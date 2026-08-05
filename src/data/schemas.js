/**
 * Database store names and default settings schema for Cronograma.
 */

export const DB_NAME = 'cronograma_db';
export const DB_VERSION = 1;

export const STORES = {
  TASKS: 'tasks',
  TAGS: 'tags',
  DEPENDENCIES: 'dependencies',
  TIME_LOGS: 'time_logs',
  SETTINGS: 'settings'
};

export const DEFAULT_SETTINGS = {
  id: 'global_settings',
  work_windows: {
    monday:    [{ start: '09:00', end: '17:00' }],
    tuesday:   [{ start: '09:00', end: '17:00' }],
    wednesday: [{ start: '09:00', end: '17:00' }],
    thursday:  [{ start: '09:00', end: '17:00' }],
    friday:    [{ start: '09:00', end: '17:00' }],
    saturday:  [],
    sunday:    []
  },
  break_windows: {
    monday:    [{ start: '12:00', end: '13:00' }],
    tuesday:   [{ start: '12:00', end: '13:00' }],
    wednesday: [{ start: '12:00', end: '13:00' }],
    thursday:  [{ start: '12:00', end: '13:00' }],
    friday:    [{ start: '12:00', end: '13:00' }],
    saturday:  [],
    sunday:    []
  },
  scheduler_interval_minutes: 5,
  scheduling_horizon_days: 7,
  slot_granularity_minutes: 15,
  accent_color: '#6366F1',
  github_sync: {
    enabled: false,
    pat: '',
    repo: '',
    owner: '',
    auto_sync_interval_seconds: 30
  }
};
