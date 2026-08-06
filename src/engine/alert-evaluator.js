import { diffHours } from '../utils/date-utils.js';

/**
 * Computes slack time for a task in hours: deadline - now - duration_hours.
 * @param {Object} task 
 * @param {Date|string} now 
 * @returns {number} slack in hours (Infinity if no deadline)
 */
export function computeSlack(task, now) {
  if (!task.deadline) return Infinity;
  const hoursUntilDeadline = diffHours(now, task.deadline);
  return hoursUntilDeadline - task.duration_hours;
}

/**
 * Computes Red/Orange/None alert level for a task.
 * @param {Object} task 
 * @param {Date|string} now 
 * @param {Array} allSlots 
 * @returns {'red'|'orange'|'none'}
 */
export function computeAlertLevel(task, now, allSlots = []) {
  if (!task.deadline) {
    return 'none';
  }

  const nowMs = new Date(now).getTime();
  const deadlineMs = new Date(task.deadline).getTime();

  if (deadlineMs <= nowMs) {
    return 'red';
  }

  // Count available slot hours between now and deadline
  const availableSlotsBeforeDeadline = allSlots.filter(s => {
    const sStart = new Date(s.start).getTime();
    return sStart >= nowMs && sStart < deadlineMs && (!s.is_break || task.ignore_breaks);
  });

  const availableHours = availableSlotsBeforeDeadline.reduce((acc, s) => acc + s.duration_hours, 0);

  if (availableHours < task.duration_hours) {
    return 'red';
  }

  if (typeof task.alert_window_hours === 'number' && task.alert_window_hours > 0) {
    const alertStartMs = deadlineMs - (task.alert_window_hours * 60 * 60 * 1000);
    if (nowMs >= alertStartMs) {
      return 'orange';
    }
  }

  return 'none';
}
