import { describe, it } from 'node:test';
import assert from 'node:assert';
import { computeSchedule } from '../src/engine/scheduler.js';

describe('Multi-Tag Daily Budgeting & Priority Window Allocation', () => {

  it('Test 1: Real Data Scenario - Corpo (Priority 10) starts at 09:00, Flame (Priority 5) follows, both get guaranteed minimums', () => {
    const tags = [
      {
        id: 'tag_flame',
        name: 'Flame',
        time_window_mode: 'auto',
        parent_tag_id: null,
        auto_expand_config: {
          minimum_daily_hours: 2.0,
          assigned_days: [0, 1, 2, 3, 4]
        }
      },
      {
        id: 'tag_corpo',
        name: 'Corpo',
        time_window_mode: 'auto',
        parent_tag_id: null,
        auto_expand_config: {
          minimum_daily_hours: 2.0,
          assigned_days: [0, 1, 2, 3, 4]
        }
      }
    ];

    const tasks = [
      // Flame has a massive 24h task with Priority 1
      {
        id: 'task_flame_massive',
        title: 'Massive Flame Task',
        tag_ids: ['tag_flame'],
        duration_hours: 24,
        priority: 1,
        status: 'active'
      },
      // Flame has a Priority 5 task
      {
        id: 'task_flame_high',
        title: 'High Priority Flame Task',
        tag_ids: ['tag_flame'],
        duration_hours: 2,
        priority: 5,
        status: 'active'
      },
      // Corpo has a Priority 10 task
      {
        id: 'task_corpo_meme',
        title: 'Pasarle nuevos presupuestos a Meme',
        tag_ids: ['tag_corpo'],
        duration_hours: 2,
        priority: 10,
        status: 'active'
      },
      // Corpo has a Priority 4 task
      {
        id: 'task_corpo_framework',
        title: 'Pulir Framework',
        tag_ids: ['tag_corpo'],
        duration_hours: 3,
        priority: 4,
        status: 'active'
      }
    ];

    const settings = {
      scheduling_horizon_days: 7,
      slot_granularity_minutes: 15,
      work_windows: {
        monday: [{ start: '09:00', end: '17:00' }], // 8h
        tuesday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '17:00' }]
      },
      break_windows: {}
    };

    const schedule = computeSchedule(tasks, tags, [], settings, '2026-08-10T08:00:00.000Z');

    // On Monday (2026-08-10):
    // Corpo has Priority 10 task -> Corpo MUST start at 09:00!
    const corpoWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_corpo' && w.date === '2026-08-10');
    const flameWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_flame' && w.date === '2026-08-10');

    assert(corpoWindows.length > 0, 'Corpo window was computed on Monday');
    assert(flameWindows.length > 0, 'Flame window was computed on Monday');

    // Corpo window starts at 09:00 and gets 5h (2h min + 3h surplus for Priority 4 task before Flame's Priority 1 task)
    assert.strictEqual(corpoWindows[0].windows[0].start, '09:00', 'Corpo starts first at 09:00 due to Priority 10 task');
    assert.strictEqual(corpoWindows[0].windows[0].end, '14:00', 'Corpo gets 5h total covering Priority 10 (2h) and Priority 4 (3h)');

    // Flame window starts at 14:00
    assert.strictEqual(flameWindows[0].windows[0].start, '14:00', 'Flame starts at 14:00 after Corpo');

    // Verify task blocks: Meme task is scheduled from 09:00 to 11:00
    const memeBlocks = schedule.blocks.filter(b => b.task_id === 'task_corpo_meme');
    assert(memeBlocks.length > 0, 'Meme task was scheduled');
    const firstMemeHour = new Date(memeBlocks[0].start).getHours();
    assert.strictEqual(firstMemeHour, 9, 'Meme task scheduled in 09:00 morning slot');
  });

  it('Test 2: Deficit Handling - Strict All-or-Nothing Cutoff', () => {
    // Work day only has 4 hours available
    const tags = [
      {
        id: 'tag_a',
        name: 'Tag A',
        time_window_mode: 'auto',
        parent_tag_id: null,
        auto_expand_config: {
          minimum_daily_hours: 3.0,
          assigned_days: [0]
        }
      },
      {
        id: 'tag_b',
        name: 'Tag B',
        time_window_mode: 'auto',
        parent_tag_id: null,
        auto_expand_config: {
          minimum_daily_hours: 3.0,
          assigned_days: [0]
        }
      }
    ];

    const tasks = [
      {
        id: 'task_a',
        title: 'Tag A Task (High Priority)',
        tag_ids: ['tag_a'],
        duration_hours: 4,
        priority: 10,
        status: 'active'
      },
      {
        id: 'task_b',
        title: 'Tag B Task (Lower Priority)',
        tag_ids: ['tag_b'],
        duration_hours: 4,
        priority: 5,
        status: 'active'
      }
    ];

    const settings = {
      scheduling_horizon_days: 7,
      slot_granularity_minutes: 15,
      work_windows: {
        monday: [{ start: '09:00', end: '13:00' }] // 4 hours total
      },
      break_windows: {}
    };

    const schedule = computeSchedule(tasks, tags, [], settings, '2026-08-10T08:00:00.000Z');

    // Tag A has Priority 10 -> needs 3h min. Fits in 4h.
    // Tag B has Priority 5 -> needs 3h min. Only 1h remains, so Tag B cannot receive its full minimum.
    // Under strict all-or-nothing cutoff: Tag B receives 0h, remainder (1h) goes to Tag A (Tag A gets full 4h).
    const aWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_a' && w.date === '2026-08-10');
    const bWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_b' && w.date === '2026-08-10');

    assert(aWindows.length > 0, 'Tag A was scheduled');
    assert.strictEqual(bWindows.length, 0, 'Tag B was skipped for today under strict all-or-nothing cutoff');
    assert.strictEqual(aWindows[0].windows[0].start, '09:00');
    assert.strictEqual(aWindows[0].windows[0].end, '13:00', 'Tag A took the full available 4h');
  });

  it('Test 3: Hard Dependency Urgency Inheritance', () => {
    const tags = [
      {
        id: 'tag_frontend',
        name: 'Frontend',
        time_window_mode: 'auto',
        parent_tag_id: null,
        auto_expand_config: { minimum_daily_hours: 1.0, assigned_days: [0] }
      },
      {
        id: 'tag_backend',
        name: 'Backend',
        time_window_mode: 'auto',
        parent_tag_id: null,
        auto_expand_config: { minimum_daily_hours: 1.0, assigned_days: [0] }
      }
    ];

    const tasks = [
      // Frontend task has Priority 10
      {
        id: 'task_fe',
        title: 'Frontend Urgent Feature',
        tag_ids: ['tag_frontend'],
        duration_hours: 2,
        priority: 10,
        status: 'active'
      },
      // Backend task has Priority 0, but is a HARD dependency of task_fe!
      {
        id: 'task_be',
        title: 'Backend API Endpoint',
        tag_ids: ['tag_backend'],
        duration_hours: 2,
        priority: 0,
        status: 'active'
      }
    ];

    const dependencies = [
      { task_id: 'task_fe', depends_on_id: 'task_be', type: 'hard' }
    ];

    const settings = {
      scheduling_horizon_days: 7,
      slot_granularity_minutes: 15,
      work_windows: {
        monday: [{ start: '09:00', end: '13:00' }] // 4 hours
      },
      break_windows: {}
    };

    const schedule = computeSchedule(tasks, tags, dependencies, settings, '2026-08-10T08:00:00.000Z');

    // Backend must be scheduled before Frontend in the morning because it unblocks Frontend!
    const beWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_backend' && w.date === '2026-08-10');
    const feWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_frontend' && w.date === '2026-08-10');

    assert(beWindows.length > 0 && feWindows.length > 0, 'Both tags have windows');
    // Backend inherited Priority 10, and dependency ordering places Backend first
    const beBlocks = schedule.blocks.filter(b => b.task_id === 'task_be');
    const feBlocks = schedule.blocks.filter(b => b.task_id === 'task_fe');
    assert(beBlocks.length > 0 && feBlocks.length > 0);
    const beStart = new Date(beBlocks[0].start).getTime();
    const feStart = new Date(feBlocks[0].start).getTime();
    assert(beStart < feStart, 'Backend dependency task runs before Frontend dependent task');
  });

  it('Test 4: True Minimum Allocation capped by task backlog', () => {
    const tags = [
      {
        id: 'tag_small',
        name: 'Small Backlog Tag',
        time_window_mode: 'auto',
        parent_tag_id: null,
        auto_expand_config: {
          minimum_daily_hours: 3.0, // Configured for 3h
          assigned_days: [0]
        }
      }
    ];

    // But tasks only sum to 1 hour!
    const tasks = [
      {
        id: 'task_quick',
        title: 'Quick 1h Task',
        tag_ids: ['tag_small'],
        duration_hours: 1.0,
        priority: 2,
        status: 'active'
      }
    ];

    const settings = {
      scheduling_horizon_days: 7,
      slot_granularity_minutes: 15,
      work_windows: {
        monday: [{ start: '09:00', end: '17:00' }]
      },
      break_windows: {}
    };

    const schedule = computeSchedule(tasks, tags, [], settings, '2026-08-10T08:00:00.000Z');
    const win = schedule.tag_windows_computed.find(w => w.tag_id === 'tag_small' && w.date === '2026-08-10');

    assert(win, 'Window computed');
    // It should only allocate 1 hour (09:00 to 10:00), not 3 hours!
    assert.strictEqual(win.windows[0].start, '09:00');
    assert.strictEqual(win.windows[0].end, '10:00', 'Window capped at 1h because task backlog is only 1h');
  });

  it('Test 5: Untagged tasks compete in surplus pool by priority', () => {
    const tags = [
      {
        id: 'tag_work',
        name: 'Work Tag',
        time_window_mode: 'auto',
        parent_tag_id: null,
        auto_expand_config: { minimum_daily_hours: 2.0, assigned_days: [0] }
      }
    ];

    const tasks = [
      {
        id: 'task_work',
        title: 'Normal Work Task',
        tag_ids: ['tag_work'],
        duration_hours: 2,
        priority: 1,
        status: 'active'
      },
      // Untagged task with Priority 8
      {
        id: 'task_untagged_high',
        title: 'Urgent Personal Task',
        tag_ids: [],
        duration_hours: 2,
        priority: 8,
        status: 'active'
      }
    ];

    const settings = {
      scheduling_horizon_days: 7,
      slot_granularity_minutes: 15,
      work_windows: {
        monday: [{ start: '09:00', end: '17:00' }] // 8 hours
      },
      break_windows: {}
    };

    const schedule = computeSchedule(tasks, tags, [], settings, '2026-08-10T08:00:00.000Z');

    const untaggedBlocks = schedule.blocks.filter(b => b.task_id === 'task_untagged_high');
    const workBlocks = schedule.blocks.filter(b => b.task_id === 'task_work');

    assert(untaggedBlocks.length > 0, 'Untagged task was scheduled');
    assert(workBlocks.length > 0, 'Work task was scheduled');
  });

  it('Test 6: Multi-dependency Chain - Dependent task never scheduled before all hard dependencies complete', () => {
    const tags = [
      {
        id: 'tag_main',
        name: 'Main Tag',
        time_window_mode: 'auto',
        parent_tag_id: null,
        auto_expand_config: {
          minimum_daily_hours: 2.0,
          assigned_days: [0, 1, 2, 3, 4]
        }
      }
    ];

    const tasks = [
      // High priority task with hard dependencies
      {
        id: 'task_final',
        title: 'Final Release Report',
        tag_ids: ['tag_main'],
        duration_hours: 2,
        priority: 10,
        status: 'active'
      },
      // Lower priority dependencies
      {
        id: 'task_dep1',
        title: 'Feature Implementation',
        tag_ids: ['tag_main'],
        duration_hours: 3,
        priority: 1,
        status: 'active'
      },
      {
        id: 'task_dep2',
        title: 'QA Testing',
        tag_ids: ['tag_main'],
        duration_hours: 2,
        priority: 0,
        status: 'active'
      }
    ];

    const dependencies = [
      { id: 'd1', task_id: 'task_final', depends_on_id: 'task_dep1', type: 'hard' },
      { id: 'd2', task_id: 'task_final', depends_on_id: 'task_dep2', type: 'hard' }
    ];

    const settings = {
      scheduling_horizon_days: 7,
      slot_granularity_minutes: 15,
      work_windows: {
        monday: [{ start: '09:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '17:00' }]
      },
      break_windows: {}
    };

    const schedule = computeSchedule(tasks, tags, dependencies, settings, '2026-08-10T08:00:00.000Z');

    const dep1Blocks = schedule.blocks.filter(b => b.task_id === 'task_dep1');
    const dep2Blocks = schedule.blocks.filter(b => b.task_id === 'task_dep2');
    const finalBlocks = schedule.blocks.filter(b => b.task_id === 'task_final');

    assert.strictEqual(dep1Blocks.length, 12, 'dep1 fully scheduled (3h)');
    assert.strictEqual(dep2Blocks.length, 8, 'dep2 fully scheduled (2h)');
    assert.strictEqual(finalBlocks.length, 8, 'final task fully scheduled (2h)');

    const maxDepEnd = Math.max(
      ...dep1Blocks.map(b => new Date(b.end).getTime()),
      ...dep2Blocks.map(b => new Date(b.end).getTime())
    );
    const finalStart = Math.min(...finalBlocks.map(b => new Date(b.start).getTime()));

    assert(finalStart >= maxDepEnd, 'task_final strictly starts after all hard dependencies finish');
  });

});
