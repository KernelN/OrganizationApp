import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';
import { DAYS_OF_WEEK } from '../../utils/date-utils.js';
import { GitHubSync } from '../../data/github-sync.js';
import '../shared/color-picker.js';
import '../shared/time-range-input.js';

export class SettingsView extends LitElement {
  static properties = {
    settingsData: { type: Object },
    showPat: { type: Boolean },
    syncStatus: { type: String },
    testResult: { type: Object }
  };

  static styles = css`
    :host {
      display: block;
    }

    .settings-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 800px;
    }

    .section-card {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-lg, 12px);
      padding: var(--space-6, 24px);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-title {
      font-family: var(--font-family-display, sans-serif);
      font-size: 1.125rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary, #9CA3AF);
    }

    input[type="text"],
    input[type="password"],
    input[type="number"],
    select {
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 10px 12px;
      color: var(--color-text-primary, #F3F4F6);
      font-size: 0.875rem;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .checkbox-row input {
      width: 18px;
      height: 18px;
      accent-color: var(--color-accent, #6366F1);
      cursor: pointer;
    }

    .window-editor {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .day-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      font-size: 0.875rem;
    }

    .day-name {
      text-transform: capitalize;
      font-weight: 600;
      min-width: 100px;
    }

    .btn-save {
      background: var(--color-accent, #6366F1);
      color: #ffffff;
      font-weight: 600;
      padding: 10px 24px;
      border-radius: var(--radius-md, 8px);
      border: none;
      cursor: pointer;
      align-self: flex-start;
      transition: background 150ms ease, box-shadow 150ms ease;
    }

    .btn-save:hover {
      background: var(--color-accent-hover, #4F46E5);
      box-shadow: var(--shadow-glow);
    }

    .btn-secondary {
      background: var(--color-bg-surface-hover, #232631);
      color: var(--color-text-primary, #F3F4F6);
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid var(--color-border, #2E3242);
      cursor: pointer;
    }

    .pat-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-msg {
      font-size: 0.8125rem;
      padding: 6px 12px;
      border-radius: 6px;
      display: inline-block;
    }

    .status-success {
      background: rgba(16, 185, 129, 0.15);
      color: #10B981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .status-error {
      background: rgba(239, 68, 68, 0.15);
      color: #EF4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
  `;

