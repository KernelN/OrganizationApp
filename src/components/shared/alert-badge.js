import { LitElement, html, css } from 'lit';

export class AlertBadge extends LitElement {
  static properties = {
    level: { type: String } // 'none' | 'orange' | 'red'
  };

  static styles = css`
    :host {
      display: inline-block;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .badge-orange {
      background: rgba(245, 158, 11, 0.15);
      color: #F59E0B;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .badge-red {
      background: rgba(239, 68, 68, 0.15);
      color: #EF4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
  `;

  render() {
    if (!this.level || this.level === 'none') {
      return html``;
    }

    if (this.level === 'red') {
      return html`<span class="badge badge-red">🚨 Red Alert</span>`;
    }

    if (this.level === 'orange') {
      return html`<span class="badge badge-orange">⚠️ Approaching</span>`;
    }

    return html``;
  }
}

customElements.define('alert-badge', AlertBadge);
