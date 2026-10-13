import { computeSchedule } from '../src/engine/scheduler.js';
import { generateAutoWindows } from '../src/engine/tag-window-expander.js';
import { CronoCalendarDayView } from '../src/components/calendar/calendar-day-view.js';
import { validateTag } from '../src/data/schemas.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- Testing Scheduler Polish & Subtag Features ---');

// 1. Schema Validation for subtag_allocation_mode
{
  let carveValid = false;
  try {
    validateTag({
      name: 'Subtag Carve',
      color: '#3B82F6',
      parent_tag_id: 'tag_parent',
      subtag_allocation_mode: 'carve'
    });
    carveValid = true;
  } catch (e) {
    carveValid = false;
  }
  assert(carveValid, 'Schema accepts subtag_allocation_mode: carve');

  let extendValid = false;
  try {
    validateTag({
      name: 'Subtag Extend',
      color: '#3B82F6',
      parent_tag_id: 'tag_parent',
      subtag_allocation_mode: 'extend'
    });
    extendValid = true;
  } catch (e) {
    extendValid = false;
  }
  assert(extendValid, 'Schema accepts subtag_allocation_mode: extend');

  let invalidFailed = false;
  try {
    validateTag({
      name: 'Subtag Bad',
      color: '#3B82F6',
      parent_tag_id: 'tag_parent',
      subtag_allocation_mode: 'invalid_mode'
    });
  } catch (e) {
    invalidFailed = true;
  }
  assert(invalidFailed, 'Schema rejects invalid subtag_allocation_mode');
}

// 2. Manual Tag (Gym) and Auto Tag: Auto tag must start in morning and not overlap Gym
{
  const tags = [
    {
      id: 'tag_gym',
      name: 'Gym',
      color: '#10B981',
      time_window_mode: 'manual',
      parent_tag_id: null,
      time_windows: {
        monday: [{ start: '18:00', end: '19:30' }],
        tuesday: [{ start: '18:00', end: '19:30' }],
        wednesday: [{ start: '18:00', end: '19:30' }],
        thursday: [{ start: '18:00', end: '19:30' }],
        friday: [{ start: '18:00', end: '19:30' }],
        saturday: [],
        sunday: []
      }
    },
    {
      id: 'tag_work',
      name: 'Work',
      color: '#3B82F6',
      time_window_mode: 'auto',
      parent_tag_id: null,
      auto_expand_config: {
        minimum_daily_hours: 2.0,
        assigned_days: [0, 1, 2, 3, 4]
      }
    }
  ];

  const tasks = [
    {
      id: 'task_work_1',
      title: 'Deep Work',
      tag_ids: ['tag_work'],
      duration_hours: 2,
      priority: 2,
      status: 'active'
    },
    {
      id: 'task_gym_1',
      title: 'Workout',
      tag_ids: ['tag_gym'],
      duration_hours: 1.5,
      priority: 1,
      status: 'active'
    }
  ];

  const settings = {
    scheduling_horizon_days: 7,
    slot_granularity_minutes: 15,
    work_windows: {
      monday: [{ start: '09:00', end: '20:00' }],
      tuesday: [{ start: '09:00', end: '20:00' }],
      wednesday: [{ start: '09:00', end: '20:00' }],
      thursday: [{ start: '09:00', end: '20:00' }],
      friday: [{ start: '09:00', end: '20:00' }],
      saturday: [],
      sunday: []
    },
    break_windows: {
      monday: [{ start: '12:00', end: '13:00' }],
      tuesday: [{ start: '12:00', end: '13:00' }],
      wednesday: [{ start: '12:00', end: '13:00' }],
      thursday: [{ start: '12:00', end: '13:00' }],
      friday: [{ start: '12:00', end: '13:00' }],
      saturday: [],
      sunday: []
    }
  };

  const schedule = computeSchedule(tasks, tags, [], settings, '2026-08-10T08:00:00.000Z');

  // Check tag windows
  const workWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_work' && w.date === '2026-08-10');
  const gymWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_gym' && w.date === '2026-08-10');

  assert(gymWindows.length > 0 && gymWindows[0].windows[0].start === '18:00', 'Gym manual window is 18:00');
  assert(workWindows.length > 0 && workWindows[0].windows[0].start === '09:00', 'Auto Work window starts at 09:00 (not skipped past Gym)');

  // Verify work blocks do not overlap with Gym (18:00 - 19:30)
  const workBlocks = schedule.blocks.filter(b => b.task_id === 'task_work_1');
  const gymBlocks = schedule.blocks.filter(b => b.task_id === 'task_gym_1');

  assert(workBlocks.length > 0, 'Work task was scheduled');
  assert(gymBlocks.length > 0, 'Gym task was scheduled');

  const workStart = new Date(workBlocks[0].start).getHours();
  assert(workStart === 9, 'Work task scheduled in morning starting at 09:00');

  const gymStart = new Date(gymBlocks[0].start).getHours();
  assert(gymStart === 18, 'Gym task scheduled at 18:00');
}

