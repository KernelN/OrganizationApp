import { ValidationError } from '../utils/errors.js';
import { isValidHexColor, isValidHHMM } from '../utils/validators.js';

export const TASK_SCHEMA = {
  name: 'task',
  requiredFields: ['title', 'duration_hours', 'priority']
};

export const TAG_SCHEMA = {
  name: 'tag',
  requiredFields: ['name', 'color']
};

export const DEPENDENCY_SCHEMA = {
  name: 'dependency',
  requiredFields: ['task_id', 'depends_on_id', 'type']
};

export const TIME_LOG_SCHEMA = {
  name: 'time_log',
  requiredFields: ['task_id', 'logged_hours', 'logged_at']
};

/**
 * Validates a task object before saving to DAL.
 * @param {Object} task 
 */
export function validateTask(task) {
  if (!task.title || typeof task.title !== 'string' || task.title.trim() === '') {
    throw new ValidationError('Task title is required.');
  }
  if (typeof task.duration_hours !== 'number' || task.duration_hours <= 0) {
    throw new ValidationError('Task duration_hours must be a positive number.');
  }
  if (typeof task.priority !== 'number' || task.priority < -100 || task.priority > 100) {
    throw new ValidationError('Task priority must be an integer between -100 and 100.');
  }
  if (task.color && !isValidHexColor(task.color)) {
    throw new ValidationError('Invalid task color hex format.');
  }
  if (task.manual_schedule) {
    if (!task.manual_schedule.start || !task.manual_schedule.end) {
      throw new ValidationError('Manual schedule requires start and end timestamps.');
    }
  }
  if (task.recurrence) {
    const validTypes = ['hourly', 'daily', 'weekly', 'monthly', 'custom'];
    if (!validTypes.includes(task.recurrence.type)) {
      throw new ValidationError(`Recurrence type must be one of: ${validTypes.join(', ')}`);
    }
    if (task.recurrence.interval && (typeof task.recurrence.interval !== 'number' || task.recurrence.interval <= 0)) {
      throw new ValidationError('Recurrence interval must be a positive number.');
    }
    if (task.recurrence.max_repeats !== undefined && task.recurrence.max_repeats !== null) {
      if (typeof task.recurrence.max_repeats !== 'number' || task.recurrence.max_repeats <= 0) {
        throw new ValidationError('Recurrence max_repeats must be a positive integer.');
      }
    }
    if (task.recurrence.iterations_completed !== undefined && task.recurrence.iterations_completed !== null) {
      if (typeof task.recurrence.iterations_completed !== 'number' || task.recurrence.iterations_completed < 0) {
        throw new ValidationError('Recurrence iterations_completed must be a non-negative integer.');
      }
    }
  }
  if (task.accumulated_count !== undefined && task.accumulated_count !== null) {
    if (typeof task.accumulated_count !== 'number' || task.accumulated_count < 0) {
      throw new ValidationError('Accumulated count must be a non-negative integer.');
    }
  }
}

/**
 * Validates a tag object before saving to DAL.
 * @param {Object} tag 
 * @param {Array<Object>} [allTags]
 */
export function validateTag(tag, allTags = []) {
  if (!tag.name || typeof tag.name !== 'string' || tag.name.trim() === '') {
    throw new ValidationError('Tag name is required.');
  }
  if (!isValidHexColor(tag.color)) {
    throw new ValidationError('Tag color must be a valid hex string.');
  }
  if (tag.time_window_mode && !['none', 'manual', 'auto'].includes(tag.time_window_mode)) {
    throw new ValidationError('Invalid tag time_window_mode.');
  }
  if (tag.parent_tag_id !== undefined && tag.parent_tag_id !== null && typeof tag.parent_tag_id !== 'string') {
    throw new ValidationError('Tag parent_tag_id must be a string or null.');
  }
}

/**
 * Validates a dependency record.
 * @param {Object} dep 
 */
export function validateDependency(dep) {
  if (!dep.task_id || !dep.depends_on_id) {
    throw new ValidationError('Dependency requires task_id and depends_on_id.');
  }
  if (dep.task_id === dep.depends_on_id) {
    throw new ValidationError('A task cannot depend on itself.');
  }
  if (!['hard', 'soft'].includes(dep.type)) {
    throw new ValidationError('Dependency type must be "hard" or "soft".');
  }
}
