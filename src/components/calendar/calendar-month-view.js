import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';
import { scheduleState } from '../../state/schedule-state.js';
import { formatLocalDate } from '../../utils/date-utils.js';

export class CalendarMonthView extends LitElement {
  static properties = {
    selectedDate: { type: Object }
  };

  static styles = css`
    :host {
      display: block;
    }

    .month-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
    }

    .header-cell {
      padding: 8px;
      font-weight: 700;
      font-size: 0.8125rem;
      text-align: center;
      color: var(--color-text-secondary, #9CA3AF);
      text-transform: uppercase;
    }

    .day-cell {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-md, 8px);
      min-height: 90px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .day-cell.other-month {
      opacity: 0.3;
    }

    .day-cell.today {
      border-color: var(--color-accent, #6366F1);
    }

    .date-num {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-text-primary, #F3F4F6);
    }

    .chip-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
      overflow: hidden;
    }

    .month-chip {
      background: var(--color-accent-subtle, rgba(99, 102, 241, 0.2));
      color: var(--color-accent, #6366F1);
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;

  constructor() {
    super();
    this.selectedDate = new Date();
  }

  getMonthDays() {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Mon=0...Sun=6

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const cells = [];
    for (let i = 0; i < 35; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);
      cells.push(cellDate);
    }
    return cells;
  }

  render() {
    const cells = this.getMonthDays();
    const headers = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentMonth = this.selectedDate.getMonth();
    const todayStr = formatLocalDate(new Date());
    const allBlocks = scheduleState.blocks || [];

    return html`
      <div class="month-grid">
        ${headers.map(h => html`<div class="header-cell">${h}</div>`)}
        ${cells.map(cellDate => {
          const dateStr = formatLocalDate(cellDate);
          const isOtherMonth = cellDate.getMonth() !== currentMonth;
          const isToday = dateStr === todayStr;

          const dayBlocks = allBlocks.filter(
            b => formatLocalDate(b.start) === dateStr
          );

          return html`
            <div class="day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}">
              <div class="date-num">${cellDate.getDate()}</div>
              <div class="chip-list">
                ${dayBlocks.slice(0, 3).map(b => {
                  const task = appState.tasks.find(t => t.id === b.task_id);
                  return html`
                    <div class="month-chip">
                      ${task?.title || 'Task'}
                    </div>
                  `;
                })}
                ${dayBlocks.length > 3
                  ? html`<div style="font-size: 0.65rem; color: var(--color-text-muted);">
                      +${dayBlocks.length - 3} more
                    </div>`
                  : ''}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('calendar-month-view', CalendarMonthView);
