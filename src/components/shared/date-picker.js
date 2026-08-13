import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { formatDateISO, parseISOToLocalDate } from '../../utils/date-utils.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * <crono-date-picker> — 100% custom calendar date picker with month navigation,
 * today indicator, quick action shortcuts, and smart collision detection.
 *
 * @fires crono-date-change - Fired when the date value changes.
 */
export class CronoDatePicker extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        position: relative;
        width: 100%;
      }
      .date-picker-container {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
      }
      .date-input {
        width: 100%;
        font-family: var(--font-mono);
        font-size: 13px;
        font-weight: 500;
        padding: 6px 10px;
        padding-right: 50px;
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
      .calendar-popover {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        z-index: 1000;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        width: 260px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        user-select: none;
      }
      .calendar-popover.align-right {
        left: auto;
        right: 0;
      }
      .calendar-popover.align-top {
        top: auto;
        bottom: calc(100% + 4px);
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
      .cal-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 10px;
        background: var(--bg-secondary);
        border-top: 1px solid var(--border);
        font-size: 11px;
      }
      .footer-btn {
        background: none;
        border: none;
        color: var(--accent);
        cursor: pointer;
        font-weight: 600;
        padding: 2px 4px;
        border-radius: var(--radius-sm);
      }
      .footer-btn:hover {
        background: hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.1);
      }
      .footer-btn.clear {
        color: var(--text-muted);
      }
      .footer-btn.clear:hover {
        color: var(--danger, #ef4444);
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
    this.min = '';
    this.max = '';
    this.disabled = false;
    this.required = false;
    this.placeholder = 'YYYY-MM-DD';
    this.isOpen = false;
    this.alignRight = false;
    this.alignTop = false;

    const today = new Date();
    this.viewYear = today.getFullYear();
    this.viewMonth = today.getMonth();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('value') && this.value) {
      const d = parseISOToLocalDate(this.value);
      if (!isNaN(d.getTime())) {
        this.viewYear = d.getFullYear();
        this.viewMonth = d.getMonth();
      }
    }
  }

  _openPopover() {
    if (this.disabled) return;
    const rect = this.getBoundingClientRect();
    const popoverWidth = 270;
    const popoverHeight = 310;
    this.alignRight = (rect.left + popoverWidth > window.innerWidth - 16);
    this.alignTop = (rect.bottom + popoverHeight > window.innerHeight - 16 && rect.top > popoverHeight);

    if (this.value) {
      const d = parseISOToLocalDate(this.value);
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

  _selectDate(isoStr) {
    this._commitValue(isoStr);
    this.isOpen = false;
  }

  _selectToday(e) {
    e.stopPropagation();
    const todayStr = formatDateISO(new Date());
    this._selectDate(todayStr);
  }

  _clear(e) {
    e.stopPropagation();
    if (this.disabled) return;
    this._commitValue('');
    this.isOpen = false;
  }

  _onInputChange(e) {
    const inputVal = e.target.value.trim();
    if (!inputVal) {
      this._commitValue('');
      return;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(inputVal)) {
      const d = parseISOToLocalDate(inputVal);
      if (!isNaN(d.getTime())) {
        const normalized = formatDateISO(d);
        this._commitValue(normalized);
        this.viewYear = d.getFullYear();
        this.viewMonth = d.getMonth();
        return;
      }
    }
    // Revert invalid format
    e.target.value = this.value || '';
  }

  _commitValue(val) {
    this.value = val;
    const inputEl = this.shadowRoot?.querySelector('.date-input');
    if (inputEl && inputEl.value !== val) {
      inputEl.value = val;
    }
    this.dispatchEvent(new CustomEvent('crono-date-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
    this.requestUpdate();
  }

  _isDateDisabled(isoStr) {
    if (this.min && isoStr < this.min) return true;
    if (this.max && isoStr > this.max) return true;
    return false;
  }

  _generateCalendarCells() {
    const year = this.viewYear;
    const month = this.viewMonth;

    const firstDay = new Date(year, month, 1);
    const firstDayWeekday = (firstDay.getDay() + 6) % 7; // 0=Mon..6=Sun
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
    const todayISO = formatDateISO(new Date());
    const selectedISO = this.value || '';
    const cells = this._generateCalendarCells();

    return html`
      <div class="date-picker-container">
        <input
          type="text"
          class="crono-input date-input"
          .value=${this.value || ''}
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
              title="Clear date"
              @click=${this._clear}
            >✕</button>
          ` : ''}
          <button
            type="button"
            class="action-btn"
            title="Open calendar"
            ?disabled=${this.disabled}
            @click=${() => {
              if (this.isOpen) this.isOpen = false;
              else this._openPopover();
            }}
          >📅</button>
        </div>

        ${this.isOpen ? html`
          <div class="backdrop" @click=${() => this.isOpen = false}></div>
          <div class="calendar-popover ${this.alignRight ? 'align-right' : ''} ${this.alignTop ? 'align-top' : ''}">
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
                const isSelected = cell.iso === selectedISO;
                const isToday = cell.iso === todayISO;
                const isDisabled = this._isDateDisabled(cell.iso);

                return html`
                  <button
                    type="button"
                    class="cal-day-cell ${cell.isOtherMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}"
                    ?disabled=${isDisabled}
                    @click=${() => this._selectDate(cell.iso)}
                  >${cell.dayNum}</button>
                `;
              })}
            </div>

            <div class="cal-footer">
              <button type="button" class="footer-btn" @click=${this._selectToday}>Today</button>
              ${!this.required ? html`
                <button type="button" class="footer-btn clear" @click=${this._clear}>Clear</button>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('crono-date-picker', CronoDatePicker);
