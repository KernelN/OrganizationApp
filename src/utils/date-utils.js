/**
 * Date and time manipulation utility functions for Cronograma engine and views.
 */

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

/**
 * Get day string from JavaScript Date (0=Mon ... 6=Sun)
 * @param {Date} date 
 * @returns {string} day of week ('monday' ... 'sunday')
 */
export function getDayOfWeekString(date) {
  const jsDay = date.getDay(); // 0=Sun, 1=Mon...
  const index = (jsDay + 6) % 7; // Convert to 0=Mon...6=Sun
  return DAYS_OF_WEEK[index];
}

/**
 * Format a Date object to ISO string
 * @param {Date} date 
 * @returns {string} ISO 8601 string
 */
export function toISOString(date = new Date()) {
  return date.toISOString();
}

/**
 * Parse HH:MM 24-hour string to minutes from start of day
 * @param {string} timeStr "HH:MM"
 * @returns {number} minutes (0 to 1439)
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes from start of day to HH:MM 24-hour string
 * @param {number} totalMinutes 
 * @returns {string} "HH:MM"
 */
export function formatMinutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Round a Date object down to the nearest granularity interval (in minutes)
 * @param {Date} date 
 * @param {number} granularityMinutes (15, 30, 60)
 * @returns {Date}
 */
export function roundToGranularity(date, granularityMinutes = 15) {
  const ms = date.getTime();
  const granularityMs = granularityMinutes * 60 * 1000;
  return new Date(Math.floor(ms / granularityMs) * granularityMs);
}
