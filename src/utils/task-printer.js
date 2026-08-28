import { getTagDepth, getTagDescendants } from './validators.js';

/**
 * Pure formatting and export utilities for Cronograma tasks.
 */

/**
 * Formats duration in hours (e.g. 1.5) into a compact human-readable string ("1h 30m", "2h", "45m").
 * @param {number} durationHours
 * @returns {string}
 */
export function formatTaskDuration(durationHours) {
  if (typeof durationHours !== 'number' || isNaN(durationHours) || durationHours <= 0) {
    return '0m';
  }

  let totalMins = Math.round(durationHours * 60);
  let hours = Math.floor(totalMins / 60);
  let mins = totalMins % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0 && mins === 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Formats a date or ISO datetime string according to dateOrder, omitYear, and omitHour options.
 * @param {string|Date} dateInput
 * @param {Object} [options={}]
 * @param {boolean} [options.omitYear=false]
 * @param {boolean} [options.omitHour=false]
 * @param {string} [options.dateOrder='Y-M-D'] - 'Y-M-D' | 'M-D-Y' | 'D-M-Y'
 * @returns {string}
 */
export function formatPrintDate(dateInput, options = {}) {
  const {
    omitYear = false,
    omitHour = false,
    dateOrder = 'Y-M-D'
  } = options;

  if (!dateInput) return '-';

  let year = '';
  let month = '';
  let day = '';
  let hours = '00';
  let mins = '00';
  let hasTime = false;

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Pure YYYY-MM-DD date string
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      [year, month, day] = trimmed.split('-');
      hasTime = false;
    } else {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return '-';
      year = String(d.getFullYear());
      month = String(d.getMonth() + 1).padStart(2, '0');
      day = String(d.getDate()).padStart(2, '0');
      hours = String(d.getHours()).padStart(2, '0');
      mins = String(d.getMinutes()).padStart(2, '0');
      hasTime = (dateInput.includes('T') && !dateInput.endsWith('T00:00:00.000Z') && !dateInput.endsWith('T00:00:00Z')) || dateInput.includes(':');
    }
  } else {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '-';
    year = String(d.getFullYear());
    month = String(d.getMonth() + 1).padStart(2, '0');
    day = String(d.getDate()).padStart(2, '0');
    hours = String(d.getHours()).padStart(2, '0');
    mins = String(d.getMinutes()).padStart(2, '0');
    hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  }

  // Build date part based on dateOrder and omitYear
  let datePart = '';
  if (omitYear) {
    if (dateOrder === 'D-M-Y') {
      datePart = `${day}-${month}`;
    } else {
      datePart = `${month}-${day}`;
    }
  } else {
    if (dateOrder === 'M-D-Y') {
      datePart = `${month}-${day}-${year}`;
    } else if (dateOrder === 'D-M-Y') {
      datePart = `${day}-${month}-${year}`;
    } else {
      datePart = `${year}-${month}-${day}`;
    }
  }

  if (hasTime && !omitHour) {
    return `${datePart} ${hours}:${mins}`;
  }

  return datePart;
}

/**
 * Returns tags sorted in depth-first hierarchical tree order so that child subtags appear
 * immediately below their parent tags.
 *
 * @param {Array<Object>} allTags
 * @returns {Array<Object>}
 */
