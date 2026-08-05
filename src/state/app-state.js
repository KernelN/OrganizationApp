import { IndexedDBAdapter } from '../data/idb-adapter.js';
import { eventBus } from './event-bus.js';
import { applyAccentColor } from '../utils/color-utils.js';
import { scheduleState } from './schedule-state.js';
import { computeSchedule } from '../engine/scheduler.js';

export class AppState {
  constructor() {
    this.dal = new IndexedDBAdapter();
    this.tasks = [];
    this.tags = [];
    this.dependencies = [];
    this.settings = null;
    this.listeners = new Set();
    this.initialized = false;
    this.worker = null;
    this.recomputeTimer = null;
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

  async init() {
    if (this.initialized) return;
    try {
      this.settings = await this.dal.getSettings();
      this.tasks = await this.dal.getTasks();
      this.tags = await this.dal.getTags();
      this.dependencies = await this.dal.getDependencies();

      if (this.settings?.accent_color) {
        applyAccentColor(this.settings.accent_color);
      }

      this.initWorker();

      this.initialized = true;
      this.notify();
      eventBus.emit('app:ready', { initialized: true });

      // Trigger initial scheduling pass immediately
      this.requestScheduleRecompute(0);
    } catch (err) {
      console.error('Failed to initialize AppState:', err);
    }
  }

  initWorker() {
    try {
      this.worker = new Worker(new URL('../engine/cronograma.worker.js', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (e) => {
        const { type, payload } = e.data || {};
        if (type === 'SCHEDULE_UPDATED') {
          scheduleState.setSchedule(payload);
          eventBus.emit('schedule:updated', payload);
          this.notify();
        }
      };

      this.worker.onerror = (err) => {
        console.warn('[Worker Error] Fallback to main-thread scheduler:', err);
        this.worker = null;
        this.requestScheduleRecompute(0);
      };
    } catch (err) {
      console.warn('Worker initialization failed (using main thread scheduler):', err);
      this.worker = null;
    }
  }

  /**
   * Request schedule recomputation in Web Worker (or main thread fallback) with 150ms debouncing.
   * @param {number} delayMs default 150ms
   */
  requestScheduleRecompute(delayMs = 150) {
    if (this.recomputeTimer) {
      clearTimeout(this.recomputeTimer);
    }

    this.recomputeTimer = setTimeout(() => {
      if (this.worker) {
        this.worker.postMessage({
          type: 'RECOMPUTE',
          payload: {
            tasks: this.tasks,
            tags: this.tags,
            dependencies: this.dependencies,
            settings: this.settings,
            now: new Date().toISOString()
          }
        });
      } else {
        // Synchronous main-thread scheduler fallback
        try {
          const schedule = computeSchedule(
            this.tasks,
            this.tags,
            this.dependencies,
            this.settings,
            new Date()
          );
          scheduleState.setSchedule(schedule);
          eventBus.emit('schedule:updated', schedule);
          this.notify();
        } catch (err) {
          console.error('[Main Thread Scheduler Error]:', err);
        }
      }
    }, delayMs);
  }

  // --- Task Mutations ---
  async addTask(taskData) {
    const newTask = await this.dal.createTask(taskData);
    this.tasks = [...this.tasks, newTask];
    this.notify();
    eventBus.emit('task:created', newTask);
    this.requestScheduleRecompute();
    return newTask;
  }

  async updateTask(id, updates) {
    const updated = await this.dal.updateTask(id, updates);
    this.tasks = this.tasks.map(t => (t.id === id ? updated : t));
    this.notify();
    eventBus.emit('task:updated', updated);
    this.requestScheduleRecompute();
    return updated;
  }

  async deleteTask(id) {
    await this.dal.deleteTask(id);
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.dependencies = this.dependencies.filter(d => d.task_id !== id && d.depends_on_id !== id);
    this.notify();
    eventBus.emit('task:deleted', { id });
    this.requestScheduleRecompute();
  }

  // --- Tag Mutations ---
  async addTag(tagData) {
    const newTag = await this.dal.createTag(tagData);
    this.tags = [...this.tags, newTag];
    this.notify();
    eventBus.emit('tag:created', newTag);
    this.requestScheduleRecompute();
    return newTag;
  }

  async updateTag(id, updates) {
    const updated = await this.dal.updateTag(id, updates);
    this.tags = this.tags.map(t => (t.id === id ? updated : t));
    this.notify();
    eventBus.emit('tag:updated', updated);
    this.requestScheduleRecompute();
    return updated;
  }

  async deleteTag(id) {
    await this.dal.deleteTag(id);
    this.tags = this.tags.filter(t => t.id !== id);
    this.notify();
    eventBus.emit('tag:deleted', { id });
    this.requestScheduleRecompute();
  }

  // --- Dependency Mutations ---
  async addDependency(taskId, dependsOnId, type = 'hard') {
    const newDep = await this.dal.addDependency(taskId, dependsOnId, type);
    this.dependencies = [...this.dependencies, newDep];
    this.notify();
    eventBus.emit('dependency:created', newDep);
    this.requestScheduleRecompute();
    return newDep;
  }

  async removeDependency(id) {
    await this.dal.removeDependency(id);
    this.dependencies = this.dependencies.filter(d => d.id !== id);
    this.notify();
    eventBus.emit('dependency:deleted', { id });
    this.requestScheduleRecompute();
  }

  // --- Settings Mutations ---
  async updateSettings(updates) {
    const updated = await this.dal.updateSettings(updates);
    this.settings = updated;
    if (updated.accent_color) {
      applyAccentColor(updated.accent_color);
    }
    this.notify();
    eventBus.emit('settings:updated', updated);
    this.requestScheduleRecompute();
    return updated;
  }
}

export const appState = new AppState();
