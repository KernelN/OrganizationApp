import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';
import { scheduleState } from '../../state/schedule-state.js';
import { getDayOfWeekString, formatLocalDate } from '../../utils/date-utils.js';
import './calendar-event-block.js';

export class CalendarDayView extends LitElement {
  static properties = {
    selectedDate: { type: Object }
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .timeline-container {
      display: flex;
      flex-direction: column;
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-lg, 12px);
      overflow-y: auto;
      height: 700px;
      position: relative;
    }

    .grid-row {
      display: flex;
      height: 60px;
      border-bottom: 1px solid var(--color-border-subtle, #242735);
      position: relative;
    }

    .time-label {
      width: 70px;
      padding: 8px 12px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-text-muted, #6B7280);
      border-right: 1px solid var(--color-border, #2E3242);
      background: var(--color-bg-base, #121318);
      user-select: none;
    }

    .slot-area {
      flex: 1;
      position: relative;
      background: transparent;
    }

    .slot-area.is-work {
      background: rgba(99, 102, 241, 0.03);
    }

    .slot-area.is-break {
      background: rgba(245, 158, 11, 0.06);
    }

    /* Red indicator line for current time */
    .now-indicator {
      position: absolute;
      left: 70px;
      right: 0;
      height: 2px;
      background: #EF4444;
      z-index: 10;
      pointer-events: none;
    }

    .now-indicator::before {
      content: '';
      position: absolute;
      left: -5px;
      top: -4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #EF4444;
    }

    .block-wrapper {
      position: absolute;
      left: 80px;
      right: 16px;
      z-index: 5;
    }
  `;

  constructor() {
    super();
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

  getBlocksForDay() {
    const targetDateStr = formatLocalDate(this.selectedDate);
    const allBlocks = scheduleState.blocks || [];
    return allBlocks.filter(b => {
      const blockDateStr = formatLocalDate(b.start);
      return blockDateStr === targetDateStr;
    });
  }

  calculateNowPosition() {
    const now = new Date();
    const targetDateStr = formatLocalDate(this.selectedDate);
    const nowDateStr = formatLocalDate(now);
    if (targetDateStr !== nowDateStr) return null;

    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours * 60 + minutes;
  }

  render() {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayStr = getDayOfWeekString(this.selectedDate);
    const settings = appState.settings || {};
    const workWindows = settings.work_windows?.[dayStr] || [];
    const breakWindows = settings.break_windows?.[dayStr] || [];

    const dayBlocks = this.getBlocksForDay();
    const nowPosMinutes = this.calculateNowPosition();

    return html`
      <div class="timeline-container">
        ${nowPosMinutes !== null
          ? html`<div class="now-indicator" style="top: ${nowPosMinutes}px;"></div>`
          : ''}

        ${hours.map(h => {
          const hhStr = `${String(h).padStart(2, '0')}:00`;

          const isWork = workWindows.some(w => hhStr >= w.start && hhStr < w.end);
          const isBreak = breakWindows.some(b => hhStr >= b.start && hhStr < b.end);

          return html`
            <div class="grid-row">
              <div class="time-label">${hhStr}</div>
              <div class="slot-area ${isBreak ? 'is-break' : isWork ? 'is-work' : ''}"></div>
            </div>
          `;
        })}

        ${dayBlocks.map(block => {
          const startDate = new Date(block.start);
          const endDate = new Date(block.end);

          const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
          const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
          const height = Math.max(30, endMinutes - startMinutes);

          const task = appState.tasks.find(t => t.id === block.task_id);

          return html`
            <div
              class="block-wrapper"
              style="top: ${startMinutes}px; height: ${height}px;"
            >
              <calendar-event-block .block="${block}" .task="${task}"></calendar-event-block>
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('calendar-day-view', CalendarDayView);
