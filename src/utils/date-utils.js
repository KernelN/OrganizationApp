const DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * Returns 0-based day of week where 0 = Monday and 6 = Sunday.
 * @param {Date|string} date 
 * @returns {number} 0..6
 */
export function getDayOfWeekIndex(date) {
  const d = new Date(date);
  const jsDay = d.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  return (jsDay + 6) % 7;   // Convert to 0 = Mon ... 6 = Sun
}

/**
 * Returns lowercase day name ('monday'...'sunday') for a date.
 * @param {Date|string} date 
 * @returns {string}
 */
export function getDayName(date) {
  return DAY_NAMES[getDayOfWeekIndex(date)];
}

/**
 * Converts 'HH:MM' string and Date base to a Date object.
 * @param {Date|string} baseDate 
 * @param {string} timeStr - 'HH:MM'
 * @returns {Date}
 */
export function parseHHMM(baseDate, timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Converts 'HH:MM' string to minutes from midnight (0..1440).
 * @param {string} hhmmStr 
 * @returns {number}
 */
export function parseHHMMToMins(hhmmStr) {
  if (!hhmmStr || typeof hhmmStr !== 'string') return 0;
  const [h, m] = hhmmStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Formats a Date object as 'HH:MM' 24h string.
 * @param {Date|string} date 
 * @returns {string} 'HH:MM'
 */
export function formatHHMM(date) {
  const d = new Date(date);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Formats a Date object as local ISO date string 'YYYY-MM-DD'.
 * @param {Date|string} date 
 * @returns {string}
 */
export function formatDateISO(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Computes difference between two Date objects or ISO strings in decimal hours.
 * @param {Date|string} start 
 * @param {Date|string} end 
 * @returns {number} hours
 */
export function diffHours(start, end) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max(0, (e - s) / (1000 * 60 * 60));
}

/**
 * Adds decimal hours to a Date object and returns a new Date.
 * @param {Date|string} date 
 * @param {number} hours 
 * @returns {Date}
 */
export function addHours(date, hours) {
  const d = new Date(date);
  d.setTime(d.getTime() + Math.round(hours * 60 * 60 * 1000));
  return d;
}

/**
 * Adds N days to a Date object and returns a new Date.
 * @param {Date|string} date 
 * @param {number} days 
 * @returns {Date}
 */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Generates all discrete time slots between now and horizon according to work and break windows.
 * @param {Date|string} now 
 * @param {Date|string} horizon 
 * @param {Object} workWindows - { monday: [{start, end}], ... }
 * @param {Object} breakWindows - { monday: [{start, end}], ... }
 * @param {number} slotSizeHours - e.g. 0.25 for 15 minutes
 * @returns {Array<{ start: string, end: string, dayOfWeek: number, duration_hours: number, is_break: boolean, occupied: boolean, tagReserved: boolean }>}
 */
export function generateTimeSlots(now, horizon, workWindows = {}, breakWindows = {}, slotSizeHours = 0.25) {
  const slots = [];
  const startLocal = new Date(now);
  const endLocal = new Date(horizon);

  // Round startLocal to current slot boundary
  const slotMs = slotSizeHours * 60 * 60 * 1000;
  let curr = new Date(Math.ceil(startLocal.getTime() / slotMs) * slotMs);

  while (curr.getTime() < endLocal.getTime()) {
    const nextSlot = new Date(curr.getTime() + slotMs);
    const dayIdx = getDayOfWeekIndex(curr);
    const dayName = DAY_NAMES[dayIdx];

    const dayWorkWindows = workWindows[dayName] || [];
    const dayBreakWindows = breakWindows[dayName] || [];

    const currMins = curr.getHours() * 60 + curr.getMinutes();
    let nextMins = nextSlot.getHours() * 60 + nextSlot.getMinutes();
    if (nextMins === 0 && nextSlot.getDate() !== curr.getDate()) {
      nextMins = 1440;
    }

    // Check if slot falls inside any work window
    const inWorkWindow = dayWorkWindows.some(w => {
      const wStartMins = parseHHMMToMins(w.start);
      const wEndMins = parseHHMMToMins(w.end);
      return currMins >= wStartMins && nextMins <= wEndMins;
    });

    if (inWorkWindow) {
      // Check if slot overlaps any break window
      const isBreak = dayBreakWindows.some(b => {
        const bStartMins = parseHHMMToMins(b.start);
        const bEndMins = parseHHMMToMins(b.end);
        return currMins >= bStartMins && nextMins <= bEndMins;
      });

      slots.push({
        start: curr.toISOString(),
        end: nextSlot.toISOString(),
        dayOfWeek: dayIdx,
        duration_hours: slotSizeHours,
        is_break: isBreak,
        occupied: false,
        tagReserved: false
      });
    }

    curr = nextSlot;
  }

  return slots;
}
