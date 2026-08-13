import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { appState, AppStateController } from '../../state/app-state.js';
import './tag-form.js';
import '../shared/drawer-panel.js';

/**
 * <crono-tag-list-view> — Tag management list view.
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
      .tag-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--space-md);
        overflow-y: auto;
      }
      .tag-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        cursor: pointer;
        transition: transform var(--transition-fast), border-color var(--transition-fast);
      }
      .tag-card:hover {
        transform: translateY(-2px);
        border-color: var(--border-hover);
      }
      .tag-header {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        font-weight: 600;
      }
      .color-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      .tag-meta {
        font-size: 12px;
        color: var(--text-secondary);
      }
    `
  ];

  static properties = {
    drawerOpen: { type: Boolean },
    editingTag: { type: Object }
  };

  constructor() {
    super();
    this.appStateCtrl = new AppStateController(this);
    this.drawerOpen = false;
    this.editingTag = null;
  }

  _openCreate() {
    this.editingTag = null;
    this.drawerOpen = true;
  }

  _openEdit(tag) {
    this.editingTag = tag;
    this.drawerOpen = true;
  }

  render() {
    const tags = appState.tags || [];

    return html`
      <div class="header">
        <h2 style="margin: 0; font-size: 18px;">Tags (${tags.length})</h2>
        <button class="crono-btn crono-btn-primary" @click=${this._openCreate}>
          + New Tag
        </button>
      </div>

      <div class="tag-grid">
        ${tags.map(
          (tg) => {
            const tagTasks = (appState.tasks || []).filter(t => Array.isArray(t.tag_ids) && t.tag_ids.includes(tg.id) && t.status === 'active');
            const totalHours = tagTasks.reduce((sum, t) => sum + (t.duration_hours || 0), 0);

            return html`
              <div class="tag-card" @click=${() => this._openEdit(tg)}>
                <div class="tag-header">
                  <div class="color-dot" style="background-color: ${tg.color}"></div>
                  <span>${tg.name}</span>
                </div>
                <div class="tag-meta">
                  <span>Mode: ${tg.time_window_mode || 'none'}</span>
                  <span> · ⏱ ${totalHours.toFixed(1)}h (${tagTasks.length} task${tagTasks.length === 1 ? '' : 's'})</span>
                </div>
              </div>
            `;
          }
        )}
      </div>

      <crono-drawer-panel
        .open=${this.drawerOpen}
        .title=${this.editingTag ? 'Edit Tag' : 'New Tag'}
        @crono-drawer:close=${() => (this.drawerOpen = false)}
      >
        <crono-tag-form
          .tag=${this.editingTag}
          @crono-form-saved=${() => (this.drawerOpen = false)}
        ></crono-tag-form>
      </crono-drawer-panel>
    `;
  }
}

customElements.define('crono-tag-list-view', CronoTagListView);
