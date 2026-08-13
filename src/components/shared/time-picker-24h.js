import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { parseHHMMToMins } from '../../utils/date-utils.js';

/**
 * <crono-time-picker-24h> — Strict 24-hour format time input with two-column (Hours / Minutes) popover,
 * auto-scroll centering, and nearest-valid-time input clamping with warning tooltip.
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
      .two-col-popover {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        z-index: 1000;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        width: 170px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .popover-header {
        display: flex;
        border-bottom: 1px solid var(--border);
        background: var(--bg-secondary);
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .popover-header > div {
        flex: 1;
        text-align: center;
        padding: 6px 0;
      }
      .columns-body {
        display: flex;
        height: 200px;
      }
      .col-list {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        padding: 4px;
        scroll-behavior: smooth;
      }
      .col-list:first-child {
        border-right: 1px solid var(--border);
      }
      .col-item {
        padding: 5px 8px;
        font-family: var(--font-mono);
        font-size: 12px;
        cursor: pointer;
        background: transparent;
        border: none;
        border-radius: var(--radius-sm);
        color: var(--text-primary);
        text-align: center;
        transition: background var(--transition-fast);
        margin-bottom: 2px;
      }
      .col-item:hover:not(:disabled) {
        background: var(--bg-secondary);
        color: var(--accent);
      }
      .col-item.selected {
        background: var(--accent);
        color: #ffffff;
        font-weight: 600;
      }
      .col-item:disabled,
      .col-item.disabled {
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
      .warning-bubble {
        position: absolute;
        top: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-surface, #1e2030);
        border: 1px solid var(--warning, #f59e0b);
        color: var(--warning, #f59e0b);
        padding: 5px 10px;
        border-radius: var(--radius-sm, 6px);
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.3));
        z-index: 1002;
        pointer-events: none;
        animation: fadeInDown 0.2s ease-out;
      }
      .warning-bubble::before {
        content: '';
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 4px;
        border-style: solid;
        border-color: transparent transparent var(--warning, #f59e0b) transparent;
      }
      @keyframes fadeInDown {
        from { opacity: 0; transform: translate(-50%, -4px); }
        to { opacity: 1; transform: translate(-50%, 0); }
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
    isOpen: { state: true },
    warningMessage: { state: true }
  };

  constructor() {
    super();
    this.value = '09:00';
    this.min = '';
    this.max = '';
    this.allowedIntervals = null;
    this.stepMinutes = 5;
    this.disabled = false;
    this.isOpen = false;
    this.warningMessage = '';
    this._warningTimer = null;
  }

  updated(changedProperties) {
    if (changedProperties.has('isOpen') && this.isOpen) {
      this._scrollToSelected();
    }
  }

  _scrollToSelected() {
    this.updateComplete.then(() => {
      const popover = this.shadowRoot?.querySelector('.two-col-popover');
      if (!popover) return;
      const hoursList = popover.querySelector('.col-hours');
      const minsList = popover.querySelector('.col-mins');

      const selectedHour = hoursList?.querySelector('.col-item.selected');
      if (selectedHour && hoursList) {
        hoursList.scrollTop = selectedHour.offsetTop - (hoursList.clientHeight / 2) + (selectedHour.clientHeight / 2);
      }

      const selectedMin = minsList?.querySelector('.col-item.selected');
      if (selectedMin && minsList) {
        minsList.scrollTop = selectedMin.offsetTop - (minsList.clientHeight / 2) + (selectedMin.clientHeight / 2);
      }
    });
  }

  _isTimeAllowed(timeStr) {
    if (!timeStr) return false;
    const mins = parseHHMMToMins(timeStr);

    if (Array.isArray(this.allowedIntervals) && this.allowedIntervals.length > 0) {
      return this.allowedIntervals.some(inv => {
        const s = parseHHMMToMins(inv.start);
        const e = parseHHMMToMins(inv.end);
        return mins >= s && mins <= e;
      });
    }

    if (this.min && mins < parseHHMMToMins(this.min)) return false;
    if (this.max && mins > parseHHMMToMins(this.max)) return false;

    return true;
  }

  _isHourAllowed(hour) {
    const hStart = hour * 60;
    const hEnd = hour * 60 + 59;

    if (Array.isArray(this.allowedIntervals) && this.allowedIntervals.length > 0) {
      return this.allowedIntervals.some(inv => {
        const s = parseHHMMToMins(inv.start);
        const e = parseHHMMToMins(inv.end);
        return !(hEnd < s || hStart > e);
      });
    }

    if (this.min && hEnd < parseHHMMToMins(this.min)) return false;
    if (this.max && hStart > parseHHMMToMins(this.max)) return false;

    return true;
  }

  _findNearestAllowedTime(timeStr) {
    if (!timeStr) return this.value || '09:00';
    let mins = parseHHMMToMins(timeStr);
    if (isNaN(mins)) mins = 540;

    if (Array.isArray(this.allowedIntervals) && this.allowedIntervals.length > 0) {
      const inside = this.allowedIntervals.some(inv => {
        const s = parseHHMMToMins(inv.start);
        const e = parseHHMMToMins(inv.end);
        return mins >= s && mins <= e;
      });
      if (inside) return timeStr;

      let closestMins = parseHHMMToMins(this.allowedIntervals[0].start);
      let minDiff = Infinity;

      for (const inv of this.allowedIntervals) {
        const s = parseHHMMToMins(inv.start);
        const e = parseHHMMToMins(inv.end);

        const diffS = Math.abs(mins - s);
        if (diffS < minDiff) {
          minDiff = diffS;
          closestMins = s;
        }

        const diffE = Math.abs(mins - e);
        if (diffE < minDiff) {
          minDiff = diffE;
          closestMins = e;
        }
      }

      const h = Math.floor(closestMins / 60);
      const m = closestMins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    if (this.min && mins < parseHHMMToMins(this.min)) return this.min;
    if (this.max && mins > parseHHMMToMins(this.max)) return this.max;

    return timeStr;
  }

  _showWarning(msg) {
    this.warningMessage = msg;
    if (this._warningTimer) clearTimeout(this._warningTimer);
    this._warningTimer = setTimeout(() => {
      this.warningMessage = '';
    }, 2500);
  }

  _onInputChange(e) {
    const inputEl = e?.target || this.shadowRoot?.querySelector('.time-input');
    let val = inputEl ? inputEl.value.trim() : (this.value || '09:00');
    const match = val.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
      const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
      val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    } else {
      val = this.value || '09:00';
    }

    if (!this._isTimeAllowed(val)) {
      const clamped = this._findNearestAllowedTime(val);
      this._showWarning(`⚠️ Clamped to nearest valid time: ${clamped}`);
      val = clamped;
    }

    if (inputEl) {
      inputEl.value = val;
    }
    this._commitValue(val);
  }

  _selectHour(hour) {
    if (!this._isHourAllowed(hour)) return;
    const [, currM] = (this.value || '09:00').split(':');
    const hStr = String(hour).padStart(2, '0');
    let mStr = currM || '00';

    if (!this._isTimeAllowed(`${hStr}:${mStr}`)) {
      for (let m = 0; m < 60; m += 5) {
        const testMStr = String(m).padStart(2, '0');
        if (this._isTimeAllowed(`${hStr}:${testMStr}`)) {
          mStr = testMStr;
          break;
        }
      }
    }

    this._commitValue(`${hStr}:${mStr}`);
  }

  _selectMinute(min) {
    const [currH] = (this.value || '09:00').split(':');
    const hStr = currH || '09';
    const mStr = String(min).padStart(2, '0');
    const timeStr = `${hStr}:${mStr}`;

    if (!this._isTimeAllowed(timeStr)) return;
    this._commitValue(timeStr);
    this.isOpen = false;
  }

  _commitValue(val) {
    this.value = val;
    const inputEl = this.shadowRoot?.querySelector('.time-input');
    if (inputEl && inputEl.value !== val) {
      inputEl.value = val;
    }
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
    const [currHStr, currMStr] = (this.value || '09:00').split(':');
    const currH = parseInt(currHStr, 10) || 0;
    const currM = parseInt(currMStr, 10) || 0;

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

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
          @blur=${this._onInputChange}
          @keydown=${(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              this._onInputChange(e);
              e.target.blur();
            }
          }}
          @click=${() => { if (!this.disabled) this.isOpen = true; }}
        />
        <button
          type="button"
          class="dropdown-toggle"
          ?disabled=${this.disabled}
          @click=${this._toggleOpen}
        >▼</button>

        ${this.warningMessage ? html`
          <div class="warning-bubble">${this.warningMessage}</div>
        ` : ''}

        ${this.isOpen ? html`
          <div class="backdrop" @click=${() => this.isOpen = false}></div>
          <div class="two-col-popover">
            <div class="popover-header">
              <div>Hour</div>
              <div>Min</div>
            </div>
            <div class="columns-body">
              <!-- Hours Column (00 - 23) -->
              <div class="col-list col-hours">
                ${hours.map(h => {
                  const allowed = this._isHourAllowed(h);
                  const isSelected = h === currH;
                  const hLabel = String(h).padStart(2, '0');
                  return html`
                    <button
                      type="button"
                      class="col-item ${isSelected ? 'selected' : ''} ${!allowed ? 'disabled' : ''}"
                      ?disabled=${!allowed}
                      @click=${() => this._selectHour(h)}
                    >
                      ${hLabel}
                    </button>
                  `;
                })}
              </div>

              <!-- Minutes Column (00 - 55) -->
              <div class="col-list col-mins">
                ${minutes.map(m => {
                  const mLabel = String(m).padStart(2, '0');
                  const testTime = `${String(currH).padStart(2, '0')}:${mLabel}`;
                  const allowed = this._isTimeAllowed(testTime);
                  const isSelected = m === currM;
                  return html`
                    <button
                      type="button"
                      class="col-item ${isSelected ? 'selected' : ''} ${!allowed ? 'disabled' : ''}"
                      ?disabled=${!allowed}
                      @click=${() => this._selectMinute(m)}
                    >
                      ${mLabel}
                    </button>
                  `;
                })}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('crono-time-picker-24h', CronoTimePicker24h);
