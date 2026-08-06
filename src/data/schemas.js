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
  if (typeof task.priority !== 'number' || task.priority < 0) {
    throw new ValidationError('Task priority must be a non-negative integer.');
  }
  if (task.color && !isValidHexColor(task.color)) {
    throw new ValidationError('Invalid task color hex format.');
  }
}

/**
 * Validates a tag object before saving to DAL.
 * @param {Object} tag 
 */
export function validateTag(tag) {
  if (!tag.name || typeof tag.name !== 'string' || tag.name.trim() === '') {
    throw new ValidationError('Tag name is required.');
  }
  if (!isValidHexColor(tag.color)) {
    throw new ValidationError('Tag color must be a valid hex string.');
  }
  if (tag.time_window_mode && !['none', 'manual', 'auto'].includes(tag.time_window_mode)) {
    throw new ValidationError('Invalid tag time_window_mode.');
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
