---
name: cronograma-dev
description: >
  Development guide for the Cronograma auto-scheduling task manager.
  Read this skill before making ANY changes to the codebase. It covers
  architecture, coding conventions, component templates, styling rules,
  engine constraints, DAL patterns, and common pitfalls.
---

# Cronograma Development Skill

> **Always read this before writing code.** For full algorithm pseudo-code, data schemas, and UI wireframes, see [`IMPLEMENTATION_SPEC.md`](file:///e:/Github/Funny%20Things/OrganizationApp/IMPLEMENTATION_SPEC.md).

---

## 1. Architecture at a Glance

| Layer | Technology | Key File(s) |
|-------|-----------|-------------|
| Build | Vite 6+ | `vite.config.js` |
| UI | Lit 3+ (Web Components) | `src/components/**/*.js` |
| Routing | `@lit-labs/router` (hash-based SPA) | `src/main.js`, `src/app-shell.js` |
| State | Lit `ReactiveController` + custom event bus | `src/state/app-state.js`, `src/state/event-bus.js` |
| Storage | IndexedDB via `idb` | `src/data/idb-adapter.js` |
| Sync | `@octokit/rest` → GitHub private repo | `src/data/github-sync.js` |
| Scheduler | Web Worker (pure functions) | `src/engine/cronograma.worker.js`, `src/engine/scheduler.js` |
| PWA | `vite-plugin-pwa` (Workbox) | `vite.config.js`, `public/manifest.json` |
| IDs | `ulid` | `src/utils/ulid.js` |
| i18n | `@lit/localize` | `src/i18n/en.json`, `src/i18n/localize.js` |

### Data Flow (critical path)

```
UI Component → AppState.dispatch() → DAL.method() → IndexedDB
                                    ↓
                              AppState → Worker.postMessage({type:'COMPUTE'})
                                    ↓
                              Worker → AppState (schedule result)
                                    ↓
                              UI re-renders via Lit reactivity
```

### Key Invariants

1. **DAL Abstraction is sacred.** ALL data reads/writes go through `src/data/dal.js`. Components and engine code NEVER import `idb` or `@octokit/rest` directly. The current adapter is `idb-adapter.js`. Future migration to Supabase = new adapter, zero other changes.

2. **Engine is pure.** Files in `src/engine/` are pure functions. They MUST NOT import: DOM APIs, `lit`, `idb`, `@octokit`, `window`, `document`, `localStorage`, or any browser API. They receive data as arguments and return results. This guarantees portability to serverless/backend.

3. **Single-device primary.** GitHub sync is a backup push, not real-time sync. No conflict resolution. Last write wins.

4. **Optimistic in-day scheduling.** The scheduler assumes past time blocks for today were executed. It only schedules from `now` forward. Uncompleted tasks re-enter the pool on the next day.

---

## 2. Coding Conventions

### Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Files | `kebab-case.js` | `calendar-day-view.js` |
| Web Components | `crono-` prefix, kebab-case | `<crono-calendar-view>` |
| JS variables/functions | `camelCase` | `computeAlertLevel()` |
| JS classes | `PascalCase` | `class SlotAllocator` |
| CSS custom properties | `--` prefix, kebab-case | `--accent-hover` |
| Constants | `UPPER_SNAKE_CASE` | `const MAX_HISTORY = 100` |
| Event names | `namespace:action` | `'task:create'`, `'schedule:updated'` |
| IndexedDB stores | `snake_case` | `time_logs` |

### Language

- **All code, comments, variable names, and commit messages MUST be in English.**
- The product name "Cronograma" is the only Spanish term allowed — it's a brand name, not a code term.

### Documentation

- **JSDoc** on all exported functions, classes, and public methods.
- **Inline comments** explaining each algorithm phase in `src/engine/` files, matching the spec's Phase 0–9 naming.
- Do NOT add redundant comments restating what the code obviously does.

### Error Handling

- **Custom error classes** in `src/utils/errors.js`:
  - `CycleDetectedError` — thrown by DAL when adding a dependency that creates a cycle
  - `ValidationError` — thrown by DAL/schemas for invalid data
  - `SyncError` — thrown by GitHub sync layer
  - `SchedulerError` — thrown by engine for unrecoverable states
- **Centralized handler** in `AppState` catches errors from DAL/engine and dispatches `<crono-toast-notification>` events.
- Engine and DAL code MUST NOT display UI (no `alert()`, no DOM manipulation for errors).

---

## 3. Lit Component Boilerplate

Use this template when creating any new component:

```javascript
import { LitElement, html, css } from 'lit';
import { sharedStyles } from '../../styles/shared-styles.js';

/**
 * <crono-example-component> — Brief description of what this component does.
 *
 * @fires crono-example-component:action - Fired when [describe trigger].
 * @slot default - [Describe slot content if applicable].
 */
export class CronoExampleComponent extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        /* Component-specific styles only. Use design tokens for colors/spacing. */
      }
    `
  ];

  static properties = {
    /** @type {string} Brief description */
    exampleProp: { type: String, attribute: 'example-prop' },
  };

  constructor() {
    super();
    this.exampleProp = '';
  }

  render() {
    return html`
      <div class="container">
        <!-- Component markup -->
      </div>
    `;
  }

  /**
   * Dispatches a custom event. Use this pattern for all component events.
   * @param {string} detail - Event payload.
   */
  _dispatchAction(detail) {
    this.dispatchEvent(new CustomEvent('crono-example-component:action', {
      detail,
      bubbles: true,
      composed: true,
    }));
  }
}

