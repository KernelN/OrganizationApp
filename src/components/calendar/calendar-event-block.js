import { LitElement, html, css } from 'lit';
import { appState } from '../../state/app-state.js';
import '../shared/alert-badge.js';

export class CalendarEventBlock extends LitElement {
  static properties = {
    block: { type: Object },
    task: { type: Object }
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }

    .event-block {
      height: 100%;
      width: 100%;
      border-radius: var(--radius-md, 8px);
      padding: 6px 10px;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: var(--shadow-sm);
      box-sizing: border-border;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 150ms ease, box-shadow 150ms ease;
    }

    .event-block:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .event-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }

    .title-text {
      font-weight: 700;
      font-size: 0.8125rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .time-text {
      font-size: 0.75rem;
      opacity: 0.9;
    }

    .badge-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .lock-btn {
      background: rgba(0, 0, 0, 0.3);
      border: none;
      color: #fff;
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: 4px;
      cursor: pointer;
    }
  `;

  formatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  toggleLock(e) {
    e.stopPropagation();
    if (!this.task) return;

    if (this.block.is_locked) {
      appState.updateTask(this.task.id, { manual_schedule: null });
    } else {
      appState.updateTask(this.task.id, {
        manual_schedule: {
          start: this.block.start,
          end: this.block.end
        }
      });
    }
  }

  render() {
    if (!this.block) return html``;

    const task = this.task || appState.tasks.find(t => t.id === this.block.task_id);
    const tag = task?.tag_ids ? appState.tags.find(t => task.tag_ids.includes(t.id)) : null;
    const blockColor = tag?.color || task?.color || '#6366F1';

    const startTimeStr = this.formatTime(this.block.start);
    const endTimeStr = this.formatTime(this.block.end);

    return html`
      <div
        class="event-block"
        style="background-color: ${blockColor};"
        title="${task?.title || 'Task'} (${startTimeStr} - ${endTimeStr})"
      >
        <div class="event-header">
          <div class="title-text">
            ${this.block.is_locked ? '🔒 ' : ''}${task?.title || 'Scheduled Block'}
          </div>
          <div class="badge-group">
            <alert-badge .level="${this.block.alert_level || 'none'}"></alert-badge>
            <button class="lock-btn" @click="${this.toggleLock}" title="Toggle Manual Lock">
              ${this.block.is_locked ? 'Unlock' : 'Lock'}
            </button>
          </div>
        </div>

        <div class="time-text">
          🕒 ${startTimeStr} – ${endTimeStr}
          ${this.block.is_split_part ? `(Part ${this.block.split_index + 1})` : ''}
        </div>
      </div>
    `;
  }
}

customElements.define('calendar-event-block', CalendarEventBlock);
