import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { validateTaskTagConstraints } from '../../utils/validators.js';
import { appState } from '../../state/app-state.js';
import '../shared/color-picker.js';

/**
 * <crono-task-form> — Create and edit form for tasks with multi-unit time inputs.
 */
export class CronoTaskForm extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
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
        align-items: flex-start;
      }
      .row > * {
        flex: 1;
      }
      .toggle-group {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-top: var(--space-xs);
      }
      .chip-group {
        display: flex;
        gap: var(--space-xs);
        flex-wrap: wrap;
      }
      .chip {
        padding: 4px 10px;
        border-radius: var(--radius-sm);
        background: var(--bg-surface);
        border: 1px solid var(--border);
        font-size: 12px;
        cursor: pointer;
      }
      .chip.selected {
        background: var(--accent-muted);
        border-color: var(--accent);
        color: var(--text-primary);
      }
      .section-divider {
        border-top: 1px solid var(--border);
        margin-top: var(--space-sm);
        padding-top: var(--space-md);
        font-weight: 600;
        font-size: 13px;
      }
      .logs-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        margin-top: var(--space-xs);
      }
      .log-item {
        background: var(--bg-surface);
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        font-size: 12px;
        display: flex;
        justify-content: space-between;
      }
    `
  ];

  static properties = {
    task: { type: Object },
    tags: { type: Array },
    allTasks: { type: Array }
  };

  constructor() {
    super();
    this.task = null;
    this.tags = [];
    this.allTasks = [];

    this._resetForm();
  }

  _resetForm() {
    this.formData = {
      title: '',
      description: '',
      color: '#6366F1',
      priority: 0,
      tag_ids: [],
      deadline: '',
      splittable: true,
      ignore_breaks: false,
      recurrence: null
    };
    this.durationHours = 1;
    this.durationMins = 0;
    this.alertDays = 1;
    this.alertHours = 0;

    this.selectedDepId = '';
    this.selectedDepType = 'hard';
    this.logHours = 1;
    this.logMins = 0;
    this.newLogNote = '';
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('task') && this.task) {
      const dur = this.task.duration_hours || 1;
      this.durationHours = Math.floor(dur);
      this.durationMins = Math.round((dur - this.durationHours) * 60);

      const alertTot = this.task.alert_window_hours ?? 24;
      this.alertDays = Math.floor(alertTot / 24);
      this.alertHours = Math.round(alertTot % 24);

      this.formData = {
        title: this.task.title || '',
        description: this.task.description || '',
        color: this.task.color || '#6366F1',
        priority: this.task.priority || 0,
        tag_ids: Array.isArray(this.task.tag_ids) ? [...this.task.tag_ids] : [],
        deadline: this.task.deadline ? this.task.deadline.substring(0, 16) : '',
        splittable: this.task.splittable ?? true,
        ignore_breaks: this.task.ignore_breaks ?? false,
        recurrence: this.task.recurrence ? { ...this.task.recurrence } : null
      };

      this.logHours = 1;
      this.logMins = 0;
    }
  }

  _toggleTag(tagId) {
    const ids = new Set(this.formData.tag_ids);
    if (ids.has(tagId)) {
      ids.delete(tagId);
    } else {
      ids.add(tagId);
    }
    const nextTagIds = Array.from(ids);
    try {
      validateTaskTagConstraints(nextTagIds, this.tags);
      this.formData = { ...this.formData, tag_ids: nextTagIds };
      this.requestUpdate();
    } catch (err) {
      alert(err.message);
    }
  }

  _onSubmit(e) {
    e.preventDefault();

    const computedDuration = Number(this.durationHours || 0) + (Number(this.durationMins || 0) / 60);
    const computedAlert = (Number(this.alertDays || 0) * 24) + Number(this.alertHours || 0);

    const payload = {
      ...this.formData,
      priority: Number(this.formData.priority),
      duration_hours: Math.max(0.01, computedDuration),
      alert_window_hours: this.formData.deadline ? computedAlert : null,
      deadline: this.formData.deadline ? new Date(this.formData.deadline).toISOString() : null
    };

    if (this.task && this.task.id) {
      appState.updateTask(this.task.id, payload);
    } else {
      appState.createTask(payload);
    }

    this.dispatchEvent(new CustomEvent('crono-form-saved', { bubbles: true, composed: true }));
  }

  async _addDependency() {
    if (!this.task || !this.task.id || !this.selectedDepId) return;
    try {
      await appState.createDependency({
        task_id: this.task.id,
        depends_on_id: this.selectedDepId,
        type: this.selectedDepType
      });
      this.requestUpdate();
    } catch (err) {
      alert(err.message);
    }
  }

  async _addTimeLog() {
    const loggedTot = Number(this.logHours || 0) + (Number(this.logMins || 0) / 60);
    if (!this.task || !this.task.id || loggedTot <= 0) return;
    await appState.createTimeLog({
      task_id: this.task.id,
      logged_hours: loggedTot,
      notes: this.newLogNote
    });
    this.newLogNote = '';
    this.requestUpdate();
  }

  render() {
    const existingDeps = this.task ? appState.dependencies.filter(d => d.task_id === this.task.id) : [];
    const taskLogs = this.task ? appState.timeLogs.filter(l => l.task_id === this.task.id) : [];

    return html`
      <form @submit=${this._onSubmit}>
        <div class="form-group">
          <label>Title *</label>
          <input
            type="text"
            class="crono-input"
            required
            .value=${this.formData.title}
            @input=${(e) => (this.formData.title = e.target.value)}
            placeholder="e.g., Write Implementation Spec"
          />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            class="crono-textarea"
            .value=${this.formData.description}
            @input=${(e) => (this.formData.description = e.target.value)}
          ></textarea>
        </div>

        <div class="row">
          <div class="form-group" style="flex: 0 0 100px;">
            <label>Priority (0-10)</label>
            <input
              type="number"
              class="crono-input crono-input-num-sm"
              min="0"
              max="10"
              .value=${String(this.formData.priority)}
              @input=${(e) => (this.formData.priority = e.target.value)}
            />
          </div>

          <div class="form-group">
            <label>Duration</label>
            <div class="unit-pair">
              <input
                type="number"
                min="0"
                max="999"
                class="crono-input crono-input-num-sm"
                .value=${String(this.durationHours)}
                @input=${(e) => (this.durationHours = Number(e.target.value))}
              />
              <span>hrs</span>
              <input
                type="number"
                min="0"
                max="59"
                class="crono-input crono-input-num-sm"
                .value=${String(this.durationMins)}
                @input=${(e) => (this.durationMins = Number(e.target.value))}
              />
              <span>mins</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Color</label>
          <crono-color-picker
            .value=${this.formData.color}
            @crono-color-change=${(e) => (this.formData.color = e.detail.value)}
          ></crono-color-picker>
        </div>

        <div class="form-group">
          <label>Tags (Max 1 time-windowed tag)</label>
          <div class="chip-group">
            ${this.tags.map(
              (tg) => html`
                <button
                  type="button"
                  class="chip ${this.formData.tag_ids.includes(tg.id) ? 'selected' : ''}"
                  @click=${() => this._toggleTag(tg.id)}
                >
                  ${tg.name} ${tg.time_window_mode !== 'none' ? '⏰' : ''}
                </button>
              `
            )}
          </div>
        </div>

        <div class="row">
          <div class="form-group">
            <label>Deadline (Optional)</label>
            <input
              type="datetime-local"
              class="crono-input"
              .value=${this.formData.deadline}
              @input=${(e) => (this.formData.deadline = e.target.value)}
            />
          </div>

          <div class="form-group">
            <label>Alert Window</label>
            <div class="unit-pair">
              <input
                type="number"
                min="0"
                max="999"
                class="crono-input crono-input-num-sm"
                .value=${String(this.alertDays)}
                @input=${(e) => (this.alertDays = Number(e.target.value))}
              />
              <span>days</span>
              <input
                type="number"
                min="0"
                max="23"
                class="crono-input crono-input-num-sm"
                .value=${String(this.alertHours)}
                @input=${(e) => (this.alertHours = Number(e.target.value))}
              />
              <span>hrs</span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="toggle-group">
            <input
              type="checkbox"
              id="splittable"
              .checked=${this.formData.splittable}
              @change=${(e) => (this.formData.splittable = e.target.checked)}
            />
            <label for="splittable">Allow Task Splitting</label>
          </div>

          <div class="toggle-group">
            <input
              type="checkbox"
              id="ignore_breaks"
              .checked=${this.formData.ignore_breaks}
              @change=${(e) => (this.formData.ignore_breaks = e.target.checked)}
            />
            <label for="ignore_breaks">Ignore Breaks</label>
          </div>
        </div>

        ${this.task && this.task.id ? html`
          <div class="section-divider">Dependencies</div>
          <div class="row">
            <select class="crono-select" @change=${e => this.selectedDepId = e.target.value}>
              <option value="">-- Select Prerequisite Task --</option>
              ${this.allTasks.filter(t => t.id !== this.task.id).map(t => html`
                <option value=${t.id}>${t.title}</option>
              `)}
            </select>
            <select class="crono-select" @change=${e => this.selectedDepType = e.target.value}>
              <option value="hard">Hard (Strict order)</option>
              <option value="soft">Soft (Preferred order)</option>
            </select>
            <button type="button" class="crono-btn crono-btn-secondary" @click=${this._addDependency}>Add</button>
          </div>
          <div class="logs-list">
            ${existingDeps.map(d => {
              const depTask = this.allTasks.find(t => t.id === d.depends_on_id);
              return html`
                <div class="log-item">
                  <span>Depends on: ${depTask ? depTask.title : d.depends_on_id} (${d.type})</span>
                  <button type="button" class="crono-btn crono-btn-icon" @click=${() => appState.deleteDependency(d.id)}>✕</button>
                </div>
              `;
            })}
          </div>

          <div class="section-divider">Time Tracking Log</div>
          <div class="row" style="align-items: center;">
            <div class="unit-pair" style="flex-shrink: 0;">
              <input
                type="number"
                min="0"
                max="999"
                class="crono-input crono-input-num-sm"
                placeholder="H"
                .value=${String(this.logHours)}
                @input=${e => (this.logHours = Number(e.target.value))}
              />
              <span>h</span>
              <input
                type="number"
                min="0"
                max="59"
                class="crono-input crono-input-num-sm"
                placeholder="M"
                .value=${String(this.logMins)}
                @input=${e => (this.logMins = Number(e.target.value))}
              />
              <span>m</span>
            </div>
            <input
              type="text"
              class="crono-input"
              placeholder="Notes..."
              .value=${this.newLogNote}
              @input=${e => this.newLogNote = e.target.value}
            />
            <button type="button" class="crono-btn crono-btn-secondary" @click=${this._addTimeLog}>Log</button>
          </div>
          <div class="logs-list">
            ${taskLogs.map(l => html`
              <div class="log-item">
                <span>⏱ ${l.logged_hours}h - ${l.notes || 'No notes'}</span>
                <span>${l.logged_at.split('T')[0]}</span>
              </div>
            `)}
          </div>
        ` : ''}

        <button type="submit" class="crono-btn crono-btn-primary" style="margin-top: var(--space-md);">
          Save Task
        </button>
      </form>
    `;
  }
}

customElements.define('crono-task-form', CronoTaskForm);
