import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { parseHHMMToMins } from '../../utils/date-utils.js';

/**
 * <crono-time-picker-24h> — Strict 24-hour format time input with dropdown selector.
 * Guarantees 24h (00:00 to 23:59) format and allows graying out disallowed intervals.
 */
export class CronoTimePicker24h extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: inline-block;
        position: relative;
      }
      .picker-container {
        position: relative;
        display: flex;
        align-items: center;
      }
      .time-input {
        width: 88px;
        font-family: var(--font-mono);
        font-size: 13px;
        font-weight: 500;
        text-align: center;
        padding: 6px 8px;
        padding-right: 24px;
      }
      .dropdown-toggle {
        position: absolute;
        right: 4px;
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 2px;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dropdown-toggle:hover {
        color: var(--text-primary);
      }
      .options-menu {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        z-index: 1000;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        max-height: 200px;
        width: 130px;
        overflow-y: auto;
        padding: 4px 0;
        display: flex;
        flex-direction: column;
      }
      .option-item {
        padding: 6px 12px;
        font-family: var(--font-mono);
        font-size: 12px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: transparent;
        border: none;
        color: var(--text-primary);
        width: 100%;
        text-align: left;
        transition: background var(--transition-fast);
      }
      .option-item:hover:not(:disabled) {
        background: var(--bg-secondary);
        color: var(--accent);
      }
      .option-item.selected {
        background: var(--accent);
        color: #ffffff;
        font-weight: 600;
      }
      .option-item:disabled,
      .option-item.disabled {
        opacity: 0.35;
        cursor: not-allowed;
        background: transparent;
        text-decoration: line-through;
      }
      .backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999;
      }
    `
  ];

  static properties = {
    value: { type: String },
    min: { type: String },
    max: { type: String },
    allowedIntervals: { type: Array },
    stepMinutes: { type: Number },
    disabled: { type: Boolean },
    isOpen: { state: true }
  };

  constructor() {
    super();
    this.value = '09:00';
    this.min = '';
    this.max = '';
    this.allowedIntervals = null;
    this.stepMinutes = 30;
    this.disabled = false;
    this.isOpen = false;
  }

  _isTimeAllowed(timeStr) {
    if (!timeStr) return false;
    const mins = parseHHMMToMins(timeStr);

    if (this.min && mins < parseHHMMToMins(this.min)) return false;
    if (this.max && mins > parseHHMMToMins(this.max)) return false;

    if (Array.isArray(this.allowedIntervals) && this.allowedIntervals.length > 0) {
      const inAny = this.allowedIntervals.some(inv => {
        const s = parseHHMMToMins(inv.start);
        const e = parseHHMMToMins(inv.end);
        return mins >= s && mins <= e;
      });
      if (!inAny) return false;
    }

    return true;
  }

  _generateTimeOptions() {
    const options = new Set();

    // Add boundaries if set
    if (this.min) options.add(this.min);
    if (this.max) options.add(this.max);
    if (Array.isArray(this.allowedIntervals)) {
      for (const inv of this.allowedIntervals) {
        if (inv.start) options.add(inv.start);
        if (inv.end) options.add(inv.end);
      }
    }
    if (this.value) options.add(this.value);

    // Generate step times across 24 hours (00:00 to 23:30)
    for (let m = 0; m < 1440; m += this.stepMinutes) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const tStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      options.add(tStr);
    }

    return Array.from(options).sort((a, b) => parseHHMMToMins(a) - parseHHMMToMins(b));
  }

  _onInputChange(e) {
    let val = e.target.value.trim();
    // Validate / sanitize format HH:MM
    const match = val.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
      const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
      val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    } else {
      val = this.value || '09:00';
    }

    this._commitValue(val);
  }

  _selectOption(timeStr) {
    if (!this._isTimeAllowed(timeStr)) return;
    this._commitValue(timeStr);
    this.isOpen = false;
  }

  _commitValue(val) {
    this.value = val;
    this.dispatchEvent(new CustomEvent('crono-time-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
    this.requestUpdate();
  }

  _toggleOpen(e) {
    e.stopPropagation();
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  }

  render() {
    const timeOptions = this.isOpen ? this._generateTimeOptions() : [];

    return html`
      <div class="picker-container">
        <input
          type="text"
          class="crono-input time-input"
          .value=${this.value || '09:00'}
          ?disabled=${this.disabled}
          placeholder="HH:MM"
          maxlength="5"
          @change=${this._onInputChange}
          @click=${() => { if (!this.disabled) this.isOpen = true; }}
        />
        <button
          type="button"
          class="dropdown-toggle"
          ?disabled=${this.disabled}
          @click=${this._toggleOpen}
        >▼</button>

        ${this.isOpen ? html`
          <div class="backdrop" @click=${() => this.isOpen = false}></div>
          <div class="options-menu">
            ${timeOptions.map(tStr => {
              const allowed = this._isTimeAllowed(tStr);
              const isSelected = tStr === this.value;
              return html`
                <button
                  type="button"
                  class="option-item ${isSelected ? 'selected' : ''} ${!allowed ? 'disabled' : ''}"
                  ?disabled=${!allowed}
                  @click=${() => this._selectOption(tStr)}
                >
                  <span>${tStr}</span>
                  ${isSelected ? html`<span>✓</span>` : ''}
                </button>
              `;
            })}
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('crono-time-picker-24h', CronoTimePicker24h);
