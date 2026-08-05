import { computeSchedule } from './scheduler.js';

self.onmessage = function (e) {
  const { type, payload } = e.data || {};

  if (type === 'RECOMPUTE') {
    const { tasks, tags, dependencies, settings, now } = payload || {};
    try {
      const currentNow = now ? new Date(now) : new Date();
      const schedule = computeSchedule(tasks, tags, dependencies, settings, currentNow);
      self.postMessage({
        type: 'SCHEDULE_UPDATED',
        payload: schedule
      });
    } catch (err) {
      console.error('[Cronograma Worker Error]:', err);
      self.postMessage({
        type: 'SCHEDULE_ERROR',
        error: err.message
      });
    }
  }
};
