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

  /* Markdown Body Styles */
  .markdown-body {
    font-size: 13px;
    line-height: 1.6;
    color: var(--text-primary);
    word-break: break-word;
  }
  .markdown-body h1, .markdown-body .md-h1 { font-size: 18px; font-weight: 700; margin: var(--space-sm) 0 var(--space-xs); color: var(--text-primary); }
  .markdown-body h2, .markdown-body .md-h2 { font-size: 16px; font-weight: 700; margin: var(--space-sm) 0 var(--space-xs); color: var(--text-primary); }
  .markdown-body h3, .markdown-body .md-h3 { font-size: 14px; font-weight: 600; margin: var(--space-xs) 0 4px; color: var(--text-primary); }
  .markdown-body h4, .markdown-body h5, .markdown-body h6, .markdown-body .md-h4, .markdown-body .md-h5, .markdown-body .md-h6 { font-size: 13px; font-weight: 600; margin: var(--space-xs) 0 4px; }
  .markdown-body p, .markdown-body .md-p { margin: 0 0 var(--space-xs); }
  .markdown-body p:last-child { margin-bottom: 0; }
  .markdown-body strong { font-weight: 700; color: var(--text-primary); }
  .markdown-body em { font-style: italic; }
  .markdown-body del { text-decoration: line-through; opacity: 0.7; }
  .markdown-body hr, .markdown-body .md-hr { border: none; border-top: 1px solid var(--border); margin: var(--space-sm) 0; }
  .markdown-body blockquote, .markdown-body .md-blockquote {
    margin: var(--space-xs) 0;
    padding: var(--space-xs) var(--space-md);
    border-left: 3px solid var(--accent);
    background: var(--bg-tertiary);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    color: var(--text-secondary);
  }
  .markdown-body .md-inline-code {
    font-family: var(--font-mono, monospace);
    font-size: 12px;
    padding: 2px 5px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--accent);
  }
  .markdown-body pre, .markdown-body .md-code-block {
    margin: var(--space-xs) 0;
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow-x: auto;
    font-family: var(--font-mono, monospace);
    font-size: 12px;
    line-height: 1.4;
  }
  .markdown-body pre code {
    background: transparent;
    padding: 0;
    border: none;
    color: var(--text-primary);
  }
  .markdown-body ul.md-list {
    list-style: none;
    padding-left: 0;
    margin: var(--space-xs) 0;
  }
  .markdown-body ul.md-list ul.md-list {
    margin: 2px 0;
    padding-left: 0;
  }
  .markdown-body ol.md-list {
    margin: var(--space-xs) 0;
    padding-left: 20px;
  }
  .markdown-body li {
    margin-bottom: 3px;
  }
  .markdown-body .md-bullet-track {
    display: inline-flex;
    align-items: center;
    margin-right: 4px;
    vertical-align: middle;
  }
  .markdown-body .md-bullet-col {
    display: inline-block;
    width: 16px;
    text-align: center;
    color: var(--text-primary);
    font-size: 14px;
    line-height: 1;
    user-select: none;
    flex-shrink: 0;
  }
  .markdown-body .md-task-list {
    list-style: none;
    padding-left: 0;
  }
  .markdown-body .md-task-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-xs);
  }
  .markdown-body .md-checkbox {
    margin-top: 3px;
    cursor: default;
  }
  .markdown-body a, .markdown-body .md-link {
    color: var(--accent);
    text-decoration: underline;
  }
  .markdown-body a:hover, .markdown-body .md-link:hover {
    color: var(--accent-hover);
  }
  .markdown-body .md-table-wrapper {
    overflow-x: auto;
    margin: var(--space-xs) 0;
  }
  .markdown-body table, .markdown-body .md-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  .markdown-body th, .markdown-body td {
    padding: 6px 10px;
    border: 1px solid var(--border);
    text-align: left;
  }
  .markdown-body th {
    background: var(--bg-tertiary);
    font-weight: 600;
  }
  .markdown-body tr:nth-child(even) {
    background: var(--bg-surface);
  }
`;
