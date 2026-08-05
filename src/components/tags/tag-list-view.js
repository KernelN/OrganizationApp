import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';
import './tag-form.js';
import '../shared/confirm-dialog.js';

export class TagListView extends LitElement {
  static properties = {
    editingTag: { type: Object },
    deletingTag: { type: Object },
    isFormOpen: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
    }

    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
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
    }

    .tag-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .tag-card {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-lg, 12px);
      padding: var(--space-4, 16px);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tag-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 1.125rem;
    }

    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .icon-btn {
      background: transparent;
      border: none;
      color: var(--color-text-secondary, #9CA3AF);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
    }

    .meta {
      font-size: 0.8125rem;
      color: var(--color-text-secondary, #9CA3AF);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      background: var(--color-bg-surface, #1A1C23);
      border: 1px dashed var(--color-border, #2E3242);
      border-radius: var(--radius-lg, 12px);
      color: var(--color-text-secondary, #9CA3AF);
      grid-column: 1 / -1;
    }
  `;

  constructor() {
    super();
    this.editingTag = null;
    this.deletingTag = null;
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
    this.editingTag = null;
    this.isFormOpen = true;
  }

  editTag(tag) {
    this.editingTag = tag;
    this.isFormOpen = true;
  }

  deleteTag(tag) {
    this.deletingTag = tag;
  }

  async confirmDelete() {
    if (this.deletingTag) {
      await appState.deleteTag(this.deletingTag.id);
      this.deletingTag = null;
    }
  }

  render() {
    const tags = appState.tags || [];

    return html`
      <div class="header-row">
        <h2>🏷️ Tag Management</h2>
        <button class="btn-create" @click="${this.openCreateForm}">+ Create Tag</button>
      </div>

      <div class="tag-grid">
        ${tags.length === 0
          ? html`
              <div class="empty-state">
                <h3>No tags defined</h3>
                <p style="margin-top: 8px;">Create tags to categorize tasks and set time windows.</p>
              </div>
            `
          : tags.map(tag => {
              const activeTasks = (appState.tasks || []).filter(
                t => t.tag_ids?.includes(tag.id) && t.status === 'active'
              );

              return html`
                <div class="tag-card">
                  <div class="card-top">
                    <div class="tag-title">
                      <div class="color-dot" style="background-color: ${tag.color || '#3B82F6'};"></div>
                      <span>${tag.name}</span>
                    </div>
                    <div class="actions">
                      <button class="icon-btn" @click="${() => this.editTag(tag)}">✏️</button>
                      <button class="icon-btn" @click="${() => this.deleteTag(tag)}">🗑️</button>
                    </div>
                  </div>

                  <div class="meta">
                    <span>⚙️ Window Mode: <strong>${tag.time_window_mode || 'none'}</strong></span>
                    <span>📋 Active Tasks: <strong>${activeTasks.length}</strong></span>
                    ${tag.needs_dedicated_timeslot
                      ? html`<span>🔒 Dedicated Time Slots Reserved</span>`
                      : ''}
                  </div>
                </div>
              `;
            })}
      </div>

      <tag-form
        ?open="${this.isFormOpen}"
        .tag="${this.editingTag}"
        @drawer-close="${() => (this.isFormOpen = false)}"
      ></tag-form>

      <confirm-dialog
        ?open="${!!this.deletingTag}"
        title="Delete Tag"
        message="Are you sure you want to delete '${this.deletingTag?.name}'?"
        @cancel="${() => (this.deletingTag = null)}"
        @confirm="${this.confirmDelete}"
      ></confirm-dialog>
    `;
  }
}

customElements.define('tag-list-view', TagListView);
