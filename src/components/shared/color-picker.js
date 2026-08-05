import { LitElement, html, css } from 'lit';

export class ColorPicker extends LitElement {
  static properties = {
    value: { type: String }
  };

  static styles = css`
    :host {
      display: block;
    }

    .color-picker-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .swatches {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .swatch {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid transparent;
      transition: transform 150ms ease, border-color 150ms ease;
    }

    .swatch:hover {
      transform: scale(1.15);
    }

    .swatch.selected {
      border-color: #ffffff;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
    }

    .custom-input {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    input[type="color"] {
      -webkit-appearance: none;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      background: transparent;
    }

    input[type="text"] {
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: 6px;
      padding: 6px 10px;
      color: #fff;
      font-size: 0.875rem;
      width: 100px;
    }
  `;

  constructor() {
    super();
    this.value = '#6366F1';
    this.presets = [
      '#6366F1', // Indigo
      '#3B82F6', // Blue
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#EC4899', // Pink
      '#8B5CF6', // Purple
      '#06B6D4'  // Cyan
    ];
  }

  selectColor(hex) {
    this.value = hex;
    this.dispatchEvent(new CustomEvent('color-change', { detail: { value: hex } }));
  }

  render() {
    return html`
      <div class="color-picker-container">
        <div class="swatches">
          ${this.presets.map(
            hex => html`
              <div
                class="swatch ${this.value?.toUpperCase() === hex.toUpperCase() ? 'selected' : ''}"
                style="background-color: ${hex};"
                @click="${() => this.selectColor(hex)}"
              ></div>
            `
          )}
        </div>
        <div class="custom-input">
          <input
            type="color"
            .value="${this.value || '#6366F1'}"
            @input="${(e) => this.selectColor(e.target.value)}"
          />
          <input
            type="text"
            .value="${this.value || '#6366F1'}"
            @change="${(e) => this.selectColor(e.target.value)}"
          />
        </div>
      </div>
    `;
  }
}

customElements.define('color-picker', ColorPicker);
