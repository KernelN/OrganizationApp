/**
 * Red and Orange alert evaluator for tasks and deadlines.
 */

/**
 * Compute alert level ('none' | 'orange' | 'red') for a task.
 * @param {Object} task 
 * @param {Date} now 
 * @param {number} availableWorkMinutesBeforeDeadline 
 * @returns {'none' | 'orange' | 'red'}
 */
export function computeTaskAlertLevel(task, now, availableWorkMinutesBeforeDeadline) {
  if (!task.deadline) {
    return 'none';
  }

  const deadlineDate = new Date(task.deadline);
  if (deadlineDate <= now) {
    return 'red'; // Deadline passed
  }

  // Red Alert: Not enough available work time before deadline to fulfill task duration
  if (availableWorkMinutesBeforeDeadline < task.duration_minutes) {
    return 'red';
  }

  // Orange Alert: Within configured alert window (e.g. 120 minutes before deadline)
  if (task.alert_window_minutes != null) {
    const alertStartTime = deadlineDate.getTime() - (task.alert_window_minutes * 60 * 1000);
    if (now.getTime() >= alertStartTime) {
      return 'orange';
    }
  }

  return 'none';
}

/**
 * Compute remaining slack time in minutes for priority queue sorting.
 * @param {Object} task 
 * @param {Date} now 
 * @returns {number} Slack in minutes (infinity if no deadline)
 */
export function computeTaskSlack(task, now) {
  if (!task.deadline) return Number.POSITIVE_INFINITY;
  const deadlineMs = new Date(task.deadline).getTime();
  const nowMs = now.getTime();
  const totalMinutesUntilDeadline = Math.max(0, Math.floor((deadlineMs - nowMs) / 60000));
  return totalMinutesUntilDeadline - task.duration_minutes;
}
