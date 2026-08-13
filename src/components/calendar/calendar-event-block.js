import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { hexToRgba } from '../../utils/color-utils.js';
import { formatHHMM } from '../../utils/date-utils.js';

/**
 * <crono-calendar-event-block> — Render element for scheduled task/tag block with icons for locked, auto, recurring, and catch-up states.
 */
export class CronoCalendarEventBlock extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }
      .block {
        height: 100%;
        width: 100%;
        border-radius: var(--radius-sm);
        padding: 4px 8px;
        display: flex;
        align-items: center;
        font-size: 12px;
        cursor: pointer;
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        box-sizing: border-box;
        overflow: hidden;
      }
      .block:hover {
        transform: scale(1.01);
        box-shadow: var(--shadow-md);
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 6px;
        font-weight: 600;
        line-height: 1.2;
        width: 100%;
        overflow: hidden;
      }
      .title-with-icon {
        display: flex;
        align-items: center;
        gap: 4px;
        overflow: hidden;
        white-space: nowrap;
        flex-shrink: 1;
      }
      .title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .icons {
        display: flex;
        align-items: center;
        gap: 2px;
        font-size: 12px;
        flex-shrink: 0;
      }
      .catchup-badge {
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 700;
        background: var(--accent);
        color: #fff;
        padding: 1px 4px;
        border-radius: var(--radius-sm);
      }
      .time {
        font-family: var(--font-mono);
        font-size: 11px;
        opacity: 0.85;
        white-space: nowrap;
        flex-shrink: 0;
      }

      /* Alert Border & Pulsing */
      .alert-orange-border {
        border-left: 4px solid var(--alert-orange) !important;
      }
      .alert-red-border {
        border-left: 4px solid var(--alert-red) !important;
      }
    `
  ];

  static properties = {
    block: { type: Object },
    task: { type: Object }
  };

  constructor() {
    super();
    this.block = null;
    this.task = null;
  }

  _onClick() {
    this.dispatchEvent(new CustomEvent('crono-event-click', {
      detail: { block: this.block, task: this.task },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.block || !this.task) return html``;

    const baseColor = this.task.color || '#6366F1';
    const bgRgba = hexToRgba(baseColor, 0.2);
    const borderLeftColor = baseColor;

    const isLocked = this.block.is_locked;
    const isRecurring = this.block.is_recurring || Boolean(this.task.recurrence);
    const isCatchup = this.block.is_catchup;
    const alertLevel = this.block.alert_level || 'none';

    let alertClass = '';
    if (alertLevel === 'red') alertClass = 'alert-red-border';
    else if (alertLevel === 'orange') alertClass = 'alert-orange-border';

    const startHHMM = this.block.start ? formatHHMM(this.block.start) : '';
    const endHHMM = this.block.end ? formatHHMM(this.block.end) : '';

    return html`
      <div
        class="block ${alertClass}"
        style="background-color: ${bgRgba}; border-left: 4px solid ${borderLeftColor};"
        @click=${this._onClick}
      >
        <div class="header">
          <div class="title-with-icon">
            <span class="icons">
              ${isLocked ? '🔒' : '🤖'}
              ${isRecurring ? '🔄' : ''}
              ${isCatchup ? html`<span class="catchup-badge" title="Make-up Catch-up Session">⚡${this.block.accumulated_index || ''}</span>` : ''}
              ${alertLevel === 'orange' ? '⚠' : ''}
              ${alertLevel === 'red' ? '🔴' : ''}
            </span>
            <span class="title">${this.task.title}</span>
          </div>
          <span class="time">(${startHHMM} - ${endHHMM})</span>
        </div>
      </div>
    `;
  }
}

customElements.define('crono-calendar-event-block', CronoCalendarEventBlock);
