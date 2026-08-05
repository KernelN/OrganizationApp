import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';
import './history-stats.js';

export class HistoryView extends LitElement {
  static properties = {
    searchQuery: { type: String }
  };

  static styles = css`
    :host {
      display: block;
    }

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    input[type="search"] {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 8px 14px;
      color: var(--color-text-primary, #F3F4F6);
      font-size: 0.875rem;
      width: 260px;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .history-card {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-lg, 12px);
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .task-title {
      font-weight: 600;
      font-size: 0.9375rem;
      text-decoration: line-through;
      color: var(--color-text-secondary, #9CA3AF);
    }

    .completed-date {
      font-size: 0.75rem;
      color: var(--color-success, #10B981);
      margin-top: 4px;
    }

    .tag-chip {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 9999px;
      color: #fff;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      background: var(--color-bg-surface, #1A1C23);
      border: 1px dashed var(--color-border, #2E3242);
      border-radius: var(--radius-lg, 12px);
      color: var(--color-text-secondary, #9CA3AF);
    }
  `;

  constructor() {
    super();
    this.searchQuery = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = appState.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    const tasks = appState.tasks || [];
    let completedTasks = tasks.filter(t => t.status === 'completed');

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      completedTasks = completedTasks.filter(t => t.title.toLowerCase().includes(q));
    }

    // Sort by completed_at descending
    completedTasks.sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime());

    return html`
      <history-stats></history-stats>

      <div class="toolbar">
        <h3 style="font-family: var(--font-family-display);">Completed Tasks Log</h3>
        <input
          type="search"
          placeholder="Filter completed tasks..."
          .value="${this.searchQuery}"
          @input="${(e) => (this.searchQuery = e.target.value)}"
        />
      </div>

      <div class="history-list">
        ${completedTasks.length === 0
          ? html`
              <div class="empty-state">
                <h3>No completed tasks</h3>
                <p style="margin-top: 8px;">Complete tasks from the Tasks view to log them in history.</p>
              </div>
            `
          : completedTasks.map(task => {
              const tag = task.tag_ids ? appState.tags.find(t => task.tag_ids.includes(t.id)) : null;
              const dateStr = task.completed_at
                ? new Date(task.completed_at).toLocaleString()
                : 'Completed';

              return html`
                <div class="history-card">
                  <div>
                    <div class="task-title">✓ ${task.title}</div>
                    <div class="completed-date">Completed on ${dateStr}</div>
                  </div>
                  <div>
                    ${tag
                      ? html`<span class="tag-chip" style="background-color: ${tag.color || '#3B82F6'};">
                          🏷️ ${tag.name}
                        </span>`
                      : ''}
                  </div>
                </div>
              `;
            })}
      </div>
    `;
  }
}

customElements.define('history-view', HistoryView);
