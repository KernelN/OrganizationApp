import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { formatDateISO, parseISOToLocalDate } from '../../utils/date-utils.js';
import { appState, AppStateController } from '../../state/app-state.js';
import './calendar-day-view.js';
import './calendar-week-view.js';
import './calendar-month-view.js';
import '../tasks/task-form.js';
import '../tags/tag-form.js';
import '../shared/drawer-panel.js';

/**
 * <crono-calendar-view> — Parent calendar container supporting Day/Week/Month views.
 */
export class CronoCalendarView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--space-md);
      }
      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        background: var(--bg-surface);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-md);
        border: 1px solid var(--border);
        flex-wrap: wrap;
      }
      .date-nav {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }
      .current-date-title {
        font-weight: 600;
        font-size: 15px;
        min-width: 180px;
      }
      .mode-toggle {
        display: flex;
        background: var(--bg-secondary);
        padding: 2px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
      }
      .mode-btn {
        background: transparent;
        border: none;
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        font-size: 12px;
        cursor: pointer;
        font-weight: 500;
        color: var(--text-secondary);
      }
      .mode-btn.active {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }
      .view-container {
        flex: 1;
        overflow: hidden;
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
    `
  ];

  static properties = {
    mode: { type: String }, // 'day' | 'week' | 'month'
    selectedDate: { type: String },
    taskDrawerOpen: { type: Boolean },
    tagDrawerOpen: { type: Boolean },
    editingTask: { type: Object },
    editingTag: { type: Object }
  };

  constructor() {
    super();
    this.appStateCtrl = new AppStateController(this);
    this.mode = 'day';
    this.selectedDate = formatDateISO(new Date());
    this.taskDrawerOpen = false;
    this.tagDrawerOpen = false;
    this.editingTask = null;
    this.editingTag = null;
  }

  _navigate(offset) {
    const d = parseISOToLocalDate(this.selectedDate);
    if (this.mode === 'day') d.setDate(d.getDate() + offset);
    else if (this.mode === 'week') d.setDate(d.getDate() + offset * 7);
    else if (this.mode === 'month') d.setMonth(d.getMonth() + offset);
    this.selectedDate = formatDateISO(d);
  }

  _goToday() {
    this.selectedDate = formatDateISO(new Date());
  }

  _onEventClick(e) {
    const { task } = e.detail;
    if (task && task.id) {
      this.editingTask = task;
      this.taskDrawerOpen = true;
    }
  }

  _onTagClick(e) {
    const { tag } = e.detail;
    if (tag && tag.id) {
      this.editingTag = tag;
      this.tagDrawerOpen = true;
    }
  }

  render() {
    const blocks = appState.schedule ? appState.schedule.blocks || [] : [];
    const tagWindowsComputed = appState.schedule ? appState.schedule.tag_windows_computed || [] : [];
    const tasks = appState.tasks || [];
    const tags = appState.tags || [];
    const settings = appState.settings || {};

    const formattedHeader = parseISOToLocalDate(this.selectedDate).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return html`
      <div class="toolbar">
        <div class="date-nav">
          <button class="crono-btn crono-btn-secondary crono-btn-sm" @click=${() => this._navigate(-1)}>◀</button>
          <button class="crono-btn crono-btn-secondary crono-btn-sm" @click=${this._goToday}>Today</button>
          <button class="crono-btn crono-btn-secondary crono-btn-sm" @click=${() => this._navigate(1)}>▶</button>
          <span class="current-date-title">${formattedHeader}</span>
        </div>

        <div class="mode-toggle">
          <button
            class="mode-btn ${this.mode === 'day' ? 'active' : ''}"
            @click=${() => (this.mode = 'day')}
          >Day</button>
          <button
            class="mode-btn ${this.mode === 'week' ? 'active' : ''}"
            @click=${() => (this.mode = 'week')}
          >Week</button>
          <button
            class="mode-btn ${this.mode === 'month' ? 'active' : ''}"
            @click=${() => (this.mode = 'month')}
          >Month</button>
        </div>
      </div>

      <div class="view-container">
        ${this.mode === 'day'
          ? html`
              <crono-calendar-day-view
                .selectedDate=${this.selectedDate}
                .blocks=${blocks}
                .tasks=${tasks}
                .tags=${tags}
                .tagWindowsComputed=${tagWindowsComputed}
                .settings=${settings}
                @crono-event-click=${this._onEventClick}
                @crono-tag-click=${this._onTagClick}
              ></crono-calendar-day-view>
            `
          : this.mode === 'week'
          ? html`
              <crono-calendar-week-view
                .selectedDate=${this.selectedDate}
                .blocks=${blocks}
                .tasks=${tasks}
                .tags=${tags}
                .tagWindowsComputed=${tagWindowsComputed}
                .settings=${settings}
                @crono-event-click=${this._onEventClick}
                @crono-tag-click=${this._onTagClick}
              ></crono-calendar-week-view>
            `
          : html`
              <crono-calendar-month-view
                .selectedDate=${this.selectedDate}
                .blocks=${blocks}
                .tasks=${tasks}
                .tags=${tags}
                .tagWindowsComputed=${tagWindowsComputed}
                @crono-date-select=${(e) => {
                  this.selectedDate = e.detail.date;
                  this.mode = 'day';
                }}
              ></crono-calendar-month-view>
            `}
      </div>

      <!-- Task Editing Drawer -->
      <crono-drawer-panel
        .open=${this.taskDrawerOpen}
        title="Edit Task"
        @crono-drawer:close=${() => (this.taskDrawerOpen = false)}
      >
        <crono-task-form
          .task=${this.editingTask}
          @crono-task-form:cancel=${() => (this.taskDrawerOpen = false)}
          @crono-task-form:save=${() => (this.taskDrawerOpen = false)}
          @crono-task-form:delete=${() => (this.taskDrawerOpen = false)}
        ></crono-task-form>
      </crono-drawer-panel>

      <!-- Tag Editing Drawer -->
      <crono-drawer-panel
        .open=${this.tagDrawerOpen}
        title="Edit Tag"
        @crono-drawer:close=${() => (this.tagDrawerOpen = false)}
      >
        <crono-tag-form
          .tag=${this.editingTag}
          @crono-tag-form:cancel=${() => (this.tagDrawerOpen = false)}
          @crono-tag-form:save=${() => (this.tagDrawerOpen = false)}
          @crono-tag-form:delete=${() => (this.tagDrawerOpen = false)}
        ></crono-tag-form>
      </crono-drawer-panel>
    `;
  }
}

customElements.define('crono-calendar-view', CronoCalendarView);