// 3. Subtag Carve Mode: Scenario A strict slice & parent task cannot steal carved slots
{
  const tags = [
    {
      id: 'tag_parent',
      name: 'Dev Parent',
      color: '#3B82F6',
      time_window_mode: 'auto',
      parent_tag_id: null,
      auto_expand_config: {
        minimum_daily_hours: 2.0,
        assigned_days: [0, 1, 2, 3, 4]
      }
    },
    {
      id: 'tag_sub_carve',
      name: 'Dev UI (Carve)',
      color: '#10B981',
      time_window_mode: 'auto',
      parent_tag_id: 'tag_parent',
      subtag_allocation_mode: 'carve',
      auto_expand_config: {
        minimum_daily_hours: 1.0,
        assigned_days: [0, 1, 2, 3, 4]
      }
    }
  ];

  // Parent task has HIGHER priority (priority 1) than subtask (priority 3)
  const tasks = [
    {
      id: 'task_parent_high_pri',
      title: 'High Priority Parent Task',
      tag_ids: ['tag_parent'],
      duration_hours: 2, // Needs 2h
      priority: 1,
      status: 'active'
    },
    {
      id: 'task_sub_low_pri',
      title: 'Low Priority Subtag Task',
      tag_ids: ['tag_sub_carve'],
      duration_hours: 1, // Needs 1h
      priority: 3,
      status: 'active'
    }
  ];

  const settings = {
    scheduling_horizon_days: 7,
    slot_granularity_minutes: 15,
    work_windows: {
      monday: [{ start: '09:00', end: '11:00' }]
    },
    break_windows: {}
  };

  const schedule = computeSchedule(tasks, tags, [], settings, '2026-08-10T08:00:00.000Z');

  // Parent tag window total: 120 mins (09:00 - 11:00)
  const parentWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_parent' && w.date === '2026-08-10');
  const subWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_sub_carve' && w.date === '2026-08-10');

  assert(parentWindows.length > 0 && parentWindows[0].windows[0].start === '09:00' && parentWindows[0].windows[0].end === '11:00', 'Parent window is strictly 2 hours (09:00 - 11:00)');
  assert(subWindows.length > 0 && subWindows[0].windows[0].start === '09:00' && subWindows[0].windows[0].end === '10:00', 'Carved subtag takes 1 hour slice (09:00 - 10:00) inside parent window');

  // Verify subtask GOT scheduled in carved slot despite lower priority
  const subBlocks = schedule.blocks.filter(b => b.task_id === 'task_sub_low_pri');
  assert(subBlocks.length > 0, 'Subtag task was scheduled into carved slice despite lower priority');
  const subStart = new Date(subBlocks[0].start).getHours();
  assert(subStart === 9, 'Subtag task scheduled at 09:00 in carved slot');

  // Verify parent task got scheduled in remaining uncarved parent slot (10:00 - 11:00)
  const parentBlocks = schedule.blocks.filter(b => b.task_id === 'task_parent_high_pri');
  assert(parentBlocks.length > 0, 'Parent task scheduled in uncarved slice');
  const parentStart = new Date(parentBlocks[0].start).getHours();
  assert(parentStart === 10, 'Parent task scheduled at 10:00 in remaining uncarved slot');
}

