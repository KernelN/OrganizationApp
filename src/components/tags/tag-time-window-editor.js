import { LitElement, html, css } from 'lit';
import { DAYS_OF_WEEK } from '../../utils/date-utils.js';
import '../shared/time-range-input.js';

export class TagTimeWindowEditor extends LitElement {
  static properties = {
    timeWindows: { type: Object }
  };

  static styles = css`
    :host {
      display: block;
    }

    .editor-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .day-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px 12px;
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
    }

    .day-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: capitalize;
    }

    .window-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .window-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .btn-add {
      background: transparent;
      border: none;
      color: var(--color-accent, #6366F1);
      cursor: pointer;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .btn-remove {
      background: transparent;
      border: none;
      color: var(--color-text-secondary, #9CA3AF);
      cursor: pointer;
      font-size: 1rem;
      padding: 2px 6px;
    }
  `;

  constructor() {
    super();
    this.timeWindows = {};
  }

  addWindow(day) {
    const current = this.timeWindows[day] || [];
    this.timeWindows = {
      ...this.timeWindows,
      [day]: [...current, { start: '09:00', end: '17:00' }]
    };
    this.emitChange();
  }

  removeWindow(day, index) {
    const current = this.timeWindows[day] || [];
    this.timeWindows = {
      ...this.timeWindows,
      [day]: current.filter((_, i) => i !== index)
    };
    this.emitChange();
  }

  updateWindow(day, index, range) {
    const current = [...(this.timeWindows[day] || [])];
    current[index] = range;
    this.timeWindows = {
      ...this.timeWindows,
      [day]: current
    };
    this.emitChange();
  }

  emitChange() {
    this.dispatchEvent(
      new CustomEvent('time-windows-change', {
        detail: { timeWindows: this.timeWindows }
      })
    );
  }

  render() {
    return html`
      <div class="editor-container">
        ${DAYS_OF_WEEK.map(day => {
          const windows = this.timeWindows[day] || [];
          return html`
            <div class="day-row">
              <div class="day-header">
                <span>${day}</span>
                <button class="btn-add" type="button" @click="${() => this.addWindow(day)}">
                  + Add Window
                </button>
              </div>

              <div class="window-list">
                ${windows.length === 0
                  ? html`<span style="font-size: 0.75rem; color: var(--color-text-muted);">No windows</span>`
                  : windows.map(
                      (win, idx) => html`
                        <div class="window-item">
                          <time-range-input
                            .start="${win.start}"
                            .end="${win.end}"
                            @range-change="${(e) => this.updateWindow(day, idx, e.detail)}"
                          ></time-range-input>
                          <button
                            class="btn-remove"
                            type="button"
                            @click="${() => this.removeWindow(day, idx)}"
                          >
                            ✕
                          </button>
                        </div>
                      `
                    )}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('tag-time-window-editor', TagTimeWindowEditor);
