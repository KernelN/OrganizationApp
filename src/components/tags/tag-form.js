import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { appState } from '../../state/app-state.js';
import { getTagDepth, getTagDescendants, validateTagHierarchy } from '../../utils/validators.js';
import { subtractTimeWindows } from '../../engine/tag-window-expander.js';
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
 * <crono-tag-form> — Create and edit form for tags with hierarchy and auto-computed time budget.
 */
export class CronoTagForm extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        width: 100%;
        box-sizing: border-box;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        width: 100%;
        box-sizing: border-box;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        width: 100%;
        box-sizing: border-box;
        min-width: 0;
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
        flex-wrap: wrap;
        width: 100%;
        box-sizing: border-box;
      }
      .row > * {
        flex: 1 1 200px;
        min-width: 0;
      }
      .radio-group {
        display: flex;
        gap: var(--space-md);
        flex-wrap: wrap;
      }
      .radio-option {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        font-size: 13px;
        cursor: pointer;
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
        transition: background var(--transition-fast), border-color var(--transition-fast);
      }
      .chip.selected {
        background: var(--accent-muted);
        border-color: var(--accent);
        color: var(--text-primary);
        font-weight: 600;
      }
      .calculated-preview {
        font-size: 12px;
        color: var(--text-secondary);
        background: var(--bg-tertiary);
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        border-left: 3px solid var(--accent);
      }
      .parent-info-badge {
        font-size: 12px;
        padding: var(--space-xs) var(--space-sm);
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }
    `
  ];

  static properties = {
    tag: { type: Object },
    initialParentId: { type: String }
  };

  constructor() {
    super();
    this.tag = null;
    this.initialParentId = null;
    this.formData = {
      name: '',
      color: '#3B82F6',
      parent_tag_id: null,
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
    if (changedProperties.has('tag') || changedProperties.has('initialParentId')) {
      if (this.tag) {
        this.formData = {
          name: this.tag.name || '',
          color: this.tag.color || '#3B82F6',
          parent_tag_id: this.tag.parent_tag_id || null,
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
      } else {
        this.formData = {
          name: '',
          color: '#3B82F6',
          parent_tag_id: this.initialParentId || null,
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

    const allTags = appState.tags || [];
    const tagTasks = appState.tasks.filter(t => Array.isArray(t.tag_ids) && t.tag_ids.includes(this.tag?.id) && t.status === 'active');
    const autoDuration = tagTasks.reduce((sum, t) => sum + (t.duration_hours || 0), 0);

    const payload = {
      ...this.formData,
      parent_tag_id: this.formData.parent_tag_id || null,
      duration_hours: autoDuration > 0 ? autoDuration : null,
      deadline: this.formData.deadline ? new Date(this.formData.deadline).toISOString() : null,
      start_date: this.formData.start_date ? new Date(this.formData.start_date).toISOString() : null
    };

    if (this.tag && this.tag.id) {
      payload.id = this.tag.id;
    }

    try {
      validateTagHierarchy(payload, allTags);
    } catch (err) {
      alert(err.message);
      return;
    }

    if (this.tag && this.tag.id) {
      appState.updateTag(this.tag.id, payload);
    } else {
      appState.createTag(payload);
    }

    this.dispatchEvent(new CustomEvent('crono-form-saved', { bubbles: true, composed: true }));
  }

  _getEligibleParentTags() {
    const allTags = appState.tags || [];
    const currentId = this.tag?.id;
    const descendantIds = currentId ? new Set(getTagDescendants(currentId, allTags).map(d => d.id)) : new Set();

    return allTags.filter(tg => {
      if (currentId && tg.id === currentId) return false;
      if (descendantIds.has(tg.id)) return false;
      // If tag depth is already 4, it cannot have children (depth would exceed 4)
      const depth = getTagDepth(tg.id, allTags);
      if (depth >= 4) return false;
      return true;
    });
  }
  _getEffectiveParentWindows(parentTag) {
    if (!parentTag || parentTag.time_window_mode !== 'manual') return null;
    const allTags = appState.tags || [];
    const currentId = this.tag?.id;
    // Sibling subtags under the same parent
    const siblings = allTags.filter(t => t.parent_tag_id === parentTag.id && t.id !== currentId && t.time_window_mode === 'manual');

    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const effective = {};

    for (const day of dayNames) {
      const baseWins = parentTag.time_windows?.[day] || [];
      const siblingWins = siblings.flatMap(s => s.time_windows?.[day] || []);
      effective[day] = subtractTimeWindows(baseWins, siblingWins);
    }
    return effective;
  }

  render() {
    const allTags = appState.tags || [];
    const tagTasks = this.tag ? appState.tasks.filter(t => Array.isArray(t.tag_ids) && t.tag_ids.includes(this.tag.id) && t.status === 'active') : [];
    const autoDuration = tagTasks.reduce((sum, t) => sum + (t.duration_hours || 0), 0);

    const eligibleParents = this._getEligibleParentTags();
    const parentTag = this.formData.parent_tag_id ? allTags.find(t => t.id === this.formData.parent_tag_id) : null;
    const parentDepth = parentTag ? getTagDepth(parentTag.id, allTags) : 0;
    const effectiveParentWindows = this._getEffectiveParentWindows(parentTag);

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
            placeholder="e.g. Work, Deep Focus, Sub-Project A"
          />
        </div>

        <!-- Parent Tag Selector (Hierarchy Depth <= 4) -->
        <div class="form-group">
          <label>Parent Tag (Optional — Nested up to 4 levels)</label>
          <select
            class="crono-select"
            .value=${this.formData.parent_tag_id || ''}
            @change=${(e) => {
              const pId = e.target.value || null;
              this.formData = { ...this.formData, parent_tag_id: pId };
              this.requestUpdate();
            }}
          >
            <option value="">(None — Top-Level Root Tag)</option>
            ${eligibleParents.map(p => {
              const depth = getTagDepth(p.id, allTags);
              const indent = '— '.repeat(depth - 1);
              return html`
                <option value=${p.id}>
                  ${indent}🏷 ${p.name} (Level ${depth}) ${p.time_window_mode !== 'none' ? '⏰' : ''}
                </option>
              `;
            })}
          </select>
          ${parentTag ? html`
            <div class="parent-info-badge">
              <span>🔗 Child of <strong>${parentTag.name}</strong> (Creates Level ${parentDepth + 1})</span>
              ${parentTag.time_window_mode !== 'none' ? html`
                <span> · ⏰ Parent Mode: <em>${parentTag.time_window_mode}</em></span>
              ` : ''}
            </div>
          ` : ''}
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
            <label>Start Date</label>
            <input
              type="date"
              class="crono-input"
              .value=${this.formData.start_date || ''}
              @input=${(e) => (this.formData.start_date = e.target.value)}
            />
          </div>

          <div class="form-group">
            <label>Deadline</label>
            <input
              type="date"
              class="crono-input"
              .value=${this.formData.deadline || ''}
              @input=${(e) => (this.formData.deadline = e.target.value)}
            />
          </div>
        </div>

        <!-- Automatic Tag Time Budget -->
        <div class="form-group">
          <label>Time Budget (Auto-computed from Tasks)</label>
          <div class="calculated-preview">
            📊 <strong>${autoDuration.toFixed(1)} hours</strong> total from <strong>${tagTasks.length}</strong> active task${tagTasks.length === 1 ? '' : 's'}
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
            <label class="radio-option" style="${parentTag && parentTag.time_window_mode === 'auto' ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
              <input
                type="radio"
                name="time_window_mode"
                value="manual"
                .disabled=${Boolean(parentTag && parentTag.time_window_mode === 'auto')}
                .checked=${this.formData.time_window_mode === 'manual'}
                @change=${() => (this.formData = { ...this.formData, time_window_mode: 'manual' })}
              /> Manual Windows
              ${parentTag && parentTag.time_window_mode === 'auto' ? html`<span style="font-size: 10px; color: var(--text-muted);">(Parent is Auto)</span>` : ''}
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
                ${parentTag && parentTag.time_window_mode === 'manual' ? html`
                  <div class="calculated-preview" style="margin-bottom: var(--space-xs);">
                    ℹ️ Windows are bounded inside parent (<strong>${parentTag.name}</strong>) unreserved hours.
                  </div>
                ` : ''}
                <crono-tag-time-window-editor
                  .timeWindows=${this.formData.time_windows}
                  .parentWindows=${effectiveParentWindows}
                  @crono-windows-change=${e => this.formData.time_windows = e.detail.timeWindows}
                ></crono-tag-time-window-editor>
              </div>
            `
          : ''}

        ${this.formData.time_window_mode === 'auto'
          ? (() => {
              const dayNamesList = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
              let allowedDayIndices = new Set([0, 1, 2, 3, 4, 5, 6]);
              if (parentTag) {
                if (parentTag.time_window_mode === 'auto') {
                  allowedDayIndices = new Set(parentTag.auto_expand_config?.assigned_days || []);
                } else if (parentTag.time_window_mode === 'manual') {
                  allowedDayIndices = new Set(
                    [0, 1, 2, 3, 4, 5, 6].filter(idx => (effectiveParentWindows?.[dayNamesList[idx]] || []).length > 0)
                  );
                }
              }

              return html`
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
                  ${parentTag && parentTag.time_window_mode !== 'none' ? html`
                    <div class="calculated-preview" style="margin-bottom: var(--space-xs);">
                      ℹ️ Days are restricted to parent (<strong>${parentTag.name}</strong>) active days.
                    </div>
                  ` : ''}
                  <div class="chip-group">
                    ${DAYS_MAP.map(d => {
                      const isAllowed = allowedDayIndices.has(d.idx);
                      const isSelected = (this.formData.auto_expand_config?.assigned_days || []).includes(d.idx);
                      return isAllowed ? html`
                        <button
                          type="button"
                          class="chip ${isSelected ? 'selected' : ''}"
                          @click=${() => this._toggleAssignedDay(d.idx)}
                        >${d.label}</button>
                      ` : html`
                        <button
                          type="button"
                          class="chip"
                          disabled
                          style="opacity: 0.45; cursor: not-allowed; text-decoration: line-through;"
                          title="Not allowed in parent tag"
                        >${d.label}</button>
                      `;
                    })}
                  </div>
                </div>
              `;
            })()
          : ''}

        <button type="submit" class="crono-btn crono-btn-primary">Save Tag</button>
      </form>
    `;
  }
}

customElements.define('crono-tag-form', CronoTagForm);

