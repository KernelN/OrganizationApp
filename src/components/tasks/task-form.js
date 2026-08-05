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

    .tag-checkboxes {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 0.8125rem;
      border: 1px solid var(--color-border, #2E3242);
      background: var(--color-bg-base, #121318);
      cursor: pointer;
    }

    .tag-pill.selected {
      border-color: var(--color-accent, #6366F1);
      background: var(--color-accent-subtle, rgba(99, 102, 241, 0.15));
      color: var(--color-accent, #6366F1);
      font-weight: 600;
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

  updated(changedProperties) {
    if (changedProperties.has('task')) {
      if (this.task) {
        this.formData = { ...this.task };
      } else {
        this.formData = this.getInitialData();
      }
    }
  }

  getInitialData() {
    return {
      title: '',
      description: '',
      duration_minutes: 30,
      priority: 5,
      tag_ids: [],
      deadline: '',
      alert_window_minutes: 120,
      splittable: true,
      ignore_breaks: false
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

    if (this.task?.id) {
      await appState.updateTask(this.task.id, this.formData);
    } else {
      await appState.addTask(this.formData);
    }

    this.open = false;
    this.dispatchEvent(new CustomEvent('form-saved'));
  }

  render() {
    const isEdit = !!this.task?.id;
    const availableTags = appState.tags || [];

    return html`
      <drawer-panel
        ?open="${this.open}"
        .title="${isEdit ? 'Edit Task' : 'Create New Task'}"
        @drawer-close="${() => (this.open = false)}"
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
              placeholder="Task details and subtasks..."
              .value="${this.formData.description || ''}"
              @input="${(e) => (this.formData.description = e.target.value)}"
            ></textarea>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                min="15"
                step="15"
                .value="${this.formData.duration_minutes || 30}"
                @change="${(e) => (this.formData.duration_minutes = Number(e.target.value))}"
              />
            </div>

            <div class="form-group">
              <label>Priority Score (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                .value="${this.formData.priority ?? 5}"
                @change="${(e) => (this.formData.priority = Number(e.target.value))}"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Tags</label>
            <div class="tag-checkboxes">
              ${availableTags.map(
                tag => html`
                  <div
                    class="tag-pill ${this.formData.tag_ids?.includes(tag.id) ? 'selected' : ''}"
                    @click="${() => this.toggleTag(tag.id)}"
                  >
                    🏷️ ${tag.name}
                  </div>
                `
              )}
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Deadline (Optional)</label>
              <input
                type="datetime-local"
                .value="${this.formData.deadline ? this.formData.deadline.substring(0, 16) : ''}"
                @change="${(e) => (this.formData.deadline = e.target.value ? new Date(e.target.value).toISOString() : null)}"
              />
            </div>

            <div class="form-group">
              <label>Alert Window (mins)</label>
              <input
                type="number"
                min="0"
                step="15"
                .value="${this.formData.alert_window_minutes || 120}"
                @change="${(e) => (this.formData.alert_window_minutes = Number(e.target.value))}"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-row">
              <input
                type="checkbox"
                .checked="${this.formData.splittable ?? true}"
                @change="${(e) => (this.formData.splittable = e.target.checked)}"
              />
              Allow Cronograma to split task across slots
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
          <button class="btn-cancel" @click="${() => (this.open = false)}">Cancel</button>
          <button class="btn-submit" @click="${this.handleSubmit}">
            ${isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </drawer-panel>
    `;
  }
}

customElements.define('task-form', TaskForm);