export function getTreeOrderedTags(allTags = []) {
  const tagMap = new Map(allTags.map(t => [t.id, t]));
  const childrenMap = new Map();

  for (const tag of allTags) {
    const pId = tag.parent_tag_id || null;
    if (!childrenMap.has(pId)) {
      childrenMap.set(pId, []);
    }
    childrenMap.get(pId).push(tag);
  }

  // Sort sibling tags alphabetically by name
  for (const list of childrenMap.values()) {
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  const result = [];
  const visited = new Set();

  const traverse = (parentId) => {
    const children = childrenMap.get(parentId) || [];
    for (const child of children) {
      if (visited.has(child.id)) continue;
      visited.add(child.id);
      result.push(child);
      traverse(child.id);
    }
  };

  // Start with root tags (parent_tag_id is null or not in tagMap)
  const rootTags = allTags.filter(t => !t.parent_tag_id || !tagMap.has(t.parent_tag_id));
  rootTags.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  for (const root of rootTags) {
    if (!visited.has(root.id)) {
      visited.add(root.id);
      result.push(root);
      traverse(root.id);
    }
  }

  // Add any orphan tags if not visited
  for (const tag of allTags) {
    if (!visited.has(tag.id)) {
      visited.add(tag.id);
      result.push(tag);
    }
  }

  return result;
}

/**
 * Builds a hierarchical tag breadcrumb string from task tag IDs:
 * e.g. "Root Tag > Subtag > Subtag 2"
 * and appends optional tag deadline in parentheses.
 *
 * If selectedTagFilter is specified and includeSubtags is false, the breadcrumb
 * is capped at the selected tag level.
 *
 * @param {Array<string>|string} tagIds - Task tag IDs or single tag ID
 * @param {Array<Object>} allTags
 * @param {Object} [options={}]
 * @param {string} [options.selectedTagFilter='']
 * @param {boolean} [options.includeSubtags=true]
 * @param {boolean} [options.omitYear=false]
 * @param {boolean} [options.omitHour=false]
 * @param {string} [options.dateOrder='Y-M-D']
 * @returns {string}
 */
export function buildTaskTagBreadcrumb(tagIds, allTags = [], options = {}) {
  const {
    selectedTagFilter = '',
    includeSubtags = true,
    omitYear = false,
    omitHour = false,
    dateOrder = 'Y-M-D'
  } = options;

  const ids = Array.isArray(tagIds) ? tagIds : (tagIds ? [tagIds] : []);
  if (ids.length === 0) return 'Untagged';

  const validTags = ids.map(id => allTags.find(t => t.id === id)).filter(Boolean);
  if (validTags.length === 0) return 'Untagged';

  let targetLeafTag = null;

  // If a tag is selected in the filter and includeSubtags is OFF, cap path at selected tag
  if (selectedTagFilter && selectedTagFilter !== 'untagged' && !includeSubtags) {
    targetLeafTag = allTags.find(t => t.id === selectedTagFilter) || validTags[0];
  } else {
    // Find the deepest tag in the task's tag hierarchy
    targetLeafTag = validTags[0];
    let maxDepth = getTagDepth(targetLeafTag.id, allTags);

    for (let i = 1; i < validTags.length; i++) {
      const depth = getTagDepth(validTags[i].id, allTags);
      if (depth > maxDepth) {
        maxDepth = depth;
        targetLeafTag = validTags[i];
      }
    }
  }

  // Walk up from targetLeafTag to the root
  const chain = [targetLeafTag];
  const visited = new Set([targetLeafTag.id]);
  let curr = targetLeafTag;

  while (curr.parent_tag_id) {
    const parent = allTags.find(t => t.id === curr.parent_tag_id);
    if (!parent || visited.has(parent.id)) break; // cycle protection
    visited.add(parent.id);
    chain.unshift(parent);
    curr = parent;
  }

  const namePath = chain.map(t => t.name).join(' > ');

  // If any tag in chain has a deadline, append the closest tag's deadline
  const deadlineTag = chain.slice().reverse().find(t => Boolean(t.deadline));
  if (deadlineTag && deadlineTag.deadline) {
    const formattedDeadline = formatPrintDate(deadlineTag.deadline, { omitYear, omitHour, dateOrder });
    if (formattedDeadline !== '-') {
      return `${namePath} (Deadline: ${formattedDeadline})`;
    }
  }

  return namePath;
}

/**
 * Builds recursive dependency tree paths for a task:
 * e.g. ["Hard Task B > Soft Task C", "Soft Task D"]
 * @param {string} taskId
 * @param {Array<Object>} allTasks
 * @param {Array<Object>} allDependencies
 * @param {Set<string>} [visited=new Set()]
 * @returns {Array<string>}
 */
export function buildDependencyTreePaths(taskId, allTasks = [], allDependencies = [], visited = new Set()) {
  if (!taskId || visited.has(taskId)) return [];

  const taskMap = new Map((allTasks || []).map(t => [t.id, t]));
  const directDeps = (allDependencies || []).filter(d => d.task_id === taskId);
  if (directDeps.length === 0) return [];

  const currentVisited = new Set(visited);
  currentVisited.add(taskId);

  const paths = [];

  for (const dep of directDeps) {
    const prereqTask = taskMap.get(dep.depends_on_id);
    const prereqTitle = prereqTask ? prereqTask.title : `Task (${dep.depends_on_id})`;
    const typeLabel = dep.type ? dep.type.charAt(0).toUpperCase() + dep.type.slice(1) : 'Hard';
    const segment = `${typeLabel} ${prereqTitle}`;

    const childPaths = buildDependencyTreePaths(dep.depends_on_id, allTasks, allDependencies, currentVisited);

    if (childPaths.length > 0) {
      for (const childPath of childPaths) {
        paths.push(`${segment} > ${childPath}`);
      }
    } else {
      paths.push(segment);
    }
  }

  return paths;
}

/**
 * Formats a single task into the specified document format.
 * Dynamically places the active sortBy field as the first entry of the task block.
 *
 * @param {Object} task
 * @param {Object} options
 * @param {string} [options.sortBy='priority'] - 'priority' | 'deadline' | 'name' | 'tag' | 'duration'
 * @param {boolean} [options.useMarkdown=true]
 * @param {boolean} [options.omitYear=false]
 * @param {boolean} [options.omitHour=false]
 * @param {string} [options.dateOrder='Y-M-D']
 * @param {boolean} [options.omitEmptyFields=false]
 * @param {string} [options.selectedTagFilter='']
 * @param {boolean} [options.includeSubtags=true]
 * @param {Object} context
 * @param {Array<Object>} context.allTags
 * @param {Array<Object>} context.allTasks
 * @param {Array<Object>} context.allDependencies
 * @returns {string}
 */
export function formatTaskBlock(task, options = {}, context = {}) {
  const {
    sortBy = 'priority',
    useMarkdown = true,
    omitYear = false,
    omitHour = false,
    dateOrder = 'Y-M-D',
    omitEmptyFields = false,
    selectedTagFilter = '',
    includeSubtags = true
  } = options;

  const {
    allTags = [],
    allTasks = [],
    allDependencies = []
  } = context;

  const bold = (txt) => (useMarkdown ? `**${txt}**` : txt);
  const italic = (txt) => (useMarkdown ? `*${txt}*` : txt);
  const boldItalic = (txt) => (useMarkdown ? `***${txt}***` : txt);

  // 1. Build Tag Entry (Bold and Italic)
  const tagBreadcrumb = buildTaskTagBreadcrumb(task.tag_ids, allTags, {
    selectedTagFilter,
    includeSubtags,
    omitYear,
    omitHour,
    dateOrder
  });
  const isUntagged = tagBreadcrumb === 'Untagged';
  let tagLine = null;
  if (!omitEmptyFields || !isUntagged) {
    tagLine = boldItalic(tagBreadcrumb);
  }

  // 2. Build Name Entry (Bold without leading dash)
  const nameLine = bold(task.title || 'Untitled');

  // 3. Build Priority Entry (Without colon: "Priority [priority]")
  const priorityVal = typeof task.priority === 'number' ? task.priority : 0;
  const priorityLine = `Priority ${italic(String(priorityVal))}`;

  // 4. Build Deadline Entry
  const hasDeadline = Boolean(task.deadline);
  let deadlineLine = null;
  if (!omitEmptyFields || hasDeadline) {
    const deadlineVal = hasDeadline ? formatPrintDate(task.deadline, { omitYear, omitHour, dateOrder }) : '-';
    deadlineLine = `Deadline: ${italic(deadlineVal)}`;
  }

  // 5. Build Duration Entry
  const durationVal = formatTaskDuration(task.duration_hours);
  const durationLine = `Duration: ${italic(durationVal)}`;

  // 6. Build Depends on Entry
  const depPaths = buildDependencyTreePaths(task.id, allTasks, allDependencies);
  const hasDeps = depPaths.length > 0;
  let dependsOnBlock = null;
  if (!omitEmptyFields || hasDeps) {
    if (hasDeps) {
      const formattedPaths = depPaths.map(p => italic(p)).join('\n');
      dependsOnBlock = `Depends on:\n${formattedPaths}`;
    } else {
      dependsOnBlock = `Depends on: ${italic('-')}`;
    }
  }

  // 7. Build Description Entry
  const hasDesc = Boolean(task.description && task.description.trim());
  let descriptionBlock = null;
  if (!omitEmptyFields || hasDesc) {
    const descText = hasDesc ? task.description.trim() : '-';
    descriptionBlock = `Description:\n${descText}`;
  }

  // Standard entries dictionary
  const entriesMap = {
    tag: tagLine,
    name: nameLine,
    priority: priorityLine,
    deadline: deadlineLine,
    duration: durationLine,
    dependencies: dependsOnBlock,
    description: descriptionBlock
  };

  // Determine order based on sortBy
  // Whichever field is selected as sort field is placed first!
  let orderedKeys = [];

  switch (sortBy) {
    case 'name':
      orderedKeys = ['name', 'tag', 'priority', 'deadline', 'duration', 'dependencies', 'description'];
      break;
    case 'deadline':
      orderedKeys = ['deadline', 'tag', 'name', 'priority', 'duration', 'dependencies', 'description'];
      break;
    case 'tag':
      orderedKeys = ['tag', 'name', 'priority', 'deadline', 'duration', 'dependencies', 'description'];
      break;
    case 'duration':
      orderedKeys = ['duration', 'tag', 'name', 'priority', 'deadline', 'dependencies', 'description'];
      break;
    case 'priority':
    default:
      orderedKeys = ['priority', 'tag', 'name', 'deadline', 'duration', 'dependencies', 'description'];
      break;
  }

  return orderedKeys.map(k => entriesMap[k]).filter(Boolean).join('\n');
}

/**
 * Filters, sorts, and generates the complete printable text/markdown document.
 *
 * @param {Array<Object>} tasks
 * @param {Object} options
 * @param {string} [options.selectedTagFilter=''] - '' (All) | 'untagged' | tagId
 * @param {boolean} [options.includeSubtags=true]
 * @param {boolean} [options.includeCompleted=false]
 * @param {string} [options.sortBy='priority'] - 'priority' | 'deadline' | 'tag' | 'name' | 'duration'
 * @param {boolean} [options.useMarkdown=true]
 * @param {boolean} [options.omitYear=false]
 * @param {boolean} [options.omitHour=false]
 * @param {string} [options.dateOrder='Y-M-D']
 * @param {boolean} [options.omitEmptyFields=false]
 * @param {Object} context
 * @param {Array<Object>} context.allTags
 * @param {Array<Object>} context.allTasks
 * @param {Array<Object>} context.allDependencies
 * @returns {string}
 */
export function generateTasksPrintDocument(tasks = [], options = {}, context = {}) {
  const {
    selectedTagFilter = '',
    includeSubtags = true,
    includeCompleted = false,
    sortBy = 'priority',
    useMarkdown = true,
    omitYear = false,
    omitHour = false,
    dateOrder = 'Y-M-D',
    omitEmptyFields = false
  } = options;

  const { allTags = [], allTasks = [], allDependencies = [] } = context;

  // 1. Status filter
  let filtered = tasks.filter(t => (includeCompleted ? true : t.status === 'active'));

  // 2. Tag filter
  if (selectedTagFilter === 'untagged') {
    filtered = filtered.filter(t => !Array.isArray(t.tag_ids) || t.tag_ids.length === 0);
  } else if (selectedTagFilter) {
    if (includeSubtags) {
      // Include selected tag AND all of its descendant subtags
      const targetTagIds = new Set([selectedTagFilter]);
      const descendants = getTagDescendants(selectedTagFilter, allTags);
      for (const d of descendants) {
        targetTagIds.add(d.id);
      }
      filtered = filtered.filter(t => Array.isArray(t.tag_ids) && t.tag_ids.some(id => targetTagIds.has(id)));
    } else {
      // Include ONLY tasks belonging directly to selectedTagFilter without any descendant subtags
      const descendantIds = new Set(getTagDescendants(selectedTagFilter, allTags).map(d => d.id));
      filtered = filtered.filter(t => {
        if (!Array.isArray(t.tag_ids) || !t.tag_ids.includes(selectedTagFilter)) return false;
        // Omit task if it has any descendant subtag of the selected tag
        return !t.tag_ids.some(id => descendantIds.has(id));
      });
    }
  }

  // 3. Sorting
  const sorted = [...filtered];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.title || '').localeCompare(b.title || '');

      case 'deadline': {
        const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        if (da !== db) return da - db;
        return (b.priority || 0) - (a.priority || 0);
      }

      case 'duration': {
        const dura = a.duration_hours || 0;
        const durb = b.duration_hours || 0;
        if (dura !== durb) return dura - durb;
        return (b.priority || 0) - (a.priority || 0);
      }

      case 'tag': {
        const tagA = buildTaskTagBreadcrumb(a.tag_ids, allTags, { selectedTagFilter, includeSubtags });
        const tagB = buildTaskTagBreadcrumb(b.tag_ids, allTags, { selectedTagFilter, includeSubtags });
        const tagComp = tagA.localeCompare(tagB);
        if (tagComp !== 0) return tagComp;
        return (b.priority || 0) - (a.priority || 0);
      }

      case 'priority':
      default: {
        const pDiff = (b.priority || 0) - (a.priority || 0);
        if (pDiff !== 0) return pDiff;
        // Secondary sort by deadline then name
        const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        if (da !== db) return da - db;
        return (a.title || '').localeCompare(b.title || '');
      }
    }
  });

  if (sorted.length === 0) {
    return 'No tasks match the selected criteria.';
  }

  const blockOptions = {
    sortBy,
    useMarkdown,
    omitYear,
    omitHour,
    dateOrder,
    omitEmptyFields,
    selectedTagFilter,
    includeSubtags
  };
  const blockContext = { allTags, allTasks, allDependencies };

  return sorted.map(t => formatTaskBlock(t, blockOptions, blockContext)).join('\n\n');
}
