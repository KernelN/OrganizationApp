import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { parseHHMMToMins, formatHHMM, diffHours, addHours } from '../../utils/date-utils.js';
import './time-picker-24h.js';

/**
 * <crono-time-range-input> — Component for selecting start and end 24h time range with auto interval shifting.
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
      .separator {
        color: var(--text-muted);
        font-weight: 500;
        font-size: 12px;
      }
    `
  ];

  static properties = {
    start: { type: String },
    end: { type: String },
    min: { type: String },
    max: { type: String },
    allowedIntervals: { type: Array }
  };

  constructor() {
    super();
    this.start = '09:00';
    this.end = '17:00';
    this.min = '';
    this.max = '';
    this.allowedIntervals = null;
  }

  _findIntervalForTime(timeStr) {
    if (!Array.isArray(this.allowedIntervals) || this.allowedIntervals.length === 0) {
      return { start: this.min || '00:00', end: this.max || '23:59' };
    }
    const mins = parseHHMMToMins(timeStr);
    const found = this.allowedIntervals.find(inv => {
      const s = parseHHMMToMins(inv.start);
      const e = parseHHMMToMins(inv.end);
      return mins >= s && mins <= e;
    });
    if (found) return found;

    let closest = this.allowedIntervals[0];
    let minDiff = Infinity;
    for (const inv of this.allowedIntervals) {
      const s = parseHHMMToMins(inv.start);
      const e = parseHHMMToMins(inv.end);
      const diff = Math.min(Math.abs(mins - s), Math.abs(mins - e));
      if (diff < minDiff) {
        minDiff = diff;
        closest = inv;
      }
    }
    return closest;
  }

  _onChange() {
    this.dispatchEvent(new CustomEvent('crono-time-range-change', {
      detail: { start: this.start, end: this.end },
      bubbles: true,
      composed: true
    }));
  }

  _onStartChange(e) {
    const newStart = e.detail.value;
    const oldStart = this.start;
    const oldEnd = this.end;

    const prevDuration = Math.max(0.5, diffHours(`2000-01-01T${oldStart}:00Z`, `2000-01-01T${oldEnd}:00Z`));
    const targetInterval = this._findIntervalForTime(newStart);

    let nextEnd = this.end;
    const nextEndMins = parseHHMMToMins(nextEnd);
    const newStartMins = parseHHMMToMins(newStart);
    const invEndMins = parseHHMMToMins(targetInterval.end);
    const invStartMins = parseHHMMToMins(targetInterval.start);

    // If current end is outside this interval or <= newStart, shift end into interval preserving duration
    if (nextEndMins <= newStartMins || nextEndMins > invEndMins || nextEndMins < invStartMins) {
      const calcEndObj = addHours(new Date(`2000-01-01T${newStart}:00Z`), prevDuration);
      let calcEndStr = `${String(calcEndObj.getUTCHours()).padStart(2, '0')}:${String(calcEndObj.getUTCMinutes()).padStart(2, '0')}`;
      if (parseHHMMToMins(calcEndStr) > invEndMins || parseHHMMToMins(calcEndStr) <= newStartMins) {
        calcEndStr = targetInterval.end;
      }
      nextEnd = calcEndStr;
    }

    this.start = newStart;
    this.end = nextEnd;
    this._onChange();
  }

  _onEndChange(e) {
    const newEnd = e.detail.value;
    const oldStart = this.start;
    const oldEnd = this.end;

    const prevDuration = Math.max(0.5, diffHours(`2000-01-01T${oldStart}:00Z`, `2000-01-01T${oldEnd}:00Z`));
    const targetInterval = this._findIntervalForTime(newEnd);

    let nextStart = this.start;
    const nextStartMins = parseHHMMToMins(nextStart);
    const newEndMins = parseHHMMToMins(newEnd);
    const invStartMins = parseHHMMToMins(targetInterval.start);
    const invEndMins = parseHHMMToMins(targetInterval.end);

    // If current start is outside this interval or >= newEnd, shift start into interval preserving duration
    if (nextStartMins >= newEndMins || nextStartMins < invStartMins || nextStartMins > invEndMins) {
      const calcStartObj = addHours(new Date(`2000-01-01T${newEnd}:00Z`), -prevDuration);
      let calcStartStr = `${String(calcStartObj.getUTCHours()).padStart(2, '0')}:${String(calcStartObj.getUTCMinutes()).padStart(2, '0')}`;
      if (parseHHMMToMins(calcStartStr) < invStartMins || parseHHMMToMins(calcStartStr) >= newEndMins) {
        calcStartStr = targetInterval.start;
      }
      nextStart = calcStartStr;
    }

    this.start = nextStart;
    this.end = newEnd;
    this._onChange();
  }

  render() {
    return html`
      <div class="range-row">
        <crono-time-picker-24h
          .value=${this.start}
          .min=${this.min || ''}
          .max=${this.max || ''}
          .allowedIntervals=${this.allowedIntervals}
          @crono-time-change=${this._onStartChange}
        ></crono-time-picker-24h>
        <span class="separator">to</span>
        <crono-time-picker-24h
          .value=${this.end}
          .min=${this.min || ''}
          .max=${this.max || ''}
          .allowedIntervals=${this.allowedIntervals}
          @crono-time-change=${this._onEndChange}
        ></crono-time-picker-24h>
      </div>
    `;
  }
}

customElements.define('crono-time-range-input', CronoTimeRangeInput);
