import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';

/**
 * <crono-alert-badge> — Renders Orange or Red alert indicator chip.
 */
export class CronoAlertBadge extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: inline-block;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .badge-orange {
        background: hsla(30, 100%, 60%, 0.15);
        color: var(--alert-orange);
        border: 1px solid var(--alert-orange);
      }
      .badge-red {
        background: hsla(0, 85%, 60%, 0.2);
        color: var(--alert-red);
        border: 1px solid var(--alert-red);
        animation: pulse-red-alert 2s infinite;
      }
    `
  ];

  static properties = {
    level: { type: String } // 'none' | 'orange' | 'red'
  };

  constructor() {
    super();
    this.level = 'none';
  }

  render() {
    if (this.level === 'red') {
      return html`<span class="badge badge-red">🔴 Red Alert</span>`;
    }
    if (this.level === 'orange') {
      return html`<span class="badge badge-orange">⚠ Orange Alert</span>`;
    }
    return html``;
  }
}

customElements.define('crono-alert-badge', CronoAlertBadge);
