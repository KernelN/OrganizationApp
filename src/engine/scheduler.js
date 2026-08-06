import { generateTimeSlots, formatDateISO, formatHHMM, parseHHMMToMins, diffHours, addDays } from '../utils/date-utils.js';
import { buildDependencyGraph, topologicalSort, hasHardDependency } from './dependency-resolver.js';
import { computeAlertLevel, computeSlack } from './alert-evaluator.js';
import { expandManualWindows, generateAutoWindows } from './tag-window-expander.js';
import { takeFirstN, findFirstContiguousBlock, markSlotsOccupied } from './slot-allocator.js';

/**
 * Core pure function scheduling engine implementing the 9 Phases of Cronograma.
 *
 * @param {Array} tasks - Active & template tasks
 * @param {Array} tags - System tags
 * @param {Array} dependencies - Task dependency relationships
 * @param {Object} settings - User settings (work windows, break windows, horizon, granularity)
 * @param {Date|string} now - Reference timestamp
 * @param {Function} ulidGen - ULID generator function dependency
 * @returns {Object} Computed Schedule object { computed_at, horizon_end, blocks, alerts, tag_windows_computed }
 */
export function computeSchedule(tasks = [], tags = [], dependencies = [], settings = {}, now = new Date().toISOString(), ulidGen = () => Math.random().toString(36).substr(2, 9)) {
  const nowObj = new Date(now);

  // ── PHASE 0: Setup ─────────────────────────────────────
  let farthestDeadline = null;
  for (const t of tasks) {
    if (t.deadline) {
      const dTime = new Date(t.deadline).getTime();
      if (!farthestDeadline || dTime > farthestDeadline) {
        farthestDeadline = dTime;
      }
    }
  }

  const fallbackDays = settings.scheduling_horizon_days || 7;
  const fallbackHorizonMs = nowObj.getTime() + (fallbackDays * 24 * 60 * 60 * 1000);
  const horizonMs = Math.max(farthestDeadline || 0, fallbackHorizonMs);
  const horizon = new Date(horizonMs).toISOString();

  const slotSizeHours = (settings.slot_granularity_minutes || 15) / 60;
  const allSlots = generateTimeSlots(now, horizon, settings.work_windows || {}, settings.break_windows || {}, slotSizeHours);

  const alerts = [];
  const scheduledBlocks = [];

  // ── PHASE 1: Reserve Locked Blocks ─────────────────────
  const lockedTasks = tasks.filter(t => t.status === 'active' && t.manual_schedule && t.manual_schedule.start && t.manual_schedule.end);
  for (const task of lockedTasks) {
    const startMs = new Date(task.manual_schedule.start).getTime();
    const endMs = new Date(task.manual_schedule.end).getTime();

    const overlappingSlots = allSlots.filter(s => {
      const sStart = new Date(s.start).getTime();
      const sEnd = new Date(s.end).getTime();
      return sStart >= startMs && sEnd <= endMs;
    });

    markSlotsOccupied(overlappingSlots);

    scheduledBlocks.push({
      id: ulidGen(),
      task_id: task.id,
      tag_id: task.tag_ids && task.tag_ids[0] ? task.tag_ids[0] : null,
      start: task.manual_schedule.start,
      end: task.manual_schedule.end,
      is_locked: true,
      alert_level: 'none',
      is_split_part: false,
      split_index: 0
    });
  }

  // ── PHASE 2: Compute Tag Time Windows ──────────────────
  const tagWindowMap = {};
  const tagWindowsComputedList = [];
  const dayCursors = {};

  // First pass: process manual windows to seed dayCursors
  for (const tag of tags) {
    if (tag.time_window_mode === 'manual') {
      tagWindowMap[tag.id] = expandManualWindows(tag.time_windows || {}, now, horizon);
      for (const [dateStr, winList] of Object.entries(tagWindowMap[tag.id])) {
        for (const w of winList) {
          if (!dayCursors[dateStr] || w.end > dayCursors[dateStr]) {
            dayCursors[dateStr] = w.end;
          }
        }
      }
    }
  }

  // Second pass: process auto-expanding windows dynamically stacked
  for (const tag of tags) {
    if (!tag.time_window_mode || tag.time_window_mode === 'none' || tag.time_window_mode === 'manual') continue;

    if (tag.time_window_mode === 'auto' && tag.auto_expand_config) {
      const tagTasks = tasks.filter(t => Array.isArray(t.tag_ids) && t.tag_ids.includes(tag.id) && t.status === 'active' && !t.manual_schedule);
      const tagTaskHours = tagTasks.reduce((sum, t) => sum + (t.duration_hours || 0), 0);
      const tagBudgetHours = typeof tag.duration_hours === 'number' && tag.duration_hours > 0 ? Number(tag.duration_hours) : 0;
      const totalHoursNeeded = Math.max(tagTaskHours, tagBudgetHours);

      const assignedDays = tag.auto_expand_config.assigned_days || [0, 1, 2, 3, 4];
      const minDaily = typeof tag.auto_expand_config.minimum_daily_hours === 'number' ? tag.auto_expand_config.minimum_daily_hours : 1.0;
      const startDate = tag.start_date && new Date(tag.start_date) > nowObj ? tag.start_date : now;
      const endDate = tag.deadline || horizon;

      // Count assigned active days in range
      let activeDaysCount = 0;
      const tempCurr = new Date(startDate);
      const tempEnd = new Date(endDate);
      while (tempCurr.getTime() <= tempEnd.getTime()) {
        const dayIdx = (tempCurr.getDay() + 6) % 7;
        if (assignedDays.includes(dayIdx)) activeDaysCount++;
        tempCurr.setDate(tempCurr.getDate() + 1);
      }

      const requiredDailyHours = activeDaysCount > 0 && totalHoursNeeded > 0
        ? Math.max(minDaily, totalHoursNeeded / activeDaysCount)
        : minDaily;

      tagWindowMap[tag.id] = generateAutoWindows(assignedDays, requiredDailyHours, settings.work_windows || {}, settings.break_windows || {}, startDate, endDate, dayCursors);
    }
  }

  for (const tag of tags) {
    if (tagWindowMap[tag.id]) {
      for (const [date, windows] of Object.entries(tagWindowMap[tag.id])) {
        tagWindowsComputedList.push({ tag_id: tag.id, date, windows });
      }
    }
  }

  // ── PHASE 3: Tag Reservation ────────────────────────────
  for (const tag of tags) {
    if (tagWindowMap[tag.id]) {
      for (const [dateStr, windowList] of Object.entries(tagWindowMap[tag.id])) {
        for (const w of windowList) {
          const wStartMins = parseHHMMToMins(w.start);
          const wEndMins = parseHHMMToMins(w.end);

          for (const slot of allSlots) {
            const slotStartObj = new Date(slot.start);
            const slotEndObj = new Date(slot.end);
            const slotDateStr = formatDateISO(slotStartObj);

            if (slotDateStr === dateStr) {
              const slotStartMins = slotStartObj.getHours() * 60 + slotStartObj.getMinutes();
              let slotEndMins = slotEndObj.getHours() * 60 + slotEndObj.getMinutes();
              if (slotEndMins === 0 && slotEndObj.getDate() !== slotStartObj.getDate()) {
                slotEndMins = 1440;
              }

              if (slotStartMins >= wStartMins && slotEndMins <= wEndMins) {
                if (tag.needs_dedicated_timeslot) {
                  slot.tagReserved = true;
                  slot.tagReservedId = tag.id;
                }
                if (!slot.matchingTagIds) slot.matchingTagIds = new Set();
                slot.matchingTagIds.add(tag.id);
              }
            }
          }
        }
      }
    }
  }

  // ── PHASE 4: Handle Recurring Tasks ────────────────────
  const schedulablePool = [];
  for (const task of tasks) {
    if (task.status !== 'active' || task.manual_schedule) continue;

    if (task.recurrence) {
      const instance = { ...task, parent_task_id: task.id };
      if (task.recurrence.accumulates && task.accumulated_count > 0) {
        const cap = task.recurrence.accumulation_cap || settings.default_accumulation_cap || 5;
        const count = Math.min(task.accumulated_count, cap);
        instance.duration_hours *= (1 + count);
      }
      schedulablePool.push(instance);
    } else {
      schedulablePool.push(task);
    }
  }

  // ── PHASE 5: Scoring ─────────────────────────────────────
  for (const task of schedulablePool) {
    task._alert_level = computeAlertLevel(task, now, allSlots);
    task._slack = computeSlack(task, now);
    task._dep_order = 0;
  }

  // ── PHASE 6: Resolve Dependencies (Topological Sort) ──
  const depGraph = buildDependencyGraph(dependencies, schedulablePool);
  const topoOrder = topologicalSort(depGraph, schedulablePool);
  for (let i = 0; i < topoOrder.length; i++) {
    const t = schedulablePool.find(item => item.id === topoOrder[i]);
    if (t) t._dep_order = i;
  }

  // ── PHASE 7: Build Priority Queue ──────────────────────
  const alertOrder = { red: 0, orange: 1, none: 2 };
  const priorityQueue = [...schedulablePool].sort((a, b) => {
    if (alertOrder[a._alert_level] !== alertOrder[b._alert_level]) {
      return alertOrder[a._alert_level] - alertOrder[b._alert_level];
    }
    if (hasHardDependency(a, b, depGraph)) {
      return a._dep_order - b._dep_order;
    }
    if (a.priority !== b.priority) {
      return b.priority - a.priority; // Higher priority first
    }
    if (a._slack !== b._slack) {
      return a._slack - b._slack; // Lower slack (more urgent) first
    }
    return a.duration_hours - b.duration_hours; // Shorter duration first
  });

  // ── PHASE 8: Allocate Slots (Greedy Fill) ──────────────
  for (const task of priorityQueue) {
    let candidateSlots = [];
    const primaryTagId = Array.isArray(task.tag_ids) && task.tag_ids[0] ? task.tag_ids[0] : null;
    const primaryTag = primaryTagId ? tags.find(tg => tg.id === primaryTagId) : null;

    if (primaryTag && tagWindowMap[primaryTag.id]) {
      candidateSlots = allSlots.filter(s => {
        if (s.occupied) return false;
        if (s.tagReserved && s.tagReservedId !== primaryTag.id) return false;
        if (!s.matchingTagIds || !s.matchingTagIds.has(primaryTag.id)) return false;
        if (!task.ignore_breaks && s.is_break) return false;
        return true;
      });
    } else {
      candidateSlots = allSlots.filter(s => {
        if (s.occupied) return false;
        if (s.tagReserved) return false;
        if (s.matchingTagIds && s.matchingTagIds.size > 0) return false; // Untagged tasks can NEVER be placed inside tag windows!
        if (!task.ignore_breaks && s.is_break) return false;
        return true;
      });
    }

    const slotsNeeded = Math.ceil(task.duration_hours / slotSizeHours);
    let allocated = [];

    if (task.splittable) {
      allocated = takeFirstN(candidateSlots, slotsNeeded);
    } else {
      allocated = findFirstContiguousBlock(candidateSlots, slotsNeeded);
      if (!allocated) {
        allocated = takeFirstN(candidateSlots, slotsNeeded);
        alerts.push({
          task_id: task.id,
          level: 'orange',
          message: `Task "${task.title}" could not fit contiguously; forced split as fallback.`
        });
      }
    }

    if (allocated.length < slotsNeeded) {
      const deficit = (slotsNeeded - allocated.length) * slotSizeHours;
      alerts.push({
        task_id: task.id,
        level: 'red',
        message: `Task "${task.title}" missing ${deficit.toFixed(2)}h before deadline/horizon.`,
        deficit_hours: deficit
      });
    }

    markSlotsOccupied(allocated);

    for (let idx = 0; idx < allocated.length; idx++) {
      const slot = allocated[idx];
      scheduledBlocks.push({
        id: ulidGen(),
        task_id: task.id,
        tag_id: primaryTagId,
        start: slot.start,
        end: slot.end,
        is_locked: false,
        alert_level: task._alert_level,
        is_split_part: allocated.length > 1,
        split_index: idx
      });
    }
  }

  // ── PHASE 9: Compute Alerts ────────────────────────────
  for (const task of schedulablePool) {
    if (task._alert_level === 'orange' && !alerts.some(a => a.task_id === task.id)) {
      alerts.push({
        task_id: task.id,
        level: 'orange',
        message: `Task "${task.title}" is approaching deadline.`,
        deadline: task.deadline
      });
    }
  }

  scheduledBlocks.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return {
    computed_at: now,
    horizon_end: horizon,
    blocks: scheduledBlocks,
    alerts,
    tag_windows_computed: tagWindowsComputedList
  };
}
