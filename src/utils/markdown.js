/**
 * Simple, zero-dependency, safe Markdown to HTML parser for Cronograma.
 * Escapes raw HTML entities to prevent XSS and transforms common Markdown constructs:
 * - Headers (# to ######)
 * - Blockquotes (>)
 * - Code blocks (```lang ... ```)
 * - Inline code (`code`)
 * - Bold (** or __), Italic (* or _), Strikethrough (~~)
 * - Unordered lists with nested subpoints (* * * or - - or indentation)
 * - Ordered lists (1. 2.)
 * - Checkboxes (- [ ] and - [x] or * * [x])
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
  const listStack = []; // Array of { type: 'ul'|'ol', level: number }
  let inTable = false;
  let tableHeaderParsed = false;

  const closeListToLevel = (targetLevel) => {
    while (listStack.length > targetLevel) {
      const closed = listStack.pop();
      htmlChunks.push(`</${closed.type}>`);
    }
  };

  const closeAllLists = () => {
    closeListToLevel(0);
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
      closeAllLists();
      closeTable();
      if (inCodeBlock) {
        htmlChunks.push(`<pre class="md-code-block"><code class="language-${codeBlockLang}">${escapeHtml(codeBlockLines.join('\n'))}</code></pre>`);
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
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
      closeAllLists();
      closeTable();
      continue;
    }

    // Tables (| col | col |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      closeAllLists();
      const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
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

    // Horizontal rule (--- or *** or ___ with nothing else)
    if (/^(---|___|\*\*\*)$/.test(trimmed)) {
      closeAllLists();
      htmlChunks.push('<hr class="md-hr" />');
      continue;
    }

    // Headers (# to ######)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      closeAllLists();
      const level = headerMatch[1].length;
      const content = parseInline(escapeHtml(headerMatch[2]));
      htmlChunks.push(`<h${level} class="md-h${level}">${content}</h${level}>`);
      continue;
    }

    // Blockquote (> text)
    if (trimmed.startsWith('>')) {
      closeAllLists();
      const quoteText = parseInline(escapeHtml(trimmed.replace(/^>\s*/, '')));
      htmlChunks.push(`<blockquote class="md-blockquote">${quoteText}</blockquote>`);
      continue;
    }

    // ── List Item Detection (Handles * * *, - -, + +, and space indentation) ──
    let isListItem = false;
    let listType = 'ul';
    let listDepth = 1;
    let itemContent = '';
    let bulletPrefix = '';

    // Check concatenated markers (e.g. * * *, - - -, + + +)
    const concatAsteriskMatch = trimmed.match(/^(\*(?:\s*\*)+)\s+(.*)$/);
    const concatDashMatch = trimmed.match(/^(-(?:\s*-)+)\s+(.*)$/);
    const concatPlusMatch = trimmed.match(/^(\+(?:\s*\+)+)\s+(.*)$/);

    if (concatAsteriskMatch) {
      isListItem = true;
      listType = 'ul';
      listDepth = (concatAsteriskMatch[1].match(/\*/g) || []).length;
      itemContent = concatAsteriskMatch[2];
      bulletPrefix = listDepth > 1 ? Array(listDepth).fill('•').join(' ') + ' ' : '';
    } else if (concatDashMatch) {
      isListItem = true;
      listType = 'ul';
      listDepth = (concatDashMatch[1].match(/-/g) || []).length;
      itemContent = concatDashMatch[2];
      bulletPrefix = listDepth > 1 ? Array(listDepth).fill('-').join(' ') + ' ' : '';
    } else if (concatPlusMatch) {
      isListItem = true;
      listType = 'ul';
      listDepth = (concatPlusMatch[1].match(/\+/g) || []).length;
      itemContent = concatPlusMatch[2];
      bulletPrefix = listDepth > 1 ? Array(listDepth).fill('+').join(' ') + ' ' : '';
    } else {
      // Check standard single bullet with indentation (- / * / +)
      const indentBulletMatch = rawLine.match(/^(\s*)([-*+])\s+(.*)$/);
      if (indentBulletMatch) {
        isListItem = true;
        listType = 'ul';
        listDepth = 1 + Math.floor(indentBulletMatch[1].length / 2);
        itemContent = indentBulletMatch[3];
      } else {
        // Check ordered list with indentation (1. 2.)
        const indentOrderedMatch = rawLine.match(/^(\s*)(\d+)\.\s+(.*)$/);
        if (indentOrderedMatch) {
          isListItem = true;
          listType = 'ol';
          listDepth = 1 + Math.floor(indentOrderedMatch[1].length / 2);
          itemContent = indentOrderedMatch[3];
        }
      }
    }

    if (isListItem) {
      // Adjust list stack to target depth
      if (listStack.length < listDepth) {
        while (listStack.length < listDepth) {
          htmlChunks.push(`<${listType} class="md-list">`);
          listStack.push({ type: listType, level: listStack.length + 1 });
        }
      } else if (listStack.length > listDepth) {
        closeListToLevel(listDepth);
      }

      // Check for task checkbox: [ ] or [x]
      const checkMatch = itemContent.match(/^\[([ xX])\]\s+(.*)$/);
      if (checkMatch) {
        const isChecked = checkMatch[1].toLowerCase() === 'x';
        const parsedText = parseInline(escapeHtml(checkMatch[2]));
        const taskTrack = listDepth > 1 ? `<span class="md-bullet-track">${'<span class="md-bullet-col">•</span>'.repeat(listDepth - 1)}</span>` : '';
        htmlChunks.push(`<li class="md-task-item">${taskTrack}<input type="checkbox" disabled ${isChecked ? 'checked' : ''} class="md-checkbox" /> <span>${parsedText}</span></li>`);
      } else if (listType === 'ul') {
        const trackHtml = `<span class="md-bullet-track">${'<span class="md-bullet-col">•</span>'.repeat(listDepth)}</span>`;
        const parsedText = parseInline(escapeHtml(itemContent));
        htmlChunks.push(`<li>${trackHtml}<span>${parsedText}</span></li>`);
      } else {
        const parsedText = parseInline(escapeHtml(itemContent));
        htmlChunks.push(`<li>${parsedText}</li>`);
      }
      continue;
    }

    // Standard paragraph
    closeAllLists();
    const paragraphText = parseInline(escapeHtml(trimmed));
    htmlChunks.push(`<p class="md-p">${paragraphText}</p>`);
  }

  closeAllLists();
  closeTable();

  return htmlChunks.join('\n');
}
