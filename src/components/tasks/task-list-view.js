import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';
import './task-card.js';
import './task-form.js';
import '../shared/confirm-dialog.js';

export class TaskListView extends LitElement {
  static properties = {
    searchQuery: { type: String },
    statusFilter: { type: String },
    tagFilter: { type: String },
    editingTask: { type: Object },
    deletingTask: { type: Object },
    isFormOpen: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    input[type="search"], select {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 8px 14px;
      color: var(--color-text-primary, #F3F4F6);
      font-size: 0.875rem;
    }

    .status-tabs {
      display: flex;
      background: var(--color-bg-surface, #1A1C23);
      padding: 4px;
      border-radius: var(--radius-md, 8px);
      border: 1px solid var(--color-border, #2E3242);
    }

    .tab {
      padding: 6px 14px;
      border-radius: var(--radius-sm, 6px);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-secondary, #9CA3AF);
      cursor: pointer;
      border: none;
      background: transparent;
      transition: background 150ms ease, color 150ms ease;
    }

    .tab.active {
      background: var(--color-bg-elevated, #262936);
      color: var(--color-text-primary, #F3F4F6);
      font-weight: 600;
    }

    .btn-create {
      background: var(--color-accent, #6366F1);
      color: #ffffff;
      font-weight: 600;
      padding: 8px 18px;
      border-radius: var(--radius-md, 8px);
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 150ms ease, box-shadow 150ms ease;
    }

    .btn-create:hover {
      background: var(--color-accent-hover, #4F46E5);
      box-shadow: var(--shadow-glow);
    }

    .task-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
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
    this.statusFilter = 'all';
    this.tagFilter = 'all';
    this.editingTask = null;
    this.deletingTask = null;
    this.isFormOpen = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = appState.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  openCreateForm() {
    this.editingTask = null;
    this.isFormOpen = true;
  }

  handleEditTask(e) {
    this.editingTask = e.detail.task;
    this.isFormOpen = true;
  }

  handleDeleteTask(e) {
    this.deletingTask = e.detail.task;
  }

  closeForm() {
    this.isFormOpen = false;
    this.editingTask = null;
  }

  async confirmDelete() {
    if (this.deletingTask) {
      await appState.deleteTask(this.deletingTask.id);
      this.deletingTask = null;
    }
  }

  getFilteredTasks() {
    let list = appState.tasks || [];

    if (this.statusFilter === 'active') {
      list = list.filter(t => t.status === 'active');
    } else if (this.statusFilter === 'completed') {
      list = list.filter(t => t.status === 'completed');
    }

    if (this.tagFilter !== 'all') {
      list = list.filter(t => t.tag_ids?.includes(this.tagFilter));
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }

    return list.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  render() {
    const filteredTasks = this.getFilteredTasks();
    const tags = appState.tags || [];

    return html`
      <div class="toolbar">
        <div class="filter-group">
          <input
            type="search"
            placeholder="Search tasks..."
            .value="${this.searchQuery}"
            @input="${(e) => (this.searchQuery = e.target.value)}"
          />

          <div class="status-tabs">
            <button
              class="tab ${this.statusFilter === 'all' ? 'active' : ''}"
              @click="${() => (this.statusFilter = 'all')}"
            >
              All
            </button>
            <button
              class="tab ${this.statusFilter === 'active' ? 'active' : ''}"
              @click="${() => (this.statusFilter = 'active')}"
            >
              Active
            </button>
            <button
              class="tab ${this.statusFilter === 'completed' ? 'active' : ''}"
              @click="${() => (this.statusFilter = 'completed')}"
            >
              Completed
            </button>
          </div>

          <select .value="${this.tagFilter}" @change="${(e) => (this.tagFilter = e.target.value)}">
            <option value="all">All Tags</option>
            ${tags.map(tag => html`<option value="${tag.id}">🏷️ ${tag.name}</option>`)}
          </select>
        </div>

        <button class="btn-create" @click="${this.openCreateForm}">
          <span>+</span> Create Task
        </button>
      </div>

      <div class="task-grid">
        ${filteredTasks.length === 0
          ? html`
              <div class="empty-state">
                <h3>No tasks found</h3>
                <p style="margin-top: 8px;">Create a task or change filter criteria.</p>
              </div>
            `
          : filteredTasks.map(
              task => html`
                <task-card
                  .task="${task}"
                  @edit-task="${this.handleEditTask}"
                  @delete-task="${this.handleDeleteTask}"
                ></task-card>
              `
            )}
      </div>

      <task-form
        ?open="${this.isFormOpen}"
        .task="${this.editingTask}"
        @drawer-close="${this.closeForm}"
      ></task-form>

      <confirm-dialog
        ?open="${!!this.deletingTask}"
        title="Delete Task"
        message="Are you sure you want to delete '${this.deletingTask?.title}'?"
        @cancel="${() => (this.deletingTask = null)}"
        @confirm="${this.confirmDelete}"
      ></confirm-dialog>
    `;
  }
}

customElements.define('task-list-view', TaskListView);
