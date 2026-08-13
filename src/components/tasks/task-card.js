import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { hexToRgba } from '../../utils/color-utils.js';
import '../shared/alert-badge.js';

/**
 * <crono-task-card> — Summary card representation of a task with recurrence, accumulation, and schedule mode badges.
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
        transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
      }
      .card:hover {
        transform: translateY(-2px);
        border-color: var(--border-hover);
        box-shadow: var(--shadow-md);
      }
      .left-section {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        overflow: hidden;
      }
      .color-strip {
        width: 4px;
        height: 38px;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
      }
      .info {
        display: flex;
        flex-direction: column;
        gap: 3px;
        overflow: hidden;
      }
      .title-row {
        display: flex;
        align-items: center;
        gap: 6px;
        overflow: hidden;
      }
      .title {
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .meta {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        font-size: 12px;
        color: var(--text-secondary);
        flex-wrap: wrap;
      }
      .priority-badge {
        font-family: var(--font-mono);
        font-size: 11px;
        padding: 2px 6px;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
      }
      .mode-badge {
        font-size: 11px;
        padding: 1px 6px;
        border-radius: var(--radius-sm);
        background: var(--bg-surface);
        border: 1px solid var(--border);
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }
      .accumulated-badge {
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 700;
        padding: 2px 7px;
        background: var(--accent-muted);
        color: var(--accent);
        border: 1px solid var(--accent);
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        animation: pulseBadge 2s infinite ease-in-out;
      }
      @keyframes pulseBadge {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-shrink: 0;
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

    const isLocked = Boolean(this.task.manual_schedule);
    const isRecurring = Boolean(this.task.recurrence);
    const accCount = this.task.accumulated_count || 0;

    return html`
      <div class="card" @click=${this._onClick}>
        <div class="left-section">
          <button
            class="crono-btn crono-btn-icon"
            title=${accCount > 0 ? `Complete 1 instance (${accCount} accumulated backlog)` : 'Complete Task'}
            @click=${this._onComplete}
          >
            ⚪
          </button>
          <div class="color-strip" style="background-color: ${color}"></div>
          <div class="info">
            <div class="title-row">
              <div class="title">${this.task.title}</div>
              ${accCount > 0 ? html`
                <span class="accumulated-badge" title="${accCount} missed instances accumulated">
                  ⚡ x${accCount + 1}
                </span>
              ` : ''}
            </div>
            <div class="meta">
              <span class="priority-badge">P:${this.task.priority || 0}</span>
              <span class="mode-badge">${isLocked ? '🔒 Locked' : '🤖 Auto'}</span>
              ${isRecurring ? html`
                <span class="mode-badge">
                  🔄 ${this.task.recurrence.type}${this.task.recurrence.max_repeats ? ` (${this.task.recurrence.iterations_completed || 0}/${this.task.recurrence.max_repeats})` : ''}
                </span>
              ` : ''}
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
