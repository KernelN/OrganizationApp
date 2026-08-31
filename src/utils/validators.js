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
 * Returns the depth of a tag in the hierarchy (1 for root tag, up to 4).
 * @param {string} tagId 
 * @param {Array<Object>} allTags 
 * @param {Set<string>} [visited]
 * @returns {number}
 */
export function getTagDepth(tagId, allTags = [], visited = new Set()) {
  if (!tagId) return 0;
  if (visited.has(tagId)) {
    throw new ValidationError('Circular tag hierarchy detected.');
  }
  visited.add(tagId);

  const tag = allTags.find(t => t.id === tagId);
  if (!tag || !tag.parent_tag_id) return 1;

  return 1 + getTagDepth(tag.parent_tag_id, allTags, visited);
}

/**
 * Returns all ancestor tag objects for a given tag ID from immediate parent up to root.
 * @param {string} tagId 
 * @param {Array<Object>} allTags 
 * @returns {Array<Object>}
 */
export function getTagAncestors(tagId, allTags = []) {
  const ancestors = [];
  let currentTag = allTags.find(t => t.id === tagId);
  const visited = new Set();

  while (currentTag && currentTag.parent_tag_id) {
    if (visited.has(currentTag.id)) break;
    visited.add(currentTag.id);

    const parent = allTags.find(t => t.id === currentTag.parent_tag_id);
    if (parent) {
      ancestors.push(parent);
      currentTag = parent;
    } else {
      break;
    }
  }

  return ancestors;
}

/**
 * Returns the nearest active (non-archived) ancestor tag for a given tag ID.
 * @param {string} tagId 
 * @param {Array<Object>} allTags 
 * @param {Set<string>} [excludeTagIds]
 * @returns {Object|null}
 */
export function getNearestActiveAncestor(tagId, allTags = [], excludeTagIds = new Set()) {
  const ancestors = getTagAncestors(tagId, allTags);
  for (const ancestor of ancestors) {
    if (!ancestor.archived && !excludeTagIds.has(ancestor.id)) {
      return ancestor;
    }
  }
  return null;
}

/**
 * Returns all descendant tag objects for a given tag ID.
 * @param {string} tagId 
 * @param {Array<Object>} allTags 
 * @returns {Array<Object>}
 */
export function getTagDescendants(tagId, allTags = []) {
  const descendants = [];
  const queue = [tagId];
  const visited = new Set([tagId]);

  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = allTags.filter(t => t.parent_tag_id === currentId);
    for (const child of children) {
      if (!visited.has(child.id)) {
        visited.add(child.id);
        descendants.push(child);
        queue.push(child.id);
      }
    }
  }

  return descendants;
}

/**
 * Computes maximum subtree depth below a tag (0 if leaf).
 * @param {string} tagId 
 * @param {Array<Object>} allTags 
 * @returns {number}
 */
export function getTagSubtreeHeight(tagId, allTags = []) {
  const children = allTags.filter(t => t.parent_tag_id === tagId);
  if (children.length === 0) return 0;
  return 1 + Math.max(...children.map(c => getTagSubtreeHeight(c.id, allTags)));
}

/**
 * Validates tag hierarchy rules (max depth 4, no cycles).
 * @param {Object} tag 
 * @param {Array<Object>} allTags 
 * @throws {ValidationError}
 */
export function validateTagHierarchy(tag, allTags = []) {
  if (!tag.parent_tag_id) return;

  if (tag.id && tag.parent_tag_id === tag.id) {
    throw new ValidationError('A tag cannot be its own parent.');
  }

  const parent = allTags.find(t => t.id === tag.parent_tag_id);
  if (!parent) {
    throw new ValidationError('Specified parent tag does not exist.');
  }

  // Check if parent is currently a descendant of tag (cycle prevention)
  if (tag.id) {
    const descendants = getTagDescendants(tag.id, allTags);
    if (descendants.some(d => d.id === tag.parent_tag_id)) {
      throw new ValidationError('Cannot set a descendant tag as the parent (circular hierarchy).');
    }
  }

  const parentDepth = getTagDepth(tag.parent_tag_id, allTags);
  const selfSubtreeHeight = tag.id ? getTagSubtreeHeight(tag.id, allTags) : 0;
  const totalDepth = parentDepth + 1 + selfSubtreeHeight;

  if (totalDepth > 4) {
    throw new ValidationError(`Tag nesting depth cannot exceed 4 levels (current would reach ${totalDepth}).`);
  }
}

/**
 * Validates that a task's tags with time window constraints form a single direct ancestor-descendant chain.
 * @param {Array<string>} tagIds 
 * @param {Array<Object>} allTags 
 * @throws {ValidationError}
 */
export function validateTaskTagConstraints(tagIds = [], allTags = []) {
  const windowedTags = tagIds
    .map(id => allTags.find(t => t.id === id))
    .filter(t => t && t.time_window_mode && t.time_window_mode !== 'none');

  if (windowedTags.length <= 1) return;

  // Verify that all windowed tags form a linear ancestor-descendant chain
  // Sort them by depth
  const sorted = [...windowedTags].sort((a, b) => {
    return getTagDepth(a.id, allTags) - getTagDepth(b.id, allTags);
  });

  for (let i = 1; i < sorted.length; i++) {
    const child = sorted[i];
    const parent = sorted[i - 1];
    const ancestors = getTagAncestors(child.id, allTags);
    if (!ancestors.some(a => a.id === parent.id)) {
      throw new ValidationError(
        'A task can have multiple time-windowed tags only if they form a direct parent-child chain.',
        [{ field: 'tag_ids', tags: windowedTags.map(t => t.name) }]
      );
    }
  }
}

