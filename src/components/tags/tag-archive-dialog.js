import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { getTagDescendants, getTagDepth } from '../../utils/validators.js';

/**
 * <crono-tag-archive-dialog> — Modal confirmation dialog for archiving a tag.
 *
 * @fires crono-archive-confirm - Fired when the user confirms archiving.
 * @fires crono-archive-cancel - Fired when the user cancels archiving.
 */
export class CronoTagArchiveDialog extends LitElement {
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
      .notice-box {
        font-size: 12px;
        background: var(--bg-tertiary);
        border-left: 3px solid var(--accent);
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
      }
      .subtags-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        border-top: 1px solid var(--border);
        padding-top: var(--space-sm);
      }
      .subtags-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .quick-actions {
        display: flex;
        gap: var(--space-xs);
      }
      .subtags-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        max-height: 200px;
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
    subtagActions: { state: true }
  };

  constructor() {
    super();
    this.open = false;
    this.tag = null;
    this.allTags = [];
    this.subtagActions = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('tag') || changedProperties.has('allTags')) {
      this._initSubtagActions();
    }
  }

  _initSubtagActions() {
    if (!this.tag) {
      this.subtagActions = {};
      return;
    }
    const descendants = getTagDescendants(this.tag.id, this.allTags || []).filter(t => !t.archived);
    const actions = {};
    for (const d of descendants) {
      actions[d.id] = this.subtagActions[d.id] || 'archive';
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
      new CustomEvent('crono-archive-confirm', {
        detail: {
          tagId: this.tag.id,
          subtagActions: this.subtagActions
        },
        bubbles: true,
        composed: true
      })
    );
    this.open = false;
  }

  _onCancel() {
    this.dispatchEvent(new CustomEvent('crono-archive-cancel', { bubbles: true, composed: true }));
    this.open = false;
  }

  render() {
    if (!this.open || !this.tag) return html``;

    const descendants = getTagDescendants(this.tag.id, this.allTags || []).filter(t => !t.archived);
    const baseDepth = getTagDepth(this.tag.id, this.allTags || []);

    return html`
      <div class="backdrop" @click=${this._onCancel}>
        <div class="modal" @click=${e => e.stopPropagation()}>
          <h3 class="title">
            <span>📦</span> Archive Tag: "${this.tag.name}"
          </h3>

          <p class="message">
            Archiving this tag makes it unavailable for new tasks or tag pickers.
          </p>

          <div class="notice-box">
            ℹ️ <strong>Active tasks</strong> with this tag will be untagged.<br />
            ✅ <strong>Completed tasks</strong> will keep this tag for historical records.
          </div>

          ${descendants.length > 0
            ? html`
                <div class="subtags-section">
                  <div class="subtags-header">
                    <span>Descendant Subtags (${descendants.length})</span>
                    <div class="quick-actions">
                      <button
                        type="button"
                        class="crono-btn crono-btn-secondary crono-btn-sm"
                        style="font-size: 11px; padding: 2px 6px;"
                        @click=${() => this._setAllSubtagActions('archive')}
                      >
                        Archive All
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
                      const currentAction = this.subtagActions[d.id] || 'archive';

                      return html`
                        <div class="subtag-row" style="margin-left: ${relativeIndent * 12}px;">
                          <div class="subtag-info">
                            <div class="color-dot" style="background-color: ${d.color}"></div>
                            <span class="subtag-name">${d.name}</span>
                          </div>

                          <select
                            class="crono-select"
                            style="width: 170px; padding: 3px 6px; font-size: 12px;"
                            .value=${currentAction}
                            @change=${e => this._onSubtagActionChange(d.id, e.target.value)}
                          >
                            <option value="archive">📦 Archive subtag</option>
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
            <button class="crono-btn crono-btn-primary" @click=${this._onConfirm}>
              Archive Tag
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('crono-tag-archive-dialog', CronoTagArchiveDialog);
