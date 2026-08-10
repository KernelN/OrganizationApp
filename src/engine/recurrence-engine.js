import { advanceRecurrenceOccurrence, getDayOfWeekIndex, formatDateISO, parseHHMM } from '../utils/date-utils.js';

/**
 * Pure engine helper to process recurring tasks and generate scheduled instances for the horizon.
 * Respects optional max_repeats / iterations_completed.
 *
 * @param {Array} tasks - Active tasks
 * @param {Date|string} now - Reference timestamp
 * @param {Date|string} horizon - Horizon end timestamp
 * @param {Function} ulidGen - ULID generator
 * @returns {{ instances: Array, lockedRecurringBlocks: Array }}
 */
export function processRecurrence(tasks = [], now, horizon, ulidGen = () => Math.random().toString(36).substr(2, 9)) {
  const instances = [];
  const lockedRecurringBlocks = [];
  const nowMs = new Date(now).getTime();
  const horizonMs = new Date(horizon).getTime();

  for (const task of tasks) {
    if (!task.recurrence || task.status !== 'active') continue;

    const rule = task.recurrence;
    const maxRepeats = typeof rule.max_repeats === 'number' && rule.max_repeats > 0 ? rule.max_repeats : null;
    const completed = typeof rule.iterations_completed === 'number' ? rule.iterations_completed : 0;
    const remainingRepeats = maxRepeats !== null ? Math.max(0, maxRepeats - completed) : Infinity;

    if (remainingRepeats <= 0) continue;

    let occurrence = rule.next_occurrence ? new Date(rule.next_occurrence) : new Date(task.created_at || now);

    // If occurrence is in the past, advance to next future occurrence
    while (occurrence.getTime() < nowMs) {
      occurrence = advanceRecurrenceOccurrence(occurrence, rule);
    }

    let generatedCount = 0;

    // 1. Generate future recurring instances up to horizon and remaining iterations
    let cycleLimit = 0;
    while (occurrence.getTime() <= horizonMs && cycleLimit < 100 && generatedCount < remainingRepeats) {
      cycleLimit++;
      generatedCount++;
      const occIso = occurrence.toISOString();

      if (task.manual_schedule && task.manual_schedule.start && task.manual_schedule.end) {
        // Locked recurring task: map time-of-day onto occurrence day
        const sTime = new Date(task.manual_schedule.start);
        const eTime = new Date(task.manual_schedule.end);
        const startHHMM = `${String(sTime.getHours()).padStart(2, '0')}:${String(sTime.getMinutes()).padStart(2, '0')}`;
        const endHHMM = `${String(eTime.getHours()).padStart(2, '0')}:${String(eTime.getMinutes()).padStart(2, '0')}`;

        const lockStart = parseHHMM(occurrence, startHHMM).toISOString();
        const lockEnd = parseHHMM(occurrence, endHHMM).toISOString();

        lockedRecurringBlocks.push({
          id: ulidGen(),
          task_id: task.id,
          tag_id: task.tag_ids && task.tag_ids[0] ? task.tag_ids[0] : null,
          start: lockStart,
          end: lockEnd,
          is_locked: true,
          is_recurring: true,
          alert_level: 'none',
          is_split_part: false,
          split_index: 0
        });
      } else {
        // Auto-scheduled recurring instance
        const instance = {
          ...task,
          id: ulidGen(),
          parent_task_id: task.id,
          deadline: occIso,
          recurrence: null, // Instances themselves don't recur
          is_recurring_instance: true,
          scheduled_occurrence: occIso
        };
        instances.push(instance);
      }

      occurrence = advanceRecurrenceOccurrence(occurrence, rule);
    }

    // 2. Generate catch-up instances for accumulated backlog
    const accCount = task.accumulated_count || 0;
    if (rule.accumulates && accCount > 0) {
      const allowedDays = Array.isArray(rule.cumulative_days) && rule.cumulative_days.length > 0
        ? rule.cumulative_days
        : (Array.isArray(rule.days_of_week) && rule.days_of_week.length > 0 ? rule.days_of_week : [0, 1, 2, 3, 4]);

      const catchupLimit = Math.min(accCount, remainingRepeats);
      for (let i = 1; i <= catchupLimit; i++) {
        instances.push({
          ...task,
          id: ulidGen(),
          parent_task_id: task.id,
          title: `${task.title} (Catch-up ${i}/${accCount})`,
          is_catchup_instance: true,
          accumulated_index: i,
          allowed_cumulative_days: allowedDays,
          recurrence: null,
          deadline: horizon // Schedule catch-up within the active horizon
        });
      }
    }
  }

  return { instances, lockedRecurringBlocks };
}
