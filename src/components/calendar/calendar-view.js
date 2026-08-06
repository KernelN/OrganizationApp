import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { formatDateISO, addDays } from '../../utils/date-utils.js';
import { appState, AppStateController } from '../../state/app-state.js';
import './calendar-day-view.js';
import './calendar-week-view.js';
import './calendar-month-view.js';

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
        flex-wrap: wrap;
      }
      .date-nav {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }
      .current-date-title {
        font-size: 16px;
        font-weight: 600;
        min-width: 180px;
      }
      .mode-toggle {
        display: flex;
        background: var(--bg-surface);
        padding: 2px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border);
      }
      .mode-btn {
        padding: 4px 12px;
        border-radius: var(--radius-sm);
        font-size: 13px;
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
      }
    `
  ];

  static properties = {
    mode: { type: String }, // 'day' | 'week' | 'month'
    selectedDate: { type: String }
  };

  constructor() {
    super();
    this.appStateCtrl = new AppStateController(this);
    this.mode = 'day';
    this.selectedDate = formatDateISO(new Date());
  }

  _navigate(offset) {
    const [y, m, day] = (this.selectedDate || formatDateISO(new Date())).split('-').map(Number);
    const d = new Date(y, m - 1, day);
    if (this.mode === 'day') d.setDate(d.getDate() + offset);
    else if (this.mode === 'week') d.setDate(d.getDate() + offset * 7);
    else if (this.mode === 'month') d.setMonth(d.getMonth() + offset);
    this.selectedDate = formatDateISO(d);
  }

  _goToday() {
    this.selectedDate = formatDateISO(new Date());
  }

  render() {
    const blocks = appState.schedule ? appState.schedule.blocks || [] : [];
    const tagWindowsComputed = appState.schedule ? appState.schedule.tag_windows_computed || [] : [];
    const tasks = appState.tasks || [];
    const tags = appState.tags || [];
    const settings = appState.settings || {};

    const formattedHeader = new Date(this.selectedDate).toLocaleDateString('en-US', {
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
              ></crono-calendar-day-view>
            `
          : this.mode === 'week'
          ? html`
              <crono-calendar-week-view
                .selectedDate=${this.selectedDate}
                .blocks=${blocks}
                .tasks=${tasks}
              ></crono-calendar-week-view>
            `
          : html`
              <crono-calendar-month-view
                .selectedDate=${this.selectedDate}
                .blocks=${blocks}
                .tasks=${tasks}
                @crono-date-select=${(e) => {
                  this.selectedDate = e.detail.date;
                  this.mode = 'day';
                }}
              ></crono-calendar-month-view>
            `}
      </div>
    `;
  }
}

customElements.define('crono-calendar-view', CronoCalendarView);
