import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';

export class TaskDependencyGraph extends LitElement {
  static properties = {
    taskId: { type: String }
  };

  static styles = css`
    :host {
      display: block;
    }

    .dep-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .dep-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .dep-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      font-size: 0.875rem;
    }

    .add-row {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    select, button {
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      color: var(--color-text-primary, #F3F4F6);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .btn-add {
      background: var(--color-accent, #6366F1);
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }

    .error-msg {
      color: #EF4444;
      font-size: 0.8125rem;
      margin-top: 4px;
    }
  `;

  constructor() {
    super();
    this.taskId = '';
    this.selectedPrereqId = '';
    this.selectedType = 'hard';
    this.errorMessage = '';
  }

  async addDep() {
    if (!this.selectedPrereqId || !this.taskId) return;
    this.errorMessage = '';
    try {
      await appState.addDependency(this.taskId, this.selectedPrereqId, this.selectedType);
      this.selectedPrereqId = '';
      this.requestUpdate();
    } catch (err) {
      this.errorMessage = err.message || 'Failed to add dependency';
    }
  }

  async removeDep(depId) {
    await appState.removeDependency(depId);
    this.requestUpdate();
  }

  render() {
    if (!this.taskId) {
      return html`<div style="color: var(--color-text-muted); font-size: 0.875rem;">Save task first to configure dependencies.</div>`;
    }

    const currentDeps = appState.dependencies.filter(d => d.task_id === this.taskId);
    const availablePrereqs = appState.tasks.filter(
      t => t.id !== this.taskId && !currentDeps.some(d => d.depends_on_id === t.id)
    );

    return html`
      <div class="dep-container">
        <div class="dep-list">
          ${currentDeps.length === 0
            ? html`<div style="font-size: 0.875rem; color: var(--color-text-muted);">No prerequisites assigned.</div>`
            : currentDeps.map(dep => {
                const prereqTask = appState.tasks.find(t => t.id === dep.depends_on_id);
                return html`
                  <div class="dep-item">
                    <span>
                      Must wait for <strong>${prereqTask?.title || dep.depends_on_id}</strong>
                      <span style="color: var(--color-text-muted); margin-left: 6px;">(${dep.type} dep)</span>
                    </span>
                    <button @click="${() => this.removeDep(dep.id)}">✕</button>
                  </div>
                `;
              })}
        </div>

        ${availablePrereqs.length > 0
          ? html`
              <div class="add-row">
                <select
                  .value="${this.selectedPrereqId}"
                  @change="${(e) => (this.selectedPrereqId = e.target.value)}"
                >
                  <option value="">Select Prerequisite Task...</option>
                  ${availablePrereqs.map(t => html`<option value="${t.id}">${t.title}</option>`)}
                </select>

                <select
                  .value="${this.selectedType}"
                  @change="${(e) => (this.selectedType = e.target.value)}"
                >
                  <option value="hard">Hard (Strict)</option>
                  <option value="soft">Soft (Flexible)</option>
                </select>

                <button class="btn-add" @click="${this.addDep}">+ Add</button>
              </div>
            `
          : ''}

        ${this.errorMessage ? html`<div class="error-msg">${this.errorMessage}</div>` : ''}
      </div>
    `;
  }
}

customElements.define('task-dependency-graph', TaskDependencyGraph);
