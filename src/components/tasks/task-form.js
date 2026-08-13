import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { validateTaskTagConstraints, getTagDescendants, getTagDepth } from '../../utils/validators.js';
import { parseMarkdown } from '../../utils/markdown.js';
import { appState } from '../../state/app-state.js';
import { addHours, formatHHMM } from '../../utils/date-utils.js';
import '../shared/color-picker.js';
import '../shared/time-picker-24h.js';

const DAYS_MAP = [
  { idx: 0, label: 'Mon' },
  { idx: 1, label: 'Tue' },
  { idx: 2, label: 'Wed' },
  { idx: 3, label: 'Thu' },
  { idx: 4, label: 'Fri' },
  { idx: 5, label: 'Sat' },
  { idx: 6, label: 'Sun' }
];

const NTH_OPTIONS = [
  { val: 1, label: '1st' },
  { val: 2, label: '2nd' },
  { val: 3, label: '3rd' },
  { val: 4, label: '4th' },
  { val: -1, label: 'Last' }
];

/**
 * <crono-task-form> — Create and edit form for tasks with start-only manual time, anti-overflow styling, and max repeats.
 */
export class CronoTaskForm extends LitElement {
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
        align-items: flex-start;
        flex-wrap: wrap;
        width: 100%;
        box-sizing: border-box;
      }
      .row > * {
        flex: 1 1 200px;
        min-width: 0;
      }
      .toggle-group {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-top: var(--space-xs);
        flex-wrap: wrap;
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
        width: 100%;
      }
      .chip {
        padding: 4px 10px;
        border-radius: var(--radius-sm);
        background: var(--bg-surface);
        border: 1px solid var(--border);
        font-size: 12px;
        cursor: pointer;
        transition: background var(--transition-fast), border-color var(--transition-fast);
        display: inline-flex;
        align-items: center;
      }
      .chip.selected {
        background: var(--accent-muted);
        border-color: var(--accent);
        color: var(--text-primary);
        font-weight: 600;
      }
      .tab-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
        background: var(--bg-tertiary);
        padding: 2px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
      }
      .tab-btn {
        background: transparent;
        border: none;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
      }
      .tab-btn.active {
        background: var(--bg-surface);
        color: var(--text-primary);
        box-shadow: var(--shadow-sm);
      }
      .description-preview {
        min-height: 80px;
        max-height: 240px;
        overflow-y: auto;
        padding: var(--space-sm) var(--space-md);
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
      }
      .tag-hierarchy-tree {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }
      .tag-row-branch {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .subtag-children-container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-xs);
        margin-left: 18px;
        padding-left: var(--space-sm);
        border-left: 2px dashed var(--border);
      }
      .section-divider {
        border-top: 1px solid var(--border);
        margin-top: var(--space-sm);
        padding-top: var(--space-md);
        font-weight: 600;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }
      .card-subpanel {
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        box-sizing: border-box;
        width: 100%;
      }
      .calculated-preview {
        font-size: 12px;
        color: var(--text-secondary);
        background: var(--bg-tertiary);
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        border-left: 3px solid var(--accent);
      }
      .unit-pair {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        flex-wrap: wrap;
      }
      .unit-pair input {
        width: 70px;
        min-width: 50px;
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
        gap: var(--space-sm);
        flex-wrap: wrap;
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
    this.descriptionTab = 'edit';

    this._resetForm();
  }

  _resetForm() {
    const now = new Date();
    const formatDt = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    this.formData = {
      title: '',
      description: '',
      color: '#6366F1',
      priority: 0,
      tag_ids: [],
      deadline: '',
      splittable: true,
      ignore_breaks: false,
      manual_schedule: null,
      recurrence: null
    };

    this.scheduleMode = 'auto'; // 'auto' | 'manual'
    this.manualStart = formatDt(now);
    this.manualTimeOfDayStart = '09:00';

    this.isRecurring = false;
    this.recType = 'weekly';
    this.recInterval = 1;
    this.recMaxRepeats = null;
    this.recDaysOfWeek = [0, 2, 4]; // Mon, Wed, Fri
    this.recMonthlyMode = 'day_of_month';
    this.recDayOfMonth = now.getDate();
    this.recNthWeekdayNth = 1;
    this.recNthWeekdayDay = 2; // Wed
    this.recAccumulates = true;
    this.recAccumulationCap = 5;
    this.recCumulativeDays = [0, 1, 2, 3, 4]; // Mon-Fri
    this.recNextOccurrence = formatDt(now);

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

      this.scheduleMode = this.task.manual_schedule ? 'manual' : 'auto';
      if (this.task.manual_schedule) {
        if (this.task.manual_schedule.start && this.task.manual_schedule.start.length === 5) {
          this.manualTimeOfDayStart = this.task.manual_schedule.start;
        } else if (this.task.manual_schedule.start) {
          const sDate = new Date(this.task.manual_schedule.start);
          this.manualStart = this.task.manual_schedule.start.substring(0, 16);
          this.manualTimeOfDayStart = `${String(sDate.getHours()).padStart(2, '0')}:${String(sDate.getMinutes()).padStart(2, '0')}`;
        }
      }

      this.isRecurring = Boolean(this.task.recurrence);
      if (this.task.recurrence) {
        const r = this.task.recurrence;
        this.recType = r.type || 'weekly';
        this.recInterval = r.interval || 1;
        this.recMaxRepeats = r.max_repeats || null;
        this.recDaysOfWeek = Array.isArray(r.days_of_week) ? [...r.days_of_week] : [0, 2, 4];
        this.recMonthlyMode = r.monthly_mode || 'day_of_month';
        this.recDayOfMonth = r.day_of_month || new Date().getDate();
        this.recNthWeekdayNth = r.nth_weekday?.nth || 1;
        this.recNthWeekdayDay = r.nth_weekday?.day_of_week ?? 2;
        this.recAccumulates = r.accumulates ?? true;
        this.recAccumulationCap = r.accumulation_cap || 5;
        this.recCumulativeDays = Array.isArray(r.cumulative_days) ? [...r.cumulative_days] : [0, 1, 2, 3, 4];
        this.recNextOccurrence = r.next_occurrence ? r.next_occurrence.substring(0, 16) : '';
      }

      this.formData = {
        title: this.task.title || '',
        description: this.task.description || '',
        color: this.task.color || '#6366F1',
        priority: this.task.priority || 0,
        tag_ids: Array.isArray(this.task.tag_ids) ? [...this.task.tag_ids] : [],
        deadline: this.task.deadline ? this.task.deadline.substring(0, 16) : '',
        splittable: this.task.splittable ?? true,
        ignore_breaks: this.task.ignore_breaks ?? false,
        manual_schedule: this.task.manual_schedule ? { ...this.task.manual_schedule } : null,
        recurrence: this.task.recurrence ? { ...this.task.recurrence } : null
      };

      this.logHours = 1;
      this.logMins = 0;
    }
  }

  _getFormattedNextOccurrence() {
    const raw = this.task?.recurrence?.next_occurrence || this.recNextOccurrence || new Date().toISOString();
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return 'Today';
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return 'Automatic';
    }
  }

  _getComputedEndTimePreview() {
    const totalDurationHours = Number(this.durationHours || 0) + (Number(this.durationMins || 0) / 60);

    if (this.isRecurring) {
      const [h, m] = (this.manualTimeOfDayStart || '09:00').split(':').map(Number);
      const totalMins = (h || 0) * 60 + (m || 0) + Math.round(totalDurationHours * 60);
      const endH = Math.floor(totalMins / 60) % 24;
      const endM = totalMins % 60;
      return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    } else {
      if (!this.manualStart) return '';
      const startD = new Date(this.manualStart);
      const endD = addHours(startD, totalDurationHours);
      const pad = (n) => String(n).padStart(2, '0');
      return `${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())} ${pad(endD.getHours())}:${pad(endD.getMinutes())}`;
    }
  }

  _toggleTag(tagId) {
    const ids = new Set(this.formData.tag_ids);
    if (ids.has(tagId)) {
      ids.delete(tagId);
      // Cascade uncheck all descendant subtags
      const descendants = getTagDescendants(tagId, this.tags);
      for (const d of descendants) {
        ids.delete(d.id);
      }
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

  _renderTagBranch(tag) {
    const isSelected = this.formData.tag_ids.includes(tag.id);
    const children = this.tags.filter(t => t.parent_tag_id === tag.id);
    const depth = getTagDepth(tag.id, this.tags);

    return html`
      <div class="tag-row-branch">
        <button
          type="button"
          class="chip ${isSelected ? 'selected' : ''}"
          @click=${() => this._toggleTag(tag.id)}
        >
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${tag.color}; margin-right: 5px;"></span>
          <span>${tag.name}</span>
          ${tag.time_window_mode !== 'none' ? html`<span style="margin-left: 4px;">⏰</span>` : ''}
          ${children.length > 0 ? html`<span style="opacity: 0.6; font-size: 10px; margin-left: 4px;">(${children.length} sub)</span>` : ''}
        </button>

        ${isSelected && children.length > 0 ? html`
          <div class="subtag-children-container">
            ${children.map(child => this._renderTagBranch(child))}
          </div>
        ` : ''}
      </div>
    `;
  }

  _toggleDayOfWeek(dayIdx) {
    const days = new Set(this.recDaysOfWeek);
    if (days.has(dayIdx)) days.delete(dayIdx);
    else days.add(dayIdx);
    this.recDaysOfWeek = Array.from(days).sort((a, b) => a - b);
    this.requestUpdate();
  }

  _toggleCumulativeDay(dayIdx) {
    const days = new Set(this.recCumulativeDays);
    if (days.has(dayIdx)) days.delete(dayIdx);
    else days.add(dayIdx);
    this.recCumulativeDays = Array.from(days).sort((a, b) => a - b);
    this.requestUpdate();
  }

  _onSubmit(e) {
    e.preventDefault();

    const computedDuration = Number(this.durationHours || 0) + (Number(this.durationMins || 0) / 60);
    const computedAlert = (Number(this.alertDays || 0) * 24) + Number(this.alertHours || 0);

    let manualSchedule = null;
    if (this.scheduleMode === 'manual') {
      if (this.isRecurring) {
        const baseDate = this.recNextOccurrence ? new Date(this.recNextOccurrence) : new Date();
        const sTimeParts = (this.manualTimeOfDayStart || '09:00').split(':').map(Number);
        const startD = new Date(baseDate);
        startD.setHours(sTimeParts[0], sTimeParts[1], 0, 0);
        const endD = addHours(startD, Math.max(0.01, computedDuration));

        manualSchedule = {
          start: startD.toISOString(),
          end: endD.toISOString()
        };
      } else {
        const startD = this.manualStart ? new Date(this.manualStart) : new Date();
        const endD = addHours(startD, Math.max(0.01, computedDuration));
        manualSchedule = {
          start: startD.toISOString(),
          end: endD.toISOString()
        };
      }
    }

    let recurrence = null;
    if (this.isRecurring) {
      recurrence = {
        type: this.recType,
        interval: Number(this.recInterval || 1),
        max_repeats: this.recMaxRepeats ? Number(this.recMaxRepeats) : null,
        iterations_completed: this.task?.recurrence?.iterations_completed || 0,
        days_of_week: this.recDaysOfWeek,
        monthly_mode: this.recMonthlyMode,
        day_of_month: Number(this.recDayOfMonth || 1),
        nth_weekday: {
          nth: Number(this.recNthWeekdayNth || 1),
          day_of_week: Number(this.recNthWeekdayDay ?? 0)
        },
        accumulates: Boolean(this.recAccumulates),
        accumulation_cap: Number(this.recAccumulationCap || 5),
        cumulative_days: this.recCumulativeDays,
        next_occurrence: this.recNextOccurrence ? new Date(this.recNextOccurrence).toISOString() : new Date().toISOString()
      };
    }

    const payload = {
      ...this.formData,
      priority: Number(this.formData.priority),
      duration_hours: Math.max(0.01, computedDuration),
      alert_window_hours: this.formData.deadline ? computedAlert : null,
      deadline: this.formData.deadline ? new Date(this.formData.deadline).toISOString() : null,
      manual_schedule: manualSchedule,
      recurrence
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
    const endTimePreview = this._getComputedEndTimePreview();

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
            placeholder="e.g., Gym Workout / Pay Rent"
          />
        </div>

        <div class="form-group">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label>Description</label>
            <div class="tab-toggle">
              <button
                type="button"
                class="tab-btn ${this.descriptionTab === 'edit' ? 'active' : ''}"
                @click=${() => { this.descriptionTab = 'edit'; this.requestUpdate(); }}
              >✏️ Edit</button>
              <button
                type="button"
                class="tab-btn ${this.descriptionTab === 'preview' ? 'active' : ''}"
                @click=${() => { this.descriptionTab = 'preview'; this.requestUpdate(); }}
              >👁️ Preview</button>
            </div>
          </div>
          ${this.descriptionTab === 'edit' ? html`
            <textarea
              class="crono-textarea"
              .value=${this.formData.description}
              @input=${(e) => (this.formData.description = e.target.value)}
              placeholder="Supports markdown: **bold**, *italic*, - list, - [ ] task, \`code\`, # heading, tables..."
            ></textarea>
          ` : html`
            <div class="description-preview markdown-body">
              ${this.formData.description && this.formData.description.trim()
                ? html`<div .innerHTML=${parseMarkdown(this.formData.description)}></div>`
                : html`<span style="color: var(--text-secondary); font-style: italic;">No description provided.</span>`}
            </div>
          `}
        </div>

        <!-- Duration & Priority -->
        <div class="row">
          <div class="form-group" style="flex: 0 0 110px;">
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
            <label>Duration *</label>
            <div class="unit-pair">
              <input
                type="number"
                min="0"
                max="999"
                class="crono-input"
                .value=${String(this.durationHours)}
                @input=${(e) => { this.durationHours = Number(e.target.value); this.requestUpdate(); }}
              />
              <span>hrs</span>
              <input
                type="number"
                min="0"
                max="59"
                class="crono-input"
                .value=${String(this.durationMins)}
                @input=${(e) => { this.durationMins = Number(e.target.value); this.requestUpdate(); }}
              />
              <span>mins</span>
            </div>
          </div>
        </div>

        <!-- Schedule Mode (Auto vs Manual) -->
        <div class="form-group">
          <label>Scheduling Mode</label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                name="schedule_mode"
                value="auto"
                .checked=${this.scheduleMode === 'auto'}
                @change=${() => { this.scheduleMode = 'auto'; this.requestUpdate(); }}
              />
              <span>🤖 Autoset (Cronograma Engine)</span>
            </label>
            <label class="radio-option">
              <input
                type="radio"
                name="schedule_mode"
                value="manual"
                .checked=${this.scheduleMode === 'manual'}
                @change=${() => { this.scheduleMode = 'manual'; this.requestUpdate(); }}
              />
              <span>🔒 Manual (Locked Timeslot)</span>
            </label>
          </div>
        </div>

        ${this.scheduleMode === 'manual' ? html`
          <div class="card-subpanel">
            <label>🔒 Manual Locked Start Time</label>
            ${this.isRecurring ? html`
              <div class="form-group">
                <label>Daily/Weekly Starting Time (24h)</label>
                <crono-time-picker-24h
                  .value=${this.manualTimeOfDayStart}
                  @crono-time-change=${e => { this.manualTimeOfDayStart = e.detail.value; this.requestUpdate(); }}
                ></crono-time-picker-24h>
              </div>
            ` : html`
              <div class="form-group">
                <label>Starting Date & Time</label>
                <input
                  type="datetime-local"
                  class="crono-input"
                  .value=${this.manualStart}
                  @input=${e => { this.manualStart = e.target.value; this.requestUpdate(); }}
                  required
                />
              </div>
            `}
            <div class="calculated-preview">
              ⏱ Ends automatically at: <strong>${endTimePreview}</strong> (${this.durationHours}h ${this.durationMins}m duration)
            </div>
          </div>
        ` : ''}

        <!-- Recurrence Section -->
        <div class="form-group">
          <div class="toggle-group">
            <input
              type="checkbox"
              id="is_recurring"
              .checked=${this.isRecurring}
              @change=${(e) => { this.isRecurring = e.target.checked; this.requestUpdate(); }}
            />
            <label for="is_recurring" style="cursor: pointer;">🔄 Repeat Task (Recurring Schedule)</label>
          </div>
        </div>

        ${this.isRecurring ? html`
          <div class="card-subpanel">
            <div class="row">
              <div class="form-group">
                <label>Frequency</label>
                <select class="crono-select" .value=${this.recType} @change=${e => { this.recType = e.target.value; this.requestUpdate(); }}>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div class="form-group">
                <label>Repeat Every</label>
                <div class="unit-pair">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    class="crono-input"
                    .value=${String(this.recInterval)}
                    @input=${e => this.recInterval = Number(e.target.value)}
                  />
                  <span>${this.recType === 'hourly' ? 'hours' : this.recType === 'daily' ? 'days' : this.recType === 'weekly' ? 'weeks' : 'months'}</span>
                </div>
              </div>
            </div>

            <!-- Optional Max Repeats -->
            <div class="form-group">
              <label>Max Repeats / Iterations (Optional)</label>
              <input
                type="number"
                min="1"
                max="9999"
                class="crono-input"
                placeholder="Leave empty for infinite repeats"
                .value=${this.recMaxRepeats ? String(this.recMaxRepeats) : ''}
                @input=${e => this.recMaxRepeats = e.target.value ? Number(e.target.value) : null}
              />
            </div>

            ${this.recType === 'weekly' ? html`
              <div class="form-group">
                <label>Recurring Days of Week</label>
                <div class="chip-group">
                  ${DAYS_MAP.map(d => html`
                    <button
                      type="button"
                      class="chip ${this.recDaysOfWeek.includes(d.idx) ? 'selected' : ''}"
                      @click=${() => this._toggleDayOfWeek(d.idx)}
                    >${d.label}</button>
                  `)}
                </div>
              </div>
            ` : ''}

            ${this.recType === 'monthly' ? html`
              <div class="form-group">
                <label>Monthly Recurrence Pattern</label>
                <div class="radio-group">
                  <label class="radio-option">
                    <input
                      type="radio"
                      name="monthly_mode"
                      value="day_of_month"
                      .checked=${this.recMonthlyMode === 'day_of_month'}
                      @change=${() => { this.recMonthlyMode = 'day_of_month'; this.requestUpdate(); }}
                    /> Specific Day of Month
                  </label>
                  <label class="radio-option">
                    <input
                      type="radio"
                      name="monthly_mode"
                      value="nth_weekday"
                      .checked=${this.recMonthlyMode === 'nth_weekday'}
                      @change=${() => { this.recMonthlyMode = 'nth_weekday'; this.requestUpdate(); }}
                    /> Relative Weekday
                  </label>
                </div>
              </div>

              ${this.recMonthlyMode === 'day_of_month' ? html`
                <div class="form-group">
                  <label>Day of Month (1 - 31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    class="crono-input"
                    .value=${String(this.recDayOfMonth)}
                    @input=${e => this.recDayOfMonth = Number(e.target.value)}
                  />
                </div>
              ` : html`
                <div class="row">
                  <div class="form-group">
                    <label>Position</label>
                    <select class="crono-select" .value=${String(this.recNthWeekdayNth)} @change=${e => this.recNthWeekdayNth = Number(e.target.value)}>
                      ${NTH_OPTIONS.map(opt => html`<option value=${opt.val}>${opt.label}</option>`)}
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Weekday</label>
                    <select class="crono-select" .value=${String(this.recNthWeekdayDay)} @change=${e => this.recNthWeekdayDay = Number(e.target.value)}>
                      ${DAYS_MAP.map(d => html`<option value=${d.idx}>${d.label}</option>`)}
                    </select>
                  </div>
                </div>
              `}
            ` : ''}

            <!-- Accumulation Configuration -->
            <div class="section-divider">Missed Instance Handling</div>
            <div class="form-group">
              <div class="toggle-group">
                <input
                  type="checkbox"
                  id="rec_accumulates"
                  .checked=${this.recAccumulates}
                  @change=${e => { this.recAccumulates = e.target.checked; this.requestUpdate(); }}
                />
                <label for="rec_accumulates" style="cursor: pointer;">
                  Accumulate missed instances (Counter increases e.g. x2, x3)
                </label>
              </div>
            </div>

            ${this.recAccumulates ? html`
              <div class="row">
                <div class="form-group" style="flex: 0 0 140px;">
                  <label>Max Accumulation Cap</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    class="crono-input"
                    .value=${String(this.recAccumulationCap)}
                    @input=${e => this.recAccumulationCap = Number(e.target.value)}
                  />
                </div>

                <div class="form-group">
                  <label>Allowed Make-up / Cumulative Days</label>
                  <div class="chip-group">
                    ${DAYS_MAP.map(d => html`
                      <button
                        type="button"
                        class="chip ${this.recCumulativeDays.includes(d.idx) ? 'selected' : ''}"
                        @click=${() => this._toggleCumulativeDay(d.idx)}
                      >${d.label}</button>
                    `)}
                  </div>
                </div>
              </div>
            ` : ''}

            <div class="form-group">
              <label>Next Occurrence (Auto-Scheduled)</label>
              <div class="calculated-preview">
                📅 <strong>${this._getFormattedNextOccurrence()}</strong>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="form-group">
          <label>Color</label>
          <crono-color-picker
            .value=${this.formData.color}
            @crono-color-change=${(e) => (this.formData.color = e.detail.value)}
          ></crono-color-picker>
        </div>

        <div class="form-group">
          <label>Tags & Subtags</label>
          <div class="tag-hierarchy-tree">
            ${this.tags.filter(t => !t.parent_tag_id).length === 0 ? html`
              <span style="font-size: 12px; color: var(--text-secondary); font-style: italic;">No tags created yet.</span>
            ` : html`
              <div class="chip-group">
                ${this.tags.filter(t => !t.parent_tag_id).map(rootTag => this._renderTagBranch(rootTag))}
              </div>
            `}
          </div>
        </div>

        <!-- Deadline row -->
        <div class="form-group">
          <label>Deadline (Optional)</label>
          <input
            type="datetime-local"
            class="crono-input"
            .value=${this.formData.deadline}
            @input=${(e) => (this.formData.deadline = e.target.value)}
          />
        </div>

        <!-- Alert Window on its own separate row below Deadline to avoid any cutoff -->
        <div class="form-group">
          <label>Alert Window (Before Deadline)</label>
          <div class="unit-pair">
            <input
              type="number"
              min="0"
              max="999"
              class="crono-input"
              .value=${String(this.alertDays)}
              @input=${(e) => (this.alertDays = Number(e.target.value))}
            />
            <span>days</span>
            <input
              type="number"
              min="0"
              max="23"
              class="crono-input"
              .value=${String(this.alertHours)}
              @input=${(e) => (this.alertHours = Number(e.target.value))}
            />
            <span>hrs</span>
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
                class="crono-input"
                placeholder="H"
                .value=${String(this.logHours)}
                @input=${e => (this.logHours = Number(e.target.value))}
              />
              <span>h</span>
              <input
                type="number"
                min="0"
                max="59"
                class="crono-input"
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
