import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';
import '../shared/drawer-panel.js';
import './task-dependency-graph.js';

export class TaskForm extends LitElement {
  static properties = {
    open: { type: Boolean },
    task: { type: Object }
  };

  static styles = css`
    :host {
      display: block;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
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
    input[type="number"],
    input[type="datetime-local"],
    textarea,
    select {
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 10px 12px;
      color: var(--color-text-primary, #F3F4F6);
      font-size: 0.875rem;
      font-family: inherit;
    }

    textarea {
      min-height: 80px;
      resize: vertical;
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

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }

    .unit-input-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .unit-input-group span {
      font-size: 0.75rem;
      color: var(--color-text-muted, #6B7280);
    }

    .tag-checkboxes {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      border: 2px solid transparent;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 150ms ease, transform 150ms ease, border-color 150ms ease;
    }

    .tag-pill:hover {
      opacity: 0.85;
      transform: scale(1.03);
    }

    .tag-pill.selected {
      opacity: 1;
      border-color: #ffffff;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }

    .btn-submit {
      background: var(--color-accent, #6366F1);
      color: #ffffff;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: var(--radius-md, 8px);
      border: none;
      cursor: pointer;
    }

    .btn-cancel {
      background: var(--color-bg-surface-hover, #232631);
      color: var(--color-text-primary, #F3F4F6);
      padding: 10px 20px;
      border-radius: var(--radius-md, 8px);
      border: 1px solid var(--color-border, #2E3242);
      cursor: pointer;
    }
  `;

