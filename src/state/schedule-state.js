/**
 * Computed schedule state holder (in memory).
 */
export class ScheduleState {
  constructor() {
    this.schedule = {
      computed_at: null,
      horizon_end: null,
      blocks: [],
      alerts: [],
      tag_windows_computed: []
    };
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  setSchedule(newSchedule) {
    this.schedule = newSchedule || {
      computed_at: null,
      horizon_end: null,
      blocks: [],
      alerts: [],
      tag_windows_computed: []
    };
    this.notify();
  }

  get blocks() {
    return this.schedule.blocks || [];
  }

  get alerts() {
    return this.schedule.alerts || [];
  }
}

export const scheduleState = new ScheduleState();
