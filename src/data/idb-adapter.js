import { openDB } from 'idb';
import { DataAccessLayer } from './dal.js';
import { validateTask, validateTag, validateDependency } from './schemas.js';
import { generateULID } from '../utils/ulid.js';
import { CycleDetectedError } from '../utils/errors.js';
import { detectCycleFromDependencies } from '../engine/dependency-resolver.js';
import { advanceRecurrenceOccurrence } from '../utils/date-utils.js';
import { getTagAncestors, getTagDescendants, getNearestActiveAncestor } from '../utils/validators.js';

const DB_NAME = 'cronograma_db';
const DB_VERSION = 2;
const SETTINGS_KEY = 'user_settings';

export const DEFAULT_SETTINGS = {
  key: SETTINGS_KEY,
  work_windows: {
    monday:    [{ start: "09:00", end: "17:00" }],
    tuesday:   [{ start: "09:00", end: "17:00" }],
    wednesday: [{ start: "09:00", end: "17:00" }],
    thursday:  [{ start: "09:00", end: "17:00" }],
    friday:    [{ start: "09:00", end: "17:00" }],
    saturday:  [],
    sunday:    []
  },
  break_windows: {
    monday:    [],
    tuesday:   [],
    wednesday: [],
    thursday:  [],
    friday:    [],
    saturday:  [],
    sunday:    []
  },
  scheduler_interval_minutes: 5,
  scheduling_horizon_days: 7,
  slot_granularity_minutes: 15,
  accent_color: '#6366F1',
  completed_history_limit: 100,
  default_accumulation_cap: 5,
  default_splittable: true,
  locale: 'en',
  vercel_sync: {
    enabled: true,
    sync_key: 'crono_main_sync',
    api_url: '/api/sync'
  },
  schema_version: 1
};

export class IndexedDBAdapter extends DataAccessLayer {
  constructor() {
    super();
    this.dbPromise = this._initDB();
  }

