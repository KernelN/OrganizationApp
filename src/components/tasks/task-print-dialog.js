import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';
import { appState, AppStateController } from '../../state/app-state.js';
import { eventBus } from '../../state/event-bus.js';
import { getTagDepth } from '../../utils/validators.js';
import { generateTasksPrintDocument, getTreeOrderedTags } from '../../utils/task-printer.js';

/**
 * <crono-task-print-dialog> — Modal dialog for filtering, formatting, copying, and exporting tasks.
 *
 * @fires crono-print-dialog:close - Fired when the dialog is closed.
 */
export class CronoTaskPrintDialog extends LitElement {
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
        box-sizing: border-box;
      }
      .modal {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: var(--space-lg);
        width: 100%;
        max-width: 740px;
        max-height: 90vh;
        box-shadow: var(--shadow-lg);
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        box-sizing: border-box;
        overflow: hidden;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border);
        padding-bottom: var(--space-sm);
      }
      .title {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        margin: 0;
      }
      .close-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 18px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: var(--radius-sm);
        transition: color var(--transition-fast), background var(--transition-fast);
      }
      .close-btn:hover {
        color: var(--text-primary);
        background: var(--bg-tertiary);
      }
      .modal-body {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        overflow-y: auto;
        flex: 1;
        min-height: 0;
        padding-right: 2px;
      }
      .filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: var(--space-sm);
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }
      label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .toggle-row {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-md);
        align-items: center;
        padding: var(--space-xs) 0;
      }
      .checkbox-label {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs);
        font-size: 13px;
        cursor: pointer;
        user-select: none;
      }
      .checkbox-label.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .preview-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        flex: 1;
        min-height: 220px;
      }
      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: var(--text-secondary);
      }
      .preview-box {
        width: 100%;
        height: 240px;
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        font-family: var(--font-mono);
        font-size: 12px;
        line-height: 1.5;
        color: var(--text-primary);
        resize: vertical;
        box-sizing: border-box;
        white-space: pre-wrap;
        overflow-y: auto;
      }
      .preview-box:focus {
        border-color: var(--accent);
        outline: none;
      }
      .modal-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-sm);
        border-top: 1px solid var(--border);
        padding-top: var(--space-md);
        flex-wrap: wrap;
      }
      .left-actions, .right-actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }
      .copied-toast-badge {
        font-size: 12px;
        color: var(--success);
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        animation: fadeIn 150ms ease-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(3px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `
  ];

  static properties = {
    open: { type: Boolean },
    selectedTagFilter: { type: String },
    includeSubtags: { type: Boolean },
    includeCompleted: { type: Boolean },
    useMarkdown: { type: Boolean },
    omitYear: { type: Boolean },
    omitHour: { type: Boolean },
    dateOrder: { type: String },
    omitEmptyFields: { type: Boolean },
    sortBy: { type: String },
    completedTasks: { type: Array },
    copied: { type: Boolean }
  };

  constructor() {
    super();
    this.appStateCtrl = new AppStateController(this);
    this.open = false;
    this.selectedTagFilter = '';
    this.includeSubtags = true;
    this.includeCompleted = false;
    this.useMarkdown = true;
    this.omitYear = false;
    this.omitHour = false;
    this.dateOrder = 'Y-M-D';
    this.omitEmptyFields = false;
    this.sortBy = 'priority';
    this.completedTasks = [];
    this.copied = false;
    this._copyTimeout = null;
  }

  async updated(changedProperties) {
    if (changedProperties.has('open') && this.open) {
      if (this.includeCompleted && this.completedTasks.length === 0) {
        await this._fetchCompletedTasks();
      }
    }
    if (changedProperties.has('includeCompleted') && this.includeCompleted && this.completedTasks.length === 0) {
      await this._fetchCompletedTasks();
    }
  }

  async _fetchCompletedTasks() {
    try {
      this.completedTasks = (await appState.dal.getCompletedTasks()) || [];
      this.requestUpdate();
    } catch (err) {
      console.warn('Failed to load completed tasks for printing:', err);
    }
  }

  _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('crono-print-dialog:close', {
      bubbles: true,
      composed: true
    }));
  }

  _generateDocument() {
    const activeTasks = appState.tasks || [];
    const allTasksPool = this.includeCompleted
      ? [...activeTasks, ...this.completedTasks.filter(ct => !activeTasks.some(at => at.id === ct.id))]
      : activeTasks;

    const tags = appState.tags || [];
    const dependencies = appState.dependencies || [];

    return generateTasksPrintDocument(
      allTasksPool,
      {
        selectedTagFilter: this.selectedTagFilter,
        includeSubtags: this.includeSubtags,
        includeCompleted: this.includeCompleted,
        sortBy: this.sortBy,
        useMarkdown: this.useMarkdown,
        omitYear: this.omitYear,
        omitHour: this.omitHour,
        dateOrder: this.dateOrder,
        omitEmptyFields: this.omitEmptyFields
      },
      {
        allTags: tags,
        allTasks: allTasksPool,
        allDependencies: dependencies
      }
    );
  }

  async _copyToClipboard() {
    const doc = this._generateDocument();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(doc);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = doc;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      this.copied = true;
      if (this._copyTimeout) clearTimeout(this._copyTimeout);
      this._copyTimeout = setTimeout(() => {
        this.copied = false;
        this.requestUpdate();
      }, 2500);

      eventBus.emit('toast:show', { message: 'Tasks copied to clipboard!', type: 'success' });
      this.requestUpdate();
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      eventBus.emit('toast:show', { message: 'Could not copy to clipboard', type: 'error' });
    }
  }

  _downloadFile() {
    const doc = this._generateDocument();
    const extension = this.useMarkdown ? 'md' : 'txt';
    const mimeType = this.useMarkdown ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const filename = `cronograma-tasks-${dateStr}.${extension}`;

    const blob = new Blob([doc], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    eventBus.emit('toast:show', { message: `Downloaded ${filename}`, type: 'success' });
  }

  render() {
    if (!this.open) return html``;

    const tags = appState.tags || [];
    const orderedTags = getTreeOrderedTags(tags);
    const documentContent = this._generateDocument();
    const isTagSelected = Boolean(this.selectedTagFilter && this.selectedTagFilter !== 'untagged');

    return html`
      <div class="backdrop" @click=${this._close}>
        <div class="modal" @click=${(e) => e.stopPropagation()}>
          <!-- Modal Header -->
          <div class="modal-header">
            <h3 class="title">
              <span>🖨️</span>
              <span>Print / Export Tasks</span>
            </h3>
            <button class="close-btn" title="Close" @click=${this._close}>✕</button>
          </div>

          <!-- Modal Body Controls -->
          <div class="modal-body">
            <div class="filter-grid">
              <!-- Tag Filter (Tree Ordered with Children Below Parents) -->
              <div class="form-group">
                <label>Filter by Tag</label>
                <select
                  class="crono-select"
                  .value=${this.selectedTagFilter}
                  @change=${(e) => {
                    this.selectedTagFilter = e.target.value;
                    this.requestUpdate();
                  }}
                >
                  <option value="">All Tags</option>
                  <option value="untagged">Untagged</option>
                  ${orderedTags.map((tg) => {
                    const depth = getTagDepth(tg.id, tags);
                    const indent = '— '.repeat(depth - 1);
                    return html`<option value=${tg.id}>${indent}🏷 ${tg.name}</option>`;
                  })}
                </select>
              </div>

              <!-- Sort Field (Places sort field as first entry!) -->
              <div class="form-group">
                <label>Sort By (Top Entry in Format)</label>
                <select
                  class="crono-select"
                  .value=${this.sortBy}
                  @change=${(e) => {
                    this.sortBy = e.target.value;
                    this.requestUpdate();
                  }}
                >
                  <option value="priority">Priority (High → Low)</option>
                  <option value="deadline">Deadline (Earliest)</option>
                  <option value="tag">Tag / Subtag (A → Z)</option>
                  <option value="name">Task Name (A → Z)</option>
                  <option value="duration">Duration (Short → Long)</option>
                </select>
              </div>

              <!-- Date Order Selector -->
              <div class="form-group">
                <label>Date Order</label>
                <select
                  class="crono-select"
                  .value=${this.dateOrder}
                  @change=${(e) => {
                    this.dateOrder = e.target.value;
                    this.requestUpdate();
                  }}
                >
                  <option value="Y-M-D">Y-M-D (YYYY-MM-DD)</option>
                  <option value="M-D-Y">M-D-Y (MM-DD-YYYY)</option>
                  <option value="D-M-Y">D-M-Y (DD-MM-YYYY)</option>
                </select>
              </div>
            </div>

            <!-- Toggles Row -->
            <div class="toggle-row">
              <label class="checkbox-label ${!isTagSelected ? 'disabled' : ''}">
                <input
                  type="checkbox"
                  .disabled=${!isTagSelected}
                  .checked=${this.includeSubtags}
                  @change=${(e) => {
                    this.includeSubtags = e.target.checked;
                    this.requestUpdate();
                  }}
                />
                <span>Include Subtags</span>
              </label>

              <label class="checkbox-label">
                <input
                  type="checkbox"
                  .checked=${this.includeCompleted}
                  @change=${(e) => {
                    this.includeCompleted = e.target.checked;
                    this.requestUpdate();
                  }}
                />
                <span>Include Completed Tasks</span>
              </label>

              <label class="checkbox-label">
                <input
                  type="checkbox"
                  .checked=${this.useMarkdown}
                  @change=${(e) => {
                    this.useMarkdown = e.target.checked;
                    this.requestUpdate();
                  }}
                />
                <span>Markdown Formatting</span>
              </label>

              <label class="checkbox-label">
                <input
                  type="checkbox"
                  .checked=${this.omitYear}
                  @change=${(e) => {
                    this.omitYear = e.target.checked;
                    this.requestUpdate();
                  }}
                />
                <span>Omit Year in Dates</span>
              </label>

              <label class="checkbox-label">
                <input
                  type="checkbox"
                  .checked=${this.omitHour}
                  @change=${(e) => {
                    this.omitHour = e.target.checked;
                    this.requestUpdate();
                  }}
                />
                <span>Omit Hour in Dates</span>
              </label>

              <label class="checkbox-label">
                <input
                  type="checkbox"
                  .checked=${this.omitEmptyFields}
                  @change=${(e) => {
                    this.omitEmptyFields = e.target.checked;
                    this.requestUpdate();
                  }}
                />
                <span>Omit Empty Fields</span>
              </label>
            </div>

            <!-- Live Document Preview -->
            <div class="preview-container">
              <div class="preview-header">
                <span><strong>Live Document Preview</strong></span>
                <span>${documentContent.length} chars</span>
              </div>
              <textarea
                class="preview-box"
                readonly
                .value=${documentContent}
                @focus=${(e) => e.target.select()}
              ></textarea>
            </div>
          </div>

          <!-- Modal Footer Actions -->
          <div class="modal-footer">
            <div class="left-actions">
              ${this.copied ? html`
                <span class="copied-toast-badge">✓ Copied to clipboard!</span>
              ` : ''}
            </div>
            <div class="right-actions">
              <button class="crono-btn crono-btn-secondary" @click=${this._close}>
                Close
              </button>
              <button class="crono-btn crono-btn-secondary" @click=${this._downloadFile}>
                💾 Download (.${this.useMarkdown ? 'md' : 'txt'})
              </button>
              <button class="crono-btn crono-btn-primary" @click=${this._copyToClipboard}>
                📋 ${this.copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('crono-task-print-dialog', CronoTaskPrintDialog);
