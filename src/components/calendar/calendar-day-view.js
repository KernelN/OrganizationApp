import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { getDayName, formatDateISO } from '../../utils/date-utils.js';
import { hexToRgba } from '../../utils/color-utils.js';
import { mergeContiguousBlocks } from '../../utils/block-utils.js';
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
        left: var(--space-sm);
        right: var(--space-sm);
        z-index: 2;
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

          <!-- Render Tag Time Windows -->
          ${dayTagWindows.map(tw => {
            const tag = this.tags.find(t => t.id === tw.tag_id) || { id: tw.tag_id, name: 'Tag', color: '#3B82F6' };
            const bgRgba = hexToRgba(tag.color, 0.12);
            return (tw.windows || []).map(w => {
              const [sH, sM] = w.start.split(':').map(Number);
              const [eH, eM] = w.end.split(':').map(Number);
              const topPx = (sH * 60 + sM);
              const heightPx = Math.max(16, ((eH * 60 + eM) - (sH * 60 + sM)));
              return html`
                <div
                  class="tag-window-strip"
                  style="top: ${topPx}px; height: ${heightPx}px; background-color: ${bgRgba}; border-left: 3px dashed ${tag.color}; color: ${tag.color};"
                  @click=${() => this._onTagClick(tag)}
                >
                  🏷️ ${tag.name} (${w.start} - ${w.end})
                </div>
              `;
            });
          })}

          <!-- Render Scheduled Event Blocks -->
          ${dayBlocks.map(block => {
            const startDate = new Date(block.start);
            const endDate = new Date(block.end);
            const startMins = startDate.getHours() * 60 + startDate.getMinutes();
            const endMins = endDate.getHours() * 60 + endDate.getMinutes();

            const topPx = startMins;
            const heightPx = Math.max(24, endMins - startMins);
            const task = this.tasks.find(t => t.id === block.task_id) || { title: 'Task', color: '#6366F1' };

            return html`
              <div
                class="block-wrapper"
                style="top: ${topPx}px; height: ${heightPx}px;"
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
