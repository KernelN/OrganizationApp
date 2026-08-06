import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { validateTaskTagConstraints } from '../../utils/validators.js';
import { appState } from '../../state/app-state.js';
import '../shared/color-picker.js';

/**
 * <crono-task-form> — Create and edit form for tasks.
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
      duration_hours: 1,
      deadline: '',
      alert_window_hours: 24,
      splittable: true,
      ignore_breaks: false,
      recurrence: null
    };
    this.selectedDepId = '';
    this.selectedDepType = 'hard';
    this.newLogHours = 1;
    this.newLogNote = '';
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('task') && this.task) {
      this.formData = {
        title: this.task.title || '',
        description: this.task.description || '',
        color: this.task.color || '#6366F1',
        priority: this.task.priority || 0,
        tag_ids: Array.isArray(this.task.tag_ids) ? [...this.task.tag_ids] : [],
        duration_hours: this.task.duration_hours || 1,
        deadline: this.task.deadline ? this.task.deadline.substring(0, 16) : '',
        alert_window_hours: this.task.alert_window_hours ?? 24,
        splittable: this.task.splittable ?? true,
        ignore_breaks: this.task.ignore_breaks ?? false,
        recurrence: this.task.recurrence ? { ...this.task.recurrence } : null
      };
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
    const payload = {
      ...this.formData,
      priority: Number(this.formData.priority),
      duration_hours: Number(this.formData.duration_hours),
      alert_window_hours: this.formData.deadline ? Number(this.formData.alert_window_hours) : null,
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
    if (!this.task || !this.task.id || !this.newLogHours) return;
    await appState.createTimeLog({
      task_id: this.task.id,
      logged_hours: Number(this.newLogHours),
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
          <div class="form-group">
            <label>Priority (0-10)</label>
            <input
              type="number"
              class="crono-input"
              min="0"
              max="10"
              .value=${String(this.formData.priority)}
              @input=${(e) => (this.formData.priority = e.target.value)}
            />
          </div>

          <div class="form-group">
            <label>Duration (Hours)</label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              class="crono-input"
              required
              .value=${String(this.formData.duration_hours)}
              @input=${(e) => (this.formData.duration_hours = e.target.value)}
            />
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
            <label>Alert Window (Hours before deadline)</label>
            <input
              type="number"
              class="crono-input"
              .value=${String(this.formData.alert_window_hours)}
              @input=${(e) => (this.formData.alert_window_hours = e.target.value)}
            />
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
          <div class="row">
            <input
              type="number"
              step="0.25"
              class="crono-input"
              placeholder="Hours"
              .value=${String(this.newLogHours)}
              @input=${e => this.newLogHours = e.target.value}
            />
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
