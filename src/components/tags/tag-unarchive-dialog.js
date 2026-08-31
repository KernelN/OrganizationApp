import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { getTagAncestors, getTagDepth } from '../../utils/validators.js';

/**
 * <crono-tag-unarchive-dialog> — Modal confirmation dialog for unarchiving a subtag with archived parent hierarchy.
 *
 * @fires crono-unarchive-confirm - Fired when user confirms unarchiving.
 * @fires crono-unarchive-cancel - Fired when user cancels unarchiving.
 */
export class CronoTagUnarchiveDialog extends LitElement {
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
      .ancestors-section {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        border-top: 1px solid var(--border);
        padding-top: var(--space-sm);
      }
      .ancestors-header {
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
      .ancestors-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        max-height: 200px;
        overflow-y: auto;
        padding-right: var(--space-xs);
      }
      .ancestor-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm);
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 6px var(--space-sm);
      }
      .ancestor-info {
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
      .ancestor-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .notice-box {
        font-size: 12px;
        background: var(--bg-tertiary);
        border-left: 3px solid var(--accent);
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
    parentActions: { state: true }
  };

  constructor() {
    super();
    this.open = false;
    this.tag = null;
    this.allTags = [];
    this.parentActions = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('tag') || changedProperties.has('allTags')) {
      this._initParentActions();
    }
  }

  _initParentActions() {
    if (!this.tag) {
      this.parentActions = {};
      return;
    }
    const ancestors = getTagAncestors(this.tag.id, this.allTags || []).filter(t => t.archived);
    const actions = {};
    for (const a of ancestors) {
      actions[a.id] = this.parentActions[a.id] || 'unarchive';
    }
    this.parentActions = actions;
  }

  _setAllParentActions(action) {
    const next = { ...this.parentActions };
    for (const key of Object.keys(next)) {
      next[key] = action;
    }
    this.parentActions = next;
  }

  _onParentActionChange(ancestorId, action) {
    this.parentActions = {
      ...this.parentActions,
      [ancestorId]: action
    };
  }

  _onConfirm() {
    this.dispatchEvent(
      new CustomEvent('crono-unarchive-confirm', {
        detail: {
          tagId: this.tag.id,
          parentActions: this.parentActions
        },
        bubbles: true,
        composed: true
      })
    );
    this.open = false;
  }

  _onCancel() {
    this.dispatchEvent(new CustomEvent('crono-unarchive-cancel', { bubbles: true, composed: true }));
    this.open = false;
  }

  render() {
    if (!this.open || !this.tag) return html``;

    const ancestors = getTagAncestors(this.tag.id, this.allTags || []).filter(t => t.archived);
    // Reverse to display from highest ancestor (root) down to immediate parent
    const reversedAncestors = [...ancestors].reverse();

    return html`
      <div class="backdrop" @click=${this._onCancel}>
        <div class="modal" @click=${e => e.stopPropagation()}>
          <h3 class="title">
            <span>♻️</span> Unarchive Subtag: "${this.tag.name}"
          </h3>

          <p class="message">
            This subtag has archived parent tag(s). Choose whether to unarchive its parent hierarchy or unlink this subtag:
          </p>

          <div class="ancestors-section">
            <div class="ancestors-header">
              <span>Archived Parent Hierarchy (${ancestors.length})</span>
              <div class="quick-actions">
                <button
                  type="button"
                  class="crono-btn crono-btn-secondary crono-btn-sm"
                  style="font-size: 11px; padding: 2px 6px;"
                  @click=${() => this._setAllParentActions('unarchive')}
                >
                  Unarchive All
                </button>
                <button
                  type="button"
                  class="crono-btn crono-btn-secondary crono-btn-sm"
                  style="font-size: 11px; padding: 2px 6px;"
                  @click=${() => this._setAllParentActions('unlink')}
                >
                  Unlink as Root
                </button>
              </div>
            </div>

            <div class="ancestors-list">
              ${reversedAncestors.map((a, idx) => {
                const currentAction = this.parentActions[a.id] || 'unarchive';

                return html`
                  <div class="ancestor-row" style="margin-left: ${idx * 12}px;">
                    <div class="ancestor-info">
                      <div class="color-dot" style="background-color: ${a.color}"></div>
                      <span class="ancestor-name">${a.name} (Archived)</span>
                    </div>

                    <select
                      class="crono-select"
                      style="width: 180px; padding: 3px 6px; font-size: 12px;"
                      .value=${currentAction}
                      @change=${e => this._onParentActionChange(a.id, e.target.value)}
                    >
                      <option value="unarchive">♻️ Unarchive parent</option>
                      <option value="unlink">🔗 Unlink child</option>
                    </select>
                  </div>
                `;
              })}
            </div>
          </div>

          <div class="notice-box">
            ℹ️ Unarchiving makes tags selectable again. It does not restore tags to past tasks that were untagged.
          </div>

          <div class="actions">
            <button class="crono-btn crono-btn-secondary" @click=${this._onCancel}>
              Cancel
            </button>
            <button class="crono-btn crono-btn-primary" @click=${this._onConfirm}>
              Confirm Unarchive
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('crono-tag-unarchive-dialog', CronoTagUnarchiveDialog);
