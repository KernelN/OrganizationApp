import { ValidationError } from './errors.js';

/**
 * Validates a 6-digit hex color code.
 * @param {string} color 
 * @returns {boolean}
 */
export function isValidHexColor(color) {
  return typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Validates 'HH:MM' 24h time string.
 * @param {string} timeStr 
 * @returns {boolean}
 */
export function isValidHHMM(timeStr) {
  return typeof timeStr === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr);
}

/**
 * Validates that a task object does not link to more than 1 tag with a time window constraint.
 * @param {Array<string>} tagIds 
 * @param {Array<Object>} allTags 
 * @throws {ValidationError}
 */
export function validateTaskTagConstraints(tagIds = [], allTags = []) {
  const windowedTags = tagIds
    .map(id => allTags.find(t => t.id === id))
    .filter(t => t && t.time_window_mode && t.time_window_mode !== 'none');

  if (windowedTags.length > 1) {
    throw new ValidationError(
      'A task can have at most ONE tag with a time window constraint.',
      [{ field: 'tag_ids', tags: windowedTags.map(t => t.name) }]
    );
  }
}
