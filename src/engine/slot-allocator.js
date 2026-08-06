/**
 * Helper functions for slot filling and contiguous block search.
 * Engine files MUST NOT import DOM, storage, or browser APIs.
 */

/**
 * Greedily takes the first N available slots.
 * @param {Array} availableSlots 
 * @param {number} count 
 * @returns {Array} allocated slots
 */
export function takeFirstN(availableSlots = [], count = 1) {
  return availableSlots.slice(0, count);
}

/**
 * Finds the first contiguous block of N slots in availableSlots.
 * Slots are considered contiguous if each subsequent slot start time equals previous slot end time.
 * @param {Array} availableSlots 
 * @param {number} count 
 * @returns {Array|null} allocated slots or null if contiguous block not found
 */
export function findFirstContiguousBlock(availableSlots = [], count = 1) {
  if (count <= 0) return [];
  if (availableSlots.length < count) return null;

  for (let i = 0; i <= availableSlots.length - count; i++) {
    let contiguous = true;
    for (let j = 0; j < count - 1; j++) {
      const s1End = new Date(availableSlots[i + j].end).getTime();
      const s2Start = new Date(availableSlots[i + j + 1].start).getTime();
      if (s1End !== s2Start) {
        contiguous = false;
        break;
      }
    }
    if (contiguous) {
      return availableSlots.slice(i, i + count);
    }
  }

  return null;
}

/**
 * Marks given slots as occupied.
 * @param {Array} slots 
 */
export function markSlotsOccupied(slots = []) {
  for (const slot of slots) {
    slot.occupied = true;
  }
}
