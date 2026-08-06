import { getDayOfWeekIndex, getDayName, formatDateISO, diffHours, addHours } from '../utils/date-utils.js';

/**
 * Expands fixed manual windows per day of week across date range [now, horizon].
 * @param {Object} timeWindows - { monday: [{start, end}], ... }
 * @param {Date|string} now 
 * @param {Date|string} horizon 
 * @returns {Object} Map date_string -> [{start, end}]
 */
export function expandManualWindows(timeWindows = {}, now, horizon) {
  const result = {};
  const curr = new Date(now);
  const end = new Date(horizon);

  while (curr.getTime() <= end.getTime()) {
    const dayName = getDayName(curr);
    const dateStr = formatDateISO(curr);
    if (Array.isArray(timeWindows[dayName]) && timeWindows[dayName].length > 0) {
      result[dateStr] = timeWindows[dayName].map(w => ({ ...w }));
    }
    curr.setDate(curr.getDate() + 1);
  }
  return result;
}

/**
 * Generates auto-expanding tag windows clamped to global work window and stacked dynamically.
 * @param {Array<number>} assignedDays - 0=Mon, 6=Sun
 * @param {number} requiredDailyHours 
 * @param {Object} workWindows 
 * @param {Date|string} startDate 
 * @param {Date|string} endDate 
 * @param {Object} dayCursors - Map of dateStr -> current start HH:MM string for dynamic stacking
 * @returns {Object} Map date_string -> [{start, end}]
 */
export function generateAutoWindows(assignedDays = [], requiredDailyHours = 1, workWindows = {}, startDate, endDate, dayCursors = {}) {
  const result = {};
  const curr = new Date(startDate);
  const end = new Date(endDate);

  while (curr.getTime() <= end.getTime()) {
    const dayIdx = getDayOfWeekIndex(curr);
    if (assignedDays.includes(dayIdx)) {
      const dayName = getDayName(curr);
      const globalWindows = workWindows[dayName] || [];

      if (globalWindows.length > 0) {
        const dateStr = formatDateISO(curr);
        const allocatedWindows = [];
        let remaining = requiredDailyHours;

        const sortedGlobal = [...globalWindows].sort((a, b) => a.start.localeCompare(b.start));

        for (const w of sortedGlobal) {
          // Current start time for this tag on this day (defaults to w.start or current dayCursor if after w.start)
          let effectiveStart = w.start;
          if (dayCursors[dateStr] && dayCursors[dateStr] > effectiveStart) {
            effectiveStart = dayCursors[dateStr];
          }

          // If current cursor is past this work window's end, skip
          if (effectiveStart >= w.end) continue;

          const availableHoursInWindow = diffHours(`2000-01-01T${effectiveStart}:00Z`, `2000-01-01T${w.end}:00Z`);
          if (availableHoursInWindow <= 0) continue;

          const take = Math.min(remaining, availableHoursInWindow);

          const wStartObj = new Date(`2000-01-01T${effectiveStart}:00Z`);
          const wEndObj = addHours(wStartObj, take);
          const endHHMM = `${String(wEndObj.getUTCHours()).padStart(2, '0')}:${String(wEndObj.getUTCMinutes()).padStart(2, '0')}`;

          allocatedWindows.push({ start: effectiveStart, end: endHHMM });
          remaining -= take;

          // Update day cursor so the next auto-expanding tag stacks right after this one
          dayCursors[dateStr] = endHHMM;

          if (remaining <= 0) break;
        }

        if (allocatedWindows.length > 0) {
          result[dateStr] = allocatedWindows;
        }
      }
    }
    curr.setDate(curr.getDate() + 1);
  }

  return result;
}