// 4. Subtag Extend Mode: Subtag schedules in addition to parent window
{
  const tags = [
    {
      id: 'tag_parent',
      name: 'Parent Tag',
      color: '#3B82F6',
      time_window_mode: 'auto',
      parent_tag_id: null,
      auto_expand_config: {
        minimum_daily_hours: 1.0,
        assigned_days: [0, 1, 2, 3, 4]
      }
    },
    {
      id: 'tag_sub_extend',
      name: 'Subtag Extend',
      color: '#EC4899',
      time_window_mode: 'auto',
      parent_tag_id: 'tag_parent',
      subtag_allocation_mode: 'extend',
      auto_expand_config: {
        minimum_daily_hours: 1.0,
        assigned_days: [0, 1, 2, 3, 4]
      }
    }
  ];

  const tasks = [
    {
      id: 'task_parent',
      title: 'Parent Task',
      tag_ids: ['tag_parent'],
      duration_hours: 1,
      priority: 1,
      status: 'active'
    },
    {
      id: 'task_extend',
      title: 'Extend Subtask',
      tag_ids: ['tag_sub_extend'],
      duration_hours: 1,
      priority: 2,
      status: 'active'
    }
  ];

  const settings = {
    scheduling_horizon_days: 7,
    slot_granularity_minutes: 15,
    work_windows: {
      monday: [{ start: '09:00', end: '17:00' }]
    }
  };

  const schedule = computeSchedule(tasks, tags, [], settings, '2026-08-10T08:00:00.000Z');

  const parentWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_parent' && w.date === '2026-08-10');
  const extendWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_sub_extend' && w.date === '2026-08-10');

  assert(parentWindows[0].windows[0].start === '09:00' && parentWindows[0].windows[0].end === '11:00', 'Combined parent family window is 09:00 - 11:00');
  assert(extendWindows[0].windows[0].start === '09:00' && extendWindows[0].windows[0].end === '10:00', 'Extend subtag window is carved inside parent window (09:00 - 10:00)');
  const parentBlocks = schedule.blocks.filter(b => b.task_id === 'task_parent');
  const extendBlocks = schedule.blocks.filter(b => b.task_id === 'task_extend');
  assert(parentBlocks.length > 0, 'Parent task scheduled');
  assert(extendBlocks.length > 0, 'Extend subtask scheduled');
}

// 5. Calendar Day View _layoutBlocks Cluster Algorithm
{
  const dayView = new CronoCalendarDayView();

  // Test Case A: Non-overlapping blocks
  const nonOverlapping = [
    { start: '2026-08-10T09:00:00', end: '2026-08-10T10:00:00' },
    { start: '2026-08-10T10:00:00', end: '2026-08-10T11:00:00' }
  ];
  const layoutA = dayView._layoutBlocks(nonOverlapping);
  assert(layoutA[0].totalCols === 1 && layoutA[0].colIndex === 0, 'Non-overlapping block 1 has totalCols=1, colIndex=0');
  assert(layoutA[1].totalCols === 1 && layoutA[1].colIndex === 0, 'Non-overlapping block 2 has totalCols=1, colIndex=0');

  // Test Case B: 2 overlapping blocks at the same time
  const overlapping = [
    { start: '2026-08-10T09:00:00', end: '2026-08-10T10:30:00' },
    { start: '2026-08-10T09:30:00', end: '2026-08-10T11:00:00' }
  ];
  const layoutB = dayView._layoutBlocks(overlapping);
  assert(layoutB.length === 2, '2 overlapping items laid out');
  assert(layoutB[0].totalCols === 2 && layoutB[1].totalCols === 2, 'Overlapping blocks share cluster of totalCols=2');
  assert(layoutB[0].colIndex !== layoutB[1].colIndex, 'Overlapping blocks receive distinct columns (0 and 1)');

  // Test Case C: 3 overlapping blocks
  const tripleOverlapping = [
    { start: '2026-08-10T14:00:00', end: '2026-08-10T15:00:00' },
    { start: '2026-08-10T14:00:00', end: '2026-08-10T15:00:00' },
    { start: '2026-08-10T14:30:00', end: '2026-08-10T15:30:00' }
  ];
  const layoutC = dayView._layoutBlocks(tripleOverlapping);
  assert(layoutC[0].totalCols === 3, 'Triple overlapping blocks create 3 columns');
  const cols = new Set(layoutC.map(l => l.colIndex));
  assert(cols.size === 3, 'All 3 overlapping blocks get unique columns');
}