customElements.define('crono-example-component', CronoExampleComponent);
```

### Component Rules

- **One component per file.** File name matches element name without prefix: `crono-task-card` → `task-card.js`.
- **Always extend `LitElement`**, never raw `HTMLElement`.
- **Always include `sharedStyles`** as the first entry in `static styles` array.
- **Events bubble + compose** (`bubbles: true, composed: true`) so they cross Shadow DOM boundaries.
- **Event naming:** `component-name:action` (e.g., `crono-task-card:complete`).
- **Attribute reflection:** Use `attribute: 'kebab-case'` for any property exposed as an HTML attribute.
- **No direct state mutation.** Components dispatch events → `AppState` handles logic → reactive updates flow back down.

---

## 4. CSS & Styling Rules

### Design Tokens

All visual values come from CSS custom properties defined in `src/styles/tokens.css`. **NEVER hard-code colors, spacing, radii, shadows, or font values.**

```css
/* ✅ Correct */
color: var(--text-primary);
padding: var(--space-md);
border-radius: var(--radius-md);

/* ❌ Wrong */
color: #eee;
padding: 16px;
border-radius: 10px;
```

### When to Create New Tokens

- **DO** create a new token if a value is used in 3+ components.
- **DO** create semantic tokens that reference base tokens (e.g., `--card-bg: var(--bg-secondary)`).
- **DON'T** create one-off tokens for single-use values. Use the closest existing token or inline the value with a comment explaining why.

### Accent Color System

The user picks ONE accent hex color. `src/utils/color-utils.js` decomposes it to HSL and generates:
- `--accent` (base)
- `--accent-hover` (lightened)
- `--accent-muted` (desaturated + darkened)
- `--accent-glow` (with alpha for shadows)

**NEVER reference the raw accent hex.** Always use the derived CSS variables.

### Responsive Breakpoints

```css
/* Defined in src/styles/responsive.css */
--breakpoint-mobile: 640px;
--breakpoint-tablet: 1024px;

