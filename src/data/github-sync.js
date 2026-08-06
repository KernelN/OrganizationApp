import { Octokit } from '@octokit/rest';
import { SyncError } from '../utils/errors.js';

export class GitHubSync {
  constructor(config = {}) {
    this.config = config;
    this.octokit = config.pat ? new Octokit({ auth: config.pat }) : null;
  }

  updateConfig(config) {
    this.config = config;
    this.octokit = config.pat ? new Octokit({ auth: config.pat }) : null;
  }

  isConfigured() {
    return !!(
      this.config.enabled &&
      this.config.pat &&
      this.config.repo_owner &&
      this.config.repo_name
    );
  }

  async testConnection() {
    if (!this.config.pat || !this.config.repo_owner || !this.config.repo_name) {
      return { valid: false, error: 'Missing GitHub configuration fields.' };
    }
    try {
      const octokit = new Octokit({ auth: this.config.pat });
      const res = await octokit.rest.repos.get({
        owner: this.config.repo_owner,
        repo: this.config.repo_name
      });
      return { valid: res.status === 200 };
    } catch (err) {
      return { valid: false, error: err.message || 'Failed to authenticate with GitHub API.' };
    }
  }

  async push(dal) {
    if (!this.isConfigured()) return;
    try {
      const data = await dal.exportAll();
      const sanitizedSettings = JSON.parse(JSON.stringify(data.settings || {}));
      if (sanitizedSettings.github_sync) {
        sanitizedSettings.github_sync.pat = ''; // Never push secret token to repository
      }

      const files = {
        'tasks.json': JSON.stringify(data.tasks, null, 2),
        'tags.json': JSON.stringify(data.tags, null, 2),
        'dependencies.json': JSON.stringify(data.dependencies, null, 2),
        'time_logs.json': JSON.stringify(data.time_logs, null, 2),
        'settings.json': JSON.stringify(sanitizedSettings, null, 2)
      };

      const owner = this.config.repo_owner;
      const repo = this.config.repo_name;
      const branch = this.config.branch || 'main';
      const basePath = (this.config.data_path || 'data/').replace(/\/$/, '') + '/';

      for (const [filename, content] of Object.entries(files)) {
        const filePath = `${basePath}${filename}`;
        let sha = null;

        try {
          const { data: fileData } = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path: filePath,
            ref: branch
          });
          if (fileData && fileData.sha) {
            sha = fileData.sha;
          }
        } catch (e) {
          // File does not exist yet; sha remains null
        }

        const contentEncoded = btoa(unescape(encodeURIComponent(content)));
        await this.octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: filePath,
          message: `Cronograma sync: ${new Date().toISOString()}`,
          content: contentEncoded,
          sha: sha || undefined,
          branch
        });
      }
    } catch (err) {
      throw new SyncError(`GitHub push failed: ${err.message}`);
    }
  }

  async pull(dal) {
    if (!this.isConfigured()) {
      throw new SyncError('GitHub sync is not configured.');
    }
    try {
      const owner = this.config.repo_owner;
      const repo = this.config.repo_name;
      const branch = this.config.branch || 'main';
      const basePath = (this.config.data_path || 'data/').replace(/\/$/, '') + '/';

      const filenames = ['tasks.json', 'tags.json', 'dependencies.json', 'time_logs.json', 'settings.json'];
      const importedData = {};

      for (const filename of filenames) {
        const filePath = `${basePath}${filename}`;
        const key = filename.replace('.json', '');

        const { data: fileData } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path: filePath,
          ref: branch
        });

        const decodedContent = decodeURIComponent(escape(atob(fileData.content.replace(/\n/g, ''))));
        importedData[key] = JSON.parse(decodedContent);
      }

      // Preserve local PAT secret when restoring settings from GitHub
      const currentSettings = await dal.getSettings();
      if (importedData.settings && importedData.settings.github_sync) {
        const currentPat = (currentSettings.github_sync && currentSettings.github_sync.pat) || '';
        importedData.settings.github_sync.pat = currentPat;
      }

      await dal.importAll(importedData);
    } catch (err) {
      throw new SyncError(`GitHub pull failed: ${err.message}`);
    }
  }
}
