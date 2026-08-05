import { openDB } from 'idb';
import { DataAccessLayer } from './dal.js';
import { DB_NAME, DB_VERSION, STORES, DEFAULT_SETTINGS } from './schemas.js';
import { ulid } from '../utils/ulid.js';

export class IndexedDBAdapter extends DataAccessLayer {
  constructor() {
    super();
    this.dbPromise = this.initDB();
  }

  async initDB() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.TASKS)) {
          const taskStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
          taskStore.createIndex('status', 'status', { unique: false });
          taskStore.createIndex('parent_task_id', 'parent_task_id', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.TAGS)) {
          db.createObjectStore(STORES.TAGS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.DEPENDENCIES)) {
          const depStore = db.createObjectStore(STORES.DEPENDENCIES, { keyPath: 'id' });
          depStore.createIndex('task_id', 'task_id', { unique: false });
          depStore.createIndex('depends_on_id', 'depends_on_id', { unique: false });
          depStore.createIndex('compound', ['task_id', 'depends_on_id'], { unique: true });
        }
        if (!db.objectStoreNames.contains(STORES.TIME_LOGS)) {
          const logStore = db.createObjectStore(STORES.TIME_LOGS, { keyPath: 'id' });
          logStore.createIndex('task_id', 'task_id', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
        }
      }
    }).then(async (db) => {
      // Initialize default settings if missing
      const existingSettings = await db.get(STORES.SETTINGS, 'global_settings');
      if (!existingSettings) {
        await db.put(STORES.SETTINGS, DEFAULT_SETTINGS);
      }
      return db;
    });
  }

  // --- Tasks ---
  async getTasks() {
    const db = await this.dbPromise;
    return db.getAll(STORES.TASKS);
  }

  async getTask(id) {
    const db = await this.dbPromise;
    return db.get(STORES.TASKS, id);
  }

  async createTask(task) {
    const db = await this.dbPromise;
    const now = new Date().toISOString();
    const newTask = {
      id: task.id || ulid(),
      title: task.title,
      description: task.description || '',
      color: task.color || '#6366F1',
      priority: task.priority ?? 0,
      tag_ids: task.tag_ids || [],
      deadline: task.deadline || null,
      alert_window_minutes: task.alert_window_minutes ?? null,
      duration_minutes: task.duration_minutes || 30,
      splittable: task.splittable ?? true,
      ignore_breaks: task.ignore_breaks ?? false,
      recurrence: task.recurrence || null,
      manual_schedule: task.manual_schedule || null,
      status: task.status || 'active',
      completed_at: task.completed_at || null,
      created_at: task.created_at || now,
      updated_at: now,
      parent_task_id: task.parent_task_id || null,
      accumulated_count: task.accumulated_count || 0
    };
    await db.put(STORES.TASKS, newTask);
    return newTask;
  }

  async updateTask(id, updates) {
    const db = await this.dbPromise;
    const existing = await db.get(STORES.TASKS, id);
    if (!existing) throw new Error(`Task ${id} not found`);
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };
    await db.put(STORES.TASKS, updated);
    return updated;
  }

  async deleteTask(id) {
    const db = await this.dbPromise;
    const tx = db.transaction([STORES.TASKS, STORES.DEPENDENCIES, STORES.TIME_LOGS], 'readwrite');
    await tx.objectStore(STORES.TASKS).delete(id);
    
    // Cleanup associated dependencies
    const depStore = tx.objectStore(STORES.DEPENDENCIES);
    const deps = await depStore.getAll();
    for (const dep of deps) {
      if (dep.task_id === id || dep.depends_on_id === id) {
        await depStore.delete(dep.id);
      }
    }
    await tx.done;
  }

  // --- Tags ---
  async getTags() {
    const db = await this.dbPromise;
    return db.getAll(STORES.TAGS);
  }

  async getTag(id) {
    const db = await this.dbPromise;
    return db.get(STORES.TAGS, id);
  }

  async createTag(tag) {
    const db = await this.dbPromise;
    const now = new Date().toISOString();
    const newTag = {
      id: tag.id || ulid(),
      name: tag.name,
      color: tag.color || '#3B82F6',
      duration_minutes: tag.duration_minutes ?? null,
      deadline: tag.deadline || null,
      start_date: tag.start_date || null,
      needs_dedicated_timeslot: tag.needs_dedicated_timeslot ?? false,
      time_window_mode: tag.time_window_mode || 'none',
      time_windows: tag.time_windows || {},
      auto_expand_config: tag.auto_expand_config || null,
      created_at: now,
      updated_at: now
    };
    await db.put(STORES.TAGS, newTag);
    return newTag;
  }

  async updateTag(id, updates) {
    const db = await this.dbPromise;
    const existing = await db.get(STORES.TAGS, id);
    if (!existing) throw new Error(`Tag ${id} not found`);
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };
    await db.put(STORES.TAGS, updated);
    return updated;
  }

  async deleteTag(id) {
    const db = await this.dbPromise;
    await db.delete(STORES.TAGS, id);
  }

  // --- Dependencies & Cycle Detection ---
  async getDependencies() {
    const db = await this.dbPromise;
    return db.getAll(STORES.DEPENDENCIES);
  }

  async addDependency(taskId, dependsOnId, type = 'hard') {
    if (taskId === dependsOnId) {
      throw new Error('A task cannot depend on itself');
    }
    const db = await this.dbPromise;
    const allDeps = await db.getAll(STORES.DEPENDENCIES);

    // Check if adding this edge introduces a cycle (DFS traversal)
    if (this._hasCycle(taskId, dependsOnId, allDeps)) {
      throw new Error('Adding this dependency creates a cyclic dependency loop');
    }

    const newDep = {
      id: ulid(),
      task_id: taskId,
      depends_on_id: dependsOnId,
      type,
      created_at: new Date().toISOString()
    };
    await db.put(STORES.DEPENDENCIES, newDep);
    return newDep;
  }

  async removeDependency(id) {
    const db = await this.dbPromise;
    await db.delete(STORES.DEPENDENCIES, id);
  }

  _hasCycle(taskId, dependsOnId, existingDeps) {
    // Adjacency list: task -> array of prerequisite tasks
    const graph = new Map();
    for (const dep of existingDeps) {
      if (!graph.has(dep.task_id)) graph.set(dep.task_id, []);
      graph.get(dep.task_id).push(dep.depends_on_id);
    }
    if (!graph.has(taskId)) graph.set(taskId, []);
    graph.get(taskId).push(dependsOnId);

    // DFS starting from dependsOnId to see if we can reach taskId
    const visited = new Set();
    const stack = [dependsOnId];

    while (stack.length > 0) {
      const current = stack.pop();
      if (current === taskId) return true; // Cycle detected!
      if (!visited.has(current)) {
        visited.add(current);
        const neighbors = graph.get(current) || [];
        for (const neighbor of neighbors) {
          stack.push(neighbor);
        }
      }
    }
    return false;
  }

  // --- Time Logs ---
  async getTimeLogs(taskId = null) {
    const db = await this.dbPromise;
    if (taskId) {
      return db.getAllFromIndex(STORES.TIME_LOGS, 'task_id', taskId);
    }
    return db.getAll(STORES.TIME_LOGS);
  }

  async createTimeLog(timeLog) {
    const db = await this.dbPromise;
    const newLog = {
      id: timeLog.id || ulid(),
      task_id: timeLog.task_id,
      logged_minutes: timeLog.logged_minutes,
      notes: timeLog.notes || '',
      logged_at: timeLog.logged_at || new Date().toISOString()
    };
    await db.put(STORES.TIME_LOGS, newLog);
    return newLog;
  }

  // --- Settings ---
  async getSettings() {
    const db = await this.dbPromise;
    const settings = await db.get(STORES.SETTINGS, 'global_settings');
    return settings || DEFAULT_SETTINGS;
  }

  async updateSettings(updates) {
    const db = await this.dbPromise;
    const current = await this.getSettings();
    const updated = {
      ...current,
      ...updates
    };
    await db.put(STORES.SETTINGS, updated);
    return updated;
  }
}
