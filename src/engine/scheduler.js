import { generateTimeSlots, formatDateISO, formatHHMM, parseHHMMToMins, diffHours, addDays, parseISOToLocalDate, getDayOfWeekIndex, getDayName } from '../utils/date-utils.js';
import { buildDependencyGraph, topologicalSort, hasHardDependency } from './dependency-resolver.js';
import { computeAlertLevel, computeSlack } from './alert-evaluator.js';
import { expandManualWindows, generateAutoWindows, subtractTimeWindows, getAvailableWorkChunks, sliceChunks } from './tag-window-expander.js';
import { takeFirstN, findFirstContiguousBlock, markSlotsOccupied } from './slot-allocator.js';
import { processRecurrence } from './recurrence-engine.js';

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
  const todayStartObj = parseISOToLocalDate(nowObj);
  const allSlots = generateTimeSlots(todayStartObj, horizon, settings.work_windows || {}, settings.break_windows || {}, slotSizeHours);

  const alerts = [];
  const scheduledBlocks = [];

  // ── Process Recurrence for the Horizon ─────────────────
  const { instances: recurringInstances, lockedRecurringBlocks } = processRecurrence(tasks, now, horizon, ulidGen);

  // ── PHASE 1: Reserve Locked Blocks ─────────────────────
  // 1a. One-off locked tasks
  const lockedTasks = tasks.filter(t => t.status === 'active' && !t.recurrence && t.manual_schedule && t.manual_schedule.start && t.manual_schedule.end);
  for (const task of lockedTasks) {
    const startMs = new Date(task.manual_schedule.start).getTime();
    const endMs = new Date(task.manual_schedule.end).getTime();

    const overlappingSlots = allSlots.filter(s => {
      const sStart = new Date(s.start).getTime();
      const sEnd = new Date(s.end).getTime();
      return sStart < endMs && sEnd > startMs;
    });

    markSlotsOccupied(overlappingSlots);

    scheduledBlocks.push({
      id: ulidGen(),
      task_id: task.id,
      tag_id: task.tag_ids && task.tag_ids[0] ? task.tag_ids[0] : null,
      start: task.manual_schedule.start,
      end: task.manual_schedule.end,
      is_locked: true,
      is_recurring: false,
      alert_level: 'none',
      is_split_part: false,
      split_index: 0
    });
  }

  // 1b. Recurring locked blocks
  for (const recBlock of lockedRecurringBlocks) {
    const startMs = new Date(recBlock.start).getTime();
    const endMs = new Date(recBlock.end).getTime();

    const overlappingSlots = allSlots.filter(s => {
      const sStart = new Date(s.start).getTime();
      const sEnd = new Date(s.end).getTime();
      return sStart < endMs && sEnd > startMs;
    });

    markSlotsOccupied(overlappingSlots);
    scheduledBlocks.push(recBlock);
  }

  // ── PHASE 2: Compute Tag Time Windows (Hierarchical & Multi-Tag Budgeting) ──
  const tagWindowMap = {};
  const tagWindowsComputedList = [];
  const parentUnreservedMap = {};
  const carvedSubtagIds = new Set();

  for (const tag of tags) {
    tagWindowMap[tag.id] = {};
  }

  // Pure helper to compute tag hierarchy depth
  const getDepth = (tagId, visited = new Set()) => {
    if (!tagId || visited.has(tagId)) return 1;
    visited.add(tagId);
    const tg = tags.find(t => t.id === tagId);
    if (!tg || !tg.parent_tag_id) return 1;
    return 1 + getDepth(tg.parent_tag_id, visited);
  };

  // Pure helper to get child tags
  const getChildTags = (parentId) => tags.filter(t => t.parent_tag_id === parentId);

  // Pure helper to get ancestor tag IDs
  const getAncestorIds = (tagId) => {
    const list = [];
    let curr = tags.find(t => t.id === tagId);
    const visited = new Set();
    while (curr && curr.parent_tag_id && !visited.has(curr.id)) {
      visited.add(curr.id);
      const p = tags.find(t => t.id === curr.parent_tag_id);
      if (p) {
        list.push(p.id);
        curr = p;
      } else {
        break;
      }
    }
    return list;
  };

  // 1. Gather all top-level manual tag windows (like Gym) so auto tags seamlessly flow around them
  const topLevelManualWindowsMap = {};
  for (const tag of tags) {
    if (!tag.parent_tag_id && tag.time_window_mode === 'manual') {
      tagWindowMap[tag.id] = expandManualWindows(tag.time_windows || {}, now, horizon);
      for (const [dateStr, winList] of Object.entries(tagWindowMap[tag.id])) {
        if (!topLevelManualWindowsMap[dateStr]) topLevelManualWindowsMap[dateStr] = [];
        topLevelManualWindowsMap[dateStr].push(...winList);
      }
    }
  }

  // 2. Multi-Tag Daily Budgeting for Root Auto Tags
  const activeSchedulableTasks = tasks.filter(t => t.status === 'active' && !t.manual_schedule);

  // Build dependency graph early so it is available during budgeting and queue sorting
  const depGraph = buildDependencyGraph(dependencies, tasks);

  const effectivePriority = new Map();
  for (const t of activeSchedulableTasks) {
    effectivePriority.set(t.id, t.priority ?? 0);
  }

  // Propagate hard dependencies: if task A depends on task B with a hard dependency,
  // B inherits A's priority so B (and B's tag) is budgeted first to unblock A
  let depPropagated = true;
  while (depPropagated) {
    depPropagated = false;
    for (const dep of dependencies) {
      if (dep.type === 'hard' && effectivePriority.has(dep.task_id) && effectivePriority.has(dep.depends_on_id)) {
        const parentP = effectivePriority.get(dep.task_id);
        const childP = effectivePriority.get(dep.depends_on_id);
        if (parentP > childP) {
          effectivePriority.set(dep.depends_on_id, parentP);
          depPropagated = true;
        }
      }
    }
  }

  // Track remaining task hours across the horizon simulation
  const remainingTaskHours = {};
  for (const t of activeSchedulableTasks) {
    remainingTaskHours[t.id] = t.duration_hours || 0;
  }

  const rootTags = tags.filter(t => !t.parent_tag_id);
  const autoRootTags = rootTags.filter(t => t.time_window_mode === 'auto' && t.auto_expand_config);

  const currD = parseISOToLocalDate(now);
  const endD = parseISOToLocalDate(horizon);

  while (currD.getTime() <= endD.getTime()) {
    const dStr = formatDateISO(currD);
    const dayName = getDayName(currD);
    const dayIdx = (currD.getDay() + 6) % 7; // 0=Mon ... 6=Sun

    const rawWork = settings.work_windows ? (settings.work_windows[dayName] || []) : [];
    const rawBreaks = settings.break_windows ? (settings.break_windows[dayName] || []) : [];
    let availChunks = getAvailableWorkChunks(rawWork, rawBreaks);
    if (topLevelManualWindowsMap[dStr]) {
      availChunks = subtractTimeWindows(availChunks, topLevelManualWindowsMap[dStr]);
    }

    const dayCap = availChunks.reduce((sum, c) => {
      return sum + diffHours(`2000-01-01T${c.start}:00Z`, `2000-01-01T${c.end}:00Z`);
    }, 0);

    if (dayCap > 0 && autoRootTags.length > 0) {
      const eligibleRoots = autoRootTags.filter(t => {
        const assigned = t.auto_expand_config.assigned_days || [0, 1, 2, 3, 4];
        if (!assigned.includes(dayIdx)) return false;
        if (t.start_date && parseISOToLocalDate(t.start_date) > currD) return false;
        if (t.deadline && parseISOToLocalDate(t.deadline) < currD) return false;
        return true;
      });

      const rootMinAllocations = {};
      for (const rTag of eligibleRoots) {
        const children = getChildTags(rTag.id);
        const extendChildren = children.filter(c => c.subtag_allocation_mode === 'extend');
        const carveChildren = children.filter(c => c.subtag_allocation_mode !== 'extend');

        const rootAndCarveTagIds = new Set([rTag.id, ...carveChildren.map(c => c.id)]);
        const familyTasks = activeSchedulableTasks.filter(t =>
          Array.isArray(t.tag_ids) && t.tag_ids.some(tid => rootAndCarveTagIds.has(tid))
        );
        const familyDemand = familyTasks.reduce((sum, t) => sum + (remainingTaskHours[t.id] || 0), 0);

        const rMinDaily = typeof rTag.auto_expand_config.minimum_daily_hours === 'number'
          ? rTag.auto_expand_config.minimum_daily_hours
          : 1.0;
        let trueMin = Math.min(rMinDaily, familyDemand);

        for (const eChild of extendChildren) {
          if (!eChild.auto_expand_config) continue;
          const eAssigned = eChild.auto_expand_config.assigned_days || [0, 1, 2, 3, 4];
          if (!eAssigned.includes(dayIdx)) continue;
          const eTasks = activeSchedulableTasks.filter(t =>
            Array.isArray(t.tag_ids) && t.tag_ids.includes(eChild.id)
          );
          const eDemand = eTasks.reduce((sum, t) => sum + (remainingTaskHours[t.id] || 0), 0);
          const eMin = typeof eChild.auto_expand_config.minimum_daily_hours === 'number'
            ? eChild.auto_expand_config.minimum_daily_hours
            : 1.0;
          trueMin += Math.min(eMin, eDemand);
        }

        if (slotSizeHours > 0) {
          trueMin = Math.round(trueMin / slotSizeHours) * slotSizeHours;
        }
        rootMinAllocations[rTag.id] = trueMin;
      }

      const totalMinReq = Object.values(rootMinAllocations).reduce((sum, h) => sum + h, 0);

      const getRootMaxPriority = (rootId) => {
        const allFamilyTagIds = new Set([rootId, ...getChildTags(rootId).map(c => c.id)]);
        const famTasks = activeSchedulableTasks.filter(t =>
          (remainingTaskHours[t.id] || 0) > 0.001 &&
          Array.isArray(t.tag_ids) && t.tag_ids.some(tid => allFamilyTagIds.has(tid))
        );
        if (famTasks.length === 0) return -1;
        return Math.max(...famTasks.map(t => effectivePriority.get(t.id) ?? 0));
      };

      const rootStartPriorities = {};
      for (const rTag of eligibleRoots) {
        rootStartPriorities[rTag.id] = getRootMaxPriority(rTag.id);
      }

      const dailyAllocatedHours = {};
      for (const rTag of eligibleRoots) {
        dailyAllocatedHours[rTag.id] = 0;
      }

      // Helper to check if tagA depends on tagB (hard dependency)
      const tagDependsOn = (tagAId, tagBId) => {
        if (tagAId === '__untagged__' || tagBId === '__untagged__') return false;
        const allA = new Set([tagAId, ...getChildTags(tagAId).map(c => c.id)]);
        const allB = new Set([tagBId, ...getChildTags(tagBId).map(c => c.id)]);
        const tasksA = activeSchedulableTasks.filter(t => Array.isArray(t.tag_ids) && t.tag_ids.some(tid => allA.has(tid)));
        const tasksB = activeSchedulableTasks.filter(t => Array.isArray(t.tag_ids) && t.tag_ids.some(tid => allB.has(tid)));
        for (const tA of tasksA) {
          for (const tB of tasksB) {
            if (hasHardDependency(tA, tB, depGraph)) {
              return true;
            }
          }
        }
        return false;
      };

      if (totalMinReq > dayCap) {
        const sortedRoots = [...eligibleRoots].sort((a, b) => {
          const pDiff = (rootStartPriorities[b.id] ?? -1) - (rootStartPriorities[a.id] ?? -1);
          if (pDiff !== 0) return pDiff;
          if (tagDependsOn(a.id, b.id)) return 1;
          if (tagDependsOn(b.id, a.id)) return -1;
          return 0;
        });

        let remCap = dayCap;
        for (const rTag of sortedRoots) {
          const req = rootMinAllocations[rTag.id];
          if (req > 0 && req <= remCap) {
            dailyAllocatedHours[rTag.id] = req;
            remCap -= req;
          } else {
            dailyAllocatedHours[rTag.id] = 0;
          }
        }
        if (remCap > 0) {
          for (const rTag of sortedRoots) {
            if (dailyAllocatedHours[rTag.id] > 0) {
              dailyAllocatedHours[rTag.id] += remCap;
              remCap = 0;
              break;
            }
          }
        }
      } else {
        for (const rTag of eligibleRoots) {
          dailyAllocatedHours[rTag.id] = rootMinAllocations[rTag.id];
        }
        let surplus = dayCap - totalMinReq;

        if (surplus > 0) {
          const simTodayRemaining = {};
          for (const t of activeSchedulableTasks) {
            simTodayRemaining[t.id] = remainingTaskHours[t.id] || 0;
          }

          for (const rTag of eligibleRoots) {
            let budget = dailyAllocatedHours[rTag.id];
            const allFamilyTagIds = new Set([rTag.id, ...getChildTags(rTag.id).map(c => c.id)]);
            const famTasks = activeSchedulableTasks
              .filter(t => Array.isArray(t.tag_ids) && t.tag_ids.some(tid => allFamilyTagIds.has(tid)))
              .sort((a, b) => {
                if (hasHardDependency(a, b, depGraph)) return 1;
                if (hasHardDependency(b, a, depGraph)) return -1;
                return (effectivePriority.get(b.id) ?? 0) - (effectivePriority.get(a.id) ?? 0);
              });

            for (const t of famTasks) {
              if (budget <= 0.001) break;
              const hardDeps = (depGraph.get(t.id) || []).filter(d => d.type === 'hard');
              const hasUnfinishedDep = hardDeps.some(hd => (simTodayRemaining[hd.depends_on_id] || 0) > 0.001);
              if (hasUnfinishedDep) continue;

              const take = Math.min(simTodayRemaining[t.id], budget);
              simTodayRemaining[t.id] -= take;
              budget -= take;
            }
          }

          const unallocatedTasks = activeSchedulableTasks
            .filter(t => {
              if (simTodayRemaining[t.id] <= 0.001) return false;
              const hardDeps = (depGraph.get(t.id) || []).filter(d => d.type === 'hard');
              const hasUnfinishedDep = hardDeps.some(hd => (simTodayRemaining[hd.depends_on_id] || 0) > 0.001);
              return !hasUnfinishedDep;
            })
            .sort((a, b) => {
              if (hasHardDependency(a, b, depGraph)) return 1;
              if (hasHardDependency(b, a, depGraph)) return -1;
              const pDiff = (effectivePriority.get(b.id) ?? 0) - (effectivePriority.get(a.id) ?? 0);
              if (pDiff !== 0) return pDiff;
              return (a.duration_hours || 0) - (b.duration_hours || 0);
            });

          while (surplus > 0.001 && unallocatedTasks.length > 0) {
            const nextTask = unallocatedTasks[0];
            const needed = simTodayRemaining[nextTask.id];
            const take = Math.min(needed, surplus);

            let ownerRoot = null;
            if (Array.isArray(nextTask.tag_ids)) {
              for (const rTag of eligibleRoots) {
                const allFam = new Set([rTag.id, ...getChildTags(rTag.id).map(c => c.id)]);
                if (nextTask.tag_ids.some(tid => allFam.has(tid))) {
                  ownerRoot = rTag;
                  break;
                }
              }
            }

            if (ownerRoot) {
              dailyAllocatedHours[ownerRoot.id] = (dailyAllocatedHours[ownerRoot.id] || 0) + take;
            } else {
              dailyAllocatedHours['__untagged__'] = (dailyAllocatedHours['__untagged__'] || 0) + take;
            }

            surplus -= take;
            simTodayRemaining[nextTask.id] -= take;
            if (simTodayRemaining[nextTask.id] <= 0.001) {
              unallocatedTasks.shift();
            }
          }
        }
      }

      // Deduct total allocated hours from remainingTaskHours for future simulation days
      for (const [rId, hours] of Object.entries(dailyAllocatedHours)) {
        if (rId === '__untagged__') continue;
        let toDeduct = hours;
        const allFamilyTagIds = new Set([rId, ...getChildTags(rId).map(c => c.id)]);
        const famTasks = activeSchedulableTasks
          .filter(t => Array.isArray(t.tag_ids) && t.tag_ids.some(tid => allFamilyTagIds.has(tid)))
          .sort((a, b) => {
            if (hasHardDependency(a, b, depGraph)) return 1;
            if (hasHardDependency(b, a, depGraph)) return -1;
            return (effectivePriority.get(b.id) ?? 0) - (effectivePriority.get(a.id) ?? 0);
          });

        for (const t of famTasks) {
          if (toDeduct <= 0.001) break;
          const take = Math.min(remainingTaskHours[t.id] || 0, toDeduct);
          remainingTaskHours[t.id] -= take;
          toDeduct -= take;
        }
      }

      // Order entities by rootStartPriorities descending (highest priority earliest in morning)
      // Break ties by hard dependency (if A depends on B, B comes first)
      const orderedEntities = Object.keys(dailyAllocatedHours)
        .filter(id => dailyAllocatedHours[id] > 0.001)
        .sort((a, b) => {
          const pA = a === '__untagged__' ? 0 : (rootStartPriorities[a] ?? -1);
          const pB = b === '__untagged__' ? 0 : (rootStartPriorities[b] ?? -1);
          if (pB !== pA) return pB - pA;
          if (tagDependsOn(a, b)) return 1;  // a depends on b -> b comes before a
          if (tagDependsOn(b, a)) return -1; // b depends on a -> a comes before b
          return 0;
        });

      // Slice available chunks sequentially
      const sliceState = { chunkIndex: 0, currentMins: parseHHMMToMins(availChunks[0].start) };
      for (const entityId of orderedEntities) {
        const hours = dailyAllocatedHours[entityId];
        const winSlices = sliceChunks(availChunks, hours, sliceState);
        if (entityId !== '__untagged__') {
          tagWindowMap[entityId][dStr] = winSlices;
        }
      }
    }

    currD.setDate(currD.getDate() + 1);
  }

  // 3. Subtag Hierarchical Carving
  const sortedSubtags = tags
    .filter(t => Boolean(t.parent_tag_id))
    .sort((a, b) => {
      const depthDiff = getDepth(a.id) - getDepth(b.id);
      if (depthDiff !== 0) return depthDiff;
      if (a.time_window_mode === 'manual' && b.time_window_mode !== 'manual') return -1;
      if (a.time_window_mode !== 'manual' && b.time_window_mode === 'manual') return 1;
      return 0;
    });

  const subtagDayCursors = {};

  for (const tag of sortedSubtags) {
    if (!tag.time_window_mode || tag.time_window_mode === 'none') continue;
    const parentWindows = tagWindowMap[tag.parent_tag_id] || {};

    if (tag.time_window_mode === 'manual') {
      tagWindowMap[tag.id] = expandManualWindows(tag.time_windows || {}, now, horizon, parentWindows);
      if (!parentUnreservedMap[tag.parent_tag_id]) {
        parentUnreservedMap[tag.parent_tag_id] = {};
        for (const [d, wList] of Object.entries(parentWindows)) {
          parentUnreservedMap[tag.parent_tag_id][d] = [...wList];
        }
      }
      for (const [d, wList] of Object.entries(tagWindowMap[tag.id])) {
        if (parentUnreservedMap[tag.parent_tag_id][d]) {
          parentUnreservedMap[tag.parent_tag_id][d] = subtractTimeWindows(parentUnreservedMap[tag.parent_tag_id][d], wList);
        }
      }
    } else if (tag.time_window_mode === 'auto' && tag.auto_expand_config) {
      carvedSubtagIds.add(tag.id);

      if (!parentUnreservedMap[tag.parent_tag_id]) {
        parentUnreservedMap[tag.parent_tag_id] = {};
        for (const [d, wList] of Object.entries(parentWindows)) {
          parentUnreservedMap[tag.parent_tag_id][d] = [...wList];
        }
      }

      const effectiveParent = parentUnreservedMap[tag.parent_tag_id];
      const subtagCursors = subtagDayCursors[tag.parent_tag_id] = subtagDayCursors[tag.parent_tag_id] || {};

      const assignedDays = tag.auto_expand_config.assigned_days || [0, 1, 2, 3, 4];
      const minDaily = typeof tag.auto_expand_config.minimum_daily_hours === 'number'
        ? tag.auto_expand_config.minimum_daily_hours
        : 1.0;
      const startDate = tag.start_date && new Date(tag.start_date) > nowObj ? tag.start_date : now;
      const endDate = tag.deadline || horizon;

      const parentTagObj = tags.find(t => t.id === tag.parent_tag_id);
      const subTasks = tasks.filter(t =>
        Array.isArray(t.tag_ids) &&
        t.tag_ids.includes(tag.id) &&
        t.status === 'active' &&
        !t.manual_schedule
      );
      const parentTasks = tasks.filter(t =>
        Array.isArray(t.tag_ids) &&
        parentTagObj &&
        t.tag_ids.includes(parentTagObj.id) &&
        !t.tag_ids.includes(tag.id) &&
        t.status === 'active' &&
        !t.manual_schedule
      );

      const sortedSubTasks = [...subTasks].sort((a, b) => {
        if (hasHardDependency(a, b, depGraph)) return 1;
        if (hasHardDependency(b, a, depGraph)) return -1;
        if ((b.priority ?? 0) !== (a.priority ?? 0)) return (b.priority ?? 0) - (a.priority ?? 0);
        return (a.duration_hours || 0) - (b.duration_hours || 0);
      });
      const sortedParentTasks = [...parentTasks].sort((a, b) => {
        if (hasHardDependency(a, b, depGraph)) return 1;
        if (hasHardDependency(b, a, depGraph)) return -1;
        if ((b.priority ?? 0) !== (a.priority ?? 0)) return (b.priority ?? 0) - (a.priority ?? 0);
        return (a.duration_hours || 0) - (b.duration_hours || 0);
      });

      const subTaskQueue = sortedSubTasks.map(t => ({
        id: t.id,
        priority: t.priority ?? 0,
        remainingHours: t.duration_hours || 0
      }));
      const parentTaskQueue = sortedParentTasks.map(t => ({
        id: t.id,
        priority: t.priority ?? 0,
        remainingHours: t.duration_hours || 0
      }));

      const dailyHoursMap = {};
      const subCurrD = parseISOToLocalDate(startDate);
      const subEndD = parseISOToLocalDate(endDate);

      while (subCurrD.getTime() <= subEndD.getTime()) {
        const dIdx = (subCurrD.getDay() + 6) % 7;
        const dStr = formatDateISO(subCurrD);

        if (!assignedDays.includes(dIdx)) {
          dailyHoursMap[dStr] = 0;
          subCurrD.setDate(subCurrD.getDate() + 1);
          continue;
        }

        const pChunks = effectiveParent[dStr] || [];
        const parentAvailHours = pChunks.reduce((sum, c) => {
          return sum + diffHours(`2000-01-01T${c.start}:00Z`, `2000-01-01T${c.end}:00Z`);
        }, 0);

        const subRemaining = subTaskQueue.reduce((sum, t) => sum + t.remainingHours, 0);

        if (parentAvailHours <= 0 || subRemaining <= 0) {
          dailyHoursMap[dStr] = 0;
          subCurrD.setDate(subCurrD.getDate() + 1);
          continue;
        }

        const guaranteedHours = Math.min(minDaily, subRemaining, parentAvailHours);

        let simSubQueue = subTaskQueue.map(t => ({ ...t }));
        let simGuaranteedRemaining = guaranteedHours;
        for (const st of simSubQueue) {
          if (simGuaranteedRemaining <= 0) break;
          const deduct = Math.min(st.remainingHours, simGuaranteedRemaining);
          st.remainingHours -= deduct;
          simGuaranteedRemaining -= deduct;
        }

        let extraCarveHours = 0;
        let remParentCap = parentAvailHours - guaranteedHours;
        let simParentQueue = parentTaskQueue.map(t => ({ ...t }));

        while (remParentCap > 0.001) {
          const nextSub = simSubQueue.find(t => t.remainingHours > 0.001);
          const nextParent = simParentQueue.find(t => t.remainingHours > 0.001);

          if (!nextSub) break;

          if (!nextParent) {
            const take = Math.min(nextSub.remainingHours, remParentCap);
            extraCarveHours += take;
            remParentCap -= take;
            nextSub.remainingHours -= take;
          } else {
            if (nextSub.priority >= nextParent.priority) {
              const take = Math.min(nextSub.remainingHours, remParentCap);
              extraCarveHours += take;
              remParentCap -= take;
              nextSub.remainingHours -= take;
            } else {
              const pTake = Math.min(nextParent.remainingHours, remParentCap);
              remParentCap -= pTake;
              nextParent.remainingHours -= pTake;
            }
          }
        }

        let totalCarve = guaranteedHours + extraCarveHours;
        if (slotSizeHours > 0) {
          const slotsCount = Math.ceil(totalCarve / slotSizeHours);
          totalCarve = slotsCount * slotSizeHours;
        }
        totalCarve = Math.min(totalCarve, subRemaining, parentAvailHours);

        dailyHoursMap[dStr] = totalCarve;

        let toDeduct = totalCarve;
        for (const st of subTaskQueue) {
          if (toDeduct <= 0) break;
          const d = Math.min(st.remainingHours, toDeduct);
          st.remainingHours -= d;
          toDeduct -= d;
        }

        subCurrD.setDate(subCurrD.getDate() + 1);
      }

      tagWindowMap[tag.id] = generateAutoWindows(
        assignedDays,
        dailyHoursMap,
        settings.work_windows || {},
        settings.break_windows || {},
        startDate,
        endDate,
        subtagCursors,
        effectiveParent,
        null
      );

      for (const [d, wList] of Object.entries(tagWindowMap[tag.id])) {
        if (parentUnreservedMap[tag.parent_tag_id][d]) {
          parentUnreservedMap[tag.parent_tag_id][d] = subtractTimeWindows(parentUnreservedMap[tag.parent_tag_id][d], wList);
        }
      }
    }
  }

  for (const tag of tags) {
    if (tagWindowMap[tag.id]) {
      for (const [date, windows] of Object.entries(tagWindowMap[tag.id])) {
        if (Array.isArray(windows) && windows.length > 0) {
          tagWindowsComputedList.push({ tag_id: tag.id, date, windows });
        }
      }
    }
  }

  // ── PHASE 3: Tag Reservation ────────────────────────────
  for (const tag of tags) {
    if (tagWindowMap[tag.id]) {
      for (const [dateStr, windowList] of Object.entries(tagWindowMap[tag.id])) {
        // For parent tags that had subtags carved from them, only reserve uncarved slices
        let effectiveWindows = windowList;
        if (!tag.parent_tag_id && parentUnreservedMap[tag.id]) {
          effectiveWindows = parentUnreservedMap[tag.id][dateStr] || [];
        }

        for (const w of effectiveWindows) {
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
                // Note: Carved subtags remain exclusive; we do NOT add ancestor IDs so parent tasks cannot steal carved subtag slots
              }
            }
          }
        }
      }
    }
  }

  // ── PHASE 4: Handle Recurring Tasks ────────────────────
  const schedulablePool = [];
  
  // 4a. Add standard active tasks (non-recurring, non-locked)
  for (const task of tasks) {
    if (task.status === 'active' && !task.manual_schedule && !task.recurrence) {
      schedulablePool.push(task);
    }
  }

  // 4b. Add recurring & catch-up instances generated for the horizon
  for (const instance of recurringInstances) {
    schedulablePool.push(instance);
  }

  // ── PHASE 5: Scoring ─────────────────────────────────────
  for (const task of schedulablePool) {
    task._alert_level = computeAlertLevel(task, now, allSlots);
    task._slack = computeSlack(task, now);
    task._dep_order = 0;
  }

  // Propagate alerts backwards through hard dependencies
  const alertOrder = { red: 0, orange: 1, none: 2 };
  let alertPropagated = true;
  while (alertPropagated) {
    alertPropagated = false;
    for (const dep of dependencies) {
      if (dep.type === 'hard') {
        const parentT = schedulablePool.find(t => t.id === dep.task_id);
        const childT = schedulablePool.find(t => t.id === dep.depends_on_id);
        if (parentT && childT) {
          if (alertOrder[parentT._alert_level] < alertOrder[childT._alert_level]) {
            childT._alert_level = parentT._alert_level;
            alertPropagated = true;
          }
        }
      }
    }
  }

  // ── PHASE 6: Resolve Dependencies (Topological Sort) ──
  const topoOrder = topologicalSort(depGraph, schedulablePool);
  for (let i = 0; i < topoOrder.length; i++) {
    const t = schedulablePool.find(item => item.id === topoOrder[i]);
    if (t) t._dep_order = i;
  }

  // ── PHASE 7: Build Priority Queue ──────────────────────
  const priorityQueue = [...schedulablePool].sort((a, b) => {
    // 1. Hard dependencies: if a depends on b, b MUST come first!
    if (hasHardDependency(a, b, depGraph)) return 1;
    if (hasHardDependency(b, a, depGraph)) return -1;

    // 2. Alert level
    if (alertOrder[a._alert_level] !== alertOrder[b._alert_level]) {
      return alertOrder[a._alert_level] - alertOrder[b._alert_level];
    }
    // 3. Effective Priority (higher priority first)
    const pA = effectivePriority.get(a.id) ?? (a.priority ?? 0);
    const pB = effectivePriority.get(b.id) ?? (b.priority ?? 0);
    if (pB !== pA) {
      return pB - pA;
    }
    // 4. Dep order (lower dep order first)
    if (a._dep_order !== b._dep_order) {
      return a._dep_order - b._dep_order;
    }
    // 5. Slack (lower slack first)
    if (a._slack !== b._slack) {
      return a._slack - b._slack;
    }
    return a.duration_hours - b.duration_hours;
  });

  // ── PHASE 8: Allocate Slots (Greedy Fill) ──────────────
  for (const task of priorityQueue) {
    let candidateSlots = [];
    const taskTags = Array.isArray(task.tag_ids) ? task.tag_ids.map(id => tags.find(tg => tg.id === id)).filter(Boolean) : [];
    const windowedTaskTags = taskTags.filter(tg => tg.time_window_mode && tg.time_window_mode !== 'none');

    // Pick the innermost (deepest) windowed tag in the chain
    let targetTag = null;
    if (windowedTaskTags.length > 0) {
      targetTag = windowedTaskTags.sort((a, b) => getDepth(b.id) - getDepth(a.id))[0];
    }

    // Enforce hard dependencies: task can only be scheduled after ALL hard dependencies are completely scheduled
    const hardDeps = (depGraph.get(task.id) || []).filter(d => d.type === 'hard');
    let canSchedule = true;
    let earliestAllowedStartMs = 0;

    for (const hd of hardDeps) {
      const depTask = schedulablePool.find(t => t.id === hd.depends_on_id) || tasks.find(t => t.id === hd.depends_on_id);
      if (depTask && depTask.status === 'active') {
        const depBlocks = scheduledBlocks.filter(b => b.task_id === depTask.id);
        const totalDepScheduledHours = depBlocks.length * slotSizeHours;
        const requiredHours = depTask.duration_hours || 0;
        if (totalDepScheduledHours < requiredHours - 0.001) {
          canSchedule = false;
          break;
        }
        for (const b of depBlocks) {
          const bEndMs = new Date(b.end).getTime();
          if (bEndMs > earliestAllowedStartMs) earliestAllowedStartMs = bEndMs;
        }
      }
    }

    if (canSchedule) {
      if (targetTag && tagWindowMap[targetTag.id]) {
        const targetAncestorIds = getAncestorIds(targetTag.id);
        candidateSlots = allSlots.filter(s => {
          if (s.occupied) return false;
          if (s.tagReserved && s.tagReservedId !== targetTag.id && !targetAncestorIds.includes(s.tagReservedId)) return false;
          if (!s.matchingTagIds || !s.matchingTagIds.has(targetTag.id)) return false;
          if (!task.ignore_breaks && s.is_break) return false;
          if (Array.isArray(task.allowed_cumulative_days) && !task.allowed_cumulative_days.includes(s.dayOfWeek)) return false;
          if (task.scheduled_occurrence && formatDateISO(s.start) !== formatDateISO(task.scheduled_occurrence)) return false;
          if (earliestAllowedStartMs > 0 && new Date(s.start).getTime() < earliestAllowedStartMs) return false;
          return true;
        });
      } else {
        candidateSlots = allSlots.filter(s => {
          if (s.occupied) return false;
          if (s.tagReserved) return false;
          if (s.matchingTagIds && s.matchingTagIds.size > 0) return false; // Untagged tasks can NEVER be placed inside tag windows!
          if (!task.ignore_breaks && s.is_break) return false;
          if (Array.isArray(task.allowed_cumulative_days) && !task.allowed_cumulative_days.includes(s.dayOfWeek)) return false;
          if (task.scheduled_occurrence && formatDateISO(s.start) !== formatDateISO(task.scheduled_occurrence)) return false;
          if (earliestAllowedStartMs > 0 && new Date(s.start).getTime() < earliestAllowedStartMs) return false;
          return true;
        });
      }

      // Fallback: If scheduled_occurrence slot was full, allow any candidate slot up to deadline
      if (candidateSlots.length === 0 && task.scheduled_occurrence) {
        candidateSlots = allSlots.filter(s => {
          if (s.occupied) return false;
          if (targetTag && tagWindowMap[targetTag.id]) {
            const targetAncestorIds = getAncestorIds(targetTag.id);
            if (s.tagReserved && s.tagReservedId !== targetTag.id && !targetAncestorIds.includes(s.tagReservedId)) return false;
            if (!s.matchingTagIds || !s.matchingTagIds.has(targetTag.id)) return false;
          } else {
            if (s.tagReserved) return false;
            if (s.matchingTagIds && s.matchingTagIds.size > 0) return false;
          }
          if (!task.ignore_breaks && s.is_break) return false;
          if (earliestAllowedStartMs > 0 && new Date(s.start).getTime() < earliestAllowedStartMs) return false;
          return new Date(s.end).getTime() <= new Date(task.deadline).getTime();
        });
      }
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
          task_id: task.parent_task_id || task.id,
          level: 'orange',
          message: `Task "${task.title}" could not fit contiguously; forced split as fallback.`
        });
      }
    }

    if (allocated.length < slotsNeeded) {
      const deficit = (slotsNeeded - allocated.length) * slotSizeHours;
      alerts.push({
        task_id: task.parent_task_id || task.id,
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
        task_id: task.parent_task_id || task.id,
        tag_id: targetTag ? targetTag.id : (Array.isArray(task.tag_ids) && task.tag_ids[0] ? task.tag_ids[0] : null),
        start: slot.start,
        end: slot.end,
        is_locked: false,
        is_recurring: Boolean(task.is_recurring_instance || task.parent_task_id),
        is_catchup: Boolean(task.is_catchup_instance),
        accumulated_index: task.accumulated_index || 0,
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
