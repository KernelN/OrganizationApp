import { LitElement, html, css } from 'lit';

export class TimeRangeInput extends LitElement {
  static properties = {
    start: { type: String },
    end: { type: String }
  };

  static styles = css`
    :host {
      display: inline-block;
    }

    .range-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    input[type="time"] {
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 6px 10px;
      color: var(--color-text-primary, #F3F4F6);
      font-size: 0.875rem;
      color-scheme: dark;
    }

    .separator {
      color: var(--color-text-muted, #6B7280);
      font-size: 0.875rem;
    }
  `;

  constructor() {
    super();
    this.start = '09:00';
    this.end = '17:00';
  }

  handleStartChange(e) {
    this.start = e.target.value;
    this.emitChange();
  }

  handleEndChange(e) {
    this.end = e.target.value;
    this.emitChange();
  }

  emitChange() {
    this.dispatchEvent(
      new CustomEvent('range-change', {
        detail: { start: this.start, end: this.end }
      })
    );
  }

  render() {
    return html`
      <div class="range-container">
        <input
          type="time"
          .value="${this.start || '09:00'}"
          @change="${this.handleStartChange}"
        />
        <span class="separator">to</span>
        <input
          type="time"
          .value="${this.end || '17:00'}"
          @change="${this.handleEndChange}"
        />
      </div>
    `;
  }
}

customElements.define('time-range-input', TimeRangeInput);
