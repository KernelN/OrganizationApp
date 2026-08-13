/**
 * Simple, zero-dependency, safe Markdown to HTML parser for Cronograma.
 * Escapes raw HTML entities to prevent XSS and transforms common Markdown constructs:
 * - Headers (# to ######)
 * - Blockquotes (>)
 * - Code blocks (```lang ... ```)
 * - Inline code (`code`)
 * - Bold (** or __), Italic (* or _), Strikethrough (~~)
 * - Unordered lists (- or *) and ordered lists (1.)
 * - Checkboxes (- [ ] and - [x])
 * - Links ([text](url)) with secure target/rel
 * - Horizontal rules (---)
 * - Tables (| a | b |)
 * - Paragraphs and line breaks
 */

/**
 * Escapes HTML characters.
 * @param {string} str 
 * @returns {string}
 */
export function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes URLs for links.
 * @param {string} url 
 * @returns {string}
 */
function sanitizeUrl(url) {
  const trimmed = url.trim();
  if (/^(https?:\/\/|mailto:|#)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return '#';
}

/**
 * Parses inline markdown elements within a line.
 * @param {string} text 
 * @returns {string}
 */
function parseInline(text) {
  let out = text;

  // Inline code (escaped beforehand)
  out = out.replace(/`([^`]+)`/g, (_, code) => `<code class="md-inline-code">${escapeHtml(code)}</code>`);

  // Bold & Italic
  out = out.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  out = out.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');

  // Bold
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Strikethrough
  out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Checkboxes
  out = out.replace(/^\[ \]\s*/, '<input type="checkbox" disabled class="md-checkbox" /> ');
  out = out.replace(/^\[[xX]\]\s*/, '<input type="checkbox" checked disabled class="md-checkbox" /> ');

  // Links [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    return `<a href="${sanitizeUrl(url)}" target="_blank" rel="noopener noreferrer" class="md-link">${label}</a>`;
  });

  return out;
}

/**
 * Parses markdown string to sanitized HTML.
 * @param {string} md 
 * @returns {string}
 */
export function parseMarkdown(md) {
  if (!md || typeof md !== 'string') return '';

  const lines = md.split(/\r?\n/);
  const htmlChunks = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines = [];
  let inList = false;
  let listType = ''; // 'ul' | 'ol'
  let inTable = false;
  let tableHeaderParsed = false;

  const closeList = () => {
    if (inList) {
      htmlChunks.push(`</${listType}>`);
      inList = false;
      listType = '';
    }
  };

  const closeTable = () => {
    if (inTable) {
      htmlChunks.push('</tbody></table></div>');
      inTable = false;
      tableHeaderParsed = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code blocks ```
    if (trimmed.startsWith('```')) {
      closeList();
      closeTable();
      if (inCodeBlock) {
        // End code block
        htmlChunks.push(`<pre class="md-code-block"><code class="language-${codeBlockLang}">${escapeHtml(codeBlockLines.join('\n'))}</code></pre>`);
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
        // Start code block
        inCodeBlock = true;
        codeBlockLang = escapeHtml(trimmed.slice(3).trim());
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Blank lines close lists and tables
    if (!trimmed) {
      closeList();
      closeTable();
      continue;
    }

    // Tables (| col | col |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      closeList();
      const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());

      // Is separator line (e.g. |---|---|)
      const isSeparator = cells.every(c => /^:?-+:?$/.test(c));

      if (isSeparator && inTable && !tableHeaderParsed) {
        tableHeaderParsed = true;
        htmlChunks.push('<tbody>');
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaderParsed = false;
        htmlChunks.push('<div class="md-table-wrapper"><table class="md-table"><thead><tr>');
        for (const cell of cells) {
          htmlChunks.push(`<th>${parseInline(escapeHtml(cell))}</th>`);
        }
        htmlChunks.push('</tr></thead>');
      } else {
        htmlChunks.push('<tr>');
        for (const cell of cells) {
          htmlChunks.push(`<td>${parseInline(escapeHtml(cell))}</td>`);
        }
        htmlChunks.push('</tr>');
      }
      continue;
    } else {
      closeTable();
    }

    // Horizontal rule (--- or *** or ___)
    if (/^(---|___|\*\*\*)$/.test(trimmed)) {
      closeList();
      htmlChunks.push('<hr class="md-hr" />');
      continue;
    }

    // Headers (# to ######)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      closeList();
      const level = headerMatch[1].length;
      const content = parseInline(escapeHtml(headerMatch[2]));
      htmlChunks.push(`<h${level} class="md-h${level}">${content}</h${level}>`);
      continue;
    }

    // Blockquote (> text)
    if (trimmed.startsWith('>')) {
      closeList();
      const quoteText = parseInline(escapeHtml(trimmed.replace(/^>\s*/, '')));
      htmlChunks.push(`<blockquote class="md-blockquote">${quoteText}</blockquote>`);
      continue;
    }

    // Checkbox list items (- [ ] / - [x])
    const checkMatch = trimmed.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (checkMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        inList = true;
        listType = 'ul';
        htmlChunks.push('<ul class="md-list md-task-list">');
      }
      const isChecked = checkMatch[1].toLowerCase() === 'x';
      const itemText = parseInline(escapeHtml(checkMatch[2]));
      htmlChunks.push(`<li class="md-task-item"><input type="checkbox" disabled ${isChecked ? 'checked' : ''} class="md-checkbox" /> <span>${itemText}</span></li>`);
      continue;
    }

    // Unordered lists (- or *)
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        inList = true;
        listType = 'ul';
        htmlChunks.push('<ul class="md-list">');
      }
      const itemText = parseInline(escapeHtml(ulMatch[1]));
      htmlChunks.push(`<li>${itemText}</li>`);
      continue;
    }

    // Ordered lists (1. 2.)
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        inList = true;
        listType = 'ol';
        htmlChunks.push('<ol class="md-list">');
      }
      const itemText = parseInline(escapeHtml(olMatch[2]));
      htmlChunks.push(`<li>${itemText}</li>`);
      continue;
    }

    // Standard paragraph
    closeList();
    const paragraphText = parseInline(escapeHtml(trimmed));
    htmlChunks.push(`<p class="md-p">${paragraphText}</p>`);
  }

  closeList();
  closeTable();

  return htmlChunks.join('\n');
}
