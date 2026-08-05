import { Octokit } from '@octokit/rest';
import { appState } from '../state/app-state.js';

export class GitHubSync {
  constructor(syncSettings = {}) {
    this.enabled = syncSettings.enabled ?? false;
    this.pat = syncSettings.pat || '';
    this.owner = syncSettings.repo_owner || '';
    this.repo = syncSettings.repo_name || '';
    this.branch = syncSettings.branch || 'main';
    this.dataPath = syncSettings.data_path || 'data/';

    this.octokit = this.pat ? new Octokit({ auth: this.pat }) : null;
  }

  async testConnection() {
    if (!this.pat || !this.owner || !this.repo) {
      return { valid: false, error: 'Missing PAT, Owner, or Repo name' };
    }

    try {
      const client = new Octokit({ auth: this.pat });
      const res = await client.rest.repos.get({
        owner: this.owner,
        repo: this.repo
      });

      if (res.status === 200) {
        return { valid: true, repoName: res.data.full_name };
      }
      return { valid: false, error: `HTTP ${res.status}` };
    } catch (err) {
      return { valid: false, error: err.message || 'Connection failed' };
    }
  }

  async push() {
    if (!this.enabled || !this.pat || !this.owner || !this.repo) {
      return { success: false, reason: 'Sync not enabled or configured' };
    }

    try {
      const client = new Octokit({ auth: this.pat });
      const storesData = {
        'tasks.json': appState.tasks,
        'tags.json': appState.tags,
        'dependencies.json': appState.dependencies,
        'settings.json': appState.settings
      };

      for (const [filename, data] of Object.entries(storesData)) {
        const filePath = `${this.dataPath.replace(/\/$/, '')}/${filename}`;
        const contentStr = JSON.stringify(data, null, 2);
        const contentEncoded = btoa(unescape(encodeURIComponent(contentStr)));

        // Get existing file SHA if present
        let sha = undefined;
        try {
          const existing = await client.rest.repos.getContent({
            owner: this.owner,
            repo: this.repo,
            path: filePath,
            ref: this.branch
          });
          if (existing.data?.sha) {
            sha = existing.data.sha;
          }
        } catch {
          // File does not exist yet, will be created
        }

        await client.rest.repos.createOrUpdateFileContents({
          owner: this.owner,
          repo: this.repo,
          path: filePath,
          message: `Cronograma sync: ${new Date().toISOString()}`,
          content: contentEncoded,
          branch: this.branch,
          sha
        });
      }

      return { success: true, timestamp: new Date().toISOString() };
    } catch (err) {
      console.error('[GitHub Sync Error]:', err);
      return { success: false, error: err.message };
    }
  }
}