// 6. User Scenario: Subtag ("Enemy Parry Polish") with 1-hour task ("EPP - Reface State")
// MUST carve strictly 1.0 hour (11:00 - 12:00), NOT 1 hour 10 minutes
{
  const tags = [
    {
      id: 'tag_parent_combat',
      name: 'Combat',
      color: '#3B82F6',
      time_window_mode: 'manual',
      parent_tag_id: null,
      time_windows: {
        monday: [{ start: '11:00', end: '17:00' }]
      }
    },
    {
      id: 'tag_sub_epp',
      name: 'Enemy Parry Polish',
      color: '#10B981',
      time_window_mode: 'auto',
      parent_tag_id: 'tag_parent_combat',
      subtag_allocation_mode: 'carve',
      auto_expand_config: {
        minimum_daily_hours: 1.0,
        assigned_days: [0, 1, 2, 3, 4]
      }
    }
  ];

  const tasks = [
    {
      id: 'task_epp_reface',
      title: 'EPP - Reface State',
      tag_ids: ['tag_sub_epp'],
      duration_hours: 1, // Exactly 1 hour
      priority: 3,
      status: 'active'
    },
    {
      id: 'task_combat_general',
      title: 'Combat Polish',
      tag_ids: ['tag_parent_combat'],
      duration_hours: 3,
      priority: 2,
      status: 'active'
    }
  ];

  const settings = {
    scheduling_horizon_days: 7,
    slot_granularity_minutes: 15,
    work_windows: {
      monday: [{ start: '09:00', end: '18:00' }]
    }
  };

  const schedule = computeSchedule(tasks, tags, [], settings, '2026-08-10T08:00:00.000Z');

  const subtagWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_sub_epp' && w.date === '2026-08-10');
  const parentWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_parent_combat' && w.date === '2026-08-10');

  assert(subtagWindows.length > 0, 'Enemy Parry Polish subtag window was computed');
  assert(subtagWindows[0].windows[0].start === '11:00' && subtagWindows[0].windows[0].end === '12:00',
    `Enemy Parry Polish window is strictly 11:00 - 12:00 (got ${subtagWindows[0].windows[0].start} - ${subtagWindows[0].windows[0].end})`);

  const eppBlocks = schedule.blocks.filter(b => b.task_id === 'task_epp_reface');
  assert(eppBlocks.length > 0, 'EPP - Reface State task block exists');
  const blockStartHour = new Date(eppBlocks[0].start).getHours();
  const blockEndHour = new Date(eppBlocks[eppBlocks.length - 1].end).getHours();
  assert(blockStartHour === 11 && blockEndHour === 12, `EPP - Reface State scheduled exactly from 11:00 to 12:00 (starts ${blockStartHour}:00, ends ${blockEndHour}:00)`);

  const combatBlock = schedule.blocks.find(b => b.task_id === 'task_combat_general');
  assert(Boolean(combatBlock), 'Parent combat task was scheduled');
  const combatStartHour = new Date(combatBlock.start).getHours();
  assert(combatStartHour === 12, 'Parent combat task starts at 12:00 in remaining uncarved parent window');
}

