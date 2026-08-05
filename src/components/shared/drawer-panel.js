import { LitElement, html, css } from 'lit';

export class DrawerPanel extends LitElement {
  static properties = {
    open: { type: Boolean },
    title: { type: String }
  };

  static styles = css`
    :host {
      display: block;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: var(--z-drawer, 300);
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--transition-normal, 250ms ease);
    }

    .backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 480px;
      background: var(--color-bg-surface, #1A1C23);
      border-left: 1px solid var(--color-border, #2E3242);
      z-index: calc(var(--z-drawer, 300) + 1);
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform var(--transition-normal, 250ms ease);
      box-shadow: var(--shadow-lg);
    }

    .drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4, 16px) var(--space-6, 24px);
      border-bottom: 1px solid var(--color-border, #2E3242);
    }

    .drawer-title {
      font-family: var(--font-family-display, sans-serif);
      font-size: var(--font-size-xl, 1.25rem);
      font-weight: 700;
    }

    .close-btn {
      background: transparent;
      border: none;
      font-size: 1.25rem;
      color: var(--color-text-secondary, #9CA3AF);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: var(--radius-sm, 6px);
      transition: background 150ms ease;
    }

    .close-btn:hover {
      background: var(--color-bg-surface-hover, #232631);
      color: var(--color-text-primary, #F3F4F6);
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-6, 24px);
    }

    .drawer-footer {
      padding: var(--space-4, 16px) var(--space-6, 24px);
      border-top: 1px solid var(--color-border, #2E3242);
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3, 12px);
      background: var(--color-bg-base, #121318);
    }
  `;

  constructor() {
    super();
    this.open = false;
    this.title = '';
  }

  close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('drawer-close'));
  }

  render() {
    return html`
      <div class="backdrop ${this.open ? 'open' : ''}" @click="${this.close}"></div>
      <aside class="drawer ${this.open ? 'open' : ''}">
        <div class="drawer-header">
          <h2 class="drawer-title">${this.title}</h2>
          <button class="close-btn" @click="${this.close}">✕</button>
        </div>
        <div class="drawer-body">
          <slot></slot>
        </div>
        <div class="drawer-footer">
          <slot name="footer"></slot>
        </div>
      </aside>
    `;
  }
}

customElements.define('drawer-panel', DrawerPanel);
