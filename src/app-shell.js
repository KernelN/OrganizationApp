import { LitElement, html, css } from 'lit';
import { sharedStyles } from './styles/shared-styles.js';
import { appState, AppStateController } from './state/app-state.js';
import { scheduleState } from './state/schedule-state.js';
import './components/shared/toast-notification.js';
import './components/calendar/calendar-view.js';
import './components/tasks/task-list-view.js';
import './components/tags/tag-list-view.js';
import './components/history/history-view.js';
import './components/settings/settings-view.js';

/**
 * <app-shell> — Root application shell component.
 */
export class AppShell extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        background-color: var(--bg-primary);
      }

      /* Desktop Layout */
      .sidebar {
        width: 240px;
        background: var(--bg-secondary);
        border-right: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: var(--space-md);
        transition: width var(--transition-base);
        flex-shrink: 0;
      }

      .sidebar.collapsed {
        width: 64px;
        padding: var(--space-md) var(--space-xs);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        font-size: 18px;
        font-weight: 700;
        color: var(--accent);
        margin-bottom: var(--space-xl);
      }

      .nav-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .nav-item a {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        font-weight: 500;
        transition: background var(--transition-fast), color var(--transition-fast);
      }

      .nav-item a:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }

      .nav-item a.active {
        background: var(--accent-muted);
        color: var(--accent);
      }

      .sidebar-footer {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        font-size: 12px;
        color: var(--text-muted);
        border-top: 1px solid var(--border);
        padding-top: var(--space-sm);
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .dot-green { background: var(--success); }
      .dot-blue { background: var(--accent); animation: pulse-computing 1s infinite; }

      .main-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      .top-app-bar {
        display: none;
        height: 56px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--space-md);
      }

      .content-area {
        flex: 1;
        padding: var(--space-lg);
        overflow: hidden;
      }

      .bottom-nav {
        display: none;
        height: 56px;
        background: var(--bg-secondary);
        border-top: 1px solid var(--border);
        justify-content: space-around;
        align-items: center;
      }

      .bottom-nav a {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 11px;
        color: var(--text-secondary);
      }

      .bottom-nav a.active {
        color: var(--accent);
      }

      /* Mobile Responsive Override */
      @media (max-width: 1023px) {
        .sidebar {
          display: none;
        }
        .top-app-bar {
          display: flex;
        }
        .bottom-nav {
          display: flex;
        }
        .content-area {
          padding: var(--space-md);
        }
      }
    `
  ];

  static properties = {
    collapsed: { type: Boolean },
    mobileDrawerOpen: { type: Boolean },
    currentHash: { type: String }
  };

  constructor() {
    super();
    this.appStateCtrl = new AppStateController(this);
    this.collapsed = false;
    this.mobileDrawerOpen = false;
    this.currentHash = window.location.hash || '#/calendar';

    this._onHashChange = () => {
      this.currentHash = window.location.hash || '#/calendar';
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('hashchange', this._onHashChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._onHashChange);
  }

  async firstUpdated() {
    await appState.init();
  }

  _isRouteActive(path) {
    const current = this.currentHash || '#/calendar';
    if (path === '/' || path === '/calendar') {
      return current === '#/' || current === '#/calendar' || current === '';
    }
    return current === `#${path}`;
  }

  _renderRoute() {
    const hash = this.currentHash || '#/calendar';

    if (hash === '#/tasks') {
      return html`<crono-task-list-view></crono-task-list-view>`;
    }
    if (hash === '#/tags') {
      return html`<crono-tag-list-view></crono-tag-list-view>`;
    }
    if (hash === '#/history') {
      return html`<crono-history-view></crono-history-view>`;
    }
    if (hash === '#/settings') {
      return html`<crono-settings-view></crono-settings-view>`;
    }
    return html`<crono-calendar-view></crono-calendar-view>`;
  }

  render() {
    const statusState = scheduleState.status; // 'idle' | 'computing'

    return html`
      <!-- Sidebar Desktop -->
      <aside class="sidebar ${this.collapsed ? 'collapsed' : ''}">
        <div>
          <div class="brand">
            <span>⏱</span>
            ${this.collapsed ? '' : 'Cronograma'}
          </div>

          <ul class="nav-list">
            <li class="nav-item">
              <a href="#/calendar" class="${this._isRouteActive('/calendar') ? 'active' : ''}">
                <span>📅</span>
                ${this.collapsed ? '' : 'Calendar'}
              </a>
            </li>
            <li class="nav-item">
              <a href="#/tasks" class="${this._isRouteActive('/tasks') ? 'active' : ''}">
                <span>✅</span>
                ${this.collapsed ? '' : 'Tasks'}
              </a>
            </li>
            <li class="nav-item">
              <a href="#/tags" class="${this._isRouteActive('/tags') ? 'active' : ''}">
                <span>🏷️</span>
                ${this.collapsed ? '' : 'Tags'}
              </a>
            </li>
            <li class="nav-item">
              <a href="#/history" class="${this._isRouteActive('/history') ? 'active' : ''}">
                <span>📊</span>
                ${this.collapsed ? '' : 'History'}
              </a>
            </li>
            <li class="nav-item">
              <a href="#/settings" class="${this._isRouteActive('/settings') ? 'active' : ''}">
                <span>⚙️</span>
                ${this.collapsed ? '' : 'Settings'}
              </a>
            </li>
          </ul>
        </div>

        <div class="sidebar-footer">
          <div class="status-indicator">
            <div class="dot ${statusState === 'computing' ? 'dot-blue' : 'dot-green'}"></div>
            ${this.collapsed ? '' : statusState === 'computing' ? 'Scheduler computing...' : 'Scheduler idle'}
          </div>
          ${this.collapsed ? '' : html`<div>Single-device local DB</div>`}
        </div>
      </aside>

      <!-- Main Layout Container -->
      <div class="main-wrapper">
        <!-- Top App Bar Mobile -->
        <header class="top-app-bar">
          <button class="crono-btn crono-btn-icon" @click=${() => this.mobileDrawerOpen = !this.mobileDrawerOpen}>☰</button>
          <span style="font-weight: 700; color: var(--accent);">Cronograma</span>
          <div class="status-indicator">
            <div class="dot ${statusState === 'computing' ? 'dot-blue' : 'dot-green'}"></div>
          </div>
        </header>

        <!-- Main View Outlet -->
        <main class="content-area">
          ${this._renderRoute()}
        </main>

        <!-- Bottom Nav Bar Mobile -->
        <nav class="bottom-nav">
          <a href="#/calendar" class="${this._isRouteActive('/calendar') ? 'active' : ''}">
            <span style="font-size: 18px;">📅</span>
            <span>Calendar</span>
          </a>
          <a href="#/tasks" class="${this._isRouteActive('/tasks') ? 'active' : ''}">
            <span style="font-size: 18px;">✅</span>
            <span>Tasks</span>
          </a>
        </nav>
      </div>

      <!-- Mobile Hamburger Drawer -->
      <crono-drawer-panel
        .open=${this.mobileDrawerOpen}
        title="Menu"
        @crono-drawer:close=${() => this.mobileDrawerOpen = false}
      >
        <ul class="nav-list">
          <li class="nav-item" @click=${() => this.mobileDrawerOpen = false}>
            <a href="#/tags" class="${this._isRouteActive('/tags') ? 'active' : ''}">
              <span>🏷️</span> Tags
            </a>
          </li>
          <li class="nav-item" @click=${() => this.mobileDrawerOpen = false}>
            <a href="#/history" class="${this._isRouteActive('/history') ? 'active' : ''}">
              <span>📊</span> History
            </a>
          </li>
          <li class="nav-item" @click=${() => this.mobileDrawerOpen = false}>
            <a href="#/settings" class="${this._isRouteActive('/settings') ? 'active' : ''}">
              <span>⚙️</span> Settings
            </a>
          </li>
        </ul>
      </crono-drawer-panel>

      <!-- Global Toast Container -->
      <crono-toast-notification></crono-toast-notification>
    `;
  }
}

customElements.define('app-shell', AppShell);
