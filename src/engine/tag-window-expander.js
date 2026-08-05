/**
 * Tag time window expansion logic for manual and auto-expanding tag modes.
 */
import { getDayOfWeekString } from '../utils/date-utils.js';

/**
 * Expand tag time windows across the scheduling horizon.
 * @param {Array} tags 
 * @param {Array} tasks 
 * @param {Date} now 
 * @param {Date} horizonEnd 
 * @param {Object} globalWorkWindows 
 * @returns {Map<string, Array<{ dateStr: string, start: string, end: string }>>}
 */
export function expandTagWindows(tags, tasks, now, horizonEnd, globalWorkWindows) {
  const tagWindowMap = new Map(); // tag_id -> list of window objects

  for (const tag of tags) {
    if (!tag.time_window_mode || tag.time_window_mode === 'none') {
      continue;
    }

    const expandedWindows = [];

    if (tag.time_window_mode === 'manual') {
      // Fixed per-day-of-week windows
      const curr = new Date(now);
      while (curr <= horizonEnd) {
        const dayStr = getDayOfWeekString(curr);
        const dateISO = curr.toISOString().split('T')[0];
        const dayWindows = tag.time_windows?.[dayStr] || [];

        for (const win of dayWindows) {
          expandedWindows.push({
            dateStr: dateISO,
            start: `${dateISO}T${win.start}:00.000Z`,
            end: `${dateISO}T${win.end}:00.000Z`,
            rawStart: win.start,
            rawEnd: win.end
          });
        }
        curr.setDate(curr.getDate() + 1);
      }
    } else if (tag.time_window_mode === 'auto') {
      // Auto-expanding windows: calculate required daily allocation
      const tagTasks = tasks.filter(t => t.tag_ids?.includes(tag.id) && t.status === 'active' && !t.manual_schedule);
      const totalMinutesNeeded = tagTasks.reduce((acc, t) => acc + (t.duration_minutes || 0), 0);

      const assignedDays = tag.auto_expand_config?.assigned_days || [0, 1, 2, 3, 4]; // Default Mon-Fri
      const minDailyMinutes = tag.auto_expand_config?.minimum_daily_minutes || 60;

      // Count assigned days within horizon
      let activeDaysCount = 0;
      const currCount = new Date(now);
      while (currCount <= horizonEnd) {
        const jsDay = (currCount.getDay() + 6) % 7; // 0=Mon...6=Sun
        if (assignedDays.includes(jsDay)) {
          activeDaysCount++;
        }
        currCount.setDate(currCount.getDate() + 1);
      }

      const daysDenominator = Math.max(1, activeDaysCount);
      const requiredDailyMinutes = Math.max(minDailyMinutes, Math.ceil(totalMinutesNeeded / daysDenominator));

      // Generate windows respecting global work windows
      const curr = new Date(now);
      while (curr <= horizonEnd) {
        const jsDay = (curr.getDay() + 6) % 7;
        const dayStr = getDayOfWeekString(curr);
        const dateISO = curr.toISOString().split('T')[0];

        if (assignedDays.includes(jsDay)) {
          const globalDayWork = globalWorkWindows?.[dayStr] || [];
          if (globalDayWork.length > 0) {
            // Place window starting from beginning of global work window
            const workStart = globalDayWork[0].start;
            const [startH, startM] = workStart.split(':').map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = startMinutes + requiredDailyMinutes;

            const endH = Math.floor(endMinutes / 60) % 24;
            const endM = endMinutes % 60;
            const rawEndStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

            expandedWindows.push({
              dateStr: dateISO,
              start: `${dateISO}T${workStart}:00.000Z`,
              end: `${dateISO}T${rawEndStr}:00.000Z`,
              rawStart: workStart,
              rawEnd: rawEndStr
            });
          }
        }
        curr.setDate(curr.getDate() + 1);
      }
    }

    tagWindowMap.set(tag.id, expandedWindows);
  }

  return tagWindowMap;
}
