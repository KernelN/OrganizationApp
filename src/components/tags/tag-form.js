import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';
import '../shared/drawer-panel.js';
import '../shared/color-picker.js';
import './tag-time-window-editor.js';

export class TagForm extends LitElement {
  static properties = {
    open: { type: Boolean },
    tag: { type: Object }
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

    input[type="text"], select, input[type="number"] {
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 10px 12px;
      color: var(--color-text-primary, #F3F4F6);
      font-size: 0.875rem;
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
    this.tag = null;
    this.formData = this.getInitialData();
  }

  updated(changedProperties) {
    if (changedProperties.has('tag')) {
      if (this.tag) {
        this.formData = { ...this.tag };
      } else {
        this.formData = this.getInitialData();
      }
    }
  }

  getInitialData() {
    return {
      name: '',
      color: '#3B82F6',
      time_window_mode: 'none',
      time_windows: {},
      needs_dedicated_timeslot: false,
      auto_expand_config: {
        minimum_daily_minutes: 60,
        assigned_days: [0, 1, 2, 3, 4]
      }
    };
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (!this.formData.name.trim()) return;

    if (this.tag?.id) {
      await appState.updateTag(this.tag.id, this.formData);
    } else {
      await appState.addTag(this.formData);
    }

    this.open = false;
  }

  render() {
    const isEdit = !!this.tag?.id;

    return html`
      <drawer-panel
        ?open="${this.open}"
        .title="${isEdit ? 'Edit Tag' : 'Create New Tag'}"
        @drawer-close="${() => (this.open = false)}"
      >
        <form @submit="${this.handleSubmit}">
          <div class="form-group">
            <label>Tag Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Deep Work, Workout..."
              .value="${this.formData.name || ''}"
              @input="${(e) => (this.formData.name = e.target.value)}"
            />
          </div>

          <div class="form-group">
            <label>Tag Color</label>
            <color-picker
              .value="${this.formData.color || '#3B82F6'}"
              @color-change="${(e) => (this.formData.color = e.detail.value)}"
            ></color-picker>
          </div>

          <div class="form-group">
            <label>Time Window Mode</label>
            <select
              .value="${this.formData.time_window_mode || 'none'}"
              @change="${(e) => (this.formData.time_window_mode = e.target.value)}"
            >
              <option value="none">None (Label Only)</option>
              <option value="manual">Manual Fixed Time Windows</option>
              <option value="auto">Auto-Expanding Windows</option>
            </select>
          </div>

          <div class="form-group">
            <label class="checkbox-row">
              <input
                type="checkbox"
                .checked="${this.formData.needs_dedicated_timeslot ?? false}"
                @change="${(e) => (this.formData.needs_dedicated_timeslot = e.target.checked)}"
              />
              Needs dedicated time slot (reserves window exclusively)
            </label>
          </div>

          ${this.formData.time_window_mode === 'manual'
            ? html`
                <div class="form-group">
                  <label>Configure Fixed Windows (Per Day)</label>
                  <tag-time-window-editor
                    .timeWindows="${this.formData.time_windows || {}}"
                    @time-windows-change="${(e) => (this.formData.time_windows = e.detail.timeWindows)}"
                  ></tag-time-window-editor>
                </div>
              `
            : ''}

          ${this.formData.time_window_mode === 'auto'
            ? html`
                <div class="form-group">
                  <label>Baseline Daily Allocation (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    .value="${this.formData.auto_expand_config?.minimum_daily_minutes || 60}"
                    @change="${(e) => {
                      this.formData.auto_expand_config = {
                        ...(this.formData.auto_expand_config || {}),
                        minimum_daily_minutes: Number(e.target.value)
                      };
                    }}"
                  />
                </div>
              `
            : ''}
        </form>

        <div slot="footer">
          <button class="btn-cancel" @click="${() => (this.open = false)}">Cancel</button>
          <button class="btn-submit" @click="${this.handleSubmit}">
            ${isEdit ? 'Save Changes' : 'Create Tag'}
          </button>
        </div>
      </drawer-panel>
    `;
  }
}

customElements.define('tag-form', TagForm);
