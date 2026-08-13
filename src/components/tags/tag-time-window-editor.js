import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import '../shared/time-range-input.js';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * <crono-tag-time-window-editor> — Per-day-of-week time windows configuration component.
 */
export class CronoTagTimeWindowEditor extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .day-row {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        padding: var(--space-sm) 0;
        border-bottom: 1px solid var(--border);
      }
      .day-name {
        font-weight: 600;
        text-transform: capitalize;
        font-size: 13px;
      }
      .windows-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }
      .window-item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }
    `
  ];

  static properties = {
    timeWindows: { type: Object },
    parentWindows: { type: Object }
  };

  constructor() {
    super();
    this.timeWindows = {
      monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
    };
    this.parentWindows = null;
  }

  _addWindow(day) {
    const current = Array.isArray(this.timeWindows[day]) ? [...this.timeWindows[day]] : [];
    // If parent has a window for this day, default to parent's start/end
    const pWindows = this.parentWindows && Array.isArray(this.parentWindows[day]) ? this.parentWindows[day] : [];
    const defaultStart = pWindows.length > 0 ? pWindows[0].start : '09:00';
    const defaultEnd = pWindows.length > 0 ? pWindows[0].end : '12:00';
    current.push({ start: defaultStart, end: defaultEnd });
    this.timeWindows = { ...this.timeWindows, [day]: current };
    this._dispatchChange();
  }

  _removeWindow(day, idx) {
    const current = Array.isArray(this.timeWindows[day]) ? [...this.timeWindows[day]] : [];
    current.splice(idx, 1);
    this.timeWindows = { ...this.timeWindows, [day]: current };
    this._dispatchChange();
  }

  _updateRange(day, idx, range) {
    const current = Array.isArray(this.timeWindows[day]) ? [...this.timeWindows[day]] : [];
    current[idx] = range;
    this.timeWindows = { ...this.timeWindows, [day]: current };
    this._dispatchChange();
  }

  _dispatchChange() {
    this.dispatchEvent(new CustomEvent('crono-windows-change', {
      detail: { timeWindows: this.timeWindows },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      ${DAYS.map(day => {
        const windows = Array.isArray(this.timeWindows[day]) ? this.timeWindows[day] : [];
        const hasParentConstraint = Boolean(this.parentWindows);
        const pWindows = this.parentWindows && Array.isArray(this.parentWindows[day]) ? this.parentWindows[day] : [];
        const isDayAllowed = !hasParentConstraint || pWindows.length > 0;

        let minBound = '';
        let maxBound = '';
        if (pWindows.length > 0) {
          const starts = pWindows.map(w => w.start).sort();
          const ends = pWindows.map(w => w.end).sort();
          minBound = starts[0];
          maxBound = ends[ends.length - 1];
        }

        const pHint = pWindows.length > 0 ? pWindows.map(w => `${w.start}-${w.end}`).join(', ') : null;

        return html`
          <div class="day-row" style="${!isDayAllowed ? 'opacity: 0.55;' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="day-name">
                ${day}
                ${pHint ? html`<span style="font-size: 11px; font-weight: normal; color: var(--accent); margin-left: 6px;">(Parent: ${pHint})</span>` : ''}
                ${hasParentConstraint && !isDayAllowed ? html`<span style="font-size: 11px; font-weight: normal; color: var(--text-muted); margin-left: 6px;">(Not allowed in parent tag)</span>` : ''}
              </span>
              ${isDayAllowed ? html`
                <button
                  type="button"
                  class="crono-btn crono-btn-secondary crono-btn-sm"
                  @click=${() => this._addWindow(day)}
                >+ Add Window</button>
              ` : html`
                <span style="font-size: 11px; color: var(--text-muted);">Disabled</span>
              `}
            </div>
            ${isDayAllowed ? html`
              <div class="windows-list">
                ${windows.map((w, idx) => html`
                  <div class="window-item">
                    <crono-time-range-input
                      .start=${w.start}
                      .end=${w.end}
                      .min=${minBound}
                      .max=${maxBound}
                      .allowedIntervals=${pWindows.length > 0 ? pWindows : null}
                      @crono-time-range-change=${e => this._updateRange(day, idx, e.detail)}
                    ></crono-time-range-input>
                    <button
                      type="button"
                      class="crono-btn crono-btn-icon"
                      @click=${() => this._removeWindow(day, idx)}
                    >✕</button>
                  </div>
                `)}
              </div>
            ` : ''}
          </div>
        `;
      })}
    `;
  }
}

customElements.define('crono-tag-time-window-editor', CronoTagTimeWindowEditor);

