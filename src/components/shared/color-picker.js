import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';

const PRESET_COLORS = [
  '#6366F1', '#3B82F6', '#06B6D4', '#10B981',
  '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'
];

/**
 * <crono-color-picker> — Color picker with preset swatches and custom hex input.
 */
export class CronoColorPicker extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .container {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }
      .swatches {
        display: flex;
        gap: var(--space-xs);
        flex-wrap: wrap;
      }
      .swatch {
        width: 28px;
        height: 28px;
        border-radius: var(--radius-sm);
        border: 2px solid transparent;
        cursor: pointer;
        transition: transform var(--transition-fast), border-color var(--transition-fast);
      }
      .swatch:hover {
        transform: scale(1.1);
      }
      .swatch.selected {
        border-color: var(--text-primary);
        transform: scale(1.1);
      }
      .custom-row {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }
      .color-preview {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border);
      }
    `
  ];

  static properties = {
    value: { type: String }
  };

  constructor() {
    super();
    this.value = '#6366F1';
  }

  _selectColor(hex) {
    this.value = hex;
    this._dispatchChange();
  }

  _onInput(e) {
    const val = e.target.value;
    this.value = val;
    this._dispatchChange();
  }

  _dispatchChange() {
    this.dispatchEvent(new CustomEvent('crono-color-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="container">
        <div class="swatches">
          ${PRESET_COLORS.map(
            (c) => html`
              <button
                class="swatch ${this.value.toUpperCase() === c.toUpperCase() ? 'selected' : ''}"
                style="background-color: ${c}"
                @click=${() => this._selectColor(c)}
              ></button>
            `
          )}
        </div>
        <div class="custom-row">
          <input
            type="color"
            class="color-preview"
            .value=${this.value}
            @input=${this._onInput}
          />
          <input
            type="text"
            class="crono-input"
            .value=${this.value}
            @input=${this._onInput}
            placeholder="#6366F1"
          />
        </div>
      </div>
    `;
  }
}

customElements.define('crono-color-picker', CronoColorPicker);
