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
    timeWindows: { type: Object }
  };

  constructor() {
    super();
    this.timeWindows = {
      monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
    };
  }

  _addWindow(day) {
    const current = Array.isArray(this.timeWindows[day]) ? [...this.timeWindows[day]] : [];
    current.push({ start: '09:00', end: '12:00' });
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
        return html`
          <div class="day-row">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="day-name">${day}</span>
              <button
                type="button"
                class="crono-btn crono-btn-secondary crono-btn-sm"
                @click=${() => this._addWindow(day)}
              >+ Add Window</button>
            </div>
            <div class="windows-list">
              ${windows.map((w, idx) => html`
                <div class="window-item">
                  <crono-time-range-input
                    .start=${w.start}
                    .end=${w.end}
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
          </div>
        `;
      })}
    `;
  }
}

customElements.define('crono-tag-time-window-editor', CronoTagTimeWindowEditor);
