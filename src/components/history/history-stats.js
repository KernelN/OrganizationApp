import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';

/**
 * <crono-history-stats> — Performance metrics and tag breakdown stats.
 */
export class CronoHistoryStats extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .stats-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-md);
      }
      .stat-item {
        display: flex;
        flex-direction: column;
      }
      .stat-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--accent);
      }
      .stat-label {
        font-size: 12px;
        color: var(--text-secondary);
      }
    `
  ];

  static properties = {
    completedTasks: { type: Array },
    timeLogs: { type: Array }
  };

  constructor() {
    super();
    this.completedTasks = [];
    this.timeLogs = [];
  }

  render() {
    const totalCompleted = this.completedTasks.length;
    const totalTrackedHours = this.timeLogs.reduce((acc, l) => acc + (l.logged_hours || 0), 0);

    return html`
      <div class="stats-card">
        <h3 style="margin:0; font-size:14px; font-weight:600;">Completion Overview</h3>
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-value">${totalCompleted}</span>
            <span class="stat-label">Completed Tasks</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${totalTrackedHours.toFixed(1)}h</span>
            <span class="stat-label">Hours Tracked</span>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('crono-history-stats', CronoHistoryStats);
