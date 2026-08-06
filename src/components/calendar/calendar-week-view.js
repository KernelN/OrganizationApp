import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { getDayOfWeekIndex, getDayName, addDays, formatDateISO, parseISOToLocalDate } from '../../utils/date-utils.js';
import { hexToRgba } from '../../utils/color-utils.js';
import './calendar-event-block.js';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * <crono-calendar-week-view> — 7-column day grid week view with event blocks, tag windows, and breaks.
 */
export class CronoCalendarWeekView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        height: 100%;
        overflow-y: auto;
      }
      .week-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: var(--border);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }
      .day-header {
        background: var(--bg-tertiary);
        padding: var(--space-sm);
        text-align: center;
        font-weight: 600;
        font-size: 13px;
        border-bottom: 1px solid var(--border);
      }
      .day-column {
        background: var(--bg-secondary);
        min-height: 500px;
        padding: var(--space-xs);
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }
      .day-number {
        font-size: 12px;
        color: var(--text-muted);
        text-align: center;
        margin-bottom: var(--space-xs);
      }
      .day-tag-windows {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: var(--space-xs);
      }
      .tag-window-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 3px 6px;
        border-radius: var(--radius-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `
  ];

  static properties = {
    selectedDate: { type: String },
    blocks: { type: Array },
    tasks: { type: Array },
    tags: { type: Array },
    tagWindowsComputed: { type: Array },
    settings: { type: Object }
  };

  constructor() {
    super();
    this.selectedDate = formatDateISO(new Date());
    this.blocks = [];
    this.tasks = [];
    this.tags = [];
    this.tagWindowsComputed = [];
    this.settings = {};
  }

  getWeekDays() {
    const curr = parseISOToLocalDate(this.selectedDate);
    const dayIdx = getDayOfWeekIndex(curr);
    const monday = addDays(curr, -dayIdx);

    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(monday, i);
      return {
        label: DAY_LABELS[i],
        dateStr: formatDateISO(d),
        dayNum: d.getDate()
      };
    });
  }

  render() {
    const weekDays = this.getWeekDays();

    return html`
      <div class="week-grid">
        ${weekDays.map(
          (wd) => html`
            <div class="day-header">
              <div>${wd.label}</div>
              <div class="day-number">${wd.dayNum}</div>
            </div>
          `
        )}
        ${weekDays.map((wd) => {
          const dayBlocks = this.blocks.filter((b) => {
            if (!b.start) return false;
            const bDateStr = formatDateISO(new Date(b.start));
            return bDateStr === wd.dateStr || b.start.startsWith(wd.dateStr);
          }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

          const dayTagWindows = (this.tagWindowsComputed || []).filter(tw => tw.date === wd.dateStr);
          const dayName = getDayName(wd.dateStr);
          const breakWindows = (this.settings?.break_windows && this.settings.break_windows[dayName]) || [];

          return html`
            <div class="day-column">
              ${(dayTagWindows.length > 0 || breakWindows.length > 0)
                ? html`
                    <div class="day-tag-windows">
                      ${breakWindows.map(bw => html`
                        <div
                          class="tag-window-badge"
                          style="background: rgba(239, 68, 68, 0.15); border-left: 3px solid var(--alert-red); color: var(--alert-red);"
                          title="Break: ${bw.start} - ${bw.end}"
                        >
                          ☕ Break (${bw.start} - ${bw.end})
                        </div>
                      `)}
                      ${dayTagWindows.map(tw => {
                        const tag = this.tags.find(t => t.id === tw.tag_id) || { name: 'Tag', color: '#3B82F6' };
                        const bgRgba = hexToRgba(tag.color, 0.15);
                        return (tw.windows || []).map(w => html`
                          <div
                            class="tag-window-badge"
                            style="background: ${bgRgba}; border-left: 3px solid ${tag.color}; color: ${tag.color};"
                            title="${tag.name}: ${w.start} - ${w.end}"
                          >
                            🏷️ ${tag.name} (${w.start} - ${w.end})
                          </div>
                        `);
                      })}
                    </div>
                  `
                : ''}

              ${dayBlocks.map((block) => {
                const task = this.tasks.find((t) => t.id === block.task_id) || { title: 'Task', color: '#6366F1' };
                return html`
                  <div style="height: 48px;">
                    <crono-calendar-event-block
                      .block=${block}
                      .task=${task}
                    ></crono-calendar-event-block>
                  </div>
                `;
              })}
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('crono-calendar-week-view', CronoCalendarWeekView);