// 7. Priority-based Expansion: Subtag with higher priority tasks carves MORE budget from parent
{
  const tags = [
    {
      id: 'tag_parent_feature',
      name: 'Feature Parent',
      color: '#3B82F6',
      time_window_mode: 'manual',
      parent_tag_id: null,
      time_windows: {
        monday: [{ start: '09:00', end: '13:00' }] // 4 hours total
      }
    },
    {
      id: 'tag_sub_critical',
      name: 'Critical Subtag',
      color: '#EF4444',
      time_window_mode: 'auto',
      parent_tag_id: 'tag_parent_feature',
      subtag_allocation_mode: 'carve',
      auto_expand_config: {
        minimum_daily_hours: 1.0, // Floor is 1h
        assigned_days: [0, 1, 2, 3, 4]
      }
    }
  ];

  // Subtag tasks have PRIORITY 4 (Higher than parent task's priority 2)
  const tasks = [
    {
      id: 'task_sub_1',
      title: 'Critical Subtask 1',
      tag_ids: ['tag_sub_critical'],
      duration_hours: 1.0,
      priority: 4,
      status: 'active'
    },
    {
      id: 'task_sub_2',
      title: 'Critical Subtask 2',
      tag_ids: ['tag_sub_critical'],
      duration_hours: 1.5,
      priority: 4,
      status: 'active'
    },
    {
      id: 'task_parent_low',
      title: 'Lower Priority Parent Task',
      tag_ids: ['tag_parent_feature'],
      duration_hours: 2.0,
      priority: 2,
      status: 'active'
    }
  ];

  const settings = {
    scheduling_horizon_days: 7,
    slot_granularity_minutes: 15,
    work_windows: {
      monday: [{ start: '09:00', end: '17:00' }]
    }
  };

  const schedule = computeSchedule(tasks, tags, [], settings, '2026-08-10T08:00:00.000Z');

  const subtagWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_sub_critical' && w.date === '2026-08-10');
  assert(subtagWindows.length > 0, 'Critical subtag window was computed');
  // Subtag should carve 2.5 hours (1.0 guaranteed + 1.5 priority expansion) -> 09:00 to 11:30
  assert(subtagWindows[0].windows[0].start === '09:00' && subtagWindows[0].windows[0].end === '11:30',
    `Critical subtag carved 2.5 hours based on priority (09:00 - 11:30), got ${subtagWindows[0].windows[0].start} - ${subtagWindows[0].windows[0].end}`);

  const subBlock1 = schedule.blocks.find(b => b.task_id === 'task_sub_1');
  const subBlock2 = schedule.blocks.find(b => b.task_id === 'task_sub_2');
  assert(Boolean(subBlock1) && Boolean(subBlock2), 'Both high priority subtasks scheduled in carved window');

  const parentBlock = schedule.blocks.find(b => b.task_id === 'task_parent_low');
  assert(Boolean(parentBlock), 'Parent task scheduled in uncarved remainder');
  const pStartMins = new Date(parentBlock.start).getHours() * 60 + new Date(parentBlock.start).getMinutes();
  assert(pStartMins >= 11 * 60 + 30, 'Parent task scheduled at or after 11:30');
}

// 8. Subtag task needing LESS than minDaily carves ONLY what is needed (no empty window waste)
{
  const tags = [
    {
      id: 'tag_parent_big',
      name: 'Big Feature',
      color: '#3B82F6',
      time_window_mode: 'manual',
      parent_tag_id: null,
      time_windows: {
        monday: [{ start: '09:00', end: '13:00' }]
      }
    },
    {
      id: 'tag_sub_small',
      name: 'Quick Patch',
      color: '#F59E0B',
      time_window_mode: 'auto',
      parent_tag_id: 'tag_parent_big',
      subtag_allocation_mode: 'carve',
      auto_expand_config: {
        minimum_daily_hours: 1.0, // minDaily is 1h, but task is only 0.5h
        assigned_days: [0, 1, 2, 3, 4]
      }
    }
  ];

  const tasks = [
    {
      id: 'task_quick',
      title: 'Quick 30m Patch',
      tag_ids: ['tag_sub_small'],
      duration_hours: 0.5, // 30 minutes
      priority: 2,
      status: 'active'
    }
  ];

  const settings = {
    scheduling_horizon_days: 7,
    slot_granularity_minutes: 15,
    work_windows: {
      monday: [{ start: '09:00', end: '17:00' }]
    }
  };

  const schedule = computeSchedule(tasks, tags, [], settings, '2026-08-10T08:00:00.000Z');

  const subtagWindows = schedule.tag_windows_computed.filter(w => w.tag_id === 'tag_sub_small' && w.date === '2026-08-10');
  assert(subtagWindows.length > 0, 'Quick Patch subtag window computed');
  assert(subtagWindows[0].windows[0].start === '09:00' && subtagWindows[0].windows[0].end === '09:30',
    `Quick Patch carved only 30 mins (09:00 - 09:30), got ${subtagWindows[0].windows[0].start} - ${subtagWindows[0].windows[0].end}`);
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
