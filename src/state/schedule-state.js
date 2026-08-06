class ScheduleState extends EventTarget {
  constructor() {
    super();
    this.schedule = {
      computed_at: null,
      horizon_end: null,
      blocks: [],
      alerts: [],
      tag_windows_computed: []
    };
    this.status = 'idle'; // 'idle' | 'computing'
  }

  setSchedule(newSchedule) {
    this.schedule = newSchedule || {
      computed_at: null,
      horizon_end: null,
      blocks: [],
      alerts: [],
      tag_windows_computed: []
    };
    this.dispatchEvent(new CustomEvent('schedule-changed', { detail: this.schedule }));
  }

  setStatus(status) {
    this.status = status;
    this.dispatchEvent(new CustomEvent('status-changed', { detail: status }));
  }

  getBlocksForDay(dateISOStr) {
    if (!this.schedule || !Array.isArray(this.schedule.blocks)) return [];
    return this.schedule.blocks.filter(b => {
      const bDate = b.start.split('T')[0];
      return bDate === dateISOStr;
    });
  }
}

export const scheduleState = new ScheduleState();
