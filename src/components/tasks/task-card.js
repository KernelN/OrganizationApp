import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';
import { scheduleState } from '../../state/schedule-state.js';
import '../shared/alert-badge.js';

export class TaskCard extends LitElement {
  static properties = {
    task: { type: Object }
  };

  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-lg, 12px);
      padding: var(--space-4, 16px);
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
    }

    .card:hover {
      border-color: var(--color-border, #2E3242);
      box-shadow: var(--shadow-md);
    }

    .card.completed {
      opacity: 0.6;
    }

    .card.completed .title {
      text-decoration: line-through;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .checkbox {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 2px solid var(--color-border, #2E3242);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 150ms ease, border-color 150ms ease;
    }

    .checkbox.checked {
      background: var(--color-accent, #6366F1);
      border-color: var(--color-accent, #6366F1);
      color: #fff;
    }

    .title {
      font-weight: 600;
      font-size: 1rem;
      color: var(--color-text-primary, #F3F4F6);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .icon-btn {
      background: transparent;
      border: none;
      color: var(--color-text-secondary, #9CA3AF);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: color 150ms ease, background 150ms ease;
    }

    .icon-btn:hover {
      background: var(--color-bg-surface-hover, #232631);
      color: var(--color-text-primary, #F3F4F6);
    }

    .meta-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.8125rem;
      color: var(--color-text-secondary, #9CA3AF);
    }

    .tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .priority-badge {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-text-muted, #6B7280);
    }
  `;

  toggleCompletion() {
    const isCompleted = this.task.status === 'completed';
    appState.updateTask(this.task.id, {
      status: isCompleted ? 'active' : 'completed',
      completed_at: isCompleted ? null : new Date().toISOString()
    });
  }

  editTask() {
    this.dispatchEvent(new CustomEvent('edit-task', { detail: { task: this.task }, bubbles: true, composed: true }));
  }

  deleteTask() {
    this.dispatchEvent(new CustomEvent('delete-task', { detail: { task: this.task }, bubbles: true, composed: true }));
  }

  render() {
    if (!this.task) return html``;

    const isCompleted = this.task.status === 'completed';
    const taskTags = appState.tags.filter(t => this.task.tag_ids?.includes(t.id));

    // Find if schedule worker generated alerts for this task
    const alert = scheduleState.alerts.find(a => a.task_id === this.task.id);
    const alertLevel = alert ? alert.level : (this.task._alert_level || 'none');

    return html`
      <div class="card ${isCompleted ? 'completed' : ''}">
        <div class="card-header">
          <div class="title-group">
            <div
              class="checkbox ${isCompleted ? 'checked' : ''}"
              @click="${this.toggleCompletion}"
            >
              ${isCompleted ? '✓' : ''}
            </div>
            <div class="title">${this.task.title}</div>
          </div>
          <div class="actions">
            <alert-badge .level="${alertLevel}"></alert-badge>
            <button class="icon-btn" @click="${this.editTask}" title="Edit Task">✏️</button>
            <button class="icon-btn" @click="${this.deleteTask}" title="Delete Task">🗑️</button>
          </div>
        </div>

        ${this.task.description
          ? html`<div style="font-size: 0.875rem; color: var(--color-text-secondary); line-height: 1.4;">
              ${this.task.description}
            </div>`
          : ''}

        <div class="meta-row">
          <span>⏱️ ${this.task.duration_minutes || 30} mins</span>
          <span class="priority-badge">Priority P${this.task.priority ?? 0}</span>
          ${this.task.deadline
            ? html`<span>📅 Deadline: ${new Date(this.task.deadline).toLocaleDateString()}</span>`
            : ''}

          ${taskTags.map(
            tag => html`
              <span
                class="tag-chip"
                style="background-color: ${tag.color}20; color: ${tag.color}; border: 1px solid ${tag.color}40;"
              >
                🏷️ ${tag.name}
              </span>
            `
          )}
        </div>
      </div>
    `;
  }
}

customElements.define('task-card', TaskCard);