/* Usage pattern (mobile-first): */
@media (min-width: 1024px) { /* Desktop */ }
```

- **Mobile-first approach.** Base styles are mobile. Add complexity via `min-width` media queries.
- Desktop layout: sidebar (240px collapsible) + main content + right detail drawer.
- Mobile layout: full-width content + bottom nav (Calendar, Tasks) + hamburger for secondary views.

---

## 5. Scheduler Engine Rules

### Quick Reference — The 9 Phases

| Phase | Name | Purpose |
|-------|------|---------|
| 0 | Setup | Compute horizon, generate time slots from work/break windows |
| 1 | Reserve Locked | Mark manually-placed (locked) tasks as occupied |
| 2 | Tag Windows | Compute manual + auto-expanding tag time windows |
| 3 | Tag Reservation | Reserve dedicated tag timeslots (blocks non-tag tasks) |
| 4 | Recurrence | Generate recurring task instances, apply accumulation |
| 5 | Scoring | Compute alert levels and slack for all tasks |
| 6 | Dependencies | Topological sort on hard dependencies (Kahn's algorithm) |
| 7 | Priority Queue | Sort tasks: Red > Orange > None → dep order → priority → slack → duration |
| 8 | Allocation | Greedy slot-fill; respect tag windows, breaks, splittability |
| 9 | Alerts | Finalize orange/red alert list |

> For full pseudo-code of each phase, see `IMPLEMENTATION_SPEC.md` §3.2.

### Engine File Responsibilities

| File | Responsibility |
|------|---------------|
| `scheduler.js` | Orchestrates all 9 phases. Single entry point: `computeSchedule()` |
| `recurrence-engine.js` | Pure Phase 4 recurrence generator: future instances, catch-up backlog on cumulative days, max repeats |
| `dependency-resolver.js` | `buildDependencyGraph()`, `topologicalSort()`, `detectCycle()` |
| `alert-evaluator.js` | `computeAlertLevel()` — red/orange/none per task |
| `tag-window-expander.js` | `generateAutoWindows()`, `expandManualWindows()` |
| `slot-allocator.js` | `takeFirstN()`, `findFirstContiguousBlock()`, `markSlotsOccupied()` |
| `cronograma.worker.js` | Web Worker entry. Listens for `COMPUTE` messages, calls `computeSchedule()`, posts `SCHEDULE` result |

### Worker Message Protocol

```javascript
// Main → Worker
{ type: 'COMPUTE', payload: { tasks, tags, dependencies, settings, now } }
{ type: 'CONFIG',  payload: { interval_ms } }
{ type: 'STOP' }

