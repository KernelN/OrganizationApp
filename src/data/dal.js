/**
 * Abstract Data Access Layer (DAL) interface definition.
 * All persistence drivers (IndexedDB, Supabase, etc.) must implement this contract.
 */
export class DataAccessLayer {
  // --- Tasks ---
  async getTasks() { throw new Error('Not implemented'); }
  async getTask(id) { throw new Error('Not implemented'); }
  async createTask(task) { throw new Error('Not implemented'); }
  async updateTask(id, updates) { throw new Error('Not implemented'); }
  async deleteTask(id) { throw new Error('Not implemented'); }

  // --- Tags ---
  async getTags() { throw new Error('Not implemented'); }
  async getTag(id) { throw new Error('Not implemented'); }
  async createTag(tag) { throw new Error('Not implemented'); }
  async updateTag(id, updates) { throw new Error('Not implemented'); }
  async deleteTag(id) { throw new Error('Not implemented'); }

  // --- Dependencies ---
  async getDependencies() { throw new Error('Not implemented'); }
  async addDependency(taskId, dependsOnId, type = 'hard') { throw new Error('Not implemented'); }
  async removeDependency(id) { throw new Error('Not implemented'); }

  // --- Time Logs ---
  async getTimeLogs(taskId = null) { throw new Error('Not implemented'); }
  async createTimeLog(timeLog) { throw new Error('Not implemented'); }

  // --- Settings ---
  async getSettings() { throw new Error('Not implemented'); }
  async updateSettings(updates) { throw new Error('Not implemented'); }
}