  constructor() {
    super();
    this.settingsData = { ...appState.settings };
    this.showPat = false;
    this.syncStatus = '';
    this.testResult = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = appState.subscribe(() => {
      this.settingsData = { ...appState.settings };
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  async saveSettings() {
    await appState.updateSettings(this.settingsData);
    this.syncStatus = 'Settings saved successfully!';
    setTimeout(() => (this.syncStatus = ''), 3000);
  }

  async testGitHubConnection() {
    this.testResult = { testing: true };
    const sync = new GitHubSync(this.settingsData.github_sync || {});
    const result = await sync.testConnection();
    this.testResult = result;
  }

  async triggerManualSync() {
    this.syncStatus = 'Syncing data to GitHub...';
    const sync = new GitHubSync(this.settingsData.github_sync || {});
    const result = await sync.push();
    if (result.success) {
      this.syncStatus = `✓ Synced to GitHub at ${new Date(result.timestamp).toLocaleTimeString()}`;
    } else {
      this.syncStatus = `✕ Sync failed: ${result.error || result.reason}`;
    }
  }

  updateWorkWindow(day, range) {
    const current = this.settingsData.work_windows || {};
    this.settingsData = {
      ...this.settingsData,
      work_windows: {
        ...current,
        [day]: [range]
      }
    };
  }

  updateBreakWindow(day, range) {
    const current = this.settingsData.break_windows || {};
    this.settingsData = {
      ...this.settingsData,
      break_windows: {
        ...current,
        [day]: [range]
      }
    };
  }

  render() {
    const gh = this.settingsData.github_sync || {};

    return html`
      <div class="settings-container">
        <!-- Appearance & Theme -->
        <div class="section-card">
          <div class="section-title">🎨 Theme & Accent Color</div>
          <div class="form-group">
            <label>Primary Accent Color</label>
            <color-picker
              .value="${this.settingsData.accent_color || '#6366F1'}"
              @color-change="${(e) => {
                this.settingsData = { ...this.settingsData, accent_color: e.detail.value };
                this.saveSettings();
              }}"
            ></color-picker>
          </div>
        </div>

        <!-- Working Hours & Work Windows -->
        <div class="section-card">
          <div class="section-title">🕒 Global Working Hours (Per Day)</div>
          <div class="window-editor">
            ${DAYS_OF_WEEK.map(day => {
              const currentWin = this.settingsData.work_windows?.[day]?.[0] || { start: '09:00', end: '17:00' };
              return html`
                <div class="day-row">
                  <span class="day-name">${day}</span>
                  <time-range-input
                    .start="${currentWin.start}"
                    .end="${currentWin.end}"
                    @range-change="${(e) => this.updateWorkWindow(day, e.detail)}"
                  ></time-range-input>
                </div>
              `;
            })}
          </div>
        </div>

        <!-- Break Windows -->
        <div class="section-card">
          <div class="section-title">☕ Break / Lunch Slots</div>
          <div class="window-editor">
            ${DAYS_OF_WEEK.map(day => {
              const currentBreak = this.settingsData.break_windows?.[day]?.[0] || { start: '12:00', end: '13:00' };
              return html`
                <div class="day-row">
                  <span class="day-name">${day}</span>
                  <time-range-input
                    .start="${currentBreak.start}"
                    .end="${currentBreak.end}"
                    @range-change="${(e) => this.updateBreakWindow(day, e.detail)}"
                  ></time-range-input>
                </div>
              `;
            })}
          </div>
        </div>

        <!-- Scheduler Parameters -->
        <div class="section-card">
          <div class="section-title">⚙️ Scheduler Parameters</div>
          <div class="grid-2">
            <div class="form-group">
              <label>Time Slot Granularity</label>
              <select
                .value="${String(this.settingsData.slot_granularity_minutes || 15)}"
                @change="${(e) => {
                  this.settingsData = { ...this.settingsData, slot_granularity_minutes: Number(e.target.value) };
                }}"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>

            <div class="form-group">
              <label>Fallback Scheduling Horizon (Days)</label>
              <input
                type="number"
                min="1"
                max="30"
                .value="${this.settingsData.scheduling_horizon_days || 7}"
                @change="${(e) => {
                  this.settingsData = { ...this.settingsData, scheduling_horizon_days: Number(e.target.value) };
                }}"
              />
            </div>
          </div>
        </div>

        <!-- GitHub Octokit Backup Sync -->
        <div class="section-card">
          <div class="section-title">☁️ GitHub Backup Sync (Octokit REST)</div>

          <div class="form-group">
            <label class="checkbox-row">
              <input
                type="checkbox"
                .checked="${gh.enabled ?? false}"
                @change="${(e) => {
                  this.settingsData = {
                    ...this.settingsData,
                    github_sync: { ...(gh || {}), enabled: e.target.checked }
                  };
                }}"
              />
              Enable Automatic GitHub Backup Sync
            </label>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Repository Owner (Username / Org)</label>
              <input
                type="text"
                placeholder="e.g. mygithubuser"
                .value="${gh.repo_owner || ''}"
                @input="${(e) => {
                  this.settingsData = {
                    ...this.settingsData,
                    github_sync: { ...(gh || {}), repo_owner: e.target.value }
                  };
                }}"
              />
            </div>

            <div class="form-group">
              <label>Repository Name</label>
              <input
                type="text"
                placeholder="e.g. cronograma-data"
                .value="${gh.repo_name || ''}"
                @input="${(e) => {
                  this.settingsData = {
                    ...this.settingsData,
                    github_sync: { ...(gh || {}), repo_name: e.target.value }
                  };
                }}"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Personal Access Token (PAT)</label>
            <div class="pat-row">
              <input
                type="${this.showPat ? 'text' : 'password'}"
                style="flex: 1;"
                placeholder="ghp_..."
                .value="${gh.pat || ''}"
                @input="${(e) => {
                  this.settingsData = {
                    ...this.settingsData,
                    github_sync: { ...(gh || {}), pat: e.target.value }
                  };
                }}"
              />
              <button
                class="btn-secondary"
                type="button"
                @click="${() => (this.showPat = !this.showPat)}"
              >
                ${this.showPat ? 'Hide' : 'Reveal'}
              </button>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
            <button class="btn-secondary" type="button" @click="${this.testGitHubConnection}">
              Test Connection
            </button>
            <button class="btn-secondary" type="button" @click="${this.triggerManualSync}">
              Sync Now
            </button>

            ${this.testResult?.valid === true
              ? html`<span class="status-msg status-success">✓ Connected: ${this.testResult.repoName}</span>`
              : ''}
            ${this.testResult?.valid === false
              ? html`<span class="status-msg status-error">✕ Error: ${this.testResult.error}</span>`
              : ''}
          </div>

          ${this.syncStatus
            ? html`<div style="font-size: 0.875rem; color: var(--color-accent); font-weight: 500;">
                ${this.syncStatus}
              </div>`
            : ''}
        </div>

        <button class="btn-save" @click="${this.saveSettings}">Save Settings</button>
      </div>
    `;
  }
}

customElements.define('settings-view', SettingsView);
