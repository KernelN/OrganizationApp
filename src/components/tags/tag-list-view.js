import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { appState, AppStateController } from '../../state/app-state.js';
import { getTagDepth, getTagAncestors } from '../../utils/validators.js';
import { formatDuration } from '../../utils/date-utils.js';
import './tag-form.js';
import './tag-archive-dialog.js';
import './tag-unarchive-dialog.js';
import './tag-delete-dialog.js';
import '../shared/drawer-panel.js';

/**
 * <crono-tag-list-view> — Tag management hierarchical tree view with Active/Archived tabs and modal dialogs.
 */
export class CronoTagListView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--space-md);
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--space-sm);
      }
      .header-tabs {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        background: var(--bg-tertiary);
        padding: 3px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border);
      }
      .tab-btn {
        background: transparent;
        border: none;
        padding: 5px 12px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast);
      }
      .tab-btn.active {
        background: var(--bg-surface);
        color: var(--text-primary);
        box-shadow: var(--shadow-sm);
      }
      .tag-tree {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        overflow-y: auto;
        flex: 1;
        padding-right: var(--space-xs);
      }
      .tag-node {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }
      .tag-item {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-md);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        cursor: pointer;
        transition: transform var(--transition-fast), border-color var(--transition-fast);
      }
      .tag-item:hover {
        border-color: var(--border-hover);
      }
      .tag-item.archived {
        opacity: 0.85;
        background: var(--bg-surface);
        border-style: dashed;
      }
      .tag-left {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        min-width: 0;
        flex: 1;
      }
      .color-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .tag-name {
        font-weight: 600;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tag-meta {
        font-size: 12px;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        flex-wrap: wrap;
      }
      .tag-actions {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        flex-shrink: 0;
      }
      .tree-children {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        margin-left: 24px;
        padding-left: var(--space-sm);
        border-left: 2px dashed var(--border);
      }
      .level-badge {
        font-size: 10px;
        padding: 1px 5px;
        border-radius: var(--radius-sm);
        background: var(--bg-surface);
        border: 1px solid var(--border);
        color: var(--text-secondary);
      }
      .mode-badge {
        font-size: 11px;
        padding: 1px 6px;
        border-radius: var(--radius-sm);
        background: var(--bg-surface);
        border: 1px solid var(--border);
      }
      .archived-badge {
        font-size: 10px;
        padding: 1px 5px;
        border-radius: var(--radius-sm);
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: 700;
      }
      .empty-state {
        text-align: center;
        padding: var(--space-2xl);
        color: var(--text-secondary);
      }
    `
  ];

  static properties = {
    activeTab: { type: String },
    drawerOpen: { type: Boolean },
    editingTag: { type: Object },
    initialParentId: { type: String },
    archiveDialogOpen: { type: Boolean },
    archivingTag: { type: Object },
    unarchiveDialogOpen: { type: Boolean },
    unarchivingTag: { type: Object },
    deleteDialogOpen: { type: Boolean },
    deletingTag: { type: Object }
  };

  constructor() {
    super();
    this.appStateCtrl = new AppStateController(this);
    this.activeTab = 'active';
    this.drawerOpen = false;
    this.editingTag = null;
    this.initialParentId = null;

    this.archiveDialogOpen = false;
    this.archivingTag = null;
    this.unarchiveDialogOpen = false;
    this.unarchivingTag = null;
    this.deleteDialogOpen = false;
    this.deletingTag = null;
  }

  _openCreate(parentId = null) {
    this.editingTag = null;
    this.initialParentId = parentId;
    this.drawerOpen = true;
    const form = this.shadowRoot?.querySelector('crono-tag-form');
    if (form && typeof form.reset === 'function') {
      form.reset(null, parentId);
    }
  }

  _openEdit(tag) {
    this.editingTag = tag;
    this.initialParentId = null;
    this.drawerOpen = true;
    const form = this.shadowRoot?.querySelector('crono-tag-form');
    if (form && typeof form.reset === 'function') {
      form.reset(tag, null);
    }
  }

  _onArchiveTagClick(e, tag) {
    e.stopPropagation();
    this.archivingTag = tag;
    this.archiveDialogOpen = true;
  }

  _onUnarchiveTagClick(e, tag) {
    e.stopPropagation();
    const allTags = appState.tags || [];
    const archivedAncestors = getTagAncestors(tag.id, allTags).filter(t => t.archived);

    if (archivedAncestors.length > 0) {
      this.unarchivingTag = tag;
      this.unarchiveDialogOpen = true;
    } else {
      appState.unarchiveTag(tag.id);
    }
  }

  _onDeleteTagClick(e, tag) {
    e.stopPropagation();
    this.deletingTag = tag;
    this.deleteDialogOpen = true;
  }

  async _handleArchiveConfirm(e) {
    const { tagId, subtagActions } = e.detail;
    await appState.archiveTag(tagId, { subtagActions });
    this.archiveDialogOpen = false;
    this.archivingTag = null;
  }

  async _handleUnarchiveConfirm(e) {
    const { tagId, parentActions } = e.detail;
    await appState.unarchiveTag(tagId, { parentActions });
    this.unarchiveDialogOpen = false;
    this.unarchivingTag = null;
  }

  async _handleDeleteConfirm(e) {
    const { tagId, taskAction, subtagActions } = e.detail;
    await appState.deleteTag(tagId, { taskAction, subtagActions });
    this.deleteDialogOpen = false;
    this.deletingTag = null;
  }

  _renderActiveTagBranch(tag, activeTags, allTags) {
    const depth = getTagDepth(tag.id, allTags);
    const children = activeTags.filter(t => t.parent_tag_id === tag.id);
    const tagTasks = (appState.tasks || []).filter(t => Array.isArray(t.tag_ids) && t.tag_ids.includes(tag.id) && t.status === 'active');
    const totalHours = tagTasks.reduce((sum, t) => sum + (t.duration_hours || 0), 0);

    return html`
      <div class="tag-node">
        <div class="tag-item" @click=${() => this._openEdit(tag)}>
          <div class="tag-left">
            <div class="color-dot" style="background-color: ${tag.color}"></div>
            <span class="tag-name">${tag.name}</span>
            <span class="level-badge">L${depth}</span>
            <span class="mode-badge">${tag.time_window_mode === 'none' ? 'Label' : tag.time_window_mode === 'manual' ? '🔒 Manual' : '🤖 Auto'}</span>
            <span class="tag-meta">
              · ⏱ ${formatDuration(totalHours)} (${tagTasks.length} task${tagTasks.length === 1 ? '' : 's'})
            </span>
          </div>

          <div class="tag-actions">
            ${depth < 4
              ? html`
                  <button
                    type="button"
                    class="crono-btn crono-btn-secondary crono-btn-sm"
                    title="Add child subtag under ${tag.name}"
                    @click=${e => {
                      e.stopPropagation();
                      this._openCreate(tag.id);
                    }}
                  >
                    + Subtag
                  </button>
                `
              : ''}
            <button
              type="button"
              class="crono-btn crono-btn-icon"
              title="Archive Tag"
              @click=${e => this._onArchiveTagClick(e, tag)}
            >
              📦
            </button>
            <button
              type="button"
              class="crono-btn crono-btn-icon"
              title="Delete Tag"
              @click=${e => this._onDeleteTagClick(e, tag)}
            >
              🗑
            </button>
          </div>
        </div>

        ${children.length > 0
          ? html`
              <div class="tree-children">
                ${children.map(child => this._renderActiveTagBranch(child, activeTags, allTags))}
              </div>
            `
          : ''}
      </div>
    `;
  }

  _renderArchivedTagBranch(tag, archivedTags, allTags) {
    const depth = getTagDepth(tag.id, allTags);
    const children = archivedTags.filter(t => t.parent_tag_id === tag.id);
    const completedTasks = (appState.tasks || []).filter(
      t => Array.isArray(t.tag_ids) && t.tag_ids.includes(tag.id) && t.status === 'completed'
    );

    return html`
      <div class="tag-node">
        <div class="tag-item archived" @click=${() => this._openEdit(tag)}>
          <div class="tag-left">
            <div class="color-dot" style="background-color: ${tag.color}"></div>
            <span class="tag-name">${tag.name}</span>
            <span class="archived-badge">Archived</span>
            <span class="level-badge">L${depth}</span>
            <span class="tag-meta">
              · 🏁 ${completedTasks.length} completed task${completedTasks.length === 1 ? '' : 's'}
            </span>
          </div>

          <div class="tag-actions">
            <button
              type="button"
              class="crono-btn crono-btn-secondary crono-btn-sm"
              title="Unarchive Tag"
              @click=${e => this._onUnarchiveTagClick(e, tag)}
            >
              ♻️ Unarchive
            </button>
            <button
              type="button"
              class="crono-btn crono-btn-icon"
              title="Permanently Delete Tag"
              @click=${e => this._onDeleteTagClick(e, tag)}
            >
              🗑
            </button>
          </div>
        </div>

        ${children.length > 0
          ? html`
              <div class="tree-children">
                ${children.map(child => this._renderArchivedTagBranch(child, archivedTags, allTags))}
              </div>
            `
          : ''}
      </div>
    `;
  }

  render() {
    const allTags = appState.tags || [];
    const activeTags = allTags.filter(t => !t.archived);
    const archivedTags = allTags.filter(t => t.archived);

    // Find roots for active and archived views
    const activeRoots = activeTags.filter(t => !t.parent_tag_id || !activeTags.some(p => p.id === t.parent_tag_id));
    const archivedRoots = archivedTags.filter(t => !t.parent_tag_id || !archivedTags.some(p => p.id === t.parent_tag_id));

    return html`
      <div class="header">
        <div class="header-tabs">
          <button
            class="tab-btn ${this.activeTab === 'active' ? 'active' : ''}"
            @click=${() => (this.activeTab = 'active')}
          >
            Active (${activeTags.length})
          </button>
          <button
            class="tab-btn ${this.activeTab === 'archived' ? 'active' : ''}"
            @click=${() => (this.activeTab = 'archived')}
          >
            Archived (${archivedTags.length})
          </button>
        </div>

        ${this.activeTab === 'active'
          ? html`
              <button class="crono-btn crono-btn-primary" @click=${() => this._openCreate(null)}>
                + New Root Tag
              </button>
            `
          : ''}
      </div>

      <div class="tag-tree">
        ${this.activeTab === 'active'
          ? activeRoots.length === 0
            ? html`
                <div class="empty-state">
                  <p>No active tags.</p>
                  <button class="crono-btn crono-btn-primary" @click=${() => this._openCreate(null)}>
                    Create your first tag
                  </button>
                </div>
              `
            : activeRoots.map(rootTag => this._renderActiveTagBranch(rootTag, activeTags, allTags))
          : archivedRoots.length === 0
          ? html`
              <div class="empty-state">
                <p>No archived tags.</p>
              </div>
            `
          : archivedRoots.map(rootTag => this._renderArchivedTagBranch(rootTag, archivedTags, allTags))}
      </div>

      <!-- Tag Drawer Panel for Create / Edit -->
      <crono-drawer-panel
        .open=${this.drawerOpen}
        .title=${this.editingTag ? `Edit Tag: ${this.editingTag.name}` : this.initialParentId ? 'New Subtag' : 'New Root Tag'}
        @crono-drawer:close=${() => (this.drawerOpen = false)}
      >
        <crono-tag-form
          .tag=${this.editingTag}
          .initialParentId=${this.initialParentId}
          @crono-form-saved=${() => (this.drawerOpen = false)}
        ></crono-tag-form>
      </crono-drawer-panel>

      <!-- Archive Dialog -->
      <crono-tag-archive-dialog
        .open=${this.archiveDialogOpen}
        .tag=${this.archivingTag}
        .allTags=${allTags}
        @crono-archive-confirm=${this._handleArchiveConfirm}
        @crono-archive-cancel=${() => (this.archiveDialogOpen = false)}
      ></crono-tag-archive-dialog>

      <!-- Unarchive Dialog -->
      <crono-tag-unarchive-dialog
        .open=${this.unarchiveDialogOpen}
        .tag=${this.unarchivingTag}
        .allTags=${allTags}
        @crono-unarchive-confirm=${this._handleUnarchiveConfirm}
        @crono-unarchive-cancel=${() => (this.unarchiveDialogOpen = false)}
      ></crono-tag-unarchive-dialog>

      <!-- Delete Dialog -->
      <crono-tag-delete-dialog
        .open=${this.deleteDialogOpen}
        .tag=${this.deletingTag}
        .allTags=${allTags}
        .tasks=${appState.tasks || []}
        @crono-delete-confirm=${this._handleDeleteConfirm}
        @crono-delete-cancel=${() => (this.deleteDialogOpen = false)}
      ></crono-tag-delete-dialog>
    `;
  }
}

customElements.define('crono-tag-list-view', CronoTagListView);
