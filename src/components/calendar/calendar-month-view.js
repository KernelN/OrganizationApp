import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { formatDateISO } from '../../utils/date-utils.js';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * <crono-calendar-month-view> — Month view with colored task dots.
 */
export class CronoCalendarMonthView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        height: 100%;
        overflow-y: auto;
      }
      .month-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: var(--border);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }
      .header-cell {
        background: var(--bg-tertiary);
        padding: var(--space-sm);
        text-align: center;
        font-weight: 600;
        font-size: 12px;
      }
      .day-cell {
        background: var(--bg-secondary);
        min-height: 90px;
        padding: var(--space-xs);
        display: flex;
        flex-direction: column;
        gap: 4px;
        cursor: pointer;
      }
      .day-cell:hover {
        background: var(--bg-tertiary);
      }
      .day-cell.other-month {
        opacity: 0.4;
      }
      .day-num {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-secondary);
      }
      .dots {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
    `
  ];

  static properties = {
    selectedDate: { type: String },
    blocks: { type: Array },
    tasks: { type: Array }
  };

  constructor() {
    super();
    this.selectedDate = formatDateISO(new Date());
    this.blocks = [];
    this.tasks = [];
  }

  getMonthDays() {
    const curr = new Date(this.selectedDate);
    const year = curr.getFullYear();
    const month = curr.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const jsDay = firstDayOfMonth.getDay();
    const startOffset = (jsDay + 6) % 7; // Mon = 0 ... Sun = 6

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startOffset);

    const days = [];
    for (let i = 0; i < 35; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      days.push({
        dateStr: formatDateISO(d),
        dayNum: d.getDate(),
        isCurrentMonth: d.getMonth() === month
      });
    }
    return days;
  }

  render() {
    const monthDays = this.getMonthDays();

    return html`
      <div class="month-grid">
        ${DAY_LABELS.map(l => html`<div class="header-cell">${l}</div>`)}
        ${monthDays.map(d => {
          const dayBlocks = this.blocks.filter(b => b.start && b.start.startsWith(d.dateStr));
          return html`
            <div
              class="day-cell ${d.isCurrentMonth ? '' : 'other-month'}"
              @click=${() => this.dispatchEvent(new CustomEvent('crono-date-select', { detail: { date: d.dateStr }, bubbles: true, composed: true }))}
            >
              <span class="day-num">${d.dayNum}</span>
              <div class="dots">
                ${dayBlocks.slice(0, 5).map(b => {
                  const t = this.tasks.find(tk => tk.id === b.task_id);
                  const color = t ? t.color : '#6366F1';
                  return html`<div class="dot" style="background-color: ${color}"></div>`;
                })}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('crono-calendar-month-view', CronoCalendarMonthView);
