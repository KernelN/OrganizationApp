/**
 * Custom error thrown when adding a dependency edge creates a cycle in the task graph.
 */
export class CycleDetectedError extends Error {
  constructor(message = 'Dependency cycle detected') {
    super(message);
    this.name = 'CycleDetectedError';
  }
}

/**
 * Custom error thrown when data fails schema validation.
 */
export class ValidationError extends Error {
  constructor(message = 'Validation error', details = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Custom error thrown during GitHub sync operations.
 */
export class SyncError extends Error {
  constructor(message = 'Sync operation failed') {
    super(message);
    this.name = 'SyncError';
  }
}

/**
 * Custom error thrown by the Cronograma scheduling engine.
 */
export class SchedulerError extends Error {
  constructor(message = 'Scheduler error') {
    super(message);
    this.name = 'SchedulerError';
  }
}
