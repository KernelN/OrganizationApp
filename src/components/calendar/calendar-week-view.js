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
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        min-width: 0;
        height: 100%;
        overflow: hidden;
        box-sizing: border-box;
      }
      .week-scroller {
        flex: 1;
        min-height: 0;
        min-width: 0;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        scrollbar-color: var(--border-hover) var(--bg-tertiary);
        box-sizing: border-box;
      }
      .week-scroller::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      .week-scroller::-webkit-scrollbar-track {
        background: var(--bg-tertiary);
        border-radius: 4px;
      }
      .week-scroller::-webkit-scrollbar-thumb {
        background: var(--border-hover);
        border-radius: 4px;
        border: 2px solid var(--bg-tertiary);
      }
      .week-scroller::-webkit-scrollbar-thumb:hover {
        background: var(--accent);
      }
      .week-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(190px, max-content));
        min-width: max-content;
        width: 100%;
        gap: 1px;
        background: var(--border);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        box-sizing: border-box;
      }
      .day-header {
        background: var(--bg-tertiary);
        padding: var(--space-sm);
        text-align: center;
        font-weight: 600;
        font-size: 13px;
        border-bottom: 1px solid var(--border);
        position: sticky;
        top: 0;
        z-index: 5;
        user-select: none;
        min-width: 190px;
        max-width: 300px;
        box-sizing: border-box;
      }
      .day-header:first-child {
        border-top-left-radius: var(--radius-lg);
      }
      .day-header:nth-child(7) {
        border-top-right-radius: var(--radius-lg);
      }
      .day-column:nth-last-child(7) {
        border-bottom-left-radius: var(--radius-lg);
      }
      .day-column:last-child {
        border-bottom-right-radius: var(--radius-lg);
      }
      .day-header.is-today {
        background: var(--accent-muted);
        color: var(--accent);
        border-bottom: 2px solid var(--accent);
      }
      .today-badge {
        display: inline-block;
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        background: var(--accent);
        color: #ffffff;
        padding: 1px 4px;
        border-radius: 4px;
        margin-top: 2px;
      }
      .day-column {
        background: var(--bg-secondary);
        min-height: 500px;
        padding: var(--space-xs);
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        position: relative;
        min-width: 190px;
        max-width: 300px;
        box-sizing: border-box;
      }
      .day-column.is-today {
        background: hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.04);
        box-shadow: inset 0 0 0 1px var(--accent-glow);
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
        cursor: pointer;
        transition: background-color var(--transition-fast), border-color var(--transition-fast);
      }
      .tag-window-box:hover {
        border-style: solid;
      }
      .tag-window-header {
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 2px 4px;
        border-radius: var(--radius-sm);
        gap: 6px;
        white-space: nowrap;
        min-width: 0;
      }
      .tag-window-header span:first-child {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        min-width: 0;
      }
      .tag-window-header span:last-child {
        flex-shrink: 0;
        font-family: var(--font-mono);
        font-size: 10px;
        white-space: nowrap;
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
      .today-current-time-banner {
        background: var(--alert-red);
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-xs);
      }
    `
  ];

  static properties = {
    selectedDate: { type: String },
    blocks: { type: Array },
    tasks: { type: Array },
    tags: { type: Array },
    tagWindowsComputed: { type: Array },
    settings: { type: Object },
    nowDate: { type: Object }
  };

  constructor() {
    super();
    this.selectedDate = formatDateISO(new Date());
    this.blocks = [];
    this.tasks = [];
    this.tags = [];
    this.tagWindowsComputed = [];
    this.settings = {};
    this.nowDate = new Date();
    this._timer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._timer = setInterval(() => {
      this.nowDate = new Date();
    }, 60000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._timer) clearInterval(this._timer);
  }

  firstUpdated() {
    this._scrollToSelectedDay(false);
  }

  updated(changedProperties) {
    if (changedProperties.has('selectedDate')) {
      this._scrollToSelectedDay(true);
    }
  }

  _scrollToSelectedDay(smooth = true) {
    requestAnimationFrame(() => {
      const scroller = this.renderRoot?.querySelector('.week-scroller');
      if (!scroller) return;

      const todayStr = formatDateISO(this.nowDate);
      const isViewingTodayWeek = this.getWeekDays().some(wd => wd.dateStr === todayStr);

      let target = null;
      if (isViewingTodayWeek) {
        target = this.renderRoot.querySelector(`.day-header[data-date="${todayStr}"]`) ||
                 this.renderRoot.querySelector('.day-header.is-today');
      } else if (this.selectedDate) {
        target = this.renderRoot.querySelector(`.day-header[data-date="${this.selectedDate}"]`);
      }

      if (target && scroller.scrollWidth > scroller.clientWidth) {
        const targetRect = target.getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        const currentOffset = targetRect.left - scrollerRect.left + scroller.scrollLeft;
        const scrollPos = currentOffset - (scrollerRect.width / 2) + (targetRect.width / 2);
        scroller.scrollTo({
          left: Math.max(0, scrollPos),
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    });
  }

  _onHeaderWheel(e) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const scroller = this.renderRoot?.querySelector('.week-scroller');
      if (scroller && scroller.scrollWidth > scroller.clientWidth) {
        e.preventDefault();
        scroller.scrollLeft += e.deltaY;
      }
    }
  }

  _onTagClick(tag) {
    this.dispatchEvent(new CustomEvent('crono-tag-click', {
      detail: { tag },
      bubbles: true,
      composed: true
    }));
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
    const todayStr = formatDateISO(this.nowDate);
    const nowHHMM = `${String(this.nowDate.getHours()).padStart(2, '0')}:${String(this.nowDate.getMinutes()).padStart(2, '0')}`;

    return html`
      <div class="week-scroller">
        <div class="week-grid">
          ${weekDays.map(
            (wd) => {
              const isToday = wd.dateStr === todayStr;
              return html`
                <div
                  class="day-header ${isToday ? 'is-today' : ''}"
                  data-date="${wd.dateStr}"
                  @wheel=${this._onHeaderWheel}
                >
                  <div>${wd.label}</div>
                  <div class="day-number">${wd.dayNum}</div>
                  ${isToday ? html`<div class="today-badge">Today</div>` : ''}
                </div>
              `;
            }
          )}
        ${weekDays.map((wd) => {
          const isToday = wd.dateStr === todayStr;
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
            <div class="day-column ${isToday ? 'is-today' : ''}">
              <!-- Live Current Time Banner for Today -->
              ${isToday
                ? html`
                    <div class="today-current-time-banner" title="Current Time">
                      <span>⏰ Live Time</span>
                      <span>${nowHHMM}</span>
                    </div>
                  `
                : ''}

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
              ${(() => {
                const sortedDayTagWindows = [...dayTagWindows].sort((a, b) => {
                  const depthA = a.tag_id ? (this.tags.find(t => t.id === a.tag_id)?.parent_tag_id ? 2 : 1) : 1;
                  const depthB = b.tag_id ? (this.tags.find(t => t.id === b.tag_id)?.parent_tag_id ? 2 : 1) : 1;
                  // Render subtags first so their specific blocks are claimed before parent
                  return depthB - depthA;
                });

                return sortedDayTagWindows.map(tw => {
                  const tag = this.tags.find(t => t.id === tw.tag_id) || { id: tw.tag_id, name: 'Tag', color: '#3B82F6' };
                  const isSubtag = Boolean(tag.parent_tag_id);
                  const bgRgba = hexToRgba(tag.color, isSubtag ? 0.14 : 0.08);

                  // Find blocks associated specifically with this tag
                  const tagBlocks = dayBlocks.filter(b => {
                    if (renderedBlockIds.has(b.id)) return false;
                    if (b.tag_id === tag.id) return true;
                    const task = this.tasks.find(t => t.id === b.task_id);
                    return task && Array.isArray(task.tag_ids) && task.tag_ids.includes(tag.id);
                  });

                  tagBlocks.forEach(b => renderedBlockIds.add(b.id));

                  return (tw.windows || []).map(w => html`
                    <div
                      class="tag-window-box"
                      style="background: ${bgRgba}; border-color: ${tag.color}; ${isSubtag ? 'margin-left: 8px;' : ''}"
                      @click=${() => this._onTagClick(tag)}
                    >
                      <div class="tag-window-header" style="color: ${tag.color};">
                        <span>🏷️ ${isSubtag ? '↳ ' : ''}${tag.name}</span>
                        <span>${w.start} - ${w.end}</span>
                      </div>
                      <div class="tag-window-body">
                        ${tagBlocks.map(block => {
                          const task = this.tasks.find(t => t.id === block.task_id) || { title: 'Task', color: tag.color };
                          return html`
                            <div
                              class="block-item"
                              @click=${(e) => e.stopPropagation()}
                            >
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
                });
              })()}

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
      </div>
    `;
  }
}

customElements.define('crono-calendar-week-view', CronoCalendarWeekView);
