import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { appState, AppStateController } from '../../state/app-state.js';
import { VercelSync } from '../../data/vercel-sync.js';
import { eventBus } from '../../state/event-bus.js';
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
    confirmPullOpen: { type: Boolean },
    confirmImportOpen: { type: Boolean },
    pendingImportData: { type: Object }
  };

  constructor() {
    super();
    this.appStateCtrl = new AppStateController(this);
    this.settings = { ...appState.settings };
    this.testResult = null;
    this.confirmPullOpen = false;
    this.confirmImportOpen = false;
    this.pendingImportData = null;

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
  async _testVercelConnection() {
    this.testResult = await appState.sync.testConnection();
    this.requestUpdate();
  }

  _generateNewKey() {
    const key = VercelSync.generateSyncKey();
    const syncConfig = this.settings.vercel_sync || {};
    const nextSync = { ...syncConfig, sync_key: key };
    this.settings = { ...this.settings, vercel_sync: nextSync };
    this._save();
  }

  async _copySyncKey() {
    const key = this.settings.vercel_sync?.sync_key;
    if (key) {
      await navigator.clipboard.writeText(key);
      eventBus.emit('toast:show', { message: 'Sync key copied to clipboard!', type: 'success' });
    }
  }

  async _syncNow() {
    try {
      const res = await appState.sync.push(appState.dal);
      if (res?.synced_at) {
        const nextSync = { ...(this.settings.vercel_sync || {}), last_synced_at: res.synced_at };
        this.settings = { ...this.settings, vercel_sync: nextSync };
        await appState.dal.updateSettings({ vercel_sync: nextSync });
      }
      eventBus.emit('toast:show', { message: 'Data pushed to Redis Cloud successfully.', type: 'success' });
      this.requestUpdate();
    } catch (err) {
      eventBus.emit('toast:show', { message: `Sync failed: ${err.message}`, type: 'error' });
    }
  }

  async _pullNow() {
    try {
      const res = await appState.sync.pull(appState.dal);
      if (res?.synced_at) {
        const nextSync = { ...(this.settings.vercel_sync || {}), last_synced_at: res.synced_at };
        await appState.dal.updateSettings({ vercel_sync: nextSync });
      }
      eventBus.emit('toast:show', { message: 'Data restored from Redis Cloud.', type: 'success' });
      setTimeout(() => window.location.reload(), 400);
    } catch (err) {
      eventBus.emit('toast:show', { message: `Pull failed: ${err.message}`, type: 'error' });
    }
  }

  async _exportBackup() {
    try {
      const data = await appState.exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const filename = `cronograma-backup-${yyyy}-${mm}-${dd}-${hh}${min}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      eventBus.emit('toast:show', { message: 'Backup exported successfully.', type: 'success' });
    } catch (err) {
      eventBus.emit('toast:show', { message: `Export failed: ${err.message}`, type: 'error' });
    }
  }

  _triggerImportFile() {
    const fileInput = this.renderRoot.querySelector('#import-file-input');
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  }

  async _handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON file format.');
      }

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Invalid backup format: root must be a JSON object.');
      }

      // Check that at least some known Cronograma stores or settings exist
      const hasKnownKeys = ('tasks' in parsed) || ('tags' in parsed) || ('settings' in parsed);
      if (!hasKnownKeys) {
        throw new Error('Invalid backup file: missing Cronograma data tables.');
      }

      this.pendingImportData = parsed;
      this.confirmImportOpen = true;
      this.requestUpdate();
    } catch (err) {
      eventBus.emit('toast:show', { message: err.message, type: 'error' });
    }
  }

  async _confirmImport() {
    this.confirmImportOpen = false;
    if (!this.pendingImportData) return;

    try {
      await appState.importAllData(this.pendingImportData);
      this.settings = { ...appState.settings };
      this.pendingImportData = null;
      this.requestUpdate();
    } catch (err) {
      this.pendingImportData = null;
    }
  }

  render() {
    const syncConfig = this.settings.vercel_sync || {};

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

      <!-- Vercel Serverless Sync Settings -->
      <div class="section-card">
        <h3 class="section-title">⚡ Vercel Serverless Sync</h3>
        <div class="row">
          <div class="form-group" style="flex-direction: row; align-items: center; gap: 8px;">
            <input
              type="checkbox"
              id="vercel-sync-enabled"
              .checked=${!!syncConfig.enabled}
              @change=${e => {
                const nextSync = { ...syncConfig, enabled: e.target.checked };
                this.settings = { ...this.settings, vercel_sync: nextSync };
                this._save();
              }}
            />
            <label for="vercel-sync-enabled" style="text-transform: none; font-size: 14px; cursor: pointer;">Enable Vercel Cloud Sync</label>
          </div>
        </div>

        <div class="form-group">
          <label>Secret Sync Key</label>
          <div class="row" style="gap: 8px;">
            <input
              type="text"
              class="crono-input"
              style="font-family: monospace; letter-spacing: 0.05em;"
              placeholder="crono_sk_..."
              .value=${syncConfig.sync_key || ''}
              @input=${e => {
                const nextSync = { ...syncConfig, sync_key: e.target.value };
                this.settings = { ...this.settings, vercel_sync: nextSync };
                this._save();
              }}
            />
            <button class="crono-btn crono-btn-secondary" style="flex: none;" @click=${this._generateNewKey}>Generate</button>
            <button class="crono-btn crono-btn-secondary" style="flex: none;" @click=${this._copySyncKey} ?disabled=${!syncConfig.sync_key}>Copy</button>
          </div>
          <span style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
            Keep this key secret. Use the same key on all your devices to sync tasks and settings.
          </span>
        </div>

        <div class="form-group">
          <label>API Endpoint Path</label>
          <input
            type="text"
            class="crono-input"
            placeholder="/api/sync"
            .value=${syncConfig.api_url || '/api/sync'}
            @input=${e => {
              const nextSync = { ...syncConfig, api_url: e.target.value };
              this.settings = { ...this.settings, vercel_sync: nextSync };
              this._save();
            }}
          />
        </div>

        <div class="row" style="margin-top: var(--space-sm);">
          <button class="crono-btn crono-btn-secondary" @click=${this._testVercelConnection}>Test Connection</button>
          <button class="crono-btn crono-btn-primary" @click=${this._syncNow}>Sync Now (Push)</button>
          <button class="crono-btn crono-btn-danger" @click=${() => this.confirmPullOpen = true}>Pull from Cloud</button>
        </div>

        ${syncConfig.last_synced_at ? html`
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
            🕒 Last Cloud Sync: <strong>${new Date(syncConfig.last_synced_at).toLocaleString()}</strong>
          </div>
        ` : ''}

        ${this.testResult ? html`
          <div style="color: ${this.testResult.valid ? 'var(--success)' : 'var(--alert-red)'}; font-size: 13px; margin-top: 8px; line-height: 1.4;">
            ${this.testResult.valid 
              ? html`✅ ${this.testResult.message || 'Connection successful!'} ${this.testResult.provider ? html`<span style="opacity:0.8;">(${this.testResult.provider})</span>` : ''}`
              : html`❌ ${this.testResult.error}`}
          </div>
        ` : ''}
      </div>

      <!-- Backup & Data Management (Import / Export) -->
      <div class="section-card">
        <h3 class="section-title">💾 Backup & Data Management</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
          Export your entire Cronograma workspace (tasks, tags, dependencies, time logs, and settings) to a JSON file, or restore from a previous backup.
        </p>

        <input
          type="file"
          id="import-file-input"
          accept=".json,application/json"
          style="display: none;"
          @change=${this._handleFileSelected}
        />

        <div class="row" style="margin-top: var(--space-xs);">
          <button class="crono-btn crono-btn-secondary" @click=${this._exportBackup}>
            ⬇️ Export Backup (.json)
          </button>
          <button class="crono-btn crono-btn-secondary" @click=${this._triggerImportFile}>
            ⬆️ Import Backup (.json)
          </button>
        </div>
        <span style="font-size: 11px; color: var(--text-secondary);">
          Note: Importing a backup replaces local data in-place and does <strong>not</strong> auto-push to the cloud. You can push manually using the sync button above when ready.
        </span>
      </div>

      <crono-confirm-dialog
        .open=${this.confirmPullOpen}
        title="Restore from Vercel Cloud"
        message="This will overwrite all local data with data stored on Vercel Cloud. Are you sure?"
        confirm-text="Overwrite & Pull"
        @crono-confirm=${this._pullNow}
        @crono-cancel=${() => this.confirmPullOpen = false}
      ></crono-confirm-dialog>

      <crono-confirm-dialog
        .open=${this.confirmImportOpen}
        title="Restore from Backup File"
        message="This will replace all your current tasks, tags, dependencies, time logs, and settings with data from the selected backup file. It will NOT be pushed to the cloud until you manually click Push. Are you sure?"
        confirm-text="Overwrite & Restore"
        @crono-confirm=${this._confirmImport}
        @crono-cancel=${() => { this.confirmImportOpen = false; this.pendingImportData = null; }}
      ></crono-confirm-dialog>
    `;
  }
}

customElements.define('crono-settings-view', CronoSettingsView);
