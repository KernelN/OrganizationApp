import { advanceRecurrenceOccurrence, getNthWeekdayOfMonth, checkMissedOccurrences, addHours } from '../src/utils/date-utils.js';
import { processRecurrence } from '../src/engine/recurrence-engine.js';
import { computeSchedule } from '../src/engine/scheduler.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- Testing Recurrence Utilities & New Tweaks ---');

// 1. Hourly advance
{
  const base = new Date('2026-08-10T10:00:00.000Z');
  const next = advanceRecurrenceOccurrence(base, { type: 'hourly', interval: 7 });
  assert(next.toISOString() === '2026-08-10T17:00:00.000Z', 'Hourly recurrence advances 7 hours');
}

// 2. Daily advance
{
  const base = new Date('2026-08-10T10:00:00');
  const next = advanceRecurrenceOccurrence(base, { type: 'daily', interval: 3 });
  assert(next.getDate() === 13, 'Daily recurrence advances 3 days');
}

// 3. Weekly advance (Mon, Wed, Fri -> 0, 2, 4)
{
  const monday = new Date('2026-08-10T09:00:00');
  const nextFromMon = advanceRecurrenceOccurrence(monday, { type: 'weekly', interval: 1, days_of_week: [0, 2, 4] });
  assert(nextFromMon.getDay() === 3, 'Weekly from Monday (0) advances to Wednesday (3 in JS getDay / 2 in 0-based Mon index)');

  const friday = new Date('2026-08-14T09:00:00'); // Friday (4)
  const nextFromFri = advanceRecurrenceOccurrence(friday, { type: 'weekly', interval: 1, days_of_week: [0, 2, 4] });
  assert(nextFromFri.getDay() === 1 && nextFromFri.getDate() === 17, 'Weekly from Friday advances to next week Monday (Aug 17)');
}

// 4. Monthly relative weekday (2nd Wednesday)
{
  const aug2ndWed = getNthWeekdayOfMonth(2026, 7, 2, 2); // month 7 is August, day 2 is Wed
  assert(aug2ndWed.getDate() === 12, 'August 2026 2nd Wednesday is August 12');

  const base = new Date('2026-08-12T10:00:00');
  const nextMonth = advanceRecurrenceOccurrence(base, {
    type: 'monthly',
    interval: 1,
    monthly_mode: 'nth_weekday',
    nth_weekday: { nth: 2, day_of_week: 2 }
  });
  assert(nextMonth.getMonth() === 8 && nextMonth.getDate() === 9, 'September 2026 2nd Wednesday is September 9');
}

// 5. Missed occurrence & Accumulation check
{
  const task = {
    id: 'T1',
    created_at: '2026-08-01T09:00:00.000Z',
    status: 'active',
    accumulated_count: 0,
    recurrence: {
      type: 'daily',
      interval: 1,
      accumulates: true,
      accumulation_cap: 5,
      next_occurrence: '2026-08-05T09:00:00.000Z'
    }
  };
  const now = '2026-08-08T12:00:00.000Z';
  const result = checkMissedOccurrences(task, now);
  assert(result.missedCount === 4, 'Detected 4 missed daily occurrences');
  assert(result.newAccumulatedCount === 4, 'Accumulated count is 4');
  assert(new Date(result.newNextOccurrence).getTime() > new Date(now).getTime(), 'Next occurrence advanced into future');
}

// 6. Accumulation capped
{
  const task = {
    id: 'T2',
    created_at: '2026-07-01T09:00:00.000Z',
    status: 'active',
    accumulated_count: 3,
    recurrence: {
      type: 'daily',
      interval: 1,
      accumulates: true,
      accumulation_cap: 5,
      next_occurrence: '2026-07-10T09:00:00.000Z'
    }
  };
  const now = '2026-08-01T09:00:00.000Z';
  const result = checkMissedOccurrences(task, now);
  assert(result.newAccumulatedCount === 5, 'Accumulated count capped at max 5');
}

// 7. Recurrence Engine processRecurrence with separate cumulative days
{
  const gymTask = {
    id: 'GYM1',
    title: 'Gym Workout',
    duration_hours: 1,
    status: 'active',
    accumulated_count: 2,
    recurrence: {
      type: 'weekly',
      interval: 1,
      days_of_week: [0, 2, 4],
      accumulates: true,
      accumulation_cap: 5,
      cumulative_days: [0, 1, 2, 3, 4],
      next_occurrence: '2026-08-10T10:00:00.000Z'
    }
  };

  const horizon = '2026-08-17T00:00:00.000Z';
  const { instances } = processRecurrence([gymTask], '2026-08-10T08:00:00.000Z', horizon);
  const catchups = instances.filter(i => i.is_catchup_instance);
  assert(catchups.length === 2, 'Generated 2 separate catch-up instances for accumulated gym sessions');
  assert(catchups[0].allowed_cumulative_days.length === 5, 'Catch-up instances use cumulative_days [0..4]');
}

// 8. Max Repeats / Iterations Cap
{
  const limitedTask = {
    id: 'LIM1',
    title: 'Limited Workshop (3 sessions)',
    duration_hours: 1.5,
    status: 'active',
    accumulated_count: 0,
    recurrence: {
      type: 'daily',
      interval: 1,
      max_repeats: 3,
      iterations_completed: 1, // 1 completed, 2 remaining
      next_occurrence: '2026-08-10T10:00:00.000Z'
    }
  };

  const horizon = '2026-08-30T00:00:00.000Z'; // Long horizon (20 days)
  const { instances } = processRecurrence([limitedTask], '2026-08-10T08:00:00.000Z', horizon);
  assert(instances.length === 2, `Generated exactly 2 instances (max 3 - 1 completed = 2 remaining), got ${instances.length}`);
}

// 9. Manual Start Time Only calculation
{
  const start = '2026-08-10T14:30:00.000Z';
  const duration = 2.5; // 2h 30m
  const end = addHours(start, duration);
  assert(end.toISOString() === '2026-08-10T17:00:00.000Z', 'Computed manual end time matches start + duration');
}

// 10. Full Scheduler Execution with recurring & accumulated tasks
{
  const settings = {
    scheduling_horizon_days: 7,
    slot_granularity_minutes: 60,
    work_windows: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [],
      sunday: []
    }
  };

  const gymTask = {
    id: 'GYM_TEST',
    title: 'Gym Workout',
    duration_hours: 1,
    priority: 5,
    status: 'active',
    accumulated_count: 1,
    recurrence: {
      type: 'weekly',
      interval: 1,
      days_of_week: [0, 2, 4],
      accumulates: true,
      accumulation_cap: 5,
      cumulative_days: [0, 1, 2, 3, 4],
      next_occurrence: '2026-08-10T09:00:00.000Z'
    }
  };

  const schedule = computeSchedule([gymTask], [], [], settings, '2026-08-10T08:00:00.000Z');
  assert(schedule.blocks.length > 0, `Schedule generated ${schedule.blocks.length} blocks`);
  const hasCatchup = schedule.blocks.some(b => b.is_catchup);
  assert(hasCatchup, 'Schedule allocated catch-up block for accumulated session');
}

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
