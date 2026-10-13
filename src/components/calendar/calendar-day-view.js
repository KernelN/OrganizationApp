import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { getDayName, formatDateISO } from '../../utils/date-utils.js';
import { hexToRgba } from '../../utils/color-utils.js';
import { mergeContiguousBlocks } from '../../utils/block-utils.js';
import { getTagDepth } from '../../utils/validators.js';
import './calendar-event-block.js';

/**
 * <crono-calendar-day-view> — Hourly grid day view with scheduled event blocks and tag windows.
 */
export class CronoCalendarDayView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        height: 100%;
        overflow-y: auto;
      }
      .grid-container {
        display: flex;
        position: relative;
        min-height: 1440px; /* 24h * 60px/hr */
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border);
      }
      .time-column {
        width: 60px;
        flex-shrink: 0;
        border-right: 1px solid var(--border);
        display: flex;
        flex-direction: column;
      }
      .time-slot-label {
        height: 60px;
        font-family: var(--font-mono);
        font-size: 11px;
        color: var(--text-muted);
        text-align: right;
        padding-right: var(--space-xs);
        box-sizing: border-box;
      }
      .slots-column {
        flex: 1;
        position: relative;
      }
      .hour-line {
        height: 60px;
        border-bottom: 1px solid var(--border);
        box-sizing: border-box;
      }
      .break-strip {
        position: absolute;
        left: 0;
        right: 0;
        background: repeating-linear-gradient(
          -45deg,
          rgba(239, 68, 68, 0.12),
          rgba(239, 68, 68, 0.12) 10px,
          rgba(239, 68, 68, 0.04) 10px,
          rgba(239, 68, 68, 0.04) 20px
        );
        pointer-events: none;
        z-index: 1;
        border-top: 1px dashed rgba(239, 68, 68, 0.5);
        border-bottom: 1px dashed rgba(239, 68, 68, 0.5);
        box-sizing: border-box;
        padding: 4px var(--space-sm);
        display: flex;
        justify-content: flex-start;
        align-items: center;
        font-size: 11px;
        font-weight: 600;
        color: var(--alert-red);
      }
      .tag-window-strip {
        position: absolute;
        left: 0;
        right: 0;
        z-index: 1;
        pointer-events: auto;
        cursor: pointer;
        box-sizing: border-box;
        padding: 4px var(--space-sm);
        display: flex;
        justify-content: flex-end;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.02em;
        transition: opacity var(--transition-fast);
      }
      .tag-window-strip:hover {
        opacity: 0.9;
      }
      .block-wrapper {
        position: absolute;
        box-sizing: border-box;
      }
      .current-time-line {
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--alert-red);
        z-index: 5;
        pointer-events: none;
        display: flex;
        align-items: center;
      }
      .current-time-dot {
        width: 10px;
        height: 10px;
        background: var(--alert-red);
        border-radius: 50%;
        margin-left: -5px;
        box-shadow: 0 0 8px var(--alert-red);
        flex-shrink: 0;
      }
      .current-time-label {
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 700;
        background: var(--alert-red);
        color: #ffffff;
        padding: 1px 5px;
        border-radius: 3px;
        margin-left: 4px;
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
    requestAnimationFrame(() => {
      this._scrollToTargetTime(false);
    });
  }

  updated(changedProperties) {
    if (changedProperties.has('selectedDate')) {
      requestAnimationFrame(() => {
        this._scrollToTargetTime(true);
      });
    }
  }

  _scrollToTargetTime(smooth = false) {
    const doScroll = () => {
      const todayStr = formatDateISO(new Date());
      let targetMins = 9 * 60; // 09:00 default (540px)

      if (this.selectedDate === todayStr) {
        const now = new Date();
        targetMins = now.getHours() * 60 + now.getMinutes();
      } else {
        const dayName = getDayName(this.selectedDate);
        const dayWorkWindows = (this.settings?.work_windows && this.settings.work_windows[dayName]) || [];
        if (dayWorkWindows.length > 0 && dayWorkWindows[0].start) {
          const [h, m] = dayWorkWindows[0].start.split(':').map(Number);
          if (!isNaN(h)) {
            targetMins = h * 60 + (m || 0);
          }
        }
      }

      const containerHeight = this.clientHeight || 600;
      const targetScrollTop = Math.max(0, targetMins - Math.floor(containerHeight / 2));

      this.scrollTo({
        top: targetScrollTop,
        behavior: smooth ? 'smooth' : 'auto'
      });
    };

    requestAnimationFrame(() => {
      doScroll();
      setTimeout(doScroll, 60);
    });
  }

  _layoutBlocks(dayBlocks) {
    if (!dayBlocks || dayBlocks.length === 0) return [];

    const items = dayBlocks.map((block, index) => {
      const s = new Date(block.start);
      const e = new Date(block.end);
      const startMins = s.getHours() * 60 + s.getMinutes();
      const endMins = e.getHours() * 60 + e.getMinutes();
      const visualEndMins = Math.max(startMins + 20, endMins);
      return {
        block,
        index,
        startMins,
        endMins,
        visualEndMins,
        colIndex: 0,
        totalCols: 1
      };
    });

    items.sort((a, b) => {
      if (a.startMins !== b.startMins) return a.startMins - b.startMins;
      return b.visualEndMins - a.visualEndMins;
    });

    const clusters = [];
    let currentCluster = [];
    let clusterMaxEnd = -1;

    for (const item of items) {
      if (currentCluster.length === 0) {
        currentCluster.push(item);
        clusterMaxEnd = item.visualEndMins;
      } else {
        if (item.startMins < clusterMaxEnd) {
          currentCluster.push(item);
          clusterMaxEnd = Math.max(clusterMaxEnd, item.visualEndMins);
        } else {
          clusters.push(currentCluster);
          currentCluster = [item];
          clusterMaxEnd = item.visualEndMins;
        }
      }
    }
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    for (const cluster of clusters) {
      const columnEndTimes = [];

      for (const item of cluster) {
        let placed = false;
        for (let col = 0; col < columnEndTimes.length; col++) {
          if (columnEndTimes[col] <= item.startMins) {
            item.colIndex = col;
            columnEndTimes[col] = item.visualEndMins;
            placed = true;
            break;
          }
        }
        if (!placed) {
          item.colIndex = columnEndTimes.length;
          columnEndTimes.push(item.visualEndMins);
        }
      }

      const totalCols = columnEndTimes.length;
      for (const item of cluster) {
        item.totalCols = totalCols;
      }
    }

    return items;
  }

  _onTagClick(tag) {
    this.dispatchEvent(new CustomEvent('crono-tag-click', {
      detail: { tag },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayName = getDayName(this.selectedDate);
    const breakWindows = (this.settings.break_windows && this.settings.break_windows[dayName]) || [];

    // Filter blocks for selected date and merge contiguous task slots into single task blocks
    const rawDayBlocks = this.blocks.filter(b => {
      if (!b.start) return false;
      const bDateStr = formatDateISO(new Date(b.start));
      return bDateStr === this.selectedDate || b.start.startsWith(this.selectedDate);
    });
    const dayBlocks = mergeContiguousBlocks(rawDayBlocks);
    const layoutItems = this._layoutBlocks(dayBlocks);

    // Filter tag windows for selected date
    const dayTagWindows = this.tagWindowsComputed.filter(tw => tw.date === this.selectedDate);

    // Current time indicator calculation
    const todayStr = formatDateISO(this.nowDate);
    const isToday = this.selectedDate === todayStr;
    const nowMins = this.nowDate.getHours() * 60 + this.nowDate.getMinutes();
    const nowHHMM = `${String(this.nowDate.getHours()).padStart(2, '0')}:${String(this.nowDate.getMinutes()).padStart(2, '0')}`;

    return html`
      <div class="grid-container">
        <div class="time-column">
          ${hours.map(h => html`
            <div class="time-slot-label">${String(h).padStart(2, '0')}:00</div>
          `)}
        </div>
        <div class="slots-column">
          ${hours.map(h => html`<div class="hour-line"></div>`)}

          <!-- Current Time Indicator Line -->
          ${isToday
            ? html`
                <div
                  class="current-time-line"
                  style="top: ${nowMins}px;"
                  title="Current Time: ${nowHHMM}"
                >
                  <span class="current-time-dot"></span>
                  <span class="current-time-label">${nowHHMM}</span>
                </div>
              `
            : ''}

          <!-- Render Break Windows -->
          ${breakWindows.map(bw => {
            const [sH, sM] = bw.start.split(':').map(Number);
            const [eH, eM] = bw.end.split(':').map(Number);
            const topPx = (sH * 60 + sM);
            const heightPx = Math.max(16, ((eH * 60 + eM) - (sH * 60 + sM)));
            return html`
              <div
                class="break-strip"
                style="top: ${topPx}px; height: ${heightPx}px;"
                title="Break Window: ${bw.start} - ${bw.end}"
              >
                ☕ Break (${bw.start} - ${bw.end})
              </div>
            `;
          })}

          <!-- Render Tag Time Windows (Layered, Inset & Vertically Offset by Depth) -->
          ${(() => {
            const sortedDayTagWindows = [...dayTagWindows].sort((a, b) => {
              const depthA = getTagDepth(a.tag_id, this.tags);
              const depthB = getTagDepth(b.tag_id, this.tags);
              return depthA - depthB;
            });

            return sortedDayTagWindows.map(tw => {
              const tag = this.tags.find(t => t.id === tw.tag_id) || { id: tw.tag_id, name: 'Tag', color: '#3B82F6' };
              const depth = getTagDepth(tag.id, this.tags);
              const isSubtag = depth > 1;
              const insetLeft = (depth - 1) * 16;
              const paddingTop = (depth - 1) * 20 + 4;
              const bgRgba = hexToRgba(tag.color, isSubtag ? 0.22 : 0.12);

              return (tw.windows || []).map(w => {
                const [sH, sM] = w.start.split(':').map(Number);
                const [eH, eM] = w.end.split(':').map(Number);
                const topPx = (sH * 60 + sM);
                const heightPx = Math.max(16, ((eH * 60 + eM) - (sH * 60 + sM)));
                return html`
                  <div
                    class="tag-window-strip"
                    style="top: ${topPx}px; height: ${heightPx}px; left: ${insetLeft}px; right: 0; z-index: ${depth}; padding-top: ${paddingTop}px; background-color: ${bgRgba}; border-left: 3px ${isSubtag ? 'solid' : 'dashed'} ${tag.color}; color: ${tag.color};"
                    @click=${() => this._onTagClick(tag)}
                  >
                    🏷️ ${isSubtag ? '↳ ' : ''}${tag.name} (${w.start} - ${w.end})
                  </div>
                `;
              });
            });
          })()}

          <!-- Render Scheduled Event Blocks -->
          ${layoutItems.map(item => {
            const block = item.block;
            const topPx = item.startMins;
            const heightPx = Math.max(24, item.endMins - item.startMins);
            const colWidthPct = 100 / item.totalCols;
            const colLeftPct = item.colIndex * colWidthPct;
            const leftStyle = `calc(${colLeftPct}% + 4px)`;
            const widthStyle = `calc(${colWidthPct}% - 8px)`;
            const zIndex = 10 + item.colIndex;
            const task = this.tasks.find(t => t.id === block.task_id) || { title: 'Task', color: '#6366F1' };

            return html`
              <div
                class="block-wrapper"
                style="top: ${topPx}px; height: ${heightPx}px; left: ${leftStyle}; width: ${widthStyle}; z-index: ${zIndex};"
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
    `;
  }
}

customElements.define('crono-calendar-day-view', CronoCalendarDayView);
