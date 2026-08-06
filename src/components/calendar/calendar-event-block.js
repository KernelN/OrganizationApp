import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { hexToRgba } from '../../utils/color-utils.js';

/**
 * <crono-calendar-event-block> — Render element for scheduled task/tag block.
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
        flex-direction: column;
        justify-content: space-between;
        font-size: 12px;
        cursor: pointer;
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        box-sizing: border-box;
      }
      .block:hover {
        transform: scale(1.01);
        box-shadow: var(--shadow-md);
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 4px;
        font-weight: 600;
        line-height: 1.2;
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
      }
      .time {
        font-family: var(--font-mono);
        font-size: 11px;
        opacity: 0.85;
      }

      /* Alert Border & Pulsing */
      .alert-orange-border {
        border-left: 4px solid var(--alert-orange) !important;
      }
      .alert-red-border {
        border-left: 4px solid var(--alert-red) !important;
        animation: pulse-red-alert 2s infinite;
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
    const alertLevel = this.block.alert_level || 'none';

    let alertClass = '';
    if (alertLevel === 'red') alertClass = 'alert-red-border';
    else if (alertLevel === 'orange') alertClass = 'alert-orange-border';

    const startHHMM = this.block.start ? this.block.start.split('T')[1].substring(0, 5) : '';
    const endHHMM = this.block.end ? this.block.end.split('T')[1].substring(0, 5) : '';

    return html`
      <div
        class="block ${alertClass}"
        style="background-color: ${bgRgba}; border-left: 4px solid ${borderLeftColor};"
        @click=${this._onClick}
      >
        <div class="header">
          <span class="title">${this.task.title}</span>
          <span class="icons">
            ${isLocked ? '🔒' : '🤖'}
            ${alertLevel === 'orange' ? '⚠' : ''}
            ${alertLevel === 'red' ? '🔴' : ''}
          </span>
        </div>
        <div class="time">${startHHMM} - ${endHHMM}</div>
      </div>
    `;
  }
}

customElements.define('crono-calendar-event-block', CronoCalendarEventBlock);
