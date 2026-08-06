import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { appState, AppStateController } from '../../state/app-state.js';
import '../shared/color-picker.js';
import '../shared/time-range-input.js';
import '../shared/confirm-dialog.js';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * <crono-settings-view> — Full settings control panel.
 */
export class CronoSettingsView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--space-lg);
        overflow-y: auto;
      }
      .section-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }
      .section-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        border-bottom: 1px solid var(--border);
        padding-bottom: var(--space-sm);
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }
      label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .row {
        display: flex;
        gap: var(--space-md);
        align-items: center;
      }
      .row > * {
        flex: 1;
      }
      .day-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-xs) 0;
        border-bottom: 1px dashed var(--border);
      }
      .day-name {
        text-transform: capitalize;
        font-weight: 500;
        width: 100px;
      }
      .pomo-box {
        background: var(--bg-surface);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        border: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }
      .checkbox-group {
        display: flex;
        gap: var(--space-sm);
        flex-wrap: wrap;
      }
    `
  ];

  static properties = {
    settings: { type: Object },
    testResult: { type: Object },
    confirmPullOpen: { type: Boolean }
  };

  constructor() {
    super();
    this.appStateCtrl = new AppStateController(this);
    this.settings = { ...appState.settings };
    this.testResult = null;
    this.confirmPullOpen = false;

    // Pomodoro Generator state
    this.pomoWorkMins = 50;
    this.pomoBreakMins = 10;
    this.pomoStart = '09:00';
    this.pomoEnd = '17:00';
    this.pomoDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('settings') && !this.settings.accent_color) {
      this.settings = { ...appState.settings };
    }
  }

  async _save() {
    await appState.updateSettings(this.settings);
  }

  _updateWorkWindow(day, range) {
    const current = { ...(this.settings.work_windows || {}) };
    current[day] = [range];
    this.settings = { ...this.settings, work_windows: current };
    this._save();
  }

  _addBreakWindow(day) {
    const current = { ...(this.settings.break_windows || {}) };
    const dayBreaks = Array.isArray(current[day]) ? [...current[day]] : [];
    dayBreaks.push({ start: '12:00', end: '13:00' });
    current[day] = dayBreaks;
    this.settings = { ...this.settings, break_windows: current };
    this._save();
  }

  _removeBreakWindow(day, idx) {
    const current = { ...(this.settings.break_windows || {}) };
    const dayBreaks = Array.isArray(current[day]) ? [...current[day]] : [];
    dayBreaks.splice(idx, 1);
    current[day] = dayBreaks;
    this.settings = { ...this.settings, break_windows: current };
    this._save();
  }

  _generatePomodoroBreaks() {
    const workMins = Number(this.pomoWorkMins);
    const breakMins = Number(this.pomoBreakMins);
    const [sH, sM] = this.pomoStart.split(':').map(Number);
    const [eH, eM] = this.pomoEnd.split(':').map(Number);

    let currTotalMins = sH * 60 + sM;
    const endTotalMins = eH * 60 + eM;

    const generatedBreaks = [];

    while (currTotalMins + workMins + breakMins <= endTotalMins) {
      const breakStartMins = currTotalMins + workMins;
      const breakEndMins = breakStartMins + breakMins;

      const bsHH = String(Math.floor(breakStartMins / 60)).padStart(2, '0');
      const bsMM = String(breakStartMins % 60).padStart(2, '0');
      const beHH = String(Math.floor(breakEndMins / 60)).padStart(2, '0');
      const beMM = String(breakEndMins % 60).padStart(2, '0');

      generatedBreaks.push({ start: `${bsHH}:${bsMM}`, end: `${beHH}:${beMM}` });
      currTotalMins = breakEndMins;
    }

    const updatedBreakWindows = { ...(this.settings.break_windows || {}) };
    for (const day of this.pomoDays) {
      updatedBreakWindows[day] = generatedBreaks.map(b => ({ ...b }));
    }

    this.settings = { ...this.settings, break_windows: updatedBreakWindows };
    this._save();
  }

  async _testGitHubConnection() {
    this.testResult = await appState.sync.testConnection();
  }

  async _syncNow() {
    try {
      await appState.sync.push(appState.dal);
    } catch (err) {
      alert(err.message);
    }
  }

  async _pullNow() {
    try {
      await appState.sync.pull(appState.dal);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  }

  render() {
    const syncConfig = this.settings.github_sync || {};

    return html`
      <h2 style="margin: 0; font-size: 18px;">Settings</h2>

      <!-- Schedule Settings -->
      <div class="section-card">
        <h3 class="section-title">📅 Schedule & Work Windows</h3>

        <div class="form-group">
          <label>Work Windows (Active Working Hours)</label>
          ${DAYS.map(day => {
            const dayWork = (this.settings.work_windows && this.settings.work_windows[day] && this.settings.work_windows[day][0]) || { start: '09:00', end: '17:00' };
            return html`
              <div class="day-row">
                <span class="day-name">${day}</span>
                <crono-time-range-input
                  .start=${dayWork.start}
                  .end=${dayWork.end}
                  @crono-time-range-change=${e => this._updateWorkWindow(day, e.detail)}
                ></crono-time-range-input>
              </div>
            `;
          })}
        </div>

        <div class="form-group">
          <label>Break Windows (Per-Day Breaks)</label>
          ${DAYS.map(day => {
            const dayBreaks = (this.settings.break_windows && this.settings.break_windows[day]) || [];
            return html`
              <div class="day-row" style="flex-direction: column; align-items: flex-start;">
                <div style="display:flex; justify-content:space-between; width:100%;">
                  <span class="day-name">${day}</span>
                  <button class="crono-btn crono-btn-secondary crono-btn-sm" @click=${() => this._addBreakWindow(day)}>+ Add Break</button>
                </div>
                ${dayBreaks.map((b, idx) => html`
                  <div style="display:flex; gap:8px; align-items:center; margin-top:4px;">
                    <crono-time-range-input
                      .start=${b.start}
                      .end=${b.end}
                      @crono-time-range-change=${e => {
                        const next = [...dayBreaks];
                        next[idx] = e.detail;
                        const bw = { ...(this.settings.break_windows || {}) };
                        bw[day] = next;
                        this.settings = { ...this.settings, break_windows: bw };
                        this._save();
                      }}
                    ></crono-time-range-input>
                    <button class="crono-btn crono-btn-icon" @click=${() => this._removeBreakWindow(day, idx)}>✕</button>
                  </div>
                `)}
              </div>
            `;
          })}
        </div>

        <!-- Pomodoro Generator Utility -->
        <div class="pomo-box">
          <h4 style="margin:0; font-size:13px; font-weight:600;">🍅 Pomodoro Break Generator Utility</h4>
          <div class="row">
            <div class="form-group">
              <label>Work Period (Mins)</label>
              <input type="number" class="crono-input" .value=${String(this.pomoWorkMins)} @input=${e => this.pomoWorkMins = e.target.value} />
            </div>
            <div class="form-group">
              <label>Break Period (Mins)</label>
              <input type="number" class="crono-input" .value=${String(this.pomoBreakMins)} @input=${e => this.pomoBreakMins = e.target.value} />
            </div>
          </div>
          <div class="row">
            <div class="form-group">
              <label>Time Span</label>
              <crono-time-range-input
                .start=${this.pomoStart}
                .end=${this.pomoEnd}
                @crono-time-range-change=${e => { this.pomoStart = e.detail.start; this.pomoEnd = e.detail.end; }}
              ></crono-time-range-input>
            </div>
          </div>
          <button class="crono-btn crono-btn-secondary" @click=${this._generatePomodoroBreaks}>Generate Breaks</button>
        </div>

        <div class="row">
          <div class="form-group">
            <label>Scheduler Interval (Minutes)</label>
            <input
              type="number"
              class="crono-input"
              .value=${String(this.settings.scheduler_interval_minutes || 5)}
              @change=${e => { this.settings = { ...this.settings, scheduler_interval_minutes: Number(e.target.value) }; this._save(); }}
            />
          </div>
          <div class="form-group">
            <label>Horizon Fallback (Days)</label>
            <input
              type="number"
              class="crono-input"
              .value=${String(this.settings.scheduling_horizon_days || 7)}
              @change=${e => { this.settings = { ...this.settings, scheduling_horizon_days: Number(e.target.value) }; this._save(); }}
            />
          </div>
        </div>
      </div>

      <!-- Appearance Settings -->
      <div class="section-card">
        <h3 class="section-title">🎨 Appearance</h3>
        <div class="form-group">
          <label>Primary Accent Color</label>
          <crono-color-picker
            .value=${this.settings.accent_color || '#6366F1'}
            @crono-color-change=${e => { this.settings = { ...this.settings, accent_color: e.detail.value }; this._save(); }}
          ></crono-color-picker>
        </div>
      </div>

      <!-- GitHub Sync Settings -->
      <div class="section-card">
        <h3 class="section-title">🔄 GitHub Backup Sync</h3>
        <div class="row">
          <div class="form-group">
            <label>Enable Sync</label>
            <input
              type="checkbox"
              .checked=${!!syncConfig.enabled}
              @change=${e => {
                const nextSync = { ...syncConfig, enabled: e.target.checked };
                this.settings = { ...this.settings, github_sync: nextSync };
                this._save();
              }}
            />
          </div>
        </div>

        <div class="form-group">
          <label>Personal Access Token (PAT)</label>
          <input
            type="password"
            class="crono-input"
            .value=${syncConfig.pat || ''}
            @input=${e => {
              const nextSync = { ...syncConfig, pat: e.target.value };
              this.settings = { ...this.settings, github_sync: nextSync };
              this._save();
            }}
          />
        </div>

        <div class="row">
          <div class="form-group">
            <label>Repo Owner</label>
            <input
              type="text"
              class="crono-input"
              .value=${syncConfig.repo_owner || ''}
              @input=${e => {
                const nextSync = { ...syncConfig, repo_owner: e.target.value };
                this.settings = { ...this.settings, github_sync: nextSync };
                this._save();
              }}
            />
          </div>

          <div class="form-group">
            <label>Repo Name</label>
            <input
              type="text"
              class="crono-input"
              .value=${syncConfig.repo_name || ''}
              @input=${e => {
                const nextSync = { ...syncConfig, repo_name: e.target.value };
                this.settings = { ...this.settings, github_sync: nextSync };
                this._save();
              }}
            />
          </div>
        </div>

        <div class="row" style="margin-top: var(--space-sm);">
          <button class="crono-btn crono-btn-secondary" @click=${this._testGitHubConnection}>Test Connection</button>
          <button class="crono-btn crono-btn-primary" @click=${this._syncNow}>Sync Now (Push)</button>
          <button class="crono-btn crono-btn-danger" @click=${() => this.confirmPullOpen = true}>Pull from GitHub</button>
        </div>

        ${this.testResult ? html`
          <div style="color: ${this.testResult.valid ? 'var(--success)' : 'var(--alert-red)'}; font-size: 13px;">
            ${this.testResult.valid ? '✅ Connection successful!' : `❌ ${this.testResult.error}`}
          </div>
        ` : ''}
      </div>

      <crono-confirm-dialog
        .open=${this.confirmPullOpen}
        title="Restore from GitHub"
        message="This will overwrite all local data with data from your GitHub repository. Are you sure?"
        confirm-text="Overwrite & Pull"
        @crono-confirm=${this._pullNow}
        @crono-cancel=${() => this.confirmPullOpen = false}
      ></crono-confirm-dialog>
    `;
  }
}

customElements.define('crono-settings-view', CronoSettingsView);
