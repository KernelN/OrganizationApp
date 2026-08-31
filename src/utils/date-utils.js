const DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * Safely converts a Date object, ISO date string ('YYYY-MM-DD'), or full ISO timestamp into a local Date object at 00:00:00.
 * @param {Date|string} date 
 * @returns {Date}
 */
export function parseISOToLocalDate(date) {
  if (!date) return new Date();
  if (date instanceof Date) return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (typeof date === 'string') {
    const datePart = date.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
  }
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Returns 0-based day of week where 0 = Monday and 6 = Sunday.
 * @param {Date|string} date 
 * @returns {number} 0..6
 */
export function getDayOfWeekIndex(date) {
  const d = parseISOToLocalDate(date);
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
  const d = parseISOToLocalDate(baseDate);
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
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
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
  const d = parseISOToLocalDate(date);
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
        return currMins < bEndMins && nextMins > bStartMins;
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

/**
 * Returns the date of the Nth weekday in a given month (0-indexed month, 0=Mon..6=Sun).
 * If nth is 5 or -1, returns the last occurrence of that weekday in the month.
 * @param {number} year 
 * @param {number} month - 0-indexed (0=Jan..11=Dec)
 * @param {number} nth - 1..4, or 5 / -1 for last
 * @param {number} dayOfWeek - 0=Mon..6=Sun
 * @returns {Date}
 */
export function getNthWeekdayOfMonth(year, month, nth, dayOfWeek) {
  const matchingDates = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    if (getDayOfWeekIndex(d) === dayOfWeek) {
      matchingDates.push(d);
    }
  }

  if (matchingDates.length === 0) {
    return new Date(year, month, 1);
  }

  if (nth === -1 || nth > matchingDates.length) {
    return matchingDates[matchingDates.length - 1];
  }

  return matchingDates[nth - 1];
}

/**
 * Calculates the next occurrence timestamp given a reference date and recurrence rule.
 * @param {Date|string} currentDate 
 * @param {Object} rule 
 * @returns {Date}
 */
export function advanceRecurrenceOccurrence(currentDate, rule) {
  if (!rule) return new Date(currentDate);
  const curr = new Date(currentDate);
  const interval = Math.max(1, rule.interval || 1);

  switch (rule.type) {
    case 'hourly': {
      return new Date(curr.getTime() + (interval * 60 * 60 * 1000));
    }

    case 'daily': {
      const next = new Date(curr);
      next.setDate(next.getDate() + interval);
      return next;
    }

    case 'weekly': {
      const days = Array.isArray(rule.days_of_week) && rule.days_of_week.length > 0
        ? [...rule.days_of_week].sort((a, b) => a - b)
        : [getDayOfWeekIndex(curr)];

      const currentDayIdx = getDayOfWeekIndex(curr);
      // Look for a day later in the same week
      const nextDayThisWeek = days.find(d => d > currentDayIdx);

      if (nextDayThisWeek !== undefined) {
        const diffDays = nextDayThisWeek - currentDayIdx;
        const next = new Date(curr);
        next.setDate(next.getDate() + diffDays);
        return next;
      } else {
        // Jump interval weeks and pick the first matching day
        const daysUntilNextWeek = (7 - currentDayIdx) + ((interval - 1) * 7) + days[0];
        const next = new Date(curr);
        next.setDate(next.getDate() + daysUntilNextWeek);
        return next;
      }
    }

    case 'monthly': {
      const targetYear = curr.getFullYear();
      const targetMonth = curr.getMonth() + interval;
      const targetDate = new Date(targetYear, targetMonth, 1, curr.getHours(), curr.getMinutes(), curr.getSeconds());

      if (rule.monthly_mode === 'nth_weekday' && rule.nth_weekday) {
        const nth = rule.nth_weekday.nth || 1;
        const dayOfWeek = rule.nth_weekday.day_of_week ?? 0;
        const resultDate = getNthWeekdayOfMonth(targetDate.getFullYear(), targetDate.getMonth(), nth, dayOfWeek);
        resultDate.setHours(curr.getHours(), curr.getMinutes(), curr.getSeconds(), 0);
        return resultDate;
      } else {
        // Day of month (e.g. 15th)
        const targetDay = rule.day_of_month || curr.getDate();
        const maxDays = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
        const clampedDay = Math.min(targetDay, maxDays);
        targetDate.setDate(clampedDay);
        return targetDate;
      }
    }

    default: {
      const next = new Date(curr);
      next.setDate(next.getDate() + interval);
      return next;
    }
  }
}

/**
 * Checks for missed occurrences for a recurring task and computes new state.
 * @param {Object} task 
 * @param {Date|string} now 
 * @returns {{ missedCount: number, newNextOccurrence: string, newAccumulatedCount: number }}
 */
export function checkMissedOccurrences(task, now) {
  if (!task.recurrence || task.status !== 'active') {
    return {
      missedCount: 0,
      newNextOccurrence: task.recurrence?.next_occurrence || null,
      newAccumulatedCount: task.accumulated_count || 0
    };
  }

  const nowMs = new Date(now).getTime();
  const rule = task.recurrence;
  let nextOccurrence = rule.next_occurrence ? new Date(rule.next_occurrence) : new Date(task.created_at || now);

  let missedCount = 0;
  while (nextOccurrence.getTime() <= nowMs) {
    missedCount++;
    nextOccurrence = advanceRecurrenceOccurrence(nextOccurrence, rule);
  }

  let newAccumulatedCount = task.accumulated_count || 0;
  if (missedCount > 0) {
    if (rule.accumulates) {
      const cap = rule.accumulation_cap || 5;
      newAccumulatedCount = Math.min(newAccumulatedCount + missedCount, cap);
    } else {
      newAccumulatedCount = 0;
    }
  }

  return {
    missedCount,
    newNextOccurrence: nextOccurrence.toISOString(),
    newAccumulatedCount
  };
}

/**
 * Formats duration in hours into a concise string:
 * - If less than 1 hour (< 1h): formatted in minutes (e.g. 0.5h -> "30m", 0.75h -> "45m")
 * - If 1 hour or more (>= 1h): formatted in hours up to 2 decimal places with trailing zeros stripped (e.g. 1.25h -> "1.25h", 1.5h -> "1.5h", 2h -> "2h")
 * @param {number} hours 
 * @returns {string}
 */
export function formatDuration(hours) {
  if (typeof hours !== 'number' || isNaN(hours) || hours <= 0) {
    return '0m';
  }
  const totalMins = Math.round(hours * 60);
  if (totalMins < 60) {
    return `${totalMins}m`;
  }
  const roundedHours = parseFloat(hours.toFixed(2));
  return `${roundedHours}h`;
}

