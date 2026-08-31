import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { getTagDescendants, getTagDepth } from '../../utils/validators.js';

/**
 * <crono-tag-delete-dialog> — Modal confirmation dialog for tag deletion with task reassignment and subtag options.
 *
 * @fires crono-delete-confirm - Fired when user confirms deletion.
 * @fires crono-delete-cancel - Fired when user cancels deletion.
 */
export class CronoTagDeleteDialog extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(4px);
        z-index: 9000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-md);
      }
      .modal {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        width: 100%;
        max-width: 520px;
        max-height: 85vh;
        box-shadow: var(--shadow-lg);
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        overflow-y: auto;
      }
      .title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }
      .message {
        font-size: 13px;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.4;
      }
      .section {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        border-top: 1px solid var(--border);
        padding-top: var(--space-sm);
      }
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .radio-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }
      .radio-label {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        font-size: 13px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        background: var(--bg-surface);
        border: 1px solid var(--border);
      }
      .quick-actions {
        display: flex;
        gap: var(--space-xs);
      }
      .subtags-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        max-height: 180px;
        overflow-y: auto;
        padding-right: var(--space-xs);
      }
      .subtag-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm);
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 6px var(--space-sm);
      }
      .subtag-info {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        min-width: 0;
        flex: 1;
        font-size: 13px;
        font-weight: 500;
      }
      .color-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .subtag-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .notice-box {
        font-size: 12px;
        background: var(--bg-tertiary);
        border-left: 3px solid var(--danger);
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-sm);
        margin-top: var(--space-sm);
      }
    `
  ];

  static properties = {
    open: { type: Boolean },
    tag: { type: Object },
    allTags: { type: Array },
    tasks: { type: Array },
    taskAction: { state: true },
    subtagActions: { state: true }
  };

  constructor() {
    super();
    this.open = false;
    this.tag = null;
    this.allTags = [];
    this.tasks = [];
    this.taskAction = 'untag';
    this.subtagActions = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('tag') || changedProperties.has('allTags')) {
      this._initActions();
    }
  }

  _initActions() {
    if (!this.tag) {
      this.subtagActions = {};
      this.taskAction = 'untag';
      return;
    }
    const parentTag = this.tag.parent_tag_id ? (this.allTags || []).find(t => t.id === this.tag.parent_tag_id) : null;
    this.taskAction = parentTag ? 'reassign_to_parent' : 'untag';

    const descendants = getTagDescendants(this.tag.id, this.allTags || []);
    const actions = {};
    for (const d of descendants) {
      actions[d.id] = this.subtagActions[d.id] || 'delete';
    }
    this.subtagActions = actions;
  }

  _setAllSubtagActions(action) {
    const next = { ...this.subtagActions };
    for (const key of Object.keys(next)) {
      next[key] = action;
    }
    this.subtagActions = next;
  }

  _onSubtagActionChange(subtagId, action) {
    this.subtagActions = {
      ...this.subtagActions,
      [subtagId]: action
    };
  }

  _onConfirm() {
    this.dispatchEvent(
      new CustomEvent('crono-delete-confirm', {
        detail: {
          tagId: this.tag.id,
          taskAction: this.taskAction,
          subtagActions: this.subtagActions
        },
        bubbles: true,
        composed: true
      })
    );
    this.open = false;
  }

  _onCancel() {
    this.dispatchEvent(new CustomEvent('crono-delete-cancel', { bubbles: true, composed: true }));
    this.open = false;
  }

  render() {
    if (!this.open || !this.tag) return html``;

    const parentTag = this.tag.parent_tag_id ? (this.allTags || []).find(t => t.id === this.tag.parent_tag_id) : null;
    const descendants = getTagDescendants(this.tag.id, this.allTags || []);
    const baseDepth = getTagDepth(this.tag.id, this.allTags || []);
    const tagTasks = (this.tasks || []).filter(t => Array.isArray(t.tag_ids) && t.tag_ids.includes(this.tag.id));

    return html`
      <div class="backdrop" @click=${this._onCancel}>
        <div class="modal" @click=${e => e.stopPropagation()}>
          <h3 class="title">
            <span>🗑</span> Delete Tag: "${this.tag.name}"
          </h3>

          <p class="message">
            Are you sure you want to delete this tag? This action cannot be undone.
          </p>

          ${parentTag && tagTasks.length > 0
            ? html`
                <div class="section">
                  <div class="section-header">
                    <span>Tasks Assigned to this Subtag (${tagTasks.length})</span>
                  </div>
                  <div class="radio-group">
                    <label class="radio-label">
                      <input
                        type="radio"
                        name="taskAction"
                        value="reassign_to_parent"
                        .checked=${this.taskAction === 'reassign_to_parent'}
                        @change=${() => (this.taskAction = 'reassign_to_parent')}
                      />
                      <span>🏷 Send tasks to parent tag (<strong>${parentTag.name}</strong>)</span>
                    </label>

                    <label class="radio-label">
                      <input
                        type="radio"
                        name="taskAction"
                        value="untag"
                        .checked=${this.taskAction === 'untag'}
                        @change=${() => (this.taskAction = 'untag')}
                      />
                      <span>🚫 Untag tasks (remove tag completely)</span>
                    </label>
                  </div>
                </div>
              `
            : tagTasks.length > 0
            ? html`
                <div class="notice-box">
                  ⚠️ <strong>${tagTasks.length} task${tagTasks.length === 1 ? '' : 's'}</strong> currently assigned to this tag will be untagged.
                </div>
              `
            : ''}

          ${descendants.length > 0
            ? html`
                <div class="section">
                  <div class="section-header">
                    <span>Child Subtags (${descendants.length})</span>
                    <div class="quick-actions">
                      <button
                        type="button"
                        class="crono-btn crono-btn-secondary crono-btn-sm"
                        style="font-size: 11px; padding: 2px 6px;"
                        @click=${() => this._setAllSubtagActions('delete')}
                      >
                        Delete All
                      </button>
                      <button
                        type="button"
                        class="crono-btn crono-btn-secondary crono-btn-sm"
                        style="font-size: 11px; padding: 2px 6px;"
                        @click=${() => this._setAllSubtagActions('unlink')}
                      >
                        Unlink All
                      </button>
                    </div>
                  </div>

                  <div class="subtags-list">
                    ${descendants.map(d => {
                      const dDepth = getTagDepth(d.id, this.allTags || []);
                      const relativeIndent = Math.max(0, dDepth - baseDepth);
                      const currentAction = this.subtagActions[d.id] || 'delete';

                      return html`
                        <div class="subtag-row" style="margin-left: ${relativeIndent * 12}px;">
                          <div class="subtag-info">
                            <div class="color-dot" style="background-color: ${d.color}"></div>
                            <span class="subtag-name">${d.name}</span>
                          </div>

                          <select
                            class="crono-select"
                            style="width: 180px; padding: 3px 6px; font-size: 12px;"
                            .value=${currentAction}
                            @change=${e => this._onSubtagActionChange(d.id, e.target.value)}
                          >
                            <option value="delete">🗑 Delete subtag</option>
                            <option value="unlink">🔗 Unlink (promote)</option>
                          </select>
                        </div>
                      `;
                    })}
                  </div>
                </div>
              `
            : ''}

          <div class="actions">
            <button class="crono-btn crono-btn-secondary" @click=${this._onCancel}>
              Cancel
            </button>
            <button class="crono-btn crono-btn-danger" @click=${this._onConfirm}>
              Delete Tag
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('crono-tag-delete-dialog', CronoTagDeleteDialog);
