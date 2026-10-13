import { getDayOfWeekIndex, getDayName, formatDateISO, parseISOToLocalDate, parseHHMMToMins, diffHours, addHours } from '../utils/date-utils.js';

export function formatMinsToHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Sequentially slices targetHours from available chunks, advancing state cursor.
 * @param {Array<{start: string, end: string}>} chunks 
 * @param {number} targetHours 
 * @param {{chunkIndex: number, currentMins: number}} state 
 * @returns {Array<{start: string, end: string}>} Sliced window segments
 */
export function sliceChunks(chunks, targetHours, state) {
  if (!Array.isArray(chunks) || chunks.length === 0 || targetHours <= 0) return [];
  const result = [];
  let remaining = targetHours;

  while (state.chunkIndex < chunks.length && remaining > 0.0001) {
    const chunk = chunks[state.chunkIndex];
    const chunkStartMins = parseHHMMToMins(chunk.start);
    const chunkEndMins = parseHHMMToMins(chunk.end);
    const currentStartMins = Math.max(chunkStartMins, state.currentMins);

    if (currentStartMins >= chunkEndMins) {
      state.chunkIndex++;
      if (state.chunkIndex < chunks.length) {
        state.currentMins = parseHHMMToMins(chunks[state.chunkIndex].start);
      }
      continue;
    }

    const availableInChunk = (chunkEndMins - currentStartMins) / 60;
    const take = Math.min(remaining, availableInChunk);
    const endMins = currentStartMins + Math.round(take * 60);

    result.push({
      start: formatMinsToHHMM(currentStartMins),
      end: formatMinsToHHMM(endMins)
    });

    remaining -= take;
    state.currentMins = endMins;

    if (endMins >= chunkEndMins) {
      state.chunkIndex++;
      if (state.chunkIndex < chunks.length) {
        state.currentMins = parseHHMMToMins(chunks[state.chunkIndex].start);
      }
    }
  }

  return result;
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
 * Subtracts occupied time windows from base time windows.
 * @param {Array<{start: string, end: string}>} baseWindows 
 * @param {Array<{start: string, end: string}>} occupiedWindows 
 * @returns {Array<{start: string, end: string}>}
 */
export function subtractTimeWindows(baseWindows = [], occupiedWindows = []) {
  if (!Array.isArray(baseWindows) || baseWindows.length === 0) return [];
  if (!Array.isArray(occupiedWindows) || occupiedWindows.length === 0) return baseWindows.map(w => ({ ...w }));

  let currentChunks = baseWindows.map(w => ({
    start: parseHHMMToMins(w.start),
    end: parseHHMMToMins(w.end)
  }));

  for (const occ of occupiedWindows) {
    const occStart = parseHHMMToMins(occ.start);
    const occEnd = parseHHMMToMins(occ.end);
    if (occStart >= occEnd) continue;

    const nextChunks = [];
    for (const chunk of currentChunks) {
      // No overlap
      if (occEnd <= chunk.start || occStart >= chunk.end) {
        nextChunks.push(chunk);
      } else {
        // Left remainder
        if (chunk.start < occStart) {
          nextChunks.push({ start: chunk.start, end: occStart });
        }
        // Right remainder
        if (chunk.end > occEnd) {
          nextChunks.push({ start: occEnd, end: chunk.end });
        }
      }
    }
    currentChunks = nextChunks;
  }

  return currentChunks
    .filter(c => c.start < c.end)
    .sort((a, b) => a.start - b.start)
    .map(c => ({
      start: formatMinsToHHMM(c.start),
      end: formatMinsToHHMM(c.end)
    }));
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
 * @param {Object} [reservedWindowsMap] - Optional map dateStr -> [{start, end}] of fixed manual windows to subtract
 * @returns {Object} Map date_string -> [{start, end}]
 */
export function generateAutoWindows(assignedDays = [], requiredDailyHours = 1, workWindows = {}, breakWindows = {}, startDate, endDate, dayCursors = {}, parentWindowsMap = null, reservedWindowsMap = null) {
  const result = {};
  const curr = parseISOToLocalDate(startDate);
  const end = parseISOToLocalDate(endDate);

  while (curr.getTime() <= end.getTime()) {
    const dayIdx = getDayOfWeekIndex(curr);
    if (assignedDays.includes(dayIdx)) {
      const dayName = getDayName(curr);
      const dateStr = formatDateISO(curr);

      const dayHours = typeof requiredDailyHours === 'function'
        ? requiredDailyHours(dateStr)
        : (typeof requiredDailyHours === 'object' && requiredDailyHours !== null
            ? (requiredDailyHours[dateStr] ?? 0)
            : requiredDailyHours);

      if (dayHours <= 0) {
        curr.setDate(curr.getDate() + 1);
        continue;
      }

      let availableChunks = [];
      const isSubtag = Boolean(parentWindowsMap);
      if (isSubtag && parentWindowsMap[dateStr]) {
        availableChunks = parentWindowsMap[dateStr].map(w => ({ ...w }));
      } else if (!isSubtag) {
        const rawWorkWindows = workWindows[dayName] || [];
        const rawBreakWindows = breakWindows[dayName] || [];
        availableChunks = getAvailableWorkChunks(rawWorkWindows, rawBreakWindows);
        if (reservedWindowsMap && reservedWindowsMap[dateStr]) {
          availableChunks = subtractTimeWindows(availableChunks, reservedWindowsMap[dateStr]);
        }
      }

      if (availableChunks.length > 0) {
        const allocatedWindows = [];
        let remaining = dayHours;

        for (const chunk of availableChunks) {
          if (dayCursors[dateStr] && dayCursors[dateStr] >= chunk.end) {
            continue;
          }

          let effectiveStart = chunk.start;
          if (dayCursors[dateStr] && dayCursors[dateStr] > effectiveStart) {
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


