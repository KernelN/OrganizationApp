import { computeSchedule } from './scheduler.js';
import { generateULID } from '../utils/ulid.js';

let computeTimer = null;
let lastPayload = null;

self.onmessage = function (e) {
  const { type, payload } = e.data || {};

  switch (type) {
    case 'COMPUTE':
      lastPayload = payload;
      runScheduleComputation(payload);
      break;

    case 'CONFIG':
      if (payload && payload.interval_ms) {
        if (computeTimer) clearInterval(computeTimer);
        computeTimer = setInterval(() => {
          if (lastPayload) {
            runScheduleComputation({ ...lastPayload, now: new Date().toISOString() });
          }
        }, payload.interval_ms);
      }
      break;

    case 'STOP':
      if (computeTimer) {
        clearInterval(computeTimer);
        computeTimer = null;
      }
      self.postMessage({ type: 'STATUS', payload: { state: 'idle', lastRun: new Date().toISOString() } });
      break;

    default:
      break;
  }
};

function runScheduleComputation(payload) {
  try {
    self.postMessage({ type: 'STATUS', payload: { state: 'computing', lastRun: new Date().toISOString() } });

    const { tasks = [], tags = [], dependencies = [], settings = {}, now = new Date().toISOString() } = payload;
    const schedule = computeSchedule(tasks, tags, dependencies, settings, now, () => generateULID());

    self.postMessage({ type: 'SCHEDULE', payload: schedule });
    self.postMessage({ type: 'STATUS', payload: { state: 'idle', lastRun: new Date().toISOString() } });
  } catch (err) {
    self.postMessage({
      type: 'ERROR',
      payload: {
        message: err.message || 'Worker execution failed',
        stack: err.stack || ''
      }
    });
    self.postMessage({ type: 'STATUS', payload: { state: 'idle', lastRun: new Date().toISOString() } });
  }
}
