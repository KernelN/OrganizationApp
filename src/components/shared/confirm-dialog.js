import { LitElement, html, css } from 'lit';

export class ConfirmDialog extends LitElement {
  static properties = {
    open: { type: Boolean },
    title: { type: String },
    message: { type: String },
    confirmText: { type: String }
  };

  static styles = css`
    :host {
      display: block;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: var(--z-modal, 400);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 200ms ease;
    }

    .backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    .dialog {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-xl, 16px);
      padding: var(--space-6, 24px);
      width: 90%;
      max-width: 400px;
      box-shadow: var(--shadow-lg);
    }

    .title {
      font-family: var(--font-family-display, sans-serif);
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .message {
      color: var(--color-text-secondary, #9CA3AF);
      font-size: 0.875rem;
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn-danger {
      background: #EF4444;
      color: #ffffff;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      border: none;
    }

    .btn-secondary {
      background: var(--color-bg-surface-hover, #232631);
      color: var(--color-text-primary, #F3F4F6);
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid var(--color-border, #2E3242);
    }
  `;

  constructor() {
    super();
    this.open = false;
    this.title = 'Are you sure?';
    this.message = 'This action cannot be undone.';
    this.confirmText = 'Delete';
  }

  cancel() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  confirm() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('confirm'));
  }

  render() {
    return html`
      <div class="backdrop ${this.open ? 'open' : ''}">
        <div class="dialog">
          <div class="title">${this.title}</div>
          <div class="message">${this.message}</div>
          <div class="actions">
            <button class="btn-secondary" @click="${this.cancel}">Cancel</button>
            <button class="btn-danger" @click="${this.confirm}">${this.confirmText}</button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('confirm-dialog', ConfirmDialog);
