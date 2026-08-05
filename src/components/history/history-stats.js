import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';

export class HistoryStats extends LitElement {
  static properties = {};

  static styles = css`
    :host {
      display: block;
      margin-bottom: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-lg, 12px);
      padding: var(--space-4, 16px);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .stat-value {
      font-family: var(--font-family-display, sans-serif);
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-accent, #6366F1);
    }

    .stat-label {
      font-size: 0.8125rem;
      color: var(--color-text-secondary, #9CA3AF);
    }

    .breakdown-card {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-lg, 12px);
      padding: var(--space-4, 16px);
    }

    .tag-bar-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 12px;
    }

    .tag-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.8125rem;
    }

    .bar-bg {
      height: 8px;
      background: var(--color-bg-base, #121318);
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 300ms ease;
    }
  `;

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
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const totalCompletedCount = completedTasks.length;

    const totalMinutes = completedTasks.reduce((acc, t) => {
      const mins = t.duration_hours != null ? Math.round(t.duration_hours * 60) : (t.duration_minutes || 30);
      return acc + mins;
    }, 0);

    const totalHours = (totalMinutes / 60).toFixed(1);

    const tags = appState.tags || [];

    return html`
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${totalCompletedCount}</div>
          <div class="stat-label">Tasks Completed</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">${totalHours} hrs</div>
          <div class="stat-label">Total Time Completed</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">${tasks.length > 0 ? Math.round((totalCompletedCount / tasks.length) * 100) : 0}%</div>
          <div class="stat-label">Completion Rate</div>
        </div>
      </div>

      <div class="breakdown-card">
        <h4 style="font-size: 0.9375rem; font-weight: 700;">Completion Breakdown by Tag</h4>
        ${tags.length === 0
          ? html`<div style="font-size: 0.8125rem; color: var(--color-text-muted); margin-top: 8px;">No tags available</div>`
          : tags.map(tag => {
              const tagCompleted = completedTasks.filter(t => t.tag_ids?.includes(tag.id));
              const pct = totalCompletedCount > 0 ? Math.round((tagCompleted.length / totalCompletedCount) * 100) : 0;

              return html`
                <div class="tag-bar-row">
                  <div class="tag-info">
                    <span>🏷️ ${tag.name} (${tagCompleted.length} tasks)</span>
                    <span>${pct}%</span>
                  </div>
                  <div class="bar-bg">
                    <div
                      class="bar-fill"
                      style="width: ${pct}%; background-color: ${tag.color || '#3B82F6'};"
                    ></div>
                  </div>
                </div>
              `;
            })}
      </div>
    `;
  }
}

customElements.define('history-stats', HistoryStats);
