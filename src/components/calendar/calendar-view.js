import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';
import { scheduleState } from '../../state/schedule-state.js';
import './calendar-day-view.js';
import './calendar-week-view.js';
import './calendar-month-view.js';

export class CalendarView extends LitElement {
  static properties = {
    viewMode: { type: String }, // 'day' | 'week' | 'month'
    selectedDate: { type: Object }
  };

  static styles = css`
    :host {
      display: block;
    }

    .calendar-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 20px;
    }

    .nav-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .date-heading {
      font-family: var(--font-family-display, sans-serif);
      font-size: 1.25rem;
      font-weight: 700;
      min-width: 220px;
      text-align: center;
    }

    .btn-nav {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border, #2E3242);
      color: var(--color-text-primary, #F3F4F6);
      padding: 6px 12px;
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      font-weight: 500;
      transition: background 150ms ease;
    }

    .btn-nav:hover {
      background: var(--color-bg-elevated, #262936);
    }

    .mode-tabs {
      display: flex;
      background: var(--color-bg-surface, #1A1C23);
      padding: 4px;
      border-radius: var(--radius-md, 8px);
      border: 1px solid var(--color-border, #2E3242);
    }

    .tab {
      padding: 6px 14px;
      border-radius: var(--radius-sm, 6px);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-secondary, #9CA3AF);
      cursor: pointer;
      border: none;
      background: transparent;
      transition: background 150ms ease, color 150ms ease;
    }

    .tab.active {
      background: var(--color-bg-elevated, #262936);
      color: var(--color-text-primary, #F3F4F6);
      font-weight: 600;
    }
  `;

  constructor() {
    super();
    this.viewMode = 'day';
    this.selectedDate = new Date();
  }

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeSchedule = scheduleState.subscribe(() => this.requestUpdate());
    this.unsubscribeApp = appState.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribeSchedule) this.unsubscribeSchedule();
    if (this.unsubscribeApp) this.unsubscribeApp();
  }

  navigate(direction) {
    const d = new Date(this.selectedDate);
    if (this.viewMode === 'day') {
      d.setDate(d.getDate() + direction);
    } else if (this.viewMode === 'week') {
      d.setDate(d.getDate() + direction * 7);
    } else if (this.viewMode === 'month') {
      d.setMonth(d.getMonth() + direction);
    }
    this.selectedDate = d;
  }

  goToday() {
    this.selectedDate = new Date();
  }

  getFormattedHeading() {
    if (this.viewMode === 'day') {
      return this.selectedDate.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    if (this.viewMode === 'month') {
      return this.selectedDate.toLocaleDateString([], { month: 'long', year: 'numeric' });
    }
    return `Week of ${this.selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  }

  render() {
    return html`
      <div class="calendar-toolbar">
        <div class="nav-controls">
          <button class="btn-nav" @click="${() => this.navigate(-1)}">‹ Prev</button>
          <button class="btn-nav" @click="${this.goToday}">Today</button>
          <button class="btn-nav" @click="${() => this.navigate(1)}">Next ›</button>
          <div class="date-heading">${this.getFormattedHeading()}</div>
        </div>

        <div class="mode-tabs">
          <button
            class="tab ${this.viewMode === 'day' ? 'active' : ''}"
            @click="${() => (this.viewMode = 'day')}"
          >
            Day
          </button>
          <button
            class="tab ${this.viewMode === 'week' ? 'active' : ''}"
            @click="${() => (this.viewMode = 'week')}"
          >
            Week
          </button>
          <button
            class="tab ${this.viewMode === 'month' ? 'active' : ''}"
            @click="${() => (this.viewMode = 'month')}"
          >
            Month
          </button>
        </div>
      </div>

      ${this.viewMode === 'day'
        ? html`<calendar-day-view .selectedDate="${this.selectedDate}"></calendar-day-view>`
        : ''}
      ${this.viewMode === 'week'
        ? html`<calendar-week-view .selectedDate="${this.selectedDate}"></calendar-week-view>`
        : ''}
      ${this.viewMode === 'month'
        ? html`<calendar-month-view .selectedDate="${this.selectedDate}"></calendar-month-view>`
        : ''}
    `;
  }
}

customElements.define('calendar-view', CalendarView);
