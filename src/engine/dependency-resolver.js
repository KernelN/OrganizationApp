/**
 * Dependency graph builder and Kahn's topological sort for task scheduling.
 */

/**
 * Build dependency graph maps for hard and soft dependencies.
 * @param {Array} dependencies Array of { id, task_id, depends_on_id, type }
 * @param {Array} activeTasks Array of active task objects
 * @returns {{ graph: Map<string, Array<{dependsOnId: string, type: string}>>, inDegrees: Map<string, number> }}
 */
export function buildDependencyGraph(dependencies, activeTasks) {
  const activeTaskIds = new Set(activeTasks.map(t => t.id));
  const graph = new Map();
  const inDegrees = new Map();

  for (const taskId of activeTaskIds) {
    graph.set(taskId, []);
    inDegrees.set(taskId, 0);
  }

  for (const dep of dependencies) {
    if (activeTaskIds.has(dep.task_id) && activeTaskIds.has(dep.depends_on_id)) {
      graph.get(dep.task_id).push({
        dependsOnId: dep.depends_on_id,
        type: dep.type || 'hard'
      });

      // Count in-degree for hard dependencies
      if (dep.type === 'hard') {
        inDegrees.set(dep.task_id, (inDegrees.get(dep.task_id) || 0) + 1);
      }
    }
  }

  return { graph, inDegrees };
}

/**
 * Perform Kahn's topological sort based on hard dependencies.
 * @param {Array} activeTasks 
 * @param {Array} dependencies 
 * @returns {Array<string>} Array of task IDs in topological order
 */
export function topologicalSort(activeTasks, dependencies) {
  const { graph, inDegrees } = buildDependencyGraph(dependencies, activeTasks);
  const queue = [];
  const result = [];

  for (const [taskId, inDegree] of inDegrees.entries()) {
    if (inDegree === 0) {
      queue.push(taskId);
    }
  }

  // Reverse map: prerequisite task -> list of tasks that depend on it
  const prereqToDependents = new Map();
  for (const [taskId, deps] of graph.entries()) {
    for (const dep of deps) {
      if (dep.type === 'hard') {
        if (!prereqToDependents.has(dep.dependsOnId)) {
          prereqToDependents.set(dep.dependsOnId, []);
        }
        prereqToDependents.get(dep.dependsOnId).push(taskId);
      }
    }
  }

  while (queue.length > 0) {
    const currentTaskId = queue.shift();
    result.push(currentTaskId);

    const dependents = prereqToDependents.get(currentTaskId) || [];
    for (const dependentId of dependents) {
      const currentInDegree = inDegrees.get(dependentId) - 1;
      inDegrees.set(dependentId, currentInDegree);
      if (currentInDegree === 0) {
        queue.push(dependentId);
      }
    }
  }

  // If result length doesn't match active tasks, cycles exist (handled gracefully by appending remaining)
  if (result.length < activeTasks.length) {
    const included = new Set(result);
    for (const task of activeTasks) {
      if (!included.has(task.id)) {
        result.push(task.id);
      }
    }
  }

  return result;
}

/**
 * Check if Task A has a hard dependency chain pointing to Task B.
 * @param {string} taskIdA 
 * @param {string} taskIdB 
 * @param {Array} dependencies 
 * @returns {boolean}
 */
export function hasHardDependencyChain(taskIdA, taskIdB, dependencies) {
  const visited = new Set();
  const queue = [taskIdA];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === taskIdB) return true;
    if (!visited.has(current)) {
      visited.add(current);
      for (const dep of dependencies) {
        if (dep.task_id === current && dep.type === 'hard') {
          queue.push(dep.depends_on_id);
        }
      }
    }
  }
  return false;
}
