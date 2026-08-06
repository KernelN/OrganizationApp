import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { appState, AppStateController } from '../../state/app-state.js';
import './task-card.js';
import './task-form.js';
import '../shared/drawer-panel.js';

/**
 * <crono-task-list-view> — Tasks list view with filters, sorting, and editing drawer.
 */
export class CronoTaskListView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--space-md);
      }
      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        flex-wrap: wrap;
      }
      .filters {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }
      .select-filter {
        width: 140px;
      }
      .task-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        overflow-y: auto;
        flex: 1;
      }
      .empty-state {
        text-align: center;
        padding: var(--space-2xl);
        color: var(--text-secondary);
      }
    `
  ];

  static properties = {
    selectedTagFilter: { type: String },
    sortBy: { type: String },
    drawerOpen: { type: Boolean },
    editingTask: { type: Object }
  };

  constructor() {
    super();
    this.appStateCtrl = new AppStateController(this);
    this.selectedTagFilter = '';
    this.sortBy = 'priority';
    this.drawerOpen = false;
    this.editingTask = null;
  }

  _openCreateDrawer() {
    this.editingTask = null;
    this.drawerOpen = true;
  }

  _openEditDrawer(task) {
    this.editingTask = task;
    this.drawerOpen = true;
  }

  render() {
    let tasks = (appState.tasks || []).filter(t => t.status === 'active');
    const tags = appState.tags || [];

    if (this.selectedTagFilter) {
      tasks = tasks.filter(t => Array.isArray(t.tag_ids) && t.tag_ids.includes(this.selectedTagFilter));
    }

    if (this.sortBy === 'priority') {
      tasks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    } else if (this.sortBy === 'duration') {
      tasks.sort((a, b) => (a.duration_hours || 0) - (b.duration_hours || 0));
    } else if (this.sortBy === 'deadline') {
      tasks.sort((a, b) => new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31'));
    }

    return html`
      <div class="toolbar">
        <div class="filters">
          <select
            class="crono-select select-filter"
            .value=${this.selectedTagFilter}
            @change=${(e) => (this.selectedTagFilter = e.target.value)}
          >
            <option value="">All Tags</option>
            ${tags.map((tg) => html`<option value=${tg.id}>${tg.name}</option>`)}
          </select>

          <select
            class="crono-select select-filter"
            .value=${this.sortBy}
            @change=${(e) => (this.sortBy = e.target.value)}
          >
            <option value="priority">Priority (High -> Low)</option>
            <option value="duration">Duration (Short -> Long)</option>
            <option value="deadline">Deadline (Earliest)</option>
          </select>
        </div>

        <button class="crono-btn crono-btn-primary" @click=${this._openCreateDrawer}>
          + New Task
        </button>
      </div>

      <div class="task-list">
        ${tasks.length === 0
          ? html`
              <div class="empty-state">
                <p>No active tasks found.</p>
                <button class="crono-btn crono-btn-primary" @click=${this._openCreateDrawer}>
                  Create your first task
                </button>
              </div>
            `
          : tasks.map(
              (task) => html`
                <crono-task-card
                  .task=${task}
                  .tags=${tags}
                  @crono-task-click=${() => this._openEditDrawer(task)}
                  @crono-task-complete=${() => appState.completeTask(task.id)}
                ></crono-task-card>
              `
            )}
      </div>

      <crono-drawer-panel
        .open=${this.drawerOpen}
        .title=${this.editingTask ? 'Edit Task' : 'New Task'}
        @crono-drawer:close=${() => (this.drawerOpen = false)}
      >
        <crono-task-form
          .task=${this.editingTask}
          .tags=${tags}
          .allTasks=${appState.tasks}
          @crono-form-saved=${() => (this.drawerOpen = false)}
        ></crono-task-form>
      </crono-drawer-panel>
    `;
  }
}

customElements.define('crono-task-list-view', CronoTaskListView);
