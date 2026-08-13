import { getDayOfWeekIndex, getDayName, formatDateISO, parseHHMMToMins, diffHours, addHours } from '../utils/date-utils.js';

function formatMinsToHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Splits global work windows by removing any overlapping break windows.
 * @param {Array<{start: string, end: string}>} workWindows 
 * @param {Array<{start: string, end: string}>} breakWindows 
 * @returns {Array<{start: string, end: string}>} Clean non-overlapping work chunks
 */
export function getAvailableWorkChunks(workWindows = [], breakWindows = []) {
  if (!Array.isArray(workWindows) || workWindows.length === 0) return [];
  const sortedWork = [...workWindows].sort((a, b) => a.start.localeCompare(b.start));
  const sortedBreaks = [...(breakWindows || [])].sort((a, b) => a.start.localeCompare(b.start));

  const resultChunks = [];

  for (const w of sortedWork) {
    let currentStartMins = parseHHMMToMins(w.start);
    const wEndMins = parseHHMMToMins(w.end);

    for (const b of sortedBreaks) {
      const bStartMins = parseHHMMToMins(b.start);
      const bEndMins = parseHHMMToMins(b.end);

      if (bStartMins >= wEndMins) break;
      if (bEndMins <= currentStartMins) continue;

      if (currentStartMins < bStartMins) {
        resultChunks.push({
          start: formatMinsToHHMM(currentStartMins),
          end: formatMinsToHHMM(Math.min(wEndMins, bStartMins))
        });
      }

      currentStartMins = Math.max(currentStartMins, bEndMins);
    }

    if (currentStartMins < wEndMins) {
      resultChunks.push({
        start: formatMinsToHHMM(currentStartMins),
        end: formatMinsToHHMM(wEndMins)
      });
    }
  }

  return resultChunks;
}

/**
 * Intersects two sets of time window arrays [{start, end}].
 * @param {Array<{start: string, end: string}>} windowsA 
 * @param {Array<{start: string, end: string}>} windowsB 
 * @returns {Array<{start: string, end: string}>}
 */
export function intersectTimeWindows(windowsA = [], windowsB = []) {
  if (!Array.isArray(windowsA) || windowsA.length === 0 || !Array.isArray(windowsB) || windowsB.length === 0) return [];
  const result = [];
  for (const a of windowsA) {
    const aStartMins = parseHHMMToMins(a.start);
    const aEndMins = parseHHMMToMins(a.end);

    for (const b of windowsB) {
      const bStartMins = parseHHMMToMins(b.start);
      const bEndMins = parseHHMMToMins(b.end);

      const maxStart = Math.max(aStartMins, bStartMins);
      const minEnd = Math.min(aEndMins, bEndMins);

      if (maxStart < minEnd) {
        result.push({
          start: formatMinsToHHMM(maxStart),
          end: formatMinsToHHMM(minEnd)
        });
      }
    }
  }
  return result;
}

/**
 * Expands fixed manual windows per day of week across date range [now, horizon].
 * @param {Object} timeWindows - { monday: [{start, end}], ... }
 * @param {Date|string} now 
 * @param {Date|string} horizon 
 * @param {Object} [parentWindowsMap] - Optional map date_string -> [{start, end}] to clamp against
 * @returns {Object} Map date_string -> [{start, end}]
 */
export function expandManualWindows(timeWindows = {}, now, horizon, parentWindowsMap = null) {
  const result = {};
  const curr = new Date(now);
  const end = new Date(horizon);

  while (curr.getTime() <= end.getTime()) {
    const dayName = getDayName(curr);
    const dateStr = formatDateISO(curr);
    if (Array.isArray(timeWindows[dayName]) && timeWindows[dayName].length > 0) {
      let windows = timeWindows[dayName].map(w => ({ ...w }));
      if (parentWindowsMap) {
        const pWins = parentWindowsMap[dateStr] || [];
        windows = intersectTimeWindows(windows, pWins);
      }
      if (windows.length > 0) {
        result[dateStr] = windows;
      }
    }
    curr.setDate(curr.getDate() + 1);
  }
  return result;
}

/**
 * Generates auto-expanding tag windows clamped to parent window or global work windows.
 * @param {Array<number>} assignedDays - 0=Mon, 6=Sun
 * @param {number} requiredDailyHours 
 * @param {Object} workWindows 
 * @param {Object} breakWindows 
 * @param {Date|string} startDate 
 * @param {Date|string} endDate 
 * @param {Object} dayCursors - Map of dateStr -> current start HH:MM string for dynamic stacking
 * @param {Object} [parentWindowsMap] - Optional map dateStr -> [{start, end}] to carve from
 * @returns {Object} Map date_string -> [{start, end}]
 */
export function generateAutoWindows(assignedDays = [], requiredDailyHours = 1, workWindows = {}, breakWindows = {}, startDate, endDate, dayCursors = {}, parentWindowsMap = null) {
  const result = {};
  const curr = new Date(startDate);
  const end = new Date(endDate);

  while (curr.getTime() <= end.getTime()) {
    const dayIdx = getDayOfWeekIndex(curr);
    if (assignedDays.includes(dayIdx)) {
      const dayName = getDayName(curr);
      const dateStr = formatDateISO(curr);

      let availableChunks = [];
      const isSubtag = Boolean(parentWindowsMap);
      if (isSubtag && parentWindowsMap[dateStr]) {
        availableChunks = parentWindowsMap[dateStr].map(w => ({ ...w }));
      } else if (!isSubtag) {
        const rawWorkWindows = workWindows[dayName] || [];
        const rawBreakWindows = breakWindows[dayName] || [];
        availableChunks = getAvailableWorkChunks(rawWorkWindows, rawBreakWindows);
      }

      if (availableChunks.length > 0) {
        const allocatedWindows = [];
        let remaining = requiredDailyHours;

        for (const chunk of availableChunks) {
          let effectiveStart = chunk.start;
          if (dayCursors[dateStr] && dayCursors[dateStr] > effectiveStart && dayCursors[dateStr] < chunk.end) {
            effectiveStart = dayCursors[dateStr];
          }

          if (effectiveStart >= chunk.end) continue;

          const availableHoursInChunk = diffHours(`2000-01-01T${effectiveStart}:00Z`, `2000-01-01T${chunk.end}:00Z`);
          if (availableHoursInChunk <= 0) continue;

          const take = Math.min(remaining, availableHoursInChunk);

          const wStartObj = new Date(`2000-01-01T${effectiveStart}:00Z`);
          const wEndObj = addHours(wStartObj, take);
          const endHHMM = `${String(wEndObj.getUTCHours()).padStart(2, '0')}:${String(wEndObj.getUTCMinutes()).padStart(2, '0')}`;

          allocatedWindows.push({ start: effectiveStart, end: endHHMM });
          remaining -= take;

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


