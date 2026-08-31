import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { appState, AppStateController } from '../../state/app-state.js';
import './task-card.js';
import './task-form.js';
import './task-print-dialog.js';
import '../shared/drawer-panel.js';
import '../shared/confirm-dialog.js';

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
      .toolbar-actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
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
    editingTask: { type: Object },
    taskToDelete: { type: Object },
    printDialogOpen: { type: Boolean }
  };

  constructor() {
    super();
    this.appStateCtrl = new AppStateController(this);
    this.selectedTagFilter = '';
    this.sortBy = 'priority';
    this.drawerOpen = false;
    this.editingTask = null;
    this.taskToDelete = null;
    this.printDialogOpen = false;
  }

  _openCreateDrawer() {
    this.editingTask = null;
    this.drawerOpen = true;
    const form = this.shadowRoot?.querySelector('crono-task-form');
    if (form && typeof form.reset === 'function') {
      form.reset(null);
    }
  }

  _openEditDrawer(task) {
    this.editingTask = task;
    this.drawerOpen = true;
    const form = this.shadowRoot?.querySelector('crono-task-form');
    if (form && typeof form.reset === 'function') {
      form.reset(task);
    }
  }

  _confirmDeleteTask(task) {
    this.taskToDelete = task;
  }

  async _executeDeleteTask() {
    if (this.taskToDelete) {
      const id = this.taskToDelete.id;
      this.taskToDelete = null;
      if (this.editingTask && this.editingTask.id === id) {
        this.drawerOpen = false;
        this.editingTask = null;
      }
      await appState.deleteTask(id);
    }
  }

  render() {
    let tasks = (appState.tasks || []).filter(t => t.status === 'active');
    const tags = appState.tags || [];

    if (this.selectedTagFilter) {
      tasks = tasks.filter(t => Array.isArray(t.tag_ids) && t.tag_ids.includes(this.selectedTagFilter));
    }

    if (this.sortBy === 'priority') {
      tasks.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
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
            ${tags.filter(tg => !tg.archived).map((tg) => html`<option value=${tg.id}>${tg.name}</option>`)}
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

        <div class="toolbar-actions">
          <button class="crono-btn crono-btn-secondary" @click=${() => (this.printDialogOpen = true)}>
            🖨️ Print
          </button>
          <button class="crono-btn crono-btn-primary" @click=${this._openCreateDrawer}>
            + New Task
          </button>
        </div>
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
                  @crono-task-delete=${(e) => this._confirmDeleteTask(e.detail.task)}
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
          @crono-task-delete=${(e) => this._confirmDeleteTask(e.detail.task)}
        ></crono-task-form>
      </crono-drawer-panel>

      <crono-task-print-dialog
        .open=${this.printDialogOpen}
        @crono-print-dialog:close=${() => (this.printDialogOpen = false)}
      ></crono-task-print-dialog>

      <crono-confirm-dialog
        .open=${Boolean(this.taskToDelete)}
        .title=${'Delete Task'}
        .message=${`Are you sure you want to permanently delete task "${this.taskToDelete?.title || ''}"? This will not keep it in history.`}
        confirm-text="Delete"
        cancel-text="Cancel"
        @crono-confirm=${this._executeDeleteTask}
        @crono-cancel=${() => (this.taskToDelete = null)}
      ></crono-confirm-dialog>
    `;
  }
}

customElements.define('crono-task-list-view', CronoTaskListView);

