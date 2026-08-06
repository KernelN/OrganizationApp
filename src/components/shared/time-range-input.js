import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';

/**
 * <crono-time-range-input> — Component for selecting start and end HH:MM time range.
 */
export class CronoTimeRangeInput extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .range-row {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }
      .time-input {
        width: 110px;
      }
      .separator {
        color: var(--text-muted);
        font-weight: 500;
      }
    `
  ];

  static properties = {
    start: { type: String },
    end: { type: String }
  };

  constructor() {
    super();
    this.start = '09:00';
    this.end = '17:00';
  }

  _onChange() {
    this.dispatchEvent(new CustomEvent('crono-time-range-change', {
      detail: { start: this.start, end: this.end },
      bubbles: true,
      composed: true
    }));
  }

  _onStartInput(e) {
    this.start = e.target.value;
    this._onChange();
  }

  _onEndInput(e) {
    this.end = e.target.value;
    this._onChange();
  }

  render() {
    return html`
      <div class="range-row">
        <input
          type="time"
          class="crono-input time-input"
          .value=${this.start}
          @change=${this._onStartInput}
        />
        <span class="separator">to</span>
        <input
          type="time"
          class="crono-input time-input"
          .value=${this.end}
          @change=${this._onEndInput}
        />
      </div>
    `;
  }
}

customElements.define('crono-time-range-input', CronoTimeRangeInput);
