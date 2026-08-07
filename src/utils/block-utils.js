/**
 * Merges contiguous scheduled time slots belonging to the same task execution segment.
 *
 * @param {Array} blocks - Array of scheduled block objects with start, end, task_id, etc.
 * @returns {Array} Array of merged block objects where adjacent contiguous slots are combined into one.
 */
export function mergeContiguousBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return [];

  // Group by task_id and sort each group by start time
  const sorted = [...blocks].sort((a, b) => {
    if (a.task_id !== b.task_id) {
      return String(a.task_id).localeCompare(String(b.task_id));
    }
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });

  const merged = [];
  let currentGroup = null;

  for (const block of sorted) {
    if (!block || !block.start || !block.end) continue;

    if (!currentGroup) {
      currentGroup = { ...block };
      continue;
    }

    const sameTask = currentGroup.task_id === block.task_id;
    const sameLocked = Boolean(currentGroup.is_locked) === Boolean(block.is_locked);
    const sameAlert = (currentGroup.alert_level || 'none') === (block.alert_level || 'none');
    const contiguous = new Date(currentGroup.end).getTime() === new Date(block.start).getTime();

    if (sameTask && sameLocked && sameAlert && contiguous) {
      // Extend end time to cover contiguous block
      currentGroup.end = block.end;
    } else {
      merged.push(currentGroup);
      currentGroup = { ...block };
    }
  }

  if (currentGroup) {
    merged.push(currentGroup);
  }

  // Restore chronological order by start time
  merged.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return merged;
}
