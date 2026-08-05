import assert from 'node:assert';
import { computeSchedule } from '../src/engine/scheduler.js';
import { topologicalSort } from '../src/engine/dependency-resolver.js';
import { computeTaskAlertLevel } from '../src/engine/alert-evaluator.js';

console.log('🧪 Starting Cronograma Engine Unit Tests...\n');

// --- Test 1: Topological Sort ---
{
  const tasks = [
    { id: 'task_A', title: 'Task A' },
    { id: 'task_B', title: 'Task B' },
    { id: 'task_C', title: 'Task C' }
  ];

  // Task B depends on Task A (Task A must come first)
  // Task C depends on Task B (Task B must come first)
  const deps = [
    { id: '1', task_id: 'task_B', depends_on_id: 'task_A', type: 'hard' },
    { id: '2', task_id: 'task_C', depends_on_id: 'task_B', type: 'hard' }
  ];

  const sortedOrder = topologicalSort(tasks, deps);
  assert.deepStrictEqual(sortedOrder, ['task_A', 'task_B', 'task_C'], 'Topological sort order should be A -> B -> C');
  console.log('✓ Test 1 Passed: Topological Sort with hard dependencies');
}

// --- Test 2: Alert Level Computation ---
{
  const now = new Date('2026-08-05T09:00:00.000Z');
  const deadline = '2026-08-05T12:00:00.000Z';

  // Task duration 60m, 180m available before deadline -> alert 'none'
  const levelNormal = computeTaskAlertLevel(
    { deadline, alert_window_minutes: 30, duration_minutes: 60 },
    now,
    180
  );
  assert.strictEqual(levelNormal, 'none');

  // Task duration 60m, 30m available before deadline -> alert 'red'
  const levelRed = computeTaskAlertLevel(
    { deadline, alert_window_minutes: 30, duration_minutes: 60 },
    now,
    30
  );
  assert.strictEqual(levelRed, 'red');

  // Within orange alert window (10:40 is within 120m of 12:00 deadline)
  const nowOrange = new Date('2026-08-05T10:40:00.000Z');
  const levelOrange = computeTaskAlertLevel(
    { deadline, alert_window_minutes: 120, duration_minutes: 60 },
    nowOrange,
    180
  );
  assert.strictEqual(levelOrange, 'orange');

  console.log('✓ Test 2 Passed: Alert Level evaluation (None, Orange, Red)');
}

// --- Test 3: Pure Scheduler Slot Allocation & Priority Ordering ---
{
  const now = new Date('2026-08-05T09:00:00.000Z');
  const settings = {
    scheduling_horizon_days: 1,
    slot_granularity_minutes: 15,
    work_windows: {
      wednesday: [{ start: '09:00', end: '17:00' }]
    },
    break_windows: {
      wednesday: [{ start: '12:00', end: '13:00' }]
    }
  };

  const tasks = [
    {
      id: 'low_prio',
      title: 'Low Priority Task',
      priority: 1,
      duration_minutes: 30,
      status: 'active',
      splittable: true
    },
    {
      id: 'high_prio',
      title: 'High Priority Task',
      priority: 10,
      duration_minutes: 45,
      status: 'active',
      splittable: true
    }
  ];

  const schedule = computeSchedule(tasks, [], [], settings, now);

  assert.ok(schedule.blocks.length > 0, 'Should generate scheduled blocks');
  // High priority task (priority 10) should be scheduled before low priority task (priority 1)
  const firstBlockTaskId = schedule.blocks[0].task_id;
  assert.strictEqual(firstBlockTaskId, 'high_prio', 'High priority task should be scheduled first');

  console.log('✓ Test 3 Passed: Scheduler priority queue & slot allocation');
}

console.log('\n🎉 All Cronograma Engine tests passed successfully!');
