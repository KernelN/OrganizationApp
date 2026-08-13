import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { formatDateISO, parseISOToLocalDate } from '../../utils/date-utils.js';
import { hexToRgba } from '../../utils/color-utils.js';
import { mergeContiguousBlocks } from '../../utils/block-utils.js';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * <crono-calendar-month-view> — Month view with nested tag window containers and merged task blocks.
 */
export class CronoCalendarMonthView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        height: 100%;
        overflow-y: auto;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .month-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: var(--border);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        overflow: hidden;
        min-width: 100%;
      }
      @media (max-width: 768px) {
        .month-grid {
          grid-template-columns: repeat(7, minmax(85px, 1fr));
          min-width: calc(7 * 85px);
        }
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
        min-height: 100px;
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
      .day-cell.is-today {
        background: hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.06);
        box-shadow: inset 0 0 0 2px var(--accent);
      }
      .day-num-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .day-num {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
      }
      .today-chip {
        font-size: 9px;
        font-weight: 700;
        background: var(--accent);
        color: #ffffff;
        padding: 1px 4px;
        border-radius: 3px;
        text-transform: uppercase;
      }
      .month-tag-box {
        border-radius: var(--radius-sm);
        border: 1px dashed var(--border);
        padding: 3px 4px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        box-sizing: border-box;
      }
      .month-tag-title {
        font-size: 10px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .month-nested-task {
        font-size: 10px;
        font-weight: 500;
        padding: 1px 4px;
        border-radius: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .task-color-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .month-untagged-box {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-top: 2px;
      }
    `
  ];

  static properties = {
    selectedDate: { type: String },
    blocks: { type: Array },
    tasks: { type: Array },
    tags: { type: Array },
    tagWindowsComputed: { type: Array }
  };

  constructor() {
    super();
    this.selectedDate = formatDateISO(new Date());
    this.blocks = [];
    this.tasks = [];
    this.tags = [];
    this.tagWindowsComputed = [];
  }

  firstUpdated() {
    this._scrollToCurrentDay(false);
  }

  updated(changedProperties) {
    if (changedProperties.has('selectedDate')) {
      this._scrollToCurrentDay(true);
    }
  }

  _scrollToCurrentDay(smooth = true) {
    requestAnimationFrame(() => {
      const todayStr = formatDateISO(new Date());
      const isCurrentMonthViewing = this.selectedDate.substring(0, 7) === todayStr.substring(0, 7);

      const targetCell = isCurrentMonthViewing
        ? (this.renderRoot.querySelector('.day-cell.is-today') || this.renderRoot.querySelector(`.day-cell[data-date="${this.selectedDate}"]`))
        : this.renderRoot.querySelector(`.day-cell[data-date="${this.selectedDate}"]`);

      if (targetCell && this.scrollWidth > this.clientWidth) {
        const targetLeft = targetCell.offsetLeft;
        const targetWidth = targetCell.offsetWidth;
        const containerWidth = this.clientWidth;
        const scrollPos = targetLeft - (containerWidth / 2) + (targetWidth / 2);
        this.scrollTo({
          left: Math.max(0, scrollPos),
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    });
  }

  getMonthDays() {
    const curr = parseISOToLocalDate(this.selectedDate);
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
    const todayStr = formatDateISO(new Date());

    return html`
      <div class="month-grid">
        ${DAY_LABELS.map(l => html`<div class="header-cell">${l}</div>`)}
        ${monthDays.map(d => {
          const isToday = d.dateStr === todayStr;
          const rawDayBlocks = this.blocks.filter(b => {
            if (!b.start) return false;
            const bDateStr = formatDateISO(new Date(b.start));
            return bDateStr === d.dateStr || b.start.startsWith(d.dateStr);
          });
          const dayBlocks = mergeContiguousBlocks(rawDayBlocks);
          const dayTagWindows = (this.tagWindowsComputed || []).filter(tw => tw.date === d.dateStr);

          const renderedBlockIds = new Set();

          return html`
            <div
              class="day-cell ${d.isCurrentMonth ? '' : 'other-month'} ${isToday ? 'is-today' : ''}"
              data-date="${d.dateStr}"
              @click=${() => this.dispatchEvent(new CustomEvent('crono-date-select', { detail: { date: d.dateStr }, bubbles: true, composed: true }))}
            >
              <div class="day-num-header">
                <span class="day-num">${d.dayNum}</span>
                ${isToday ? html`<span class="today-chip">Today</span>` : ''}
              </div>

              <!-- Render Tag Windows with Nested Tasks -->
              ${dayTagWindows.map(tw => {
                const tag = this.tags.find(t => t.id === tw.tag_id) || { id: tw.tag_id, name: 'Tag', color: '#3B82F6' };
                const bgRgba = hexToRgba(tag.color, 0.15);

                const tagBlocks = dayBlocks.filter(b => {
                  if (b.tag_id === tag.id) return true;
                  const task = this.tasks.find(t => t.id === b.task_id);
                  return task && Array.isArray(task.tag_ids) && task.tag_ids.includes(tag.id);
                });

                tagBlocks.forEach(b => renderedBlockIds.add(b.id));

                return html`
                  <div
                    class="month-tag-box"
                    style="background: ${bgRgba}; border-color: ${tag.color};"
                  >
                    <div class="month-tag-title" style="color: ${tag.color};">
                      🏷️ ${tag.name}
                    </div>
                    ${tagBlocks.map(b => {
                      const task = this.tasks.find(t => t.id === b.task_id) || { title: 'Task', color: tag.color };
                      const color = task.color || tag.color;
                      return html`
                        <div class="month-nested-task" style="background: rgba(255, 255, 255, 0.05);">
                          <span class="task-color-dot" style="background-color: ${color}"></span>
                          <span>${task.title}</span>
                        </div>
                      `;
                    })}
                  </div>
                `;
              })}

              <!-- Render Untagged Tasks -->
              ${(() => {
                const untaggedBlocks = dayBlocks.filter(b => !renderedBlockIds.has(b.id));
                if (untaggedBlocks.length === 0) return '';
                return html`
                  <div class="month-untagged-box">
                    ${untaggedBlocks.map(b => {
                      const task = this.tasks.find(t => t.id === b.task_id) || { title: 'Task', color: '#6366F1' };
                      const color = task.color || '#6366F1';
                      const taskBg = hexToRgba(color, 0.15);
                      return html`
                        <div class="month-nested-task" style="background: ${taskBg}; color: var(--text-primary);">
                          <span class="task-color-dot" style="background-color: ${color}"></span>
                          <span>${task.title}</span>
                        </div>
                      `;
                    })}
                  </div>
                `;
              })()}
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('crono-calendar-month-view', CronoCalendarMonthView);