  constructor() {
    super();
    this.open = false;
    this.task = null;
    this.formData = this.getInitialData();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('open') && this.open) {
      if (this.task) {
        this.populateFromTask(this.task);
      } else {
        this.formData = this.getInitialData();
      }
    } else if (changedProperties.has('task') && this.open) {
      if (this.task) {
        this.populateFromTask(this.task);
      }
    }
  }

  populateFromTask(t) {
    const totalMins = t.duration_hours != null ? Math.round(t.duration_hours * 60) : (t.duration_minutes || 30);
    const durationHours = Math.floor(totalMins / 60);
    const durationMinutes = totalMins % 60;

    const alertMins = t.alert_window_hours != null
      ? Math.round(t.alert_window_hours * 60)
      : (t.alert_window_minutes || 120);

    const alertDays = Math.floor(alertMins / (24 * 60));
    const alertHrs = Math.floor((alertMins % (24 * 60)) / 60);
    const alertMinRem = alertMins % 60;

    this.formData = {
      title: t.title || '',
      description: t.description || '',
      priority: t.priority ?? 5,
      tag_ids: t.tag_ids ? [...t.tag_ids] : [],
      deadline: t.deadline || '',
      splittable: t.splittable ?? true,
      ignore_breaks: t.ignore_breaks ?? false,
      durationHours,
      durationMinutes,
      alertDays,
      alertHours: alertHrs,
      alertMinutes: alertMinRem
    };
  }

  getInitialData() {
    return {
      title: '',
      description: '',
      priority: 5,
      tag_ids: [],
      deadline: '',
      splittable: true,
      ignore_breaks: false,
      durationHours: 0,
      durationMinutes: 30,
      alertDays: 0,
      alertHours: 2,
      alertMinutes: 0
    };
  }

  toggleTag(tagId) {
    const current = this.formData.tag_ids || [];
    if (current.includes(tagId)) {
      this.formData.tag_ids = current.filter(id => id !== tagId);
    } else {
      this.formData.tag_ids = [...current, tagId];
    }
    this.requestUpdate();
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (!this.formData.title.trim()) return;

    const totalDurationHours = Number(this.formData.durationHours || 0) + (Number(this.formData.durationMinutes || 0) / 60);
    const totalAlertHours = (Number(this.formData.alertDays || 0) * 24) + Number(this.formData.alertHours || 0) + (Number(this.formData.alertMinutes || 0) / 60);

    const payload = {
      title: this.formData.title,
      description: this.formData.description,
      priority: Math.max(1, Number(this.formData.priority || 1)),
      tag_ids: this.formData.tag_ids,
      deadline: this.formData.deadline || null,
      splittable: this.formData.splittable,
      ignore_breaks: this.formData.ignore_breaks,
      duration_hours: Number(totalDurationHours.toFixed(2)),
      duration_minutes: Math.round(totalDurationHours * 60),
      alert_window_hours: Number(totalAlertHours.toFixed(2)),
      alert_window_minutes: Math.round(totalAlertHours * 60)
    };

    if (this.task?.id) {
      await appState.updateTask(this.task.id, payload);
    } else {
      await appState.addTask(payload);
    }

    this.closeForm();
  }

  closeForm() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('drawer-close', { bubbles: true, composed: true }));
  }

  render() {
    const isEdit = !!this.task?.id;
    const availableTags = appState.tags || [];

    return html`
      <drawer-panel
        ?open="${this.open}"
        .title="${isEdit ? 'Edit Task' : 'Create New Task'}"
        @drawer-close="${this.closeForm}"
      >
        <form @submit="${this.handleSubmit}">
          <div class="form-group">
            <label>Title *</label>
            <input
              type="text"
              required
              placeholder="Task title..."
              .value="${this.formData.title || ''}"
              @input="${(e) => (this.formData.title = e.target.value)}"
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              placeholder="Task details..."
              .value="${this.formData.description || ''}"
              @input="${(e) => (this.formData.description = e.target.value)}"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Duration</label>
            <div class="grid-2">
              <div class="unit-input-group">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  .value="${this.formData.durationHours ?? 0}"
                  @change="${(e) => (this.formData.durationHours = Number(e.target.value))}"
                />
                <span>Hours</span>
              </div>
              <div class="unit-input-group">
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  placeholder="30"
                  .value="${this.formData.durationMinutes ?? 30}"
                  @change="${(e) => (this.formData.durationMinutes = Number(e.target.value))}"
                />
                <span>Mins</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Priority Score (Min: 1, Higher = First)</label>
            <input
              type="number"
              min="1"
              .value="${this.formData.priority ?? 5}"
              @change="${(e) => (this.formData.priority = Number(e.target.value))}"
            />
          </div>

          <div class="form-group">
            <label>Tags</label>
            <div class="tag-checkboxes">
              ${availableTags.map(tag => {
                const isSelected = this.formData.tag_ids?.includes(tag.id);
                return html`
                  <div
                    class="tag-pill ${isSelected ? 'selected' : ''}"
                    style="background-color: ${tag.color || '#3B82F6'}; color: #ffffff;"
                    @click="${() => this.toggleTag(tag.id)}"
                  >
                    🏷️ ${tag.name}
                  </div>
                `;
              })}
            </div>
          </div>

          <div class="form-group">
            <label>Deadline (Optional)</label>
            <input
              type="datetime-local"
              .value="${this.formData.deadline ? this.formData.deadline.substring(0, 16) : ''}"
              @change="${(e) => (this.formData.deadline = e.target.value ? new Date(e.target.value).toISOString() : '')}"
            />
          </div>

          <div class="form-group">
            <label>Alert Window Before Deadline</label>
            <div class="grid-3">
              <div class="unit-input-group">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  .value="${this.formData.alertDays ?? 0}"
                  @change="${(e) => (this.formData.alertDays = Number(e.target.value))}"
                />
                <span>Days</span>
              </div>
              <div class="unit-input-group">
                <input
                  type="number"
                  min="0"
                  max="23"
                  placeholder="2"
                  .value="${this.formData.alertHours ?? 2}"
                  @change="${(e) => (this.formData.alertHours = Number(e.target.value))}"
                />
                <span>Hours</span>
              </div>
              <div class="unit-input-group">
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  placeholder="0"
                  .value="${this.formData.alertMinutes ?? 0}"
                  @change="${(e) => (this.formData.alertMinutes = Number(e.target.value))}"
                />
                <span>Mins</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-row">
              <input
                type="checkbox"
                .checked="${this.formData.splittable ?? true}"
                @change="${(e) => (this.formData.splittable = e.target.checked)}"
              />
              Allow Cronograma to split task across non-contiguous slots
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-row">
              <input
                type="checkbox"
                .checked="${this.formData.ignore_breaks ?? false}"
                @change="${(e) => (this.formData.ignore_breaks = e.target.checked)}"
              />
              Can be scheduled during break hours
            </label>
          </div>

          ${isEdit
            ? html`
                <div class="form-group">
                  <label>Dependencies</label>
                  <task-dependency-graph .taskId="${this.task.id}"></task-dependency-graph>
                </div>
              `
            : ''}
        </form>

        <div slot="footer">
          <button class="btn-cancel" @click="${this.closeForm}">Cancel</button>
          <button class="btn-submit" @click="${this.handleSubmit}">
            ${isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </drawer-panel>
    `;
  }
}

customElements.define('task-form', TaskForm);
