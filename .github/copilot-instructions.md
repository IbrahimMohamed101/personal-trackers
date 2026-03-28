# Sama OS - AI Coding Agent Instructions

Sama OS is a personal operating system/dashboard app written in vanilla JavaScript. It's a complex single-page app with modular features, bilingual UI (Arabic/English), and a sophisticated gamification system.

## Architecture Overview

**Single Global State Model**: All app data lives in a global `S` object (defined in `core.js`, persisted in `persistence.js`). This single source of truth is:
- Loaded from Supabase or localStorage on app start (`load()` function)
- Validated/recovered via `normalizeStateShape()` to ensure data integrity  
- Saved via `save()` which syncs to both localStorage and Supabase

**Feature Organization**: Each feature module operates independently but modifies the shared `S` object:
- `features-tasks.js`: Task creation, recurring task refreshing, rendering
- `features-habits.js`: Daily habit tracking, XP rewards
- `features-money.js`: Expense tracking with budget categories
- `features-journal.js`: Daily journal entries with mood/energy logging
- `features-gamification.js`: XP system, levels, weekly challenges
- `features-insights.js`, `features-planning.js`, `features-home.js`: Other views

**Data Flow**: HTML pages (rendered as template strings in `templates.js`) → Event handlers (`onclick="toggleTaskDone(123)"`) → Feature functions modify `S` → Call `save()` → UI re-renders via `render*()` functions.

**Storage Layer** (`persistence.js`): 
- Supabase integration for cloud sync (14 tables: `sama_tasks`, `sama_habits`, `sama_expenses`, etc.)
- Automatic conflict resolution: Bootstrap default data if remote is empty; merge local+remote on conflicts
- Snapshot creation via `createRemoteSnapshot()` transforms local `S` to remote schema (e.g., `amt` → `amount`, `cat` → `category`)

## Critical Conventions

**Date Handling**: All dates are YYYY-MM-DD strings (NOT JavaScript Dates):
```javascript
todayKey()                    // Returns today as "2026-03-28"
shiftDateKey("2026-03-28", 7) // Returns "2026-04-04"
parseDateKey("2026-03-28")    // Returns JavaScript Date object
```

**ID Generation**: Numeric IDs via `generateNumericId()`. When working with IDs, always normalize to `Number()` type.

**Naming Conventions** (internal shortcuts for storage):
- `amt` = amount (expenses)
- `cat` = category  
- `pct` = percentage (goals)
- `w1-w4` = weekly questions 1-4
- `gratitude1` = first gratitude entry
- `repeatType` = task repeat type (`'daily'`, `'weekly'`, or `'none'`)

**Bilingual String System**: 
- Arabic-first templates in `templates.js`
- English fallback in `features-home.js` via `lang()` function
- Use `langText('key.path', fallback)` to get localized strings
- RTL applied via CSS (`dir="rtl"` when language is Arabic)

**Rendering Pattern**: No frameworks; template strings + innerHTML:
```javascript
function renderTasks() {
  const tasks = getTodayTasks();
  const html = tasks.map(task => renderTaskItem(task)).join('');
  document.getElementById('tasks-pending').innerHTML = html;
}

function renderTaskItem(task) {
  return `<div class="task-item ${task.done ? 'done' : ''}">
    <input type="checkbox" ${task.done ? 'checked' : ''} 
           onchange="toggleTaskDone(${task.id}, this.checked)">
    ...
  </div>`;
}
```

**UI Structure**: Desktop (220px sidebar + main) and Mobile (top bar + bottom nav). Toggle via media queries in CSS.

## Key Data Structures

Familiarize yourself with these normalized shapes before modifying persistence:

**Task**: `{id, title, priority('urgent'|'important'|'normal'), repeatType, goalId, done, date, createdAt}`

**Habit**: `{id, name, done[array of date keys], createdAt}` — daily tracking via date array

**Expense**: `{id, amt, cat, note, date, createdAt}` — categories: 'أكل', 'مواصلات', 'دراسة', 'ترفيه', 'صحة', 'فواتير', 'أخرى'

**Journal Entry**: `{id, date, content, gratitude1, gratitude2, gratitude3, energy(1-10), mood(1-6), createdAt}`

**Goal**: `{id, icon, title, detail, deadline, pct, createdAt}` — 3-month goals with progress %

**State Root** (`S`):
```javascript
{
  energy: 1-10,               // Daily energy level (user-set slider)
  dayType: 'productive'|...,  // Day mood type
  xp, level,                  // Gamification
  tasks, habits, expenses, journal, goals, problems,  // Feature data
  energyHistory, moodLog,     // Historical tracking
  weeklyChallenge, weeklyChallengeProgress, weeklyChallengeDone,
  settings: {fontScale, language},
  pomodoro: {mode, remainingSec, running, sessionsToday},
  ...other features
}
```

## Common Tasks & Patterns

**Adding a new feature field to state:**
1. Add default in `createDefaultState()` 
2. Add normalization in `normalizeStateShape()` 
3. Add to remote snapshot in `createRemoteSnapshot()` and sync function
4. Access via `S.yourField` in feature code

**Updating UI after data change:**
```javascript
// Modify state
S.tasks.push({id: generateNumericId(), title: newTitle, ...});

// Save (triggers Supabase sync)
save();

// Re-render affected UI
renderTasks();
```

**Quest/Challenge System** (`features-gamification.js`): Weekly challenges defined in `WEEKLY_CHALLENGE_DEFS` array. Each has `progress()` function that recalculates completion. Update `S.weeklyChallengeProgress` during state changes.

**Modal/Form Pattern**: Modals rendered in `templates.js` with hidden/visible states. Form submission stores data then calls `save()` and relevant `render*()` function.

## Debugging & Testing

**Check app state**: Open dev console: `console.log(S)` to inspect current state

**Trace sync issues**: 
- Check `setSyncIndicator()` states: 'syncing', 'synced', 'offline'
- Verify Supabase client initialized: `supabaseClient` should exist
- Test localStorage: `localStorage.getItem('samaos_v3')` returns JSON backup

**Data integrity**: Call `S = normalizeStateShape(S)` to auto-recover corrupted state

**Performance**: App syncs on every `save()` call; batch updates in loops before single `save()`.

## File Map

| File | Purpose |
|------|---------|
| `core.js` | Constants, utility functions (date, ID, localization), state defaults |
| `persistence.js` | State loading/saving, Supabase sync logic, normalization |
| `app.js` | App initialization, page routing via `goPage()`, active page rendering |
| `ui.js` | Navigation, settings, export/import, modals, shared UI helpers |
| `templates.js` | HTML template strings for all pages; no rendering logic |
| `features-*.js` | Feature-specific state logic and rendering functions |
| `css/sama-os.css` | Dark theme, responsive layout, component styles |

---

**When in doubt**: Check `normalizeStateShape()` to understand the canonical data shape, and `renderActivePage()` to see the routing pattern.
