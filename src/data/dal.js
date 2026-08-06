/**
 * Abstract Data Access Layer (DAL) interface.
 * All data persistence in Cronograma goes through this class interface.
 * Components and engine NEVER access storage directly.
 */
export class DataAccessLayer {
  /* ── Tasks ── */
  async getTasks(filter = {}) { throw new Error('Not implemented'); }
  async getTaskById(id) { throw new Error('Not implemented'); }
  async createTask(task) { throw new Error('Not implemented'); }
  async updateTask(id, updates) { throw new Error('Not implemented'); }
  async deleteTask(id) { throw new Error('Not implemented'); }
  async completeTask(id) { throw new Error('Not implemented'); }
  async getCompletedTasks() { throw new Error('Not implemented'); }

  /* ── Tags ── */
  async getTags() { throw new Error('Not implemented'); }
  async getTagById(id) { throw new Error('Not implemented'); }
  async createTag(tag) { throw new Error('Not implemented'); }
  async updateTag(id, updates) { throw new Error('Not implemented'); }
  async deleteTag(id) { throw new Error('Not implemented'); }

  /* ── Dependencies ── */
  async getDependencies() { throw new Error('Not implemented'); }
  async getDependenciesForTask(taskId) { throw new Error('Not implemented'); }
  async createDependency(dep) { throw new Error('Not implemented'); }
  async deleteDependency(id) { throw new Error('Not implemented'); }

  /* ── Time Logs ── */
  async getTimeLogs(filter = {}) { throw new Error('Not implemented'); }
  async createTimeLog(log) { throw new Error('Not implemented'); }
  async deleteTimeLog(id) { throw new Error('Not implemented'); }

  /* ── Settings ── */
  async getSettings() { throw new Error('Not implemented'); }
  async updateSettings(updates) { throw new Error('Not implemented'); }

  /* ── Bulk Operations ── */
  async exportAll() { throw new Error('Not implemented'); }
  async importAll(data) { throw new Error('Not implemented'); }
}
