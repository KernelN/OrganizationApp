/**
 * Pure functions for dependency graph construction, topological sorting, and cycle detection.
 * Engine files MUST NOT import DOM, storage, or browser APIs.
 */

/**
 * Builds an adjacency map task_id -> [{ depends_on_id, type }]
 * @param {Array} dependencies 
 * @param {Array|Map} schedulableTasks 
 * @returns {Map<string, Array<{ depends_on_id: string, type: 'hard'|'soft' }>>}
 */
export function buildDependencyGraph(dependencies = [], schedulableTasks = []) {
  const taskSet = new Set(
    Array.isArray(schedulableTasks)
      ? schedulableTasks.map(t => t.id)
      : Array.from(schedulableTasks.keys())
  );

  const graph = new Map();
  for (const taskId of taskSet) {
    graph.set(taskId, []);
  }

  for (const dep of dependencies) {
    if (taskSet.has(dep.task_id) && taskSet.has(dep.depends_on_id)) {
      if (!graph.has(dep.task_id)) {
        graph.set(dep.task_id, []);
      }
      graph.get(dep.task_id).push(dep);
    }
  }
  return graph;
}

/**
 * Performs Kahn's algorithm topological sort on hard dependencies.
 * @param {Map} graph - Adjacency map
 * @param {Array} tasks - Array of active task objects
 * @returns {Array<string>} Topologically ordered task IDs
 */
export function topologicalSort(graph, tasks = []) {
  const taskIds = tasks.map(t => t.id);
  const inDegree = new Map();

  for (const id of taskIds) {
    inDegree.set(id, 0);
  }

  // Calculate hard in-degrees: task A depends on Task B (B -> A edge)
  for (const [taskId, deps] of graph.entries()) {
    for (const dep of deps) {
      if (dep.type === 'hard' && inDegree.has(taskId)) {
        inDegree.set(taskId, (inDegree.get(taskId) || 0) + 1);
      }
    }
  }

  const queue = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(id);
    }
  }

  const result = [];
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node);

    // Find nodes that depend on `node` (where depends_on_id == node)
    for (const [taskId, deps] of graph.entries()) {
      for (const dep of deps) {
        if (dep.depends_on_id === node && dep.type === 'hard') {
          const currentDeg = inDegree.get(taskId);
          if (typeof currentDeg === 'number') {
            const nextDeg = currentDeg - 1;
            inDegree.set(taskId, nextDeg);
            if (nextDeg === 0) {
              queue.push(taskId);
            }
          }
        }
      }
    }
  }

  // Append any remaining tasks not reached (e.g. disconnected or soft-only nodes)
  for (const id of taskIds) {
    if (!result.includes(id)) {
      result.push(id);
    }
  }

  return result;
}

/**
 * Checks if task A has a hard dependency chain pointing to task B.
 * @param {Object} taskA 
 * @param {Object} taskB 
 * @param {Map} graph 
 * @returns {boolean}
 */
export function hasHardDependency(taskA, taskB, graph) {
  if (!taskA || !taskB || !graph) return false;
  // A depends on B directly or indirectly?
  const visited = new Set();
  const queue = [taskA.id];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === taskB.id) return true;
    visited.add(current);

    const deps = graph.get(current) || [];
    for (const dep of deps) {
      if (dep.type === 'hard' && !visited.has(dep.depends_on_id)) {
        queue.push(dep.depends_on_id);
      }
    }
  }
  return false;
}

/**
 * Checks if adding newEdge creates a cycle in the dependency graph using DFS.
 * @param {Array} existingDeps 
 * @param {Object} newEdge - { task_id, depends_on_id }
 * @returns {boolean} true if cycle detected
 */
export function detectCycleFromDependencies(existingDeps = [], newEdge) {
  const adj = new Map();

  const addEdge = (from, to) => {
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from).push(to);
  };

  // Build graph (edges from task_id -> depends_on_id)
  for (const d of existingDeps) {
    addEdge(d.task_id, d.depends_on_id);
  }
  addEdge(newEdge.task_id, newEdge.depends_on_id);

  // DFS from newEdge.depends_on_id to see if it reaches newEdge.task_id
  const visited = new Set();
  const dfs = (curr, target) => {
    if (curr === target) return true;
    visited.add(curr);
    const neighbors = adj.get(curr) || [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        if (dfs(next, target)) return true;
      }
    }
    return false;
  };

  return dfs(newEdge.depends_on_id, newEdge.task_id);
}
