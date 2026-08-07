import { css } from 'lit';

export const sharedStyles = css`
  :host {
    box-sizing: border-box;
    font-family: var(--font-family, system-ui, sans-serif);
    color: var(--text-primary);
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  /* Form Controls */
  .crono-input, .crono-select, .crono-textarea {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: 14px;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .crono-input:focus, .crono-select:focus, .crono-textarea:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-glow);
  }

  .crono-input-num-sm {
    width: 65px !important;
    text-align: center;
    padding: var(--space-xs) var(--space-sm);
  }

  .unit-pair {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .crono-textarea {
    min-height: 80px;
    resize: vertical;
  }

  /* Buttons */
  .crono-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
  }

  .crono-btn:active {
    transform: scale(0.98);
  }

  .crono-btn-primary {
    background: var(--accent);
    color: #ffffff;
  }

  .crono-btn-primary:hover {
    background: var(--accent-hover);
    box-shadow: var(--glow);
  }

  .crono-btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border-color: var(--border);
  }

  .crono-btn-secondary:hover {
    background: var(--bg-surface);
    border-color: var(--border-hover);
  }

  .crono-btn-danger {
    background: var(--alert-red);
    color: #ffffff;
  }

  .crono-btn-danger:hover {
    filter: brightness(1.1);
  }

  .crono-btn-sm {
    padding: 4px var(--space-sm);
    font-size: 12px;
    border-radius: var(--radius-sm);
  }

  .crono-btn-icon {
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
  }

  .crono-btn-icon:hover {
    color: var(--text-primary);
    background: var(--bg-tertiary);
  }

  /* Badges & Chips */
  .crono-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    text-transform: uppercase;
  }

  /* Scrollbars */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: var(--bg-primary);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--border-hover);
  }
`;
