import { IndexedDBAdapter } from '../data/idb-adapter.js';
import { eventBus } from './event-bus.js';
import { applyAccentColor } from '../utils/color-utils.js';

export class AppState {
  constructor() {
    this.dal = new IndexedDBAdapter();
    this.tasks = [];
    this.tags = [];
    this.dependencies = [];
    this.settings = null;
    this.listeners = new Set();
    this.initialized = false;
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

      this.initialized = true;
      this.notify();
      eventBus.emit('app:ready', { initialized: true });
    } catch (err) {
      console.error('Failed to initialize AppState:', err);
    }
  }

  // --- Task Mutations ---
  async addTask(taskData) {
    const newTask = await this.dal.createTask(taskData);
    this.tasks = [...this.tasks, newTask];
    this.notify();
    eventBus.emit('task:created', newTask);
    return newTask;
  }

  async updateTask(id, updates) {
    const updated = await this.dal.updateTask(id, updates);
    this.tasks = this.tasks.map(t => (t.id === id ? updated : t));
    this.notify();
    eventBus.emit('task:updated', updated);
    return updated;
  }

  async deleteTask(id) {
    await this.dal.deleteTask(id);
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.dependencies = this.dependencies.filter(d => d.task_id !== id && d.depends_on_id !== id);
    this.notify();
    eventBus.emit('task:deleted', { id });
  }

  // --- Tag Mutations ---
  async addTag(tagData) {
    const newTag = await this.dal.createTag(tagData);
    this.tags = [...this.tags, newTag];
    this.notify();
    eventBus.emit('tag:created', newTag);
    return newTag;
  }

  async updateTag(id, updates) {
    const updated = await this.dal.updateTag(id, updates);
    this.tags = this.tags.map(t => (t.id === id ? updated : t));
    this.notify();
    eventBus.emit('tag:updated', updated);
    return updated;
  }

  async deleteTag(id) {
    await this.dal.deleteTag(id);
    this.tags = this.tags.filter(t => t.id !== id);
    this.notify();
    eventBus.emit('tag:deleted', { id });
  }

  // --- Dependency Mutations ---
  async addDependency(taskId, dependsOnId, type = 'hard') {
    const newDep = await this.dal.addDependency(taskId, dependsOnId, type);
    this.dependencies = [...this.dependencies, newDep];
    this.notify();
    eventBus.emit('dependency:created', newDep);
    return newDep;
  }

  async removeDependency(id) {
    await this.dal.removeDependency(id);
    this.dependencies = this.dependencies.filter(d => d.id !== id);
    this.notify();
    eventBus.emit('dependency:deleted', { id });
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
    return updated;
  }
}

export const appState = new AppState();
