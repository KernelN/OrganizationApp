import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { hexToRgba } from '../../utils/color-utils.js';
import '../shared/alert-badge.js';

/**
 * <crono-task-card> — Summary card representation of a task.
 */
export class CronoTaskCard extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .card {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        cursor: pointer;
        transition: transform var(--transition-fast), border-color var(--transition-fast);
      }
      .card:hover {
        transform: translateY(-2px);
        border-color: var(--border-hover);
      }
      .left-section {
        display: flex;
        align-items: center;
        gap: var(--space-md);
      }
      .color-strip {
        width: 4px;
        height: 36px;
        border-radius: var(--radius-sm);
      }
      .info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .title {
        font-size: 14px;
        font-weight: 600;
      }
      .meta {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        font-size: 12px;
        color: var(--text-secondary);
      }
      .priority-badge {
        font-family: var(--font-mono);
        font-size: 11px;
        padding: 2px 6px;
        background: var(--bg-surface);
        border-radius: var(--radius-sm);
      }
      .actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }
    `
  ];

  static properties = {
    task: { type: Object },
    tags: { type: Array }
  };

  constructor() {
    super();
    this.task = null;
    this.tags = [];
  }

  _onClick() {
    this.dispatchEvent(new CustomEvent('crono-task-click', {
      detail: { task: this.task },
      bubbles: true,
      composed: true
    }));
  }

  _onComplete(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('crono-task-complete', {
      detail: { task: this.task },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    if (!this.task) return html``;

    const color = this.task.color || '#6366F1';
    const tagNames = (this.task.tag_ids || [])
      .map(id => (this.tags.find(t => t.id === id) || {}).name)
      .filter(Boolean)
      .join(', ');

    return html`
      <div class="card" @click=${this._onClick}>
        <div class="left-section">
          <button
            class="crono-btn crono-btn-icon"
            title="Complete Task"
            @click=${this._onComplete}
          >
            ⚪
          </button>
          <div class="color-strip" style="background-color: ${color}"></div>
          <div class="info">
            <div class="title">${this.task.title}</div>
            <div class="meta">
              <span class="priority-badge">P:${this.task.priority || 0}</span>
              <span>⏱ ${this.task.duration_hours}h</span>
              ${tagNames ? html`<span>🏷 ${tagNames}</span>` : ''}
              ${this.task.deadline ? html`<span>📅 ${this.task.deadline.split('T')[0]}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="actions">
          <crono-alert-badge .level=${this.task._alert_level || 'none'}></crono-alert-badge>
        </div>
      </div>
    `;
  }
}

customElements.define('crono-task-card', CronoTaskCard);
