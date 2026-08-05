import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';
import { scheduleState } from '../../state/schedule-state.js';
import { DAYS_OF_WEEK, formatLocalDate } from '../../utils/date-utils.js';
import './calendar-event-block.js';

export class CalendarWeekView extends LitElement {
  static properties = {
    selectedDate: { type: Object }
  };

  static styles = css`
    :host {
      display: block;
    }

    .week-container {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      background: var(--color-bg-base, #121318);
    }

    .day-column {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 12px 8px;
      min-height: 500px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .column-header {
      font-weight: 700;
      font-size: 0.875rem;
      text-align: center;
      text-transform: capitalize;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border, #2E3242);
      color: var(--color-text-secondary, #9CA3AF);
    }

    .column-header.today {
      color: var(--color-accent, #6366F1);
    }

    .blocks-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;

  constructor() {
    super();
    this.selectedDate = new Date();
  }

  getWeekDays() {
    const curr = new Date(this.selectedDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday start
    const monday = new Date(curr.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const next = new Date(monday);
      next.setDate(monday.getDate() + i);
      days.push(next);
    }
    return days;
  }

  render() {
    const weekDays = this.getWeekDays();
    const allBlocks = scheduleState.blocks || [];
    const todayStr = formatLocalDate(new Date());

    return html`
      <div class="week-container">
        ${weekDays.map((date, idx) => {
          const dateStr = formatLocalDate(date);
          const isToday = dateStr === todayStr;
          const dayName = DAYS_OF_WEEK[idx];

          const dayBlocks = allBlocks.filter(
            b => formatLocalDate(b.start) === dateStr
          );

          return html`
            <div class="day-column">
              <div class="column-header ${isToday ? 'today' : ''}">
                <div>${dayName.substring(0, 3)}</div>
                <div style="font-size: 0.75rem; margin-top: 2px;">${date.getDate()}</div>
              </div>

              <div class="blocks-list">
                ${dayBlocks.map(block => {
                  const task = appState.tasks.find(t => t.id === block.task_id);
                  return html`
                    <div style="height: 64px;">
                      <calendar-event-block .block="${block}" .task="${task}"></calendar-event-block>
                    </div>
                  `;
                })}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('calendar-week-view', CalendarWeekView);
