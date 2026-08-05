import { computeSchedule } from '../src/engine/scheduler.js';

const tasks = [
  { id: '1', title: 'Test Task', duration_minutes: 60, priority: 5, status: 'active' }
];

const settings = {
  work_windows: {
    monday: [{ start: '09:00', end: '17:00' }],
    tuesday: [{ start: '09:00', end: '17:00' }],
    wednesday: [{ start: '09:00', end: '17:00' }],
    thursday: [{ start: '09:00', end: '17:00' }],
    friday: [{ start: '09:00', end: '17:00' }],
    saturday: [{ start: '09:00', end: '17:00' }],
    sunday: [{ start: '09:00', end: '17:00' }]
  }
};

const now = new Date();
const schedule = computeSchedule(tasks, [], [], settings, now);

console.log('Now:', now.toISOString());
console.log('Computed blocks:', JSON.stringify(schedule.blocks, null, 2));
console.log('Computed alerts:', JSON.stringify(schedule.alerts, null, 2));
