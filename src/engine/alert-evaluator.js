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

  const durationMinutes = task.duration_hours != null ? task.duration_hours * 60 : (task.duration_minutes || 30);

  // Red Alert: Not enough available work time before deadline to fulfill task duration
  if (availableWorkMinutesBeforeDeadline < durationMinutes) {
    return 'red';
  }

  // Orange Alert: Within configured alert window
  const alertWindowMinutes = getAlertWindowMinutes(task);
  if (alertWindowMinutes != null && alertWindowMinutes > 0) {
    const alertStartTime = deadlineDate.getTime() - (alertWindowMinutes * 60 * 1000);
    if (now.getTime() >= alertStartTime) {
      return 'orange';
    }
  }

  return 'none';
}

/**
 * Compute total alert window in minutes from task object.
 * @param {Object} task 
 * @returns {number|null}
 */
export function getAlertWindowMinutes(task) {
  if (task.alert_window_hours != null) {
    return task.alert_window_hours * 60;
  }
  if (task.alert_window_minutes != null) {
    return task.alert_window_minutes;
  }
  return null;
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
  const durationMinutes = task.duration_hours != null ? task.duration_hours * 60 : (task.duration_minutes || 30);
  return totalMinutesUntilDeadline - durationMinutes;
}