// Worker → Main
{ type: 'SCHEDULE', payload: Schedule }
{ type: 'ERROR',    payload: { message, stack } }
{ type: 'STATUS',   payload: { state: 'computing' | 'idle', lastRun } }
```

### Hard Rules for Engine Code

1. **Zero side effects.** `computeSchedule()` is a pure function. Same input → same output, always.
2. **No browser APIs.** No `window`, `document`, `fetch`, `localStorage`, `IndexedDB`.
3. **No external state.** Don't read global variables or module-level mutable state.
4. **Time is an input.** `now` is passed as a parameter. NEVER call `new Date()` inside engine code.
5. **ULIDs are generated outside.** Pass a ULID generator function as a dependency if block IDs need generation inside the engine.
6. **Local Date Parsing.** NEVER pass `'YYYY-MM-DD'` date strings directly to `new Date('YYYY-MM-DD')` because ECMAScript parses them as UTC midnight (`00:00:00.000Z`), causing day-lag shifts in negative timezones. Always use `parseISOToLocalDate(date)`.
7. **Current Day Slot Generation.** Phase 0 `generateTimeSlots` MUST start at `parseISOToLocalDate(nowObj)` (`00:00:00` of current local day), NOT exact timestamp `now`, ensuring full-day time slots exist for today so morning tasks schedule on today's calendar.
8. **Break Window Work Chunking.** Auto-expanding tag windows must call `getAvailableWorkChunks(workWindows, breakWindows)` to split global work windows into sub-chunks around custom breaks, filling sub-chunks sequentially and jumping over break windows.
9. **Untagged Task Isolation.** Untagged tasks (tasks without a time-windowed tag) are strictly restricted to non-tag hours (`(!s.matchingTagIds || s.matchingTagIds.size === 0)`), even if a tag window is empty of tasks.

10. **Tag Hierarchy & Subtag Windows.** Tags support hierarchical nesting up to 4 levels via `parent_tag_id`. Subtags inherit time window constraints from parent tags:
   - If parent is `auto`, subtags are locked to `auto` (or `none`) and active days are restricted to parent active days.
   - If parent is `manual`, subtags can pick `manual` or `auto`, bounded by parent unreserved windows.
   - Sibling subtags under the same parent dynamically slice and subtract their manual windows from the parent window pool using `subtractTimeWindows()`.
   - Scheduler Phase 2 sorts tags topologically by hierarchy depth (prioritizing manual before auto at the same depth) and carves subtag auto windows cleanly from the unreserved parent slices using scoped `subtagDayCursors`.

---

## 6. DAL Interaction Patterns

### Adding a New Entity Type

If you need to add a new data entity (e.g., `notes`):

1. **Define the JSON schema** in `src/data/schemas.js`.
2. **Add the object store** to the IndexedDB upgrade handler in `src/data/idb-adapter.js` (increment DB version).
3. **Add CRUD methods** to the `DataAccessLayer` abstract class in `src/data/dal.js`.
4. **Implement** those methods in `idb-adapter.js`.
5. **Add to bulk export/import** (`exportAll()` / `importAll()`) so GitHub sync picks it up.
6. **Add the JSON file** to the GitHub sync file list in `src/data/github-sync.js`.
7. **Bump `schema_version`** in settings and add a migration in `src/data/migrations.js`.

### Schema Migrations

- `src/data/migrations.js` contains versioned migration functions: `migrate_v1_to_v2()`, etc.
- On app startup, check `settings.schema_version` vs. current code version.
- Run migrations sequentially. Each migration transforms the data in IndexedDB in-place.
- **NEVER delete fields** in a migration without a deprecation period. Add new fields with defaults first, migrate data, then remove old fields in a subsequent version.

### DAL Method Conventions

- All methods are `async` and return Promises.
- `create*()` auto-generates `id` (ULID), `created_at`, and `updated_at`.
- `update*()` auto-sets `updated_at`.
- `completeTask()` enforces the history limit (prunes oldest completed tasks beyond the cap).
- `createDependency()` runs cycle detection before writing. Throws `CycleDetectedError` if invalid.

### Scheduler Trigger Rules

After any DAL write operation, `AppState` checks if it should trigger a scheduler recompute:

- **Triggers recompute:** `createTask`, `updateTask`, `deleteTask`, `completeTask`, `updateTag`, `deleteTag`, `createDependency`, `deleteDependency`, `updateSettings`
- **Does NOT trigger:** `createTag` (no tasks linked yet), `createTimeLog`, `deleteTimeLog` (informational only)

---

## 7. Common Pitfalls & Gotchas

### ❌ Don't Do This → ✅ Do This Instead

| Pitfall | Why It's Wrong | Correct Approach |
|---------|---------------|-----------------|
| Import `idb` in a component | Violates DAL abstraction | Import from `dal.js` only |
| Use `new Date()` in engine code | Breaks purity; non-deterministic | Accept `now` as parameter |
| Parse `'YYYY-MM-DD'` with `new Date('YYYY-MM-DD')` | Parses as UTC midnight, shifting day by -1 in negative timezones | Use `parseISOToLocalDate(date)` |
| Pass raw `now` timestamp to `generateTimeSlots` | Omits morning slots for today; pushes morning tasks to tomorrow | Use `parseISOToLocalDate(nowObj)` as start |
| Generate auto tag windows without break chunking | Overlaps break windows or truncates tag hours | Call `getAvailableWorkChunks(workWindows, breakWindows)` |
| Allow untagged tasks in empty tag windows | Violates strict tag window isolation | Filter candidate slots with `(!s.matchingTagIds || s.matchingTagIds.size === 0)` |
| Use native browser `<input type="date">`, `<input type="time">`, or `<input type="datetime-local">` | Inconsistent locale rendering, uncontrolled dialogs, off-screen clipping | Always use `<crono-date-picker>`, `<crono-time-picker-24h>`, or `<crono-datetime-picker>` |
| Position popovers with static `left: 0` | Renders off-screen when opened near right viewport/drawer boundaries | Implement viewport boundary collision detection (auto-flip to `right: 0` and `bottom: calc(100% + 4px)`) |
| Rely on browser default nested list bullets (`◦`, `▪`) | Causes double-bullet rendering and misaligned indentation | Use `list-style: none` and `<span class="md-bullet-col">•</span>` |
| Overwrite dirty Lit DOM `.value` with property binding alone | Browser keeps dirty input value if component property didn't change | Explicitly sync `inputEl.value = val` on clamp/commit |
| Render subtag calendar labels at identical top offsets | Causes text collision with parent tag headers | Add depth vertical padding offset (`padding-top: ${(depth - 1) * 20 + 4}px`) |
| Hard-code colors in component CSS | Breaks theming | Use `var(--token-name)` |
| Fire events without `composed: true` | Events won't cross Shadow DOM | Always set `bubbles: true, composed: true` |
| Put scheduling logic in a component | Violates engine isolation | All scheduling logic lives in `src/engine/` |
| Call `dal.createDependency()` without handling `CycleDetectedError` | Silent failure | Catch and show user-facing error via toast |
| Mutate task objects in the engine | Side effects; breaks re-entrancy | Clone/create new objects; return fresh schedule |
| Store computed schedule in IndexedDB | Wasteful; it's recomputed every run | Keep in memory via `schedule-state.js` only |
| Use `alert()` or `console.log()` for user errors | Bad UX, not accessible | Dispatch `<crono-toast-notification>` events |
| Use `px` for spacing | Inconsistent spacing | Use `var(--space-*)` tokens |
| Create a component without `sharedStyles` | Missing design tokens/reset | Always include `sharedStyles` as first in `static styles` |
| Allow multiple tags with time windows on one task | Conflicting scheduling constraints | Validate at creation: max 1 time-windowed tag per task |
| Let time logs affect the scheduler | Violates spec: time logs are informational only | Engine NEVER reads `time_logs` store |
| Forget to add new entities to `exportAll()`/`importAll()` | GitHub sync will miss the data | Always update both methods when adding stores |

### Edge Cases to Remember

- **Strict 24-Hour Two-Column Time Picker**: `<crono-time-picker-24h>` provides two-column selection (`Hour 00–23` and `Min 00–55` + `:59` end-of-day), grays out unavailable interval slices, auto-scrolls to center on open, and clamps invalid manual inputs with an animated warning tooltip bubble.
- **Custom Month Calendar Date Picker**: `<crono-date-picker>` renders a 100% custom month grid (Mon-Sun headers, prev/next month navigation, today outline, selected highlight, and quick "Today"/"Clear" buttons) with zero native browser calendar popups.
- **Unified Side-by-Side DateTime Popover**: `<crono-datetime-picker>` pairs custom date calendar and 24h time selection side-by-side inside a single popover triggered by a unified `YYYY-MM-DD HH:MM` text input, with smart defaults (09:00 for start, 23:59 for deadline).
- **Smart Viewport & Drawer Collision Detection**: All picker popovers dynamically measure trigger position relative to window bounds on open, auto-flipping alignment to `right: 0` when in right-side drawer panels or near the right edge of the screen, and flipping upward if near the bottom.
- **Hierarchical Tag Model**: Subtags support up to 4 levels of depth with cycle validation. Sibling subtags under the same parent dynamically slice and reserve parent windows using `subtractTimeWindows()`.
- **Calendar Layering & Depth Offsets**: Calendar Day and Week views render subtag windows layered with horizontal insets and depth-based vertical padding offsets (`padding-top: ${(depth - 1) * 20 + 4}px`) to prevent label collisions.
- **Markdown Column Bullet Tracks**: Concatenated sublists (`* *`, `* * *`, `- -`) render with fixed 16px column widths (`.md-bullet-col`) and `list-style: none`, vertically aligning each bullet level.
- **Task Form Preview Default**: Existing tasks open directly in the **Preview** tab, and new tasks open in **Edit** mode.
- **Manual Start-Time Only**: Manual locked tasks (one-off and recurring) take only the start time; end time is computed from duration.
- **Automatic Tag Time Budget**: Tag duration is dynamically derived from assigned active tasks, not manually edited.
- **Recurring task accumulation** uses a counter on the parent, NOT separate task objects. The cap is configurable per-task (`accumulation_cap`).
- **Allowed Cumulative Days**: Catch-up instances for accumulated tasks are scheduled across `cumulative_days` (configured separately from primary recurrence days).
- **Max Repeats / Iterations**: Repeating tasks can optionally specify `max_repeats`. Capped instance generation in engine; completes the task when `iterations_completed >= max_repeats`.
- **Readonly Next Occurrence**: Managed by recurrence engine and task completion; not user-editable.
- **Anti-Overflow Drawer Layout**: Drawer panel is 500px on desktop with `overflow-x: hidden`, alert window placed below deadline.
- **Non-splittable tasks** that can't fit contiguously should be **force-split as a fallback** with an alert, not silently dropped.
- **Auto-expanding tag windows** always respect global work windows and break windows. They stack dynamically across available work chunks in list order using a stateful `dayCursors` map (`dateStr -> HH:MM`).
- **Tags with `time_window_mode: 'none'`** are pure labels — they don't affect scheduling.
- **Dependency cycle detection** checks the combined hard+soft graph, not just one type.
- **History pruning** runs inside `completeTask()`, not as a separate cron/timer.


