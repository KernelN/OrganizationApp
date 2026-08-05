/**
 * Time slot grid generation and slot allocation engine.
 */
import { getDayOfWeekString } from '../utils/date-utils.js';

/**
 * Generate discrete time slots between `now` and `horizonEnd`.
 * @param {Date} now 
 * @param {Date} horizonEnd 
 * @param {Object} workWindows 
 * @param {Object} breakWindows 
 * @param {number} slotGranularityMinutes 15, 30, or 60
 * @returns {Array<{ id: number, start: Date, end: Date, dateStr: string, isBreak: boolean, occupied: boolean, tagReserved: string|null }>}
 */
export function generateSlotGrid(now, horizonEnd, workWindows, breakWindows, slotGranularityMinutes = 15) {
  const slots = [];
  let slotIdCounter = 0;

  // Align start to slot granularity boundary
  const curr = new Date(now);
  const msPerSlot = slotGranularityMinutes * 60 * 1000;
  curr.setTime(Math.ceil(curr.getTime() / msPerSlot) * msPerSlot);

  while (curr < horizonEnd) {
    const slotStart = new Date(curr);
    const slotEnd = new Date(curr.getTime() + msPerSlot);
    const dayStr = getDayOfWeekString(slotStart);
    const dateStr = slotStart.toISOString().split('T')[0];

    const timeHHMM = `${String(slotStart.getHours()).padStart(2, '0')}:${String(slotStart.getMinutes()).padStart(2, '0')}`;

    // Check if within work window
    const dayWork = workWindows?.[dayStr] || [];
    const isWithinWorkWindow = dayWork.some(w => timeHHMM >= w.start && timeHHMM < w.end);

    if (isWithinWorkWindow) {
      // Check if break window
      const dayBreaks = breakWindows?.[dayStr] || [];
      const isBreak = dayBreaks.some(b => timeHHMM >= b.start && timeHHMM < b.end);

      slots.push({
        id: ++slotIdCounter,
        start: slotStart,
        end: slotEnd,
        dateStr,
        isBreak,
        occupied: false,
        tagReserved: null
      });
    }

    curr.setTime(curr.getTime() + msPerSlot);
  }

  return slots;
}

/**
 * Count total work minutes available before a given deadline.
 * @param {Date} now 
 * @param {Date} deadline 
 * @param {Array} slotGrid 
 * @returns {number}
 */
export function countAvailableWorkMinutesBefore(now, deadline, slotGrid) {
  let minutes = 0;
  for (const slot of slotGrid) {
    if (slot.start >= now && slot.end <= deadline && !slot.occupied && !slot.isBreak) {
      minutes += (slot.end.getTime() - slot.start.getTime()) / 60000;
    }
  }
  return minutes;
}

/**
 * Mark slots occupied by locked manual tasks (`manual_schedule`).
 * @param {Array} lockedTasks 
 * @param {Array} slotGrid 
 * @returns {Array} List of scheduled block objects for locked tasks
 */
export function reserveLockedTaskSlots(lockedTasks, slotGrid) {
  const lockedBlocks = [];

  for (const task of lockedTasks) {
    if (!task.manual_schedule?.start || !task.manual_schedule?.end) continue;
    const taskStart = new Date(task.manual_schedule.start);
    const taskEnd = new Date(task.manual_schedule.end);

    for (const slot of slotGrid) {
      if (slot.start >= taskStart && slot.end <= taskEnd) {
        slot.occupied = true;
      }
    }

    lockedBlocks.push({
      id: `locked_${task.id}`,
      task_id: task.id,
      tag_id: task.tag_ids?.[0] || null,
      start: taskStart.toISOString(),
      end: taskEnd.toISOString(),
      is_locked: true,
      alert_level: 'none',
      is_split_part: false,
      split_index: 0
    });
  }

  return lockedBlocks;
}

/**
 * Allocate slots for a task from available slot grid.
 * @param {Object} task 
 * @param {Array} candidateSlots 
 * @param {number} slotGranularityMinutes 
 * @returns {{ allocated: Array, isComplete: boolean }}
 */
export function allocateSlotsForTask(task, candidateSlots, slotGranularityMinutes = 15) {
  const durationMinutes = task.duration_hours != null ? task.duration_hours * 60 : (task.duration_minutes || 30);
  const slotsNeeded = Math.ceil(durationMinutes / slotGranularityMinutes);

  if (task.splittable) {
    // Greedily pick first N available slots
    const allocated = candidateSlots.slice(0, slotsNeeded);
    return {
      allocated,
      isComplete: allocated.length >= slotsNeeded
    };
  } else {
    // Find first contiguous block of N available slots
    let contiguousGroup = [];
    for (let i = 0; i < candidateSlots.length; i++) {
      const slot = candidateSlots[i];
      if (contiguousGroup.length === 0) {
        contiguousGroup.push(slot);
      } else {
        const lastSlot = contiguousGroup[contiguousGroup.length - 1];
        if (slot.start.getTime() === lastSlot.end.getTime()) {
          contiguousGroup.push(slot);
        } else {
          contiguousGroup = [slot];
        }
      }

      if (contiguousGroup.length === slotsNeeded) {
        return {
          allocated: contiguousGroup,
          isComplete: true
        };
      }
    }

    // Fallback if contiguous block not found: pick first N available slots (forced split)
    const fallbackAllocated = candidateSlots.slice(0, slotsNeeded);
    return {
      allocated: fallbackAllocated,
      isComplete: fallbackAllocated.length >= slotsNeeded
    };
  }
}
