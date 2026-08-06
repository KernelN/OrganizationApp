import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { eventBus } from '../../state/event-bus.js';

/**
 * <crono-toast-notification> — Toast notification overlay element.
 */
export class CronoToastNotification extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        position: fixed;
        bottom: var(--space-lg);
        right: var(--space-lg);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        pointer-events: none;
      }

      .toast {
        pointer-events: auto;
        min-width: 280px;
        max-width: 420px;
        padding: var(--space-md);
        border-radius: var(--radius-md);
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        color: var(--text-primary);
        font-size: 13px;
        animation: slideIn 250ms ease-out forwards;
      }

      .toast-success { border-left: 4px solid var(--success); }
      .toast-error { border-left: 4px solid var(--alert-red); }
      .toast-warning { border-left: 4px solid var(--alert-orange); }
      .toast-info { border-left: 4px solid var(--accent); }

      .close-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 16px;
      }
      .close-btn:hover { color: var(--text-primary); }

      @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `
  ];

  static properties = {
    toasts: { type: Array }
  };

  constructor() {
    super();
    this.toasts = [];
    this._unsub = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsub = eventBus.on('toast:show', (detail) => {
      this.addToast(detail);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsub) this._unsub();
  }

  addToast({ message, type = 'info', duration = 4000 }) {
    const id = Math.random().toString(36).substring(2);
    const toast = { id, message, type };
    this.toasts = [...this.toasts, toast];

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }
  }

  removeToast(id) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  render() {
    return html`
      ${this.toasts.map(
        (t) => html`
          <div class="toast toast-${t.type}">
            <span>${t.message}</span>
            <button class="close-btn" @click=${() => this.removeToast(t.id)}>✕</button>
          </div>
        `
      )}
    `;
  }
}

customElements.define('crono-toast-notification', CronoToastNotification);
