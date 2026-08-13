import { IndexedDBAdapter } from '../data/idb-adapter.js';
import { VercelSync } from '../data/vercel-sync.js';
import { scheduleState } from './schedule-state.js';
import { eventBus } from './event-bus.js';
import { applyAccentColor } from '../utils/color-utils.js';
import { checkMissedOccurrences } from '../utils/date-utils.js';

class AppState {
  constructor() {
    this.dal = new IndexedDBAdapter();
    this.sync = new VercelSync();
    this.worker = null;
    this.listeners = new Set();

    this.tasks = [];
    this.tags = [];
    this.dependencies = [];
    this.settings = {};
    this.timeLogs = [];
    this.schedule = scheduleState.schedule;

    this.syncDebounceTimer = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // 1. Load initial data from DAL
      this.settings = await this.dal.getSettings();
      applyAccentColor(this.settings.accent_color);

      this.tasks = await this.dal.getTasks();
      this.tags = await this.dal.getTags();
      this.dependencies = await this.dal.getDependencies();
      this.timeLogs = await this.dal.getTimeLogs();

      // 1b. Check missed occurrences for recurring tasks
      const now = new Date().toISOString();
      for (const t of this.tasks) {
        if (t.recurrence && t.status === 'active') {
          const { missedCount, newNextOccurrence, newAccumulatedCount } = checkMissedOccurrences(t, now);
          if (missedCount > 0) {
            const updated = await this.dal.updateTask(t.id, {
              accumulated_count: newAccumulatedCount,
              recurrence: {
                ...t.recurrence,
                next_occurrence: newNextOccurrence
              }
            });
            const idx = this.tasks.findIndex(item => item.id === t.id);
            if (idx !== -1) this.tasks[idx] = updated;
          }
        }
      }

      // 2. Initialize Vercel sync config
      if (this.settings.vercel_sync) {
        this.sync.updateConfig(this.settings.vercel_sync);
      }

      // 3. Initialize Worker
      this.initWorker();

      // 4. Trigger initial schedule computation
      this.triggerRecompute();

      this.isInitialized = true;
      this.notify();
    } catch (err) {
      console.error('AppState initialization failed:', err);
      eventBus.emit('toast:show', { message: `App init failed: ${err.message}`, type: 'error' });
    }
  }

  initWorker() {
    if (this.worker) this.worker.terminate();

    this.worker = new Worker(new URL('../engine/cronograma.worker.js', import.meta.url), { type: 'module' });

    this.worker.onmessage = (e) => {
      const { type, payload } = e.data || {};
      if (type === 'SCHEDULE') {
        scheduleState.setSchedule(payload);
        this.schedule = payload;
        this.notify();
      } else if (type === 'STATUS') {
        scheduleState.setStatus(payload.state);
        this.notify();
      } else if (type === 'ERROR') {
        eventBus.emit('toast:show', { message: `Scheduler error: ${payload.message}`, type: 'error' });
      }
    };

    // Configure timer interval in worker
    if (this.settings.scheduler_interval_minutes) {
      this.worker.postMessage({
        type: 'CONFIG',
        payload: { interval_ms: this.settings.scheduler_interval_minutes * 60 * 1000 }
      });
    }
  }

  triggerRecompute() {
    if (!this.worker) return;
    this.worker.postMessage({
      type: 'COMPUTE',
      payload: {
        tasks: this.tasks,
        tags: this.tags,
        dependencies: this.dependencies,
        settings: this.settings,
        now: new Date().toISOString()
      }
    });
  }

  debounceSync() {
    if (this.syncDebounceTimer) clearTimeout(this.syncDebounceTimer);
    this.syncDebounceTimer = setTimeout(async () => {
      if (this.sync.isConfigured()) {
        try {
          await this.sync.push(this.dal);
          eventBus.emit('sync:updated', { lastSync: new Date().toISOString() });
        } catch (err) {
          eventBus.emit('toast:show', { message: err.message, type: 'warning' });
        }
      }
    }, 30000);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      if (typeof listener.requestUpdate === 'function') {
        listener.requestUpdate();
      } else if (typeof listener === 'function') {
        listener(this);
      }
    }
  }

  /* ── Task Operations ── */
  async createTask(taskData) {
    try {
      const task = await this.dal.createTask(taskData);
      this.tasks.push(task);
      this.triggerRecompute();
      this.debounceSync();
      this.notify();
      eventBus.emit('toast:show', { message: `Task "${task.title}" created.`, type: 'success' });
      return task;
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
      throw err;
    }
  }

  async updateTask(id, updates) {
    try {
      const updated = await this.dal.updateTask(id, updates);
      const idx = this.tasks.findIndex(t => t.id === id);
      if (idx !== -1) this.tasks[idx] = updated;
      this.triggerRecompute();
      this.debounceSync();
      this.notify();
      eventBus.emit('toast:show', { message: `Task updated.`, type: 'success' });
      return updated;
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
      throw err;
    }
  }

  async deleteTask(id) {
    try {
      await this.dal.deleteTask(id);
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.dependencies = this.dependencies.filter(d => d.task_id !== id && d.depends_on_id !== id);
      this.timeLogs = this.timeLogs.filter(l => l.task_id !== id);
      this.triggerRecompute();
      this.debounceSync();
      this.notify();
      eventBus.emit('toast:show', { message: 'Task deleted.', type: 'info' });
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
      throw err;
    }
  }

  async completeTask(id) {
    try {
      const completed = await this.dal.completeTask(id);
      const idx = this.tasks.findIndex(t => t.id === id);
      if (idx !== -1) this.tasks[idx] = completed;
      this.triggerRecompute();
      this.debounceSync();
      this.notify();

      if (completed.accumulated_count > 0) {
        eventBus.emit('toast:show', { message: `Completed 1 instance (${completed.accumulated_count} accumulated remaining) ⚡`, type: 'success' });
      } else if (completed.recurrence) {
        const nextDate = completed.recurrence.next_occurrence ? new Date(completed.recurrence.next_occurrence).toLocaleDateString() : '';
        eventBus.emit('toast:show', { message: `Repeating task completed! Next: ${nextDate} 🔄`, type: 'success' });
      } else {
        eventBus.emit('toast:show', { message: 'Task completed! 🎉', type: 'success' });
      }
      return completed;
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
      throw err;
    }
  }

  /* ── Tag Operations ── */
  async createTag(tagData) {
    try {
      const tag = await this.dal.createTag(tagData);
      this.tags.push(tag);
      // createTag does not trigger recompute (no tasks linked yet)
      this.debounceSync();
      this.notify();
      eventBus.emit('toast:show', { message: `Tag "${tag.name}" created.`, type: 'success' });
      return tag;
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
      throw err;
    }
  }

  async updateTag(id, updates) {
    try {
      const updated = await this.dal.updateTag(id, updates);
      const idx = this.tags.findIndex(t => t.id === id);
      if (idx !== -1) this.tags[idx] = updated;
      this.triggerRecompute();
      this.debounceSync();
      this.notify();
      eventBus.emit('toast:show', { message: 'Tag updated.', type: 'success' });
      return updated;
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
      throw err;
    }
  }

  async deleteTag(id) {
    try {
      await this.dal.deleteTag(id);
      this.tags = this.tags.filter(t => t.id !== id);
      this.tasks.forEach(t => {
        if (Array.isArray(t.tag_ids)) {
          t.tag_ids = t.tag_ids.filter(tId => tId !== id);
        }
      });
      this.triggerRecompute();
      this.debounceSync();
      this.notify();
      eventBus.emit('toast:show', { message: 'Tag deleted.', type: 'info' });
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
      throw err;
    }
  }

  /* ── Dependency Operations ── */
  async createDependency(depData) {
    try {
      const dep = await this.dal.createDependency(depData);
      if (!this.dependencies.some(d => d.id === dep.id)) {
        this.dependencies.push(dep);
      }
      this.triggerRecompute();
      this.debounceSync();
      this.notify();
      eventBus.emit('toast:show', { message: 'Dependency added.', type: 'success' });
      return dep;
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
      throw err;
    }
  }

  async deleteDependency(id) {
    try {
      await this.dal.deleteDependency(id);
      this.dependencies = this.dependencies.filter(d => d.id !== id);
      this.triggerRecompute();
      this.debounceSync();
      this.notify();
      eventBus.emit('toast:show', { message: 'Dependency removed.', type: 'info' });
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
      throw err;
    }
  }

  /* ── Time Log Operations ── */
  async createTimeLog(logData) {
    try {
      const log = await this.dal.createTimeLog(logData);
      this.timeLogs.push(log);
      // Time logs are informational only — no recompute trigger
      this.debounceSync();
      this.notify();
      eventBus.emit('toast:show', { message: 'Time log added.', type: 'success' });
      return log;
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
      throw err;
    }
  }

  async deleteTimeLog(id) {
    try {
      await this.dal.deleteTimeLog(id);
      this.timeLogs = this.timeLogs.filter(l => l.id !== id);
      this.notify();
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
      throw err;
    }
  }

  /* ── Settings Operations ── */
  async updateSettings(updates) {
    try {
      this.settings = await this.dal.updateSettings(updates);
      if (updates.accent_color) {
        applyAccentColor(updates.accent_color);
      }
      if (updates.vercel_sync) {
        this.sync.updateConfig(updates.vercel_sync);
      }
      this.triggerRecompute();
      this.debounceSync();
      this.notify();
      eventBus.emit('toast:show', { message: 'Settings saved.', type: 'success' });
      return this.settings;
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
      throw err;
    }
  }
}

export const appState = new AppState();

/**
 * Lit ReactiveController helper for Web Components.
 */
export class AppStateController {
  constructor(host) {
    this.host = host;
    this.host.addController(this);
    this.unsubscribe = null;
  }

  hostConnected() {
    this.unsubscribe = appState.subscribe(this.host);
  }

  hostDisconnected() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
