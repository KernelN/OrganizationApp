/**
 * Cronograma Core Scheduling Algorithm Engine.
 * Pure functions — zero DOM/storage dependencies.
 */
import { ulid } from '../utils/ulid.js';
import { topologicalSort, hasHardDependencyChain } from './dependency-resolver.js';
import { computeTaskAlertLevel, computeTaskSlack } from './alert-evaluator.js';
import { expandTagWindows } from './tag-window-expander.js';
import {
  generateSlotGrid,
  countAvailableWorkMinutesBefore,
  reserveLockedTaskSlots,
  allocateSlotsForTask
} from './slot-allocator.js';

/**
 * Main pure scheduling function.
 * @param {Array} tasks Array of task objects
 * @param {Array} tags Array of tag objects
 * @param {Array} dependencies Array of dependency objects
 * @param {Object} settings Global user settings object
 * @param {Date} now Current timestamp
 * @returns {Object} Computed Schedule output schema
 */
export function computeSchedule(tasks = [], tags = [], dependencies = [], settings = {}, now = new Date()) {
  const computedAt = now.toISOString();

  // ─── PHASE 0: Setup & Horizon ──────────────────────────────
  let farthestDeadlineMs = now.getTime();
  for (const t of tasks) {
    if (t.deadline) {
      const d = new Date(t.deadline).getTime();
      if (d > farthestDeadlineMs) farthestDeadlineMs = d;
    }
  }

  const fallbackDays = settings.scheduling_horizon_days || 7;
  const fallbackHorizonMs = now.getTime() + (fallbackDays * 24 * 60 * 60 * 1000);
  const horizonEndMs = Math.max(farthestDeadlineMs, fallbackHorizonMs);
  const horizonEnd = new Date(horizonEndMs);

  const slotGranularity = settings.slot_granularity_minutes || 15;
  const workWindows = settings.work_windows || {};
  const breakWindows = settings.break_windows || {};

  // Generate grid of all candidate time slots
  const slotGrid = generateSlotGrid(now, horizonEnd, workWindows, breakWindows, slotGranularity);

  // ─── PHASE 1: Reserve Locked Blocks ────────────────────────
  const activeTasks = tasks.filter(t => t.status === 'active');
  const lockedTasks = activeTasks.filter(t => t.manual_schedule != null);
  const scheduledBlocks = reserveLockedTaskSlots(lockedTasks, slotGrid);

  // ─── PHASE 2 & 3: Compute Tag Time Windows ─────────────────
  const tagWindowMap = expandTagWindows(tags, activeTasks, now, horizonEnd, workWindows);

  // ─── PHASE 4 & 5: Alert Level & Slack Computation ──────────
  const schedulableTasks = activeTasks.filter(t => t.manual_schedule == null);

  for (const task of schedulableTasks) {
    const availableMins = task.deadline
      ? countAvailableWorkMinutesBefore(now, new Date(task.deadline), slotGrid)
      : Number.POSITIVE_INFINITY;

    task._alert_level = computeTaskAlertLevel(task, now, availableMins);
    task._slack = computeTaskSlack(task, now);
  }

  // ─── PHASE 6: Topological Sort for Dependencies ───────────
  topologicalSort(schedulableTasks, dependencies);

  // ─── PHASE 7: Priority Queue Sorting ───────────────────────
  const alertOrder = { red: 0, orange: 1, none: 2 };

  const priorityQueue = [...schedulableTasks].sort((a, b) => {
    // 1. Alert Level (Red > Orange > None)
    if (alertOrder[a._alert_level] !== alertOrder[b._alert_level]) {
      return alertOrder[a._alert_level] - alertOrder[b._alert_level];
    }

    // 2. Direct/Indirect Hard Dependency Precedence
    if (hasHardDependencyChain(a.id, b.id, dependencies)) return 1;
    if (hasHardDependencyChain(b.id, a.id, dependencies)) return -1;

    // 3. Task Priority Integer (Higher = First)
    if ((b.priority || 0) !== (a.priority || 0)) {
      return (b.priority || 0) - (a.priority || 0);
    }

    // 4. Deadline Slack Time (Lower = More Urgent)
    if (a._slack !== b._slack) {
      return a._slack - b._slack;
    }

    // 5. Duration (Shorter first to fill tight gaps)
    const durA = a.duration_hours != null ? a.duration_hours * 60 : (a.duration_minutes || 30);
    const durB = b.duration_hours != null ? b.duration_hours * 60 : (b.duration_minutes || 30);
    return durA - durB;
  });

  // ─── PHASE 8: Allocate Slots (Greedy Fill) ─────────────────
  const alerts = [];
  const tagWindowsComputed = [];

  for (const [tagId, windows] of tagWindowMap.entries()) {
    tagWindowsComputed.push({
      tag_id: tagId,
      windows: windows.map(w => ({ date: w.dateStr, start: w.rawStart, end: w.rawEnd }))
    });
  }

  for (const task of priorityQueue) {
    // Determine candidate slots for this task
    let candidateSlots = slotGrid.filter(s => !s.occupied);

    // Respect breaks if not ignored
    if (!task.ignore_breaks) {
      candidateSlots = candidateSlots.filter(s => !s.isBreak);
    }

    // Tag window constraints
    const primaryTagId = task.tag_ids?.find(id => tagWindowMap.has(id));
    if (primaryTagId && tagWindowMap.get(primaryTagId).length > 0) {
      const windows = tagWindowMap.get(primaryTagId);
      candidateSlots = candidateSlots.filter(slot => {
        return windows.some(w => {
          const wStart = new Date(w.start).getTime();
          const wEnd = new Date(w.end).getTime();
          return slot.start.getTime() >= wStart && slot.end.getTime() <= wEnd;
        });
      });
    }

    const { allocated, isComplete } = allocateSlotsForTask(task, candidateSlots, slotGranularity);
    const durationMinutes = task.duration_hours != null ? task.duration_hours * 60 : (task.duration_minutes || 30);

    if (!isComplete || task._alert_level === 'red') {
      const slotsNeeded = Math.ceil(durationMinutes / slotGranularity);
      const deficit = Math.max(0, (slotsNeeded - allocated.length) * slotGranularity);
      alerts.push({
        task_id: task.id,
        level: 'red',
        message: `Task '${task.title}' cannot be fully scheduled before deadline`,
        deadline: task.deadline || null,
        deficit_minutes: deficit
      });
    } else if (task._alert_level === 'orange') {
      alerts.push({
        task_id: task.id,
        level: 'orange',
        message: `Task '${task.title}' is approaching its deadline`,
        deadline: task.deadline || null,
        deficit_minutes: 0
      });
    }

    // Convert allocated slots to scheduled blocks & mark occupied
    allocated.forEach((slot, index) => {
      slot.occupied = true;
      scheduledBlocks.push({
        id: ulid(),
        task_id: task.id,
        tag_id: primaryTagId || task.tag_ids?.[0] || null,
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
        is_locked: false,
        alert_level: task._alert_level,
        is_split_part: allocated.length > 1,
        split_index: index
      });
    });
  }

  // Sort blocks chronologically
  scheduledBlocks.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return {
    computed_at: computedAt,
    horizon_end: horizonEnd.toISOString(),
    blocks: scheduledBlocks,
    alerts,
    tag_windows_computed: tagWindowsComputed
  };
}
