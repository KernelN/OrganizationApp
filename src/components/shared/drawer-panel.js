import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';

/**
 * <crono-drawer-panel> — Slide-in side drawer (desktop) / bottom sheet (mobile).
 */
export class CronoDrawerPanel extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
        z-index: 8000;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--transition-base);
      }
      .backdrop.open {
        opacity: 1;
        pointer-events: auto;
      }
      .panel {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        max-width: 500px;
        background: var(--bg-secondary);
        border-left: 1px solid var(--border);
        box-shadow: var(--shadow-lg);
        z-index: 8001;
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform var(--transition-slow);
        box-sizing: border-box;
      }
      .panel.open {
        transform: translateX(0);
      }
      .header {
        padding: var(--space-md) var(--space-lg);
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }
      .close-btn {
        font-size: 18px;
        color: var(--text-muted);
      }
      .close-btn:hover {
        color: var(--text-primary);
      }
      .body {
        flex: 1;
        padding: var(--space-lg);
        overflow-y: auto;
        overflow-x: hidden;
      }

      @media (max-width: 1023px) {
        .panel {
          top: auto;
          left: 0;
          right: 0;
          bottom: 0;
          max-width: 100%;
          height: 85vh;
          border-left: none;
          border-top: 1px solid var(--border);
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          transform: translateY(100%);
        }
        .panel.open {
          transform: translateY(0);
        }
      }
    `
  ];

  static properties = {
    open: { type: Boolean, reflect: true },
    title: { type: String }
  };

  constructor() {
    super();
    this.open = false;
    this.title = '';
  }

  _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('crono-drawer:close', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="backdrop ${this.open ? 'open' : ''}" @click=${this._close}></div>
      <div class="panel ${this.open ? 'open' : ''}">
        <div class="header">
          <h3 class="title">${this.title}</h3>
          <button class="crono-btn crono-btn-icon close-btn" @click=${this._close}>✕</button>
        </div>
        <div class="body">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('crono-drawer-panel', CronoDrawerPanel);
