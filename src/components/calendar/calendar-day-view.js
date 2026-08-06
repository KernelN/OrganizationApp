import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { getDayName, formatDateISO } from '../../utils/date-utils.js';
import './calendar-event-block.js';

/**
 * <crono-calendar-day-view> — Hourly grid day view with scheduled event blocks.
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
          45deg,
          rgba(255, 255, 255, 0.03),
          rgba(255, 255, 255, 0.03) 10px,
          rgba(0, 0, 0, 0.1) 10px,
          rgba(0, 0, 0, 0.1) 20px
        );
        pointer-events: none;
        z-index: 1;
        border-top: 1px dashed var(--border);
        border-bottom: 1px dashed var(--border);
      }
      .block-wrapper {
        position: absolute;
        left: var(--space-sm);
        right: var(--space-sm);
        z-index: 2;
      }
    `
  ];

  static properties = {
    selectedDate: { type: String },
    blocks: { type: Array },
    tasks: { type: Array },
    settings: { type: Object }
  };

  constructor() {
    super();
    this.selectedDate = formatDateISO(new Date());
    this.blocks = [];
    this.tasks = [];
    this.settings = {};
  }

  render() {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayName = getDayName(this.selectedDate);
    const breakWindows = (this.settings.break_windows && this.settings.break_windows[dayName]) || [];

    // Filter blocks for selected date
    const dayBlocks = this.blocks.filter(b => {
      if (!b.start) return false;
      const bDateStr = formatDateISO(new Date(b.start));
      return bDateStr === this.selectedDate || b.start.startsWith(this.selectedDate);
    });

    return html`
      <div class="grid-container">
        <div class="time-column">
          ${hours.map(h => html`
            <div class="time-slot-label">${String(h).padStart(2, '0')}:00</div>
          `)}
        </div>
        <div class="slots-column">
          ${hours.map(h => html`<div class="hour-line"></div>`)}

          <!-- Render Break Windows -->
          ${breakWindows.map(bw => {
            const [sH, sM] = bw.start.split(':').map(Number);
            const [eH, eM] = bw.end.split(':').map(Number);
            const topPx = (sH * 60 + sM);
            const heightPx = ((eH * 60 + eM) - (sH * 60 + sM));
            return html`
              <div
                class="break-strip"
                style="top: ${topPx}px; height: ${heightPx}px;"
                title="Break Window: ${bw.start} - ${bw.end}"
              ></div>
            `;
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