  async _initDB() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('status', 'status', { unique: false });
          taskStore.createIndex('deadline', 'deadline', { unique: false });
          taskStore.createIndex('priority', 'priority', { unique: false });
          taskStore.createIndex('parent_task_id', 'parent_task_id', { unique: false });
        }

        // Tags store
        if (!db.objectStoreNames.contains('tags')) {
          const tagStore = db.createObjectStore('tags', { keyPath: 'id' });
          tagStore.createIndex('name', 'name', { unique: false });
        }

        // Dependencies store
        if (!db.objectStoreNames.contains('dependencies')) {
          const depStore = db.createObjectStore('dependencies', { keyPath: 'id' });
          depStore.createIndex('task_id', 'task_id', { unique: false });
          depStore.createIndex('depends_on_id', 'depends_on_id', { unique: false });
        }

        // Time logs store
        if (!db.objectStoreNames.contains('time_logs')) {
          const logStore = db.createObjectStore('time_logs', { keyPath: 'id' });
          logStore.createIndex('task_id', 'task_id', { unique: false });
          logStore.createIndex('logged_at', 'logged_at', { unique: false });
        }

        // Settings store
        if (db.objectStoreNames.contains('settings')) {
          db.deleteObjectStore('settings');
        }
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    });
  }

  /* ── Tasks ── */
  async getTasks(filter = {}) {
    const db = await this.dbPromise;
    let tasks = await db.getAll('tasks');

    if (filter.status) {
      tasks = tasks.filter(t => t.status === filter.status);
    }
    if (filter.tag_id) {
      tasks = tasks.filter(t => Array.isArray(t.tag_ids) && t.tag_ids.includes(filter.tag_id));
    }
    if (typeof filter.priority_gte === 'number') {
      tasks = tasks.filter(t => t.priority >= filter.priority_gte);
    }
    return tasks;
  }

  async getTaskById(id) {
    const db = await this.dbPromise;
    return (await db.get('tasks', id)) || null;
  }

  async createTask(taskData) {
    validateTask(taskData);
    const now = new Date().toISOString();
    const task = {
      id: generateULID(),
      title: taskData.title,
      description: taskData.description || '',
      color: taskData.color || '#6366F1',
      priority: typeof taskData.priority === 'number' ? taskData.priority : 0,
      tag_ids: Array.isArray(taskData.tag_ids) ? taskData.tag_ids : [],
      deadline: taskData.deadline || null,
      alert_window_hours: taskData.alert_window_hours ?? null,
      duration_hours: taskData.duration_hours,
      splittable: taskData.splittable ?? true,
      ignore_breaks: taskData.ignore_breaks ?? false,
      recurrence: taskData.recurrence || null,
      manual_schedule: taskData.manual_schedule || null,
      status: 'active',
      completed_at: null,
      created_at: now,
      updated_at: now,
      parent_task_id: taskData.parent_task_id || null,
      accumulated_count: taskData.accumulated_count || 0
    };

    const db = await this.dbPromise;
    await db.put('tasks', task);
    return task;
  }

  async updateTask(id, updates) {
    const db = await this.dbPromise;
    const existing = await db.get('tasks', id);
    if (!existing) {
      throw new Error(`Task with id ${id} not found`);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString()
    };
    validateTask(updated);

    await db.put('tasks', updated);
    return updated;
  }

  async deleteTask(id) {
    const db = await this.dbPromise;
    const tx = db.transaction(['tasks', 'dependencies', 'time_logs'], 'readwrite');
    await tx.objectStore('tasks').delete(id);

    // Delete dependencies referencing this task
    const depStore = tx.objectStore('dependencies');
    const allDeps = await depStore.getAll();
    for (const dep of allDeps) {
      if (dep.task_id === id || dep.depends_on_id === id) {
        await depStore.delete(dep.id);
      }
    }

    // Delete time logs for this task
    const logStore = tx.objectStore('time_logs');
    const allLogs = await logStore.getAll();
    for (const log of allLogs) {
      if (log.task_id === id) {
        await logStore.delete(log.id);
      }
    }

    await tx.done;
  }

  async completeTask(id) {
    const db = await this.dbPromise;
    const existing = await db.get('tasks', id);
    if (!existing) {
      throw new Error(`Task with id ${id} not found`);
    }

    const now = new Date().toISOString();

    // 1. If accumulated count > 0, decrement counter and track iteration
    if (existing.accumulated_count && existing.accumulated_count > 0) {
      const nextCompleted = (existing.recurrence?.iterations_completed || 0) + 1;
      const maxRepeats = existing.recurrence?.max_repeats;
      const isFinished = Boolean(maxRepeats && nextCompleted >= maxRepeats && (existing.accumulated_count - 1 <= 0));

      const updated = await this.updateTask(id, {
        accumulated_count: Math.max(0, existing.accumulated_count - 1),
        status: isFinished ? 'completed' : 'active',
        completed_at: isFinished ? now : null,
        recurrence: existing.recurrence ? {
          ...existing.recurrence,
          iterations_completed: nextCompleted
        } : null,
        updated_at: now
      });
      return updated;
    }

    // 2. If repeating task with 0 accumulated count, advance next_occurrence and update last_occurrence
    if (existing.recurrence) {
      const nextCompleted = (existing.recurrence.iterations_completed || 0) + 1;
      const maxRepeats = existing.recurrence.max_repeats;
      const isFinished = Boolean(maxRepeats && nextCompleted >= maxRepeats);

      if (isFinished) {
        const updated = await this.updateTask(id, {
          status: 'completed',
          completed_at: now,
          accumulated_count: 0,
          recurrence: {
            ...existing.recurrence,
            iterations_completed: nextCompleted,
            last_occurrence: now
          },
          updated_at: now
        });
        const settings = await this.getSettings();
        await this._enforceHistoryLimit(settings.completed_history_limit);
        return updated;
      }

      const currentNext = existing.recurrence.next_occurrence ? new Date(existing.recurrence.next_occurrence) : new Date(now);
      const nextDate = advanceRecurrenceOccurrence(currentNext, existing.recurrence);
      const updated = await this.updateTask(id, {
        status: 'active',
        accumulated_count: 0,
        recurrence: {
          ...existing.recurrence,
          iterations_completed: nextCompleted,
          next_occurrence: nextDate.toISOString(),
          last_occurrence: now
        },
        updated_at: now
      });
      return updated;
    }

    // 3. One-off task: mark completed
    const updated = await this.updateTask(id, {
      status: 'completed',
      completed_at: now
    });

    const settings = await this.getSettings();
    await this._enforceHistoryLimit(settings.completed_history_limit);
    return updated;
  }

  async getCompletedTasks() {
    const db = await this.dbPromise;
    const tasks = await db.getAllFromIndex('tasks', 'status', 'completed');
    return tasks.sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0));
  }

  async _enforceHistoryLimit(limit = 100) {
    const completed = await this.getCompletedTasks();
    if (completed.length > limit) {
      const excess = completed.slice(limit);
      for (const task of excess) {
        await this.deleteTask(task.id);
      }
    }
  }

  /* ── Tags ── */
  async getTags() {
    const db = await this.dbPromise;
    return await db.getAll('tags');
  }

  async getTagById(id) {
    const db = await this.dbPromise;
    return (await db.get('tags', id)) || null;
  }

  async createTag(tagData) {
    validateTag(tagData);
    const now = new Date().toISOString();
    const tag = {
      id: generateULID(),
      name: tagData.name,
      color: tagData.color,
      parent_tag_id: tagData.parent_tag_id || null,
      duration_hours: tagData.duration_hours ?? null,
      deadline: tagData.deadline || null,
      start_date: tagData.start_date || null,
      needs_dedicated_timeslot: tagData.needs_dedicated_timeslot ?? false,
      time_window_mode: tagData.time_window_mode || 'none',
      time_windows: tagData.time_windows || {},
      auto_expand_config: tagData.auto_expand_config || null,
      archived: tagData.archived ?? false,
      archived_at: tagData.archived_at || null,
      created_at: now,
      updated_at: now
    };

    const db = await this.dbPromise;
    await db.put('tags', tag);
    return tag;
  }

  async updateTag(id, updates) {
    const db = await this.dbPromise;
    const existing = await db.get('tags', id);
    if (!existing) {
      throw new Error(`Tag with id ${id} not found`);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString()
    };
    validateTag(updated);

    await db.put('tags', updated);
    return updated;
  }

  async archiveTag(id, options = {}) {
    const db = await this.dbPromise;
    const targetTag = await db.get('tags', id);
    if (!targetTag) {
      throw new Error(`Tag with id ${id} not found`);
    }

    const allTags = await db.getAll('tags');
    const now = new Date().toISOString();
    const descendants = getTagDescendants(id, allTags).filter(t => !t.archived);

    const toArchive = new Set([id]);
    const toUnlink = new Map(); // subtagId -> newParentId (or null)

    for (const subtag of descendants) {
      const action = options.subtagActions?.[subtag.id] || 'archive';
      if (action === 'archive') {
        toArchive.add(subtag.id);
      } else if (action === 'unlink') {
        const nearest = getNearestActiveAncestor(subtag.id, allTags, toArchive);
        toUnlink.set(subtag.id, nearest ? nearest.id : null);
      }
    }

    const tx = db.transaction(['tags', 'tasks'], 'readwrite');
    const tagStore = tx.objectStore('tags');

    for (const tagId of toArchive) {
      const tg = await tagStore.get(tagId);
      if (tg) {
        tg.archived = true;
        tg.archived_at = now;
        tg.updated_at = now;
        await tagStore.put(tg);
      }
    }

    for (const [subtagId, newParentId] of toUnlink.entries()) {
      const tg = await tagStore.get(subtagId);
      if (tg) {
        tg.parent_tag_id = newParentId;
        tg.updated_at = now;
        await tagStore.put(tg);
      }
    }

    // Remove archived tags from ACTIVE tasks only; completed tasks retain them
    const taskStore = tx.objectStore('tasks');
    const allTasks = await taskStore.getAll();
    for (const task of allTasks) {
      if (task.status === 'active' && Array.isArray(task.tag_ids) && task.tag_ids.some(tId => toArchive.has(tId))) {
        task.tag_ids = task.tag_ids.filter(tId => !toArchive.has(tId));
        task.updated_at = now;
        await taskStore.put(task);
      }
    }

    await tx.done;
    return { archivedTagIds: Array.from(toArchive), unlinkedTagIds: Array.from(toUnlink.keys()) };
  }

  async unarchiveTag(id, options = {}) {
    const db = await this.dbPromise;
    const targetTag = await db.get('tags', id);
    if (!targetTag) {
      throw new Error(`Tag with id ${id} not found`);
    }

    const allTags = await db.getAll('tags');
    const now = new Date().toISOString();
    const toUnarchive = new Set([id]);
    const toReparent = new Map(); // childId -> newParentId

    if (targetTag.parent_tag_id) {
      const ancestors = getTagAncestors(id, allTags);
      let currentChildId = id;
      for (const ancestor of ancestors) {
        if (ancestor.archived) {
          const action = options.parentActions?.[ancestor.id] || 'unarchive';
          if (action === 'unarchive') {
            toUnarchive.add(ancestor.id);
            currentChildId = ancestor.id;
          } else if (action === 'unlink') {
            const nearest = getNearestActiveAncestor(ancestor.id, allTags);
            toReparent.set(currentChildId, nearest ? nearest.id : null);
            break;
          }
        }
      }
    }

    const tx = db.transaction(['tags'], 'readwrite');
    const tagStore = tx.objectStore('tags');

    for (const tagId of toUnarchive) {
      const tg = await tagStore.get(tagId);
      if (tg) {
        tg.archived = false;
        tg.archived_at = null;
        tg.updated_at = now;
        await tagStore.put(tg);
      }
    }

    for (const [childId, newParentId] of toReparent.entries()) {
      const tg = await tagStore.get(childId);
      if (tg) {
        tg.parent_tag_id = newParentId;
        tg.updated_at = now;
        await tagStore.put(tg);
      }
    }

    await tx.done;
    return { unarchivedTagIds: Array.from(toUnarchive), reparentedTagIds: Array.from(toReparent.keys()) };
  }

  async deleteTag(id, options = {}) {
    const db = await this.dbPromise;
    const targetTag = await db.get('tags', id);
    if (!targetTag) return;

    const allTags = await db.getAll('tags');
    const descendants = getTagDescendants(id, allTags);

    const tagsToDelete = new Set([id]);
    const tagsToReparent = new Map(); // subtagId -> newParentId

    for (const subtag of descendants) {
      const action = options.subtagActions?.[subtag.id] || 'delete';
      if (action === 'unlink') {
        const nearest = getNearestActiveAncestor(subtag.id, allTags, tagsToDelete);
        tagsToReparent.set(subtag.id, nearest ? nearest.id : targetTag.parent_tag_id || null);
      } else {
        tagsToDelete.add(subtag.id);
      }
    }

    const tx = db.transaction(['tags', 'tasks'], 'readwrite');
    const tagStore = tx.objectStore('tags');

    for (const tagId of tagsToDelete) {
      await tagStore.delete(tagId);
    }

    for (const [subtagId, newParentId] of tagsToReparent.entries()) {
      const tg = await tagStore.get(subtagId);
      if (tg) {
        tg.parent_tag_id = newParentId;
        tg.updated_at = new Date().toISOString();
        await tagStore.put(tg);
      }
    }

    // Update tasks
    const taskStore = tx.objectStore('tasks');
    const allTasks = await taskStore.getAll();
    const now = new Date().toISOString();
    const taskAction = options.taskAction || 'untag';

    for (const task of allTasks) {
      if (Array.isArray(task.tag_ids) && task.tag_ids.some(tId => tagsToDelete.has(tId))) {
        let newTagIds = [...task.tag_ids];

        if (taskAction === 'reassign_to_parent' && targetTag.parent_tag_id) {
          // Replace target tag or any deleted subtag with target parent
          newTagIds = newTagIds.map(tId => (tagsToDelete.has(tId) ? targetTag.parent_tag_id : tId));
          // Deduplicate
          newTagIds = Array.from(new Set(newTagIds));
        } else {
          // Untag all deleted tag IDs
          newTagIds = newTagIds.filter(tId => !tagsToDelete.has(tId));
        }

        task.tag_ids = newTagIds;
        task.updated_at = now;
        await taskStore.put(task);
      }
    }

    await tx.done;
  }

  /* ── Dependencies ── */
  async getDependencies() {
    const db = await this.dbPromise;
    return await db.getAll('dependencies');
  }

  async getDependenciesForTask(taskId) {
    const db = await this.dbPromise;
    const all = await db.getAll('dependencies');
    return all.filter(d => d.task_id === taskId || d.depends_on_id === taskId);
  }

  async createDependency(depData) {
    validateDependency(depData);

    const db = await this.dbPromise;
    const existingDeps = await db.getAll('dependencies');

    // Duplicate check
    const duplicate = existingDeps.find(
      d => d.task_id === depData.task_id && d.depends_on_id === depData.depends_on_id
    );
    if (duplicate) {
      return duplicate;
    }

    // Cycle detection check
    const hasCycle = detectCycleFromDependencies(existingDeps, depData);
    if (hasCycle) {
      throw new CycleDetectedError(`Adding dependency creates a cycle between ${depData.task_id} and ${depData.depends_on_id}`);
    }

    const dep = {
      id: generateULID(),
      task_id: depData.task_id,
      depends_on_id: depData.depends_on_id,
      type: depData.type,
      created_at: new Date().toISOString()
    };

    await db.put('dependencies', dep);
    return dep;
  }

  async deleteDependency(id) {
    const db = await this.dbPromise;
    await db.delete('dependencies', id);
  }

  /* ── Time Logs ── */
  async getTimeLogs(filter = {}) {
    const db = await this.dbPromise;
    let logs = await db.getAll('time_logs');
    if (filter.task_id) {
      logs = logs.filter(l => l.task_id === filter.task_id);
    }
    return logs;
  }

  async createTimeLog(logData) {
    if (!logData.task_id || typeof logData.logged_hours !== 'number') {
      throw new Error('Time log requires task_id and logged_hours');
    }
    const log = {
      id: generateULID(),
      task_id: logData.task_id,
      logged_hours: logData.logged_hours,
      notes: logData.notes || '',
      logged_at: logData.logged_at || new Date().toISOString()
    };

    const db = await this.dbPromise;
    await db.put('time_logs', log);
    return log;
  }

  async deleteTimeLog(id) {
    const db = await this.dbPromise;
    await db.delete('time_logs', id);
  }

  /* ── Settings ── */
  async getSettings() {
    const db = await this.dbPromise;
    const settings = await db.get('settings', SETTINGS_KEY);
    if (!settings) {
      const defaultWithKey = { ...DEFAULT_SETTINGS, key: SETTINGS_KEY };
      await db.put('settings', defaultWithKey);
      return defaultWithKey;
    }
    if (!settings.vercel_sync) {
      settings.vercel_sync = { ...DEFAULT_SETTINGS.vercel_sync };
    } else {
      if (!settings.vercel_sync.sync_key) {
        settings.vercel_sync.sync_key = DEFAULT_SETTINGS.vercel_sync.sync_key;
      }
      if (typeof settings.vercel_sync.enabled !== 'boolean') {
        settings.vercel_sync.enabled = true;
      }
    }
    return settings;
  }

  async updateSettings(updates) {
    const db = await this.dbPromise;
    const current = await this.getSettings();
    const updated = {
      ...current,
      ...updates,
      key: SETTINGS_KEY
    };
    await db.put('settings', updated);
    return updated;
  }

  /* ── Bulk Export / Import ── */
  async exportAll() {
    const db = await this.dbPromise;
    return {
      tasks: await db.getAll('tasks'),
      tags: await db.getAll('tags'),
      dependencies: await db.getAll('dependencies'),
      time_logs: await db.getAll('time_logs'),
      settings: await this.getSettings()
    };
  }

  async importAll(data) {
    const db = await this.dbPromise;
    const tx = db.transaction(['tasks', 'tags', 'dependencies', 'time_logs', 'settings'], 'readwrite');

    await tx.objectStore('tasks').clear();
    await tx.objectStore('tags').clear();
    await tx.objectStore('dependencies').clear();
    await tx.objectStore('time_logs').clear();
    await tx.objectStore('settings').clear();

    if (Array.isArray(data.tasks)) {
      for (const t of data.tasks) await tx.objectStore('tasks').put(t);
    }
    if (Array.isArray(data.tags)) {
      for (const t of data.tags) await tx.objectStore('tags').put(t);
    }
    if (Array.isArray(data.dependencies)) {
      for (const d of data.dependencies) await tx.objectStore('dependencies').put(d);
    }
    if (Array.isArray(data.time_logs)) {
      for (const l of data.time_logs) await tx.objectStore('time_logs').put(l);
    }
    if (data.settings) {
      await tx.objectStore('settings').put({ ...data.settings, key: SETTINGS_KEY });
    } else {
      await tx.objectStore('settings').put(DEFAULT_SETTINGS);
    }

    await tx.done;
  }
}
