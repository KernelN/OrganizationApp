import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';

/**
 * <crono-confirm-dialog> — Modal confirmation dialog for destructive actions.
 */
export class CronoConfirmDialog extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 9000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-md);
      }
      .modal {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        width: 100%;
        max-width: 400px;
        box-shadow: var(--shadow-lg);
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }
      .title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }
      .message {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-sm);
        margin-top: var(--space-sm);
      }
    `
  ];

  static properties = {
    open: { type: Boolean },
    title: { type: String },
    message: { type: String },
    confirmText: { type: String, attribute: 'confirm-text' },
    cancelText: { type: String, attribute: 'cancel-text' }
  };

  constructor() {
    super();
    this.open = false;
    this.title = 'Confirm Action';
    this.message = 'Are you sure you want to proceed?';
    this.confirmText = 'Confirm';
    this.cancelText = 'Cancel';
  }

  _onConfirm() {
    this.dispatchEvent(new CustomEvent('crono-confirm', { bubbles: true, composed: true }));
    this.open = false;
  }

  _onCancel() {
    this.dispatchEvent(new CustomEvent('crono-cancel', { bubbles: true, composed: true }));
    this.open = false;
  }

  render() {
    if (!this.open) return html``;
    return html`
      <div class="backdrop" @click=${this._onCancel}>
        <div class="modal" @click=${(e) => e.stopPropagation()}>
          <h3 class="title">${this.title}</h3>
          <p class="message">${this.message}</p>
          <div class="actions">
            <button class="crono-btn crono-btn-secondary" @click=${this._onCancel}>
              ${this.cancelText}
            </button>
            <button class="crono-btn crono-btn-danger" @click=${this._onConfirm}>
              ${this.confirmText}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('crono-confirm-dialog', CronoConfirmDialog);
