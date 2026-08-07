import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { getDayOfWeekIndex, getDayName, addDays, formatDateISO, parseISOToLocalDate } from '../../utils/date-utils.js';
import { hexToRgba } from '../../utils/color-utils.js';
import { mergeContiguousBlocks } from '../../utils/block-utils.js';
import './calendar-event-block.js';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * <crono-calendar-week-view> — 7-column day grid week view with tag window containers and nested task blocks.
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
      .break-window-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 4px 6px;
        border-radius: var(--radius-sm);
        margin-bottom: var(--space-xs);
      }
      .tag-window-box {
        border-radius: var(--radius-md);
        border: 1px dashed var(--border);
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: var(--space-xs);
      }
      .tag-window-header {
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 2px 4px;
        border-radius: var(--radius-sm);
      }
      .tag-window-body {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .untagged-section {
        border-radius: var(--radius-md);
        border: 1px solid var(--border);
        background: var(--bg-tertiary);
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .untagged-header {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        padding: 2px 4px;
      }
      .block-item {
        min-height: 44px;
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
          const rawDayBlocks = this.blocks.filter((b) => {
            if (!b.start) return false;
            const bDateStr = formatDateISO(new Date(b.start));
            return bDateStr === wd.dateStr || b.start.startsWith(wd.dateStr);
          });
          const dayBlocks = mergeContiguousBlocks(rawDayBlocks);

          const dayTagWindows = (this.tagWindowsComputed || []).filter(tw => tw.date === wd.dateStr);
          const dayName = getDayName(wd.dateStr);
          const breakWindows = (this.settings?.break_windows && this.settings.break_windows[dayName]) || [];

          // Track which block IDs have been rendered inside a tag window
          const renderedBlockIds = new Set();

          return html`
            <div class="day-column">
              <!-- Render Break Windows -->
              ${breakWindows.map(bw => html`
                <div
                  class="break-window-badge"
                  style="background: rgba(239, 68, 68, 0.12); border-left: 3px solid var(--alert-red); color: var(--alert-red);"
                  title="Break: ${bw.start} - ${bw.end}"
                >
                  ☕ Break (${bw.start} - ${bw.end})
                </div>
              `)}

              <!-- Render Tag Window Containers with Nested Tasks -->
              ${dayTagWindows.map(tw => {
                const tag = this.tags.find(t => t.id === tw.tag_id) || { id: tw.tag_id, name: 'Tag', color: '#3B82F6' };
                const bgRgba = hexToRgba(tag.color, 0.08);

                // Find blocks associated with this tag
                const tagBlocks = dayBlocks.filter(b => {
                  if (b.tag_id === tag.id) return true;
                  const task = this.tasks.find(t => t.id === b.task_id);
                  return task && Array.isArray(task.tag_ids) && task.tag_ids.includes(tag.id);
                });

                tagBlocks.forEach(b => renderedBlockIds.add(b.id));

                return (tw.windows || []).map(w => html`
                  <div
                    class="tag-window-box"
                    style="background: ${bgRgba}; border-color: ${tag.color};"
                  >
                    <div class="tag-window-header" style="color: ${tag.color};">
                      <span>🏷️ ${tag.name}</span>
                      <span>${w.start} - ${w.end}</span>
                    </div>
                    <div class="tag-window-body">
                      ${tagBlocks.map(block => {
                        const task = this.tasks.find(t => t.id === block.task_id) || { title: 'Task', color: tag.color };
                        return html`
                          <div class="block-item">
                            <crono-calendar-event-block
                              .block=${block}
                              .task=${task}
                            ></crono-calendar-event-block>
                          </div>
                        `;
                      })}
                    </div>
                  </div>
                `);
              })}

              <!-- Render Untagged Tasks Container -->
              ${(() => {
                const untaggedBlocks = dayBlocks.filter(b => !renderedBlockIds.has(b.id));
                if (untaggedBlocks.length === 0) return '';
                return html`
                  <div class="untagged-section">
                    <div class="untagged-header">📋 Other Tasks</div>
                    ${untaggedBlocks.map(block => {
                      const task = this.tasks.find(t => t.id === block.task_id) || { title: 'Task', color: '#6366F1' };
                      return html`
                        <div class="block-item">
                          <crono-calendar-event-block
                            .block=${block}
                            .task=${task}
                          ></crono-calendar-event-block>
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

customElements.define('crono-calendar-week-view', CronoCalendarWeekView);
