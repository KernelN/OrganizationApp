import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { appState } from '../../state/app-state.js';
import '../shared/color-picker.js';
import './tag-time-window-editor.js';

const DAYS_MAP = [
  { idx: 0, label: 'Mon' },
  { idx: 1, label: 'Tue' },
  { idx: 2, label: 'Wed' },
  { idx: 3, label: 'Thu' },
  { idx: 4, label: 'Fri' },
  { idx: 5, label: 'Sat' },
  { idx: 6, label: 'Sun' }
];

/**
 * <crono-tag-form> — Create and edit form for tags.
 */
export class CronoTagForm extends LitElement {
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
      .radio-group {
        display: flex;
        gap: var(--space-md);
      }
      .radio-option {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        font-size: 13px;
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
      }
    `
  ];

  static properties = {
    tag: { type: Object }
  };

  constructor() {
    super();
    this.tag = null;
    this.formData = {
      name: '',
      color: '#3B82F6',
      duration_hours: null,
      deadline: '',
      start_date: '',
      needs_dedicated_timeslot: false,
      time_window_mode: 'none',
      time_windows: {},
      auto_expand_config: {
        minimum_daily_hours: 1.0,
        assigned_days: [0, 1, 2, 3, 4]
      }
    };
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('tag') && this.tag) {
      this.formData = {
        name: this.tag.name || '',
        color: this.tag.color || '#3B82F6',
        duration_hours: this.tag.duration_hours ?? null,
        deadline: this.tag.deadline ? this.tag.deadline.split('T')[0] : '',
        start_date: this.tag.start_date ? this.tag.start_date.split('T')[0] : '',
        needs_dedicated_timeslot: this.tag.needs_dedicated_timeslot ?? false,
        time_window_mode: this.tag.time_window_mode || 'none',
        time_windows: this.tag.time_windows || {},
        auto_expand_config: this.tag.auto_expand_config || {
          minimum_daily_hours: 1.0,
          assigned_days: [0, 1, 2, 3, 4]
        }
      };
    }
  }

  _toggleAssignedDay(dayIdx) {
    const config = this.formData.auto_expand_config || { minimum_daily_hours: 1.0, assigned_days: [] };
    const currentDays = new Set(config.assigned_days || []);
    if (currentDays.has(dayIdx)) currentDays.delete(dayIdx);
    else currentDays.add(dayIdx);

    this.formData = {
      ...this.formData,
      auto_expand_config: {
        ...config,
        assigned_days: Array.from(currentDays)
      }
    };
    this.requestUpdate();
  }

  _onSubmit(e) {
    e.preventDefault();
    const payload = {
      ...this.formData,
      duration_hours: this.formData.duration_hours ? Number(this.formData.duration_hours) : null,
      deadline: this.formData.deadline ? new Date(this.formData.deadline).toISOString() : null,
      start_date: this.formData.start_date ? new Date(this.formData.start_date).toISOString() : null
    };

    if (this.tag && this.tag.id) {
      appState.updateTag(this.tag.id, payload);
    } else {
      appState.createTag(payload);
    }

    this.dispatchEvent(new CustomEvent('crono-form-saved', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <form @submit=${this._onSubmit}>
        <div class="form-group">
          <label>Tag Name *</label>
          <input
            type="text"
            class="crono-input"
            required
            .value=${this.formData.name}
            @input=${(e) => (this.formData.name = e.target.value)}
          />
        </div>

        <div class="form-group">
          <label>Color</label>
          <crono-color-picker
            .value=${this.formData.color}
            @crono-color-change=${(e) => (this.formData.color = e.detail.value)}
          ></crono-color-picker>
        </div>

        <div class="row">
          <div class="form-group">
            <label>Total Time Budget (Hours)</label>
            <input
              type="number"
              step="0.5"
              class="crono-input"
              .value=${this.formData.duration_hours || ''}
              @input=${(e) => (this.formData.duration_hours = e.target.value)}
            />
          </div>

          <div class="form-group">
            <label>Deadline</label>
            <input
              type="date"
              class="crono-input"
              .value=${this.formData.deadline}
              @input=${(e) => (this.formData.deadline = e.target.value)}
            />
          </div>
        </div>

        <div class="form-group">
          <label>Time Window Mode</label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                name="time_window_mode"
                value="none"
                .checked=${this.formData.time_window_mode === 'none'}
                @change=${() => (this.formData = { ...this.formData, time_window_mode: 'none' })}
              /> None (Label Only)
            </label>
            <label class="radio-option">
              <input
                type="radio"
                name="time_window_mode"
                value="manual"
                .checked=${this.formData.time_window_mode === 'manual'}
                @change=${() => (this.formData = { ...this.formData, time_window_mode: 'manual' })}
              /> Manual Windows
            </label>
            <label class="radio-option">
              <input
                type="radio"
                name="time_window_mode"
                value="auto"
                .checked=${this.formData.time_window_mode === 'auto'}
                @change=${() => (this.formData = { ...this.formData, time_window_mode: 'auto' })}
              /> Auto-Expanding
            </label>
          </div>
        </div>

        ${this.formData.time_window_mode === 'manual'
          ? html`
              <div class="form-group">
                <label>Manual Time Windows</label>
                <crono-tag-time-window-editor
                  .timeWindows=${this.formData.time_windows}
                  @crono-windows-change=${e => this.formData.time_windows = e.detail.timeWindows}
                ></crono-tag-time-window-editor>
              </div>
            `
          : ''}

        ${this.formData.time_window_mode === 'auto'
          ? html`
              <div class="form-group">
                <label>Minimum Daily Allocation (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  class="crono-input"
                  .value=${String(this.formData.auto_expand_config?.minimum_daily_hours || 1.0)}
                  @input=${e => this.formData.auto_expand_config.minimum_daily_hours = Number(e.target.value)}
                />
              </div>

              <div class="form-group">
                <label>Active Days</label>
                <div class="chip-group">
                  ${DAYS_MAP.map(d => html`
                    <button
                      type="button"
                      class="chip ${(this.formData.auto_expand_config?.assigned_days || []).includes(d.idx) ? 'selected' : ''}"
                      @click=${() => this._toggleAssignedDay(d.idx)}
                    >${d.label}</button>
                  `)}
                </div>
              </div>
            `
          : ''}

        <button type="submit" class="crono-btn crono-btn-primary">Save Tag</button>
      </form>
    `;
  }
}

customElements.define('crono-tag-form', CronoTagForm);
