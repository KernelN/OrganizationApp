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
 * Generates auto-expanding tag windows clamped to global work window.
 * @param {Array<number>} assignedDays - 0=Mon, 6=Sun
 * @param {number} requiredDailyHours 
 * @param {Object} workWindows 
 * @param {Date|string} startDate 
 * @param {Date|string} endDate 
 * @returns {Object} Map date_string -> [{start, end}]
 */
export function generateAutoWindows(assignedDays = [], requiredDailyHours = 1, workWindows = {}, startDate, endDate) {
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
          const wHours = diffHours(`2000-01-01T${w.start}:00Z`, `2000-01-01T${w.end}:00Z`);
          const take = Math.min(remaining, wHours);

          const wStartObj = new Date(`2000-01-01T${w.start}:00Z`);
          const wEndObj = addHours(wStartObj, take);
          const endHHMM = `${String(wEndObj.getUTCHours()).padStart(2, '0')}:${String(wEndObj.getUTCMinutes()).padStart(2, '0')}`;

          allocatedWindows.push({ start: w.start, end: endHHMM });
          remaining -= take;
          if (remaining <= 0) break;
        }

        result[dateStr] = allocatedWindows;
      }
    }
    curr.setDate(curr.getDate() + 1);
  }

  return result;
}
