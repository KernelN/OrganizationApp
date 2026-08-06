import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { appState, AppStateController } from '../../state/app-state.js';
import './history-stats.js';

/**
 * <crono-history-view> — Grouped completed tasks list view.
 */
export class CronoHistoryView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--space-md);
        overflow-y: auto;
      }
      .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .tag-group {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }
      .group-title {
        font-weight: 600;
        font-size: 14px;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }
      .task-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-xs) 0;
        border-bottom: 1px dashed var(--border);
        font-size: 13px;
      }
      .task-item:last-child {
        border-bottom: none;
      }
      .task-date {
        font-size: 11px;
        color: var(--text-muted);
      }
    `
  ];

  static properties = {
    completedTasks: { type: Array }
  };

  constructor() {
    super();
    this.appStateCtrl = new AppStateController(this);
    this.completedTasks = [];
  }

  async connectedCallback() {
    super.connectedCallback();
    this.completedTasks = await appState.dal.getCompletedTasks();
  }

  render() {
    const tags = appState.tags || [];

    // Group completed tasks by tag
    const grouped = {};
    for (const t of this.completedTasks) {
      const tagId = Array.isArray(t.tag_ids) && t.tag_ids[0] ? t.tag_ids[0] : 'untagged';
      if (!grouped[tagId]) grouped[tagId] = [];
      grouped[tagId].push(t);
    }

    return html`
      <div class="history-header">
        <h2 style="margin: 0; font-size: 18px;">Completed Tasks History</h2>
      </div>

      <crono-history-stats
        .completedTasks=${this.completedTasks}
        .timeLogs=${appState.timeLogs || []}
      ></crono-history-stats>

      ${Object.keys(grouped).length === 0
        ? html`<div style="text-align:center; padding:var(--space-2xl); color:var(--text-secondary);">No completed tasks yet.</div>`
        : Object.entries(grouped).map(([tagId, list]) => {
            const tagObj = tags.find(tg => tg.id === tagId);
            const title = tagObj ? tagObj.name : 'Untagged';
            const color = tagObj ? tagObj.color : '#6366F1';

            return html`
              <div class="tag-group">
                <div class="group-title">
                  <span style="width:10px; height:10px; border-radius:50%; background-color:${color}"></span>
                  <span>🏷 ${title} (${list.length})</span>
                </div>
                ${list.map(t => html`
                  <div class="task-item">
                    <span>✅ ${t.title}</span>
                    <span class="task-date">${t.completed_at ? t.completed_at.replace('T', ' ').substring(0, 16) : ''}</span>
                  </div>
                `)}
              </div>
            `;
          })}
    `;
  }
}

customElements.define('crono-history-view', CronoHistoryView);
