import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { formatDateISO, parseISOToLocalDate, formatHHMM } from '../../utils/date-utils.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * <crono-datetime-picker> — Unified side-by-side custom Date Calendar + 24h Time Picker
 * popover with smart viewport collision detection and single-trigger input.
 *
 * @fires crono-datetime-change - Fired when the combined datetime value changes.
 */
export class CronoDatetimePicker extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        position: relative;
        width: 100%;
      }
      .picker-container {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
      }
      .datetime-input {
        width: 100%;
        font-family: var(--font-mono);
        font-size: 13px;
        font-weight: 500;
        padding: 6px 10px;
        padding-right: 54px;
        box-sizing: border-box;
        cursor: pointer;
      }
      .actions-group {
        position: absolute;
        right: 6px;
        display: flex;
        align-items: center;
        gap: 2px;
      }
      .action-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 2px 4px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast), background var(--transition-fast);
      }
      .action-btn:hover:not(:disabled) {
        color: var(--text-primary);
        background: var(--bg-secondary);
      }
      .action-btn.clear-btn:hover:not(:disabled) {
        color: var(--danger, #ef4444);
      }
      .unified-popover {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        z-index: 1050;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        width: 440px;
        max-width: 92vw;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        user-select: none;
      }
      .unified-popover.align-right {
        left: auto;
        right: 0;
      }
      .unified-popover.align-top {
        top: auto;
        bottom: calc(100% + 4px);
      }
      .popover-body {
        display: flex;
        border-bottom: 1px solid var(--border);
      }
      @media (max-width: 480px) {
        .unified-popover {
          width: 320px;
        }
        .popover-body {
          flex-direction: column;
        }
      }
      /* Left Calendar Pane */
      .cal-pane {
        flex: 1.35;
        border-right: 1px solid var(--border);
        display: flex;
        flex-direction: column;
      }
      @media (max-width: 480px) {
        .cal-pane {
          border-right: none;
          border-bottom: 1px solid var(--border);
        }
      }
      .cal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
      }
      .cal-title {
        font-weight: 600;
        font-size: 13px;
        color: var(--text-primary);
      }
      .cal-nav-btn {
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text-secondary);
        width: 24px;
        height: 24px;
        border-radius: var(--radius-sm);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        transition: background var(--transition-fast), color var(--transition-fast);
      }
      .cal-nav-btn:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }
      .cal-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        padding: 6px 6px 2px 6px;
        text-align: center;
      }
      .weekday-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      .cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        padding: 4px 6px 8px 6px;
      }
      .cal-day-cell {
        aspect-ratio: 1;
        background: transparent;
        border: none;
        border-radius: var(--radius-sm);
        color: var(--text-primary);
        font-size: 12px;
        font-family: var(--font-mono);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background var(--transition-fast), color var(--transition-fast);
        padding: 0;
      }
      .cal-day-cell:hover:not(:disabled) {
        background: var(--bg-secondary);
        color: var(--accent);
      }
      .cal-day-cell.other-month {
        opacity: 0.35;
      }
      .cal-day-cell.today {
        box-shadow: inset 0 0 0 1px var(--accent);
        font-weight: 700;
      }
      .cal-day-cell.selected {
        background: var(--accent);
        color: #ffffff;
        font-weight: 700;
      }
      .cal-day-cell:disabled {
        opacity: 0.2;
        cursor: not-allowed;
        text-decoration: line-through;
      }

      /* Right Time Pane */
      .time-pane {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: var(--bg-surface);
      }
      .time-header {
        display: flex;
        border-bottom: 1px solid var(--border);
        background: var(--bg-secondary);
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .time-header > div {
        flex: 1;
        text-align: center;
        padding: 8px 0;
      }
      .time-columns {
        display: flex;
        height: 205px;
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
        padding: 4px 6px;
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

      /* Footer */
      .popover-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 10px;
        background: var(--bg-secondary);
        font-size: 11px;
        gap: 6px;
        flex-wrap: wrap;
      }
      .footer-shortcuts {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .footer-btn {
        background: none;
        border: none;
        color: var(--accent);
        cursor: pointer;
        font-weight: 600;
        padding: 2px 5px;
        border-radius: var(--radius-sm);
        transition: background var(--transition-fast);
      }
      .footer-btn:hover {
        background: hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.12);
      }
      .footer-btn.clear {
        color: var(--text-muted);
      }
      .footer-btn.clear:hover {
        color: var(--danger, #ef4444);
      }
      .footer-btn.done-btn {
        background: var(--accent);
        color: #ffffff;
        padding: 3px 8px;
      }
      .footer-btn.done-btn:hover {
        opacity: 0.9;
      }
      .backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1040;
      }
    `
  ];

  static properties = {
    value: { type: String },
    defaultTime: { type: String, attribute: 'default-time' },
    min: { type: String },
    max: { type: String },
    disabled: { type: Boolean },
    required: { type: Boolean },
    placeholder: { type: String },
    isOpen: { state: true },
    viewYear: { state: true },
    viewMonth: { state: true },
    alignRight: { state: true },
    alignTop: { state: true }
  };

  constructor() {
    super();
    this.value = '';
    this.defaultTime = '09:00';
    this.min = '';
    this.max = '';
    this.disabled = false;
    this.required = false;
    this.placeholder = 'YYYY-MM-DD HH:MM';
    this.isOpen = false;
    this.alignRight = false;
    this.alignTop = false;

    const today = new Date();
    this.viewYear = today.getFullYear();
    this.viewMonth = today.getMonth();
  }

  updated(changedProperties) {
    if (changedProperties.has('isOpen') && this.isOpen) {
      this._scrollToSelectedTime();
    }
  }

  _parseCurrent() {
    if (!this.value) {
      return { date: '', time: this.defaultTime || '09:00' };
    }
    const val = String(this.value).trim();
    if (!val) {
      return { date: '', time: this.defaultTime || '09:00' };
    }

    if (val.includes('T')) {
      const [dPart, tPart] = val.split('T');
      const timeClean = (tPart || '').substring(0, 5) || (this.defaultTime || '09:00');
      return { date: dPart, time: timeClean };
    }

    if (val.includes(' ')) {
      const [dPart, tPart] = val.split(' ');
      const timeClean = (tPart || '').substring(0, 5) || (this.defaultTime || '09:00');
      return { date: dPart, time: timeClean };
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return { date: val, time: this.defaultTime || '09:00' };
    }

    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      const dateStr = formatDateISO(d);
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return { date: dateStr, time: `${h}:${m}` };
    }

    return { date: '', time: this.defaultTime || '09:00' };
  }

  _formatDisplayValue() {
    const cur = this._parseCurrent();
    if (!cur.date) return '';
    return `${cur.date} ${cur.time}`;
  }

  _openPopover() {
    if (this.disabled) return;
    const rect = this.getBoundingClientRect();
    const popoverWidth = 450;
    const popoverHeight = 320;
    this.alignRight = (rect.left + popoverWidth > window.innerWidth - 16);
    this.alignTop = (rect.bottom + popoverHeight > window.innerHeight - 16 && rect.top > popoverHeight);

    const cur = this._parseCurrent();
    if (cur.date) {
      const d = parseISOToLocalDate(cur.date);
      if (!isNaN(d.getTime())) {
        this.viewYear = d.getFullYear();
        this.viewMonth = d.getMonth();
      }
    } else {
      const today = new Date();
      this.viewYear = today.getFullYear();
      this.viewMonth = today.getMonth();
    }

    this.isOpen = true;
  }

  _scrollToSelectedTime() {
    this.updateComplete.then(() => {
      const popover = this.shadowRoot?.querySelector('.unified-popover');
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

  _prevMonth(e) {
    e.stopPropagation();
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear -= 1;
    } else {
      this.viewMonth -= 1;
    }
  }

  _nextMonth(e) {
    e.stopPropagation();
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear += 1;
    } else {
      this.viewMonth += 1;
    }
  }

  _selectDate(dateStr) {
    const cur = this._parseCurrent();
    const time = cur.time || this.defaultTime || '09:00';
    const combined = `${dateStr}T${time}`;
    this._commitValue(combined, dateStr, time);
  }

  _selectHour(hour) {
    const cur = this._parseCurrent();
    const date = cur.date || formatDateISO(new Date());
    const [, currM] = cur.time.split(':');
    const hStr = String(hour).padStart(2, '0');
    const mStr = currM || '00';
    const timeStr = `${hStr}:${mStr}`;
    const combined = `${date}T${timeStr}`;
    this._commitValue(combined, date, timeStr);
  }

  _selectMinute(min) {
    const cur = this._parseCurrent();
    const date = cur.date || formatDateISO(new Date());
    const [currH] = cur.time.split(':');
    const hStr = currH || '09';
    const mStr = String(min).padStart(2, '0');
    const timeStr = `${hStr}:${mStr}`;
    const combined = `${date}T${timeStr}`;
    this._commitValue(combined, date, timeStr);
  }

  _selectToday() {
    const todayStr = formatDateISO(new Date());
    const cur = this._parseCurrent();
    const time = cur.time || this.defaultTime || '09:00';
    this.viewYear = new Date().getFullYear();
    this.viewMonth = new Date().getMonth();
    this._commitValue(`${todayStr}T${time}`, todayStr, time);
  }

  _selectNow() {
    const now = new Date();
    const dateStr = formatDateISO(now);
    const timeStr = formatHHMM(now);
    this.viewYear = now.getFullYear();
    this.viewMonth = now.getMonth();
    this._commitValue(`${dateStr}T${timeStr}`, dateStr, timeStr);
  }

  _selectEndOfDay() {
    const cur = this._parseCurrent();
    const date = cur.date || formatDateISO(new Date());
    const timeStr = '23:59';
    this._commitValue(`${date}T${timeStr}`, date, timeStr);
  }

  _clear(e) {
    if (e) e.stopPropagation();
    if (this.disabled) return;
    this._commitValue('', '', '');
    this.isOpen = false;
  }

  _onInputChange(e) {
    const rawVal = e.target.value.trim();
    if (!rawVal) {
      this._commitValue('', '', '');
      return;
    }

    const match = rawVal.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):(\d{2})$/);
    if (match) {
      const dStr = match[1];
      const h = Math.min(23, Math.max(0, parseInt(match[2], 10)));
      const m = Math.min(59, Math.max(0, parseInt(match[3], 10)));
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const combined = `${dStr}T${timeStr}`;
      this._commitValue(combined, dStr, timeStr);
      return;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(rawVal)) {
      const time = this.defaultTime || '09:00';
      this._commitValue(`${rawVal}T${time}`, rawVal, time);
      return;
    }

    // Revert
    e.target.value = this._formatDisplayValue();
  }

  _commitValue(combinedVal, dateStr, timeStr) {
    this.value = combinedVal;
    const inputEl = this.shadowRoot?.querySelector('.datetime-input');
    if (inputEl) {
      inputEl.value = this._formatDisplayValue();
    }
    this.dispatchEvent(new CustomEvent('crono-datetime-change', {
      detail: {
        value: this.value,
        date: dateStr,
        time: timeStr
      },
      bubbles: true,
      composed: true
    }));
    this.requestUpdate();
  }

  _generateCalendarCells() {
    const year = this.viewYear;
    const month = this.viewMonth;

    const firstDay = new Date(year, month, 1);
    const firstDayWeekday = (firstDay.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];
    const pad = (n) => String(n).padStart(2, '0');

    // Prev month days
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const iso = `${prevYear}-${pad(prevMonth + 1)}-${pad(dayNum)}`;
      cells.push({ dayNum, iso, isOtherMonth: true });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const iso = `${year}-${pad(month + 1)}-${pad(d)}`;
      cells.push({ dayNum: d, iso, isOtherMonth: false });
    }

    // Next month days to reach 42 cells (6 rows)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const iso = `${nextYear}-${pad(nextMonth + 1)}-${pad(d)}`;
      cells.push({ dayNum: d, iso, isOtherMonth: true });
    }

    return cells;
  }

  render() {
    const cur = this._parseCurrent();
    const todayISO = formatDateISO(new Date());
    const selectedDateISO = cur.date;
    const [currHStr, currMStr] = cur.time.split(':');
    const currH = parseInt(currHStr, 10) || 0;
    const currM = parseInt(currMStr, 10) || 0;

    const cells = this._generateCalendarCells();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 59];

    return html`
      <div class="picker-container">
        <input
          type="text"
          class="crono-input datetime-input"
          .value=${this._formatDisplayValue()}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @change=${this._onInputChange}
          @blur=${this._onInputChange}
          @keydown=${(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              this._onInputChange(e);
              e.target.blur();
            }
          }}
          @click=${() => this._openPopover()}
        />
        <div class="actions-group">
          ${this.value && !this.required && !this.disabled ? html`
            <button
              type="button"
              class="action-btn clear-btn"
              title="Clear date & time"
              @click=${this._clear}
            >✕</button>
          ` : ''}
          <button
            type="button"
            class="action-btn"
            title="Open date & time picker"
            ?disabled=${this.disabled}
            @click=${() => {
              if (this.isOpen) this.isOpen = false;
              else this._openPopover();
            }}
          >📅</button>
        </div>

        ${this.isOpen ? html`
          <div class="backdrop" @click=${() => this.isOpen = false}></div>
          <div class="unified-popover ${this.alignRight ? 'align-right' : ''} ${this.alignTop ? 'align-top' : ''}">
            <div class="popover-body">
              <!-- Left Calendar Pane -->
              <div class="cal-pane">
                <div class="cal-header">
                  <button type="button" class="cal-nav-btn" @click=${this._prevMonth}>◀</button>
                  <span class="cal-title">${MONTH_NAMES[this.viewMonth]} ${this.viewYear}</span>
                  <button type="button" class="cal-nav-btn" @click=${this._nextMonth}>▶</button>
                </div>

                <div class="cal-weekdays">
                  ${WEEKDAY_NAMES.map(w => html`<span class="weekday-label">${w}</span>`)}
                </div>

                <div class="cal-grid">
                  ${cells.map(cell => {
                    const isSelected = cell.iso === selectedDateISO;
                    const isToday = cell.iso === todayISO;

                    return html`
                      <button
                        type="button"
                        class="cal-day-cell ${cell.isOtherMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}"
                        @click=${() => this._selectDate(cell.iso)}
                      >${cell.dayNum}</button>
                    `;
                  })}
                </div>
              </div>

              <!-- Right Time Pane -->
              <div class="time-pane">
                <div class="time-header">
                  <div>Hour</div>
                  <div>Min</div>
                </div>
                <div class="time-columns">
                  <!-- Hours Column -->
                  <div class="col-list col-hours">
                    ${hours.map(h => {
                      const isSelected = h === currH;
                      const hLabel = String(h).padStart(2, '0');
                      return html`
                        <button
                          type="button"
                          class="col-item ${isSelected ? 'selected' : ''}"
                          @click=${() => this._selectHour(h)}
                        >${hLabel}</button>
                      `;
                    })}
                  </div>

                  <!-- Minutes Column -->
                  <div class="col-list col-mins">
                    ${minutes.map(m => {
                      const isSelected = m === currM;
                      const mLabel = String(m).padStart(2, '0');
                      return html`
                        <button
                          type="button"
                          class="col-item ${isSelected ? 'selected' : ''}"
                          @click=${() => this._selectMinute(m)}
                        >${mLabel}</button>
                      `;
                    })}
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Toolbar -->
            <div class="popover-footer">
              <div class="footer-shortcuts">
                <button type="button" class="footer-btn" @click=${this._selectToday}>Today</button>
                <button type="button" class="footer-btn" @click=${this._selectNow}>Now</button>
                <button type="button" class="footer-btn" @click=${this._selectEndOfDay}>23:59</button>
                ${!this.required ? html`
                  <button type="button" class="footer-btn clear" @click=${this._clear}>Clear</button>
                ` : ''}
              </div>
              <button type="button" class="footer-btn done-btn" @click=${() => this.isOpen = false}>Done ✓</button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('crono-datetime-picker', CronoDatetimePicker);
