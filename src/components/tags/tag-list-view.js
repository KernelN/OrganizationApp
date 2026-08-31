import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { appState, AppStateController } from '../../state/app-state.js';
import { getTagDepth } from '../../utils/validators.js';
import { formatDuration } from '../../utils/date-utils.js';
import './tag-form.js';
import '../shared/drawer-panel.js';

/**
 * <crono-tag-list-view> — Tag management hierarchical tree view.
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
      .empty-state {
        text-align: center;
        padding: var(--space-2xl);
        color: var(--text-secondary);
      }
    `
  ];

  static properties = {
    drawerOpen: { type: Boolean },
    editingTag: { type: Object },
    initialParentId: { type: String }
  };

  constructor() {
    super();
    this.appStateCtrl = new AppStateController(this);
    this.drawerOpen = false;
    this.editingTag = null;
    this.initialParentId = null;
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

  _deleteTag(e, tag) {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete tag "${tag.name}"? Any child subtags will also be deleted.`)) {
      appState.deleteTag(tag.id);
    }
  }

  _renderTagBranch(tag, allTags) {
    const depth = getTagDepth(tag.id, allTags);
    const children = allTags.filter(t => t.parent_tag_id === tag.id);
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
            ${depth < 4 ? html`
              <button
                type="button"
                class="crono-btn crono-btn-secondary crono-btn-sm"
                title="Add child subtag under ${tag.name}"
                @click=${(e) => { e.stopPropagation(); this._openCreate(tag.id); }}
              >
                + Subtag
              </button>
            ` : ''}
            <button
              type="button"
              class="crono-btn crono-btn-icon"
              title="Delete Tag"
              @click=${(e) => this._deleteTag(e, tag)}
            >
              🗑
            </button>
          </div>
        </div>

        ${children.length > 0 ? html`
          <div class="tree-children">
            ${children.map(child => this._renderTagBranch(child, allTags))}
          </div>
        ` : ''}
      </div>
    `;
  }

  render() {
    const allTags = appState.tags || [];
    const rootTags = allTags.filter(t => !t.parent_tag_id);

    return html`
      <div class="header">
        <h2 style="margin: 0; font-size: 18px;">Tags & Subtags (${allTags.length})</h2>
        <button class="crono-btn crono-btn-primary" @click=${() => this._openCreate(null)}>
          + New Root Tag
        </button>
      </div>

      <div class="tag-tree">
        ${rootTags.length === 0
          ? html`
              <div class="empty-state">
                <p>No tags created yet.</p>
                <button class="crono-btn crono-btn-primary" @click=${() => this._openCreate(null)}>
                  Create your first tag
                </button>
              </div>
            `
          : rootTags.map(rootTag => this._renderTagBranch(rootTag, allTags))}
      </div>

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
    `;
  }
}

customElements.define('crono-tag-list-view', CronoTagListView);

