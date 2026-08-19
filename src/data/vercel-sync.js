import { SyncError } from '../utils/errors.js';

export class VercelSync {
  constructor(config = {}) {
    this.config = config;
  }

  updateConfig(config = {}) {
    this.config = config;
  }

  isConfigured() {
    return !!(
      this.config.enabled &&
      this.config.sync_key &&
      this.config.sync_key.length >= 8
    );
  }

  static generateSyncKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'crono_sk_';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async testConnection() {
    if (!this.isConfigured()) {
      return { valid: false, error: 'Vercel sync is not configured. Secret Sync Key is required.' };
    }
    try {
      const apiUrl = this.config.api_url || '/api/sync';
      const res = await fetch(`${apiUrl}?action=ping`, {
        headers: {
          'Authorization': `Bearer ${this.config.sync_key}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return {
          valid: false,
          error: data.error || `HTTP ${res.status} connection test failed.`
        };
      }
      return {
        valid: true,
        message: data.message || 'Connected to Redis cloud successfully.',
        provider: data.provider || 'Redis'
      };
    } catch (err) {
      return { valid: false, error: err.message || 'Failed to connect to Vercel sync endpoint.' };
    }
  }

  async getRemoteMetadata() {
    if (!this.isConfigured()) return null;
    try {
      const apiUrl = this.config.api_url || '/api/sync';
      const res = await fetch(`${apiUrl}?action=metadata`, {
        headers: {
          'Authorization': `Bearer ${this.config.sync_key}`
        }
      });
      if (res.status === 404) {
        return { exists: false };
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        return null;
      }
      return {
        exists: true,
        synced_at: data._synced_at,
        taskCount: data.taskCount || 0,
        tagCount: data.tagCount || 0
      };
    } catch {
      return null;
    }
  }

  async push(dal) {
    if (!this.isConfigured()) return null;
    try {
      const data = await dal.exportAll();
      const sanitizedSettings = JSON.parse(JSON.stringify(data.settings || {}));

      const payload = {
        tasks: data.tasks,
        tags: data.tags,
        dependencies: data.dependencies,
        time_logs: data.time_logs,
        settings: sanitizedSettings
      };

      const apiUrl = this.config.api_url || '/api/sync';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.sync_key}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok || !resData.success) {
        throw new SyncError(resData.error || `Push failed with HTTP ${res.status}`);
      }

      return {
        success: true,
        synced_at: resData._synced_at || new Date().toISOString()
      };
    } catch (err) {
      throw new SyncError(`Vercel push failed: ${err.message}`);
    }
  }

  async pull(dal) {
    if (!this.isConfigured()) {
      throw new SyncError('Vercel sync is not configured.');
    }
    try {
      const apiUrl = this.config.api_url || '/api/sync';
      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.sync_key}`
        }
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok || !resData.success || !resData.data) {
        throw new SyncError(resData.error || `Pull failed with HTTP ${res.status}`);
      }

      let parsedData = resData.data;
      if (typeof parsedData === 'string') {
        try {
          parsedData = JSON.parse(parsedData);
        } catch {
          // keep as is
        }
      }

      await dal.importAll(parsedData);
      return {
        success: true,
        data: parsedData,
        synced_at: parsedData._synced_at || null
      };
    } catch (err) {
      throw new SyncError(`Vercel pull failed: ${err.message}`);
    }
  }
}

