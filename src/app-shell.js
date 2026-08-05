import { LitElement, html, css } from 'lit';
import { appState } from './state/app-state.js';
import './components/calendar/calendar-view.js';
import './components/tasks/task-list-view.js';
import './components/tags/tag-list-view.js';
import './components/history/history-view.js';
import './components/settings/settings-view.js';

export class AppShell extends LitElement {
  static properties = {
    currentRoute: { type: String }
  };

  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background-color: var(--color-bg-base, #121318);
      color: var(--color-text-primary, #F3F4F6);
      font-family: var(--font-family-sans, sans-serif);
    }

    /* Sidebar Navigation (Desktop) */
    .sidebar {
      width: 260px;
      background: var(--color-bg-surface, #1A1C23);
      border-right: 1px solid var(--color-border, #2E3242);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: var(--space-4, 16px);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      margin-bottom: 24px;
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      background: var(--color-accent, #6366F1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
      font-family: var(--font-family-display);
      box-shadow: 0 0 12px var(--color-accent-subtle, rgba(99, 102, 241, 0.3));
    }

    .brand-title {
      font-family: var(--font-family-display, sans-serif);
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      list-style: none;
    }

    .nav-item a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-md, 8px);
      color: var(--color-text-secondary, #9CA3AF);
      font-weight: 500;
      text-decoration: none;
      transition: background 150ms ease, color 150ms ease;
    }

    .nav-item a:hover {
      background: var(--color-bg-surface-hover, #232631);
      color: var(--color-text-primary, #F3F4F6);
    }

    .nav-item.active a {
      background: var(--color-accent-subtle, rgba(99, 102, 241, 0.15));
      color: var(--color-accent, #6366F1);
      font-weight: 600;
    }

    .nav-icon {
      font-size: 1.2rem;
    }

    /* Main Workspace */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background-color: var(--color-bg-base, #121318);
      position: relative;
    }

    .content-area {
      flex: 1;
      padding: var(--space-6, 24px);
    }

    /* Bottom Navigation Bar (Mobile) */
    .bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: var(--color-bg-surface, #1A1C23);
      border-top: 1px solid var(--color-border, #2E3242);
      z-index: var(--z-sticky, 200);
      justify-content: space-around;
      align-items: center;
    }

    .bottom-nav a {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--color-text-secondary, #9CA3AF);
      font-size: 0.75rem;
      text-decoration: none;
    }

    .bottom-nav a.active {
      color: var(--color-accent, #6366F1);
      font-weight: 600;
    }

    @media (max-width: 767px) {
      .sidebar {
        display: none;
      }
      .bottom-nav {
        display: flex;
      }
      .content-area {
        padding-bottom: 80px;
      }
    }

    /* Header Bar */
    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid var(--color-border, #2E3242);
      background: var(--color-bg-surface, #1A1C23);
    }

    .page-title {
      font-family: var(--font-family-display);
      font-size: 1.25rem;
      font-weight: 700;
    }
  `;

  constructor() {
    super();
    this.currentRoute = this.getRouteFromHash();
    this.onHashChange = this.onHashChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    appState.init();
    window.addEventListener('hashchange', this.onHashChange);
    this.unsubscribeState = appState.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this.onHashChange);
    if (this.unsubscribeState) this.unsubscribeState();
  }

  getRouteFromHash() {
    const hash = window.location.hash.replace('#', '') || 'calendar';
    return hash;
  }

  onHashChange() {
    this.currentRoute = this.getRouteFromHash();
  }

  isActive(route) {
    return this.currentRoute === route;
  }

  renderRouteContent() {
    switch (this.currentRoute) {
      case 'tasks':
        return this.renderPage('Tasks', html`<task-list-view></task-list-view>`);
      case 'tags':
        return this.renderPage('Tags', html`<tag-list-view></tag-list-view>`);
      case 'history':
        return this.renderPage('History', html`<history-view></history-view>`);
      case 'settings':
        return this.renderPage('Settings', html`<settings-view></settings-view>`);
      case 'calendar':
      default:
        return this.renderPage('Calendar', html`<calendar-view></calendar-view>`);
    }
  }

  renderPage(title, content) {
    return html`
      <div class="header-bar">
        <h1 class="page-title">${title}</h1>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-accent">Offline-First IDB</span>
        </div>
      </div>
      <div class="content-area">
        ${content}
      </div>
    `;
  }

  render() {
    return html`
      <!-- Desktop Sidebar -->
      <aside class="sidebar">
        <div>
          <div class="brand">
            <div class="brand-logo">C</div>
            <div class="brand-title">Cronograma</div>
          </div>
          <ul class="nav-list">
            <li class="nav-item ${this.isActive('calendar') ? 'active' : ''}">
              <a href="#calendar">
                <span class="nav-icon">📅</span>
                <span>Calendar</span>
              </a>
            </li>
            <li class="nav-item ${this.isActive('tasks') ? 'active' : ''}">
              <a href="#tasks">
                <span class="nav-icon">📋</span>
                <span>Tasks</span>
              </a>
            </li>
            <li class="nav-item ${this.isActive('tags') ? 'active' : ''}">
              <a href="#tags">
                <span class="nav-icon">🏷️</span>
                <span>Tags</span>
              </a>
            </li>
            <li class="nav-item ${this.isActive('history') ? 'active' : ''}">
              <a href="#history">
                <span class="nav-icon">📜</span>
                <span>History</span>
              </a>
            </li>
            <li class="nav-item ${this.isActive('settings') ? 'active' : ''}">
              <a href="#settings">
                <span class="nav-icon">⚙️</span>
                <span>Settings</span>
              </a>
            </li>
          </ul>
        </div>
        <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); padding: 8px 12px;">
          Cronograma v1.0.0
        </div>
      </aside>

      <!-- Main Workspace -->
      <main class="main-content">
        ${this.renderRouteContent()}
      </main>

      <!-- Mobile Bottom Nav -->
      <nav class="bottom-nav">
        <a href="#calendar" class="${this.isActive('calendar') ? 'active' : ''}">
          <span>📅</span>
          <span>Calendar</span>
        </a>
        <a href="#tasks" class="${this.isActive('tasks') ? 'active' : ''}">
          <span>📋</span>
          <span>Tasks</span>
        </a>
        <a href="#tags" class="${this.isActive('tags') ? 'active' : ''}">
          <span>🏷️</span>
          <span>Tags</span>
        </a>
        <a href="#history" class="${this.isActive('history') ? 'active' : ''}">
          <span>📜</span>
          <span>History</span>
        </a>
        <a href="#settings" class="${this.isActive('settings') ? 'active' : ''}">
          <span>⚙️</span>
          <span>Settings</span>
        </a>
      </nav>
    `;
  }
}

customElements.define('app-shell', AppShell);
