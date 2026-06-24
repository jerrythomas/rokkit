# Quick Wins Design: Test Fixes + text→label Rename + Coverage

**Date:** 2026-03-06
**Status:** Approved

---

## Overview

Three sequential steps to fix failing tests, complete the `label` field rename in code, and close coverage gaps in critical packages.

---

## Step 1 — Fix 3 failing vibe tests

**File:** `packages/states/spec/vibe.spec.svelte.js`

**Root cause:** The `mocked` describe block replaces `window.localStorage` via `Object.defineProperty` in a `beforeEach` but never restores it. The mock persists across test collection cycles causing outer-scope tests to see a broken localStorage.

**Fix:** Capture the original `localStorage` reference before the mock is installed. Restore it in an `afterEach`.

```js
describe('mocked', () => {
  let originalLocalStorage

  beforeEach(() => {
    originalLocalStorage = window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    })
  })
  // ... existing tests
})
```

**Success:** All 2696 tests pass, 0 failures.

---

## Step 2 — `text` → `label` rename + compat removal

### Code changes

| File                                                          | Change                                                               |
| ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `packages/states/src/derive.svelte.js` lines 51, 55           | `fields.text` → `fields.label`                                       |
| `packages/core/src/field-mapper.js` line 19                   | `this.hasText` → `this.hasLabel`; update all internal usages         |
| `packages/testbed/src/proxy/proxy.svelte.js` lines 9, 74, 125 | Comment + `fields.text` + `get text()` accessor                      |
| `packages/ui/src/types/menu.ts` line 24                       | JSDoc: `text → 'text'` → `label → 'label'`                           |
| `packages/core/src/constants.js`                              | Remove `normalizeFields()` backward compat mapping of `text → label` |

### Test data changes

All spec files using `{ text: '...' }` as a **field mapping key** (not content) must be updated to `{ label: '...' }`. This is limited to:

- `packages/states/spec/` — proxy-item, list-controller, wrapper, derive specs
- `packages/ui/` — any component specs passing `fields: { text: ... }`
- `packages/forms/` — lookup field mapping examples

**Important distinction:** Only change `text:` when it is the _field mapping role_ key. Do not change:

- String content like `{ text: 'Hello world' }` where `text` is a data property name
- CSS class strings like `text-sm`, `text-surface-z5`
- `InputText`, `inputText` component/variable names

### Backward compat

Removing `normalizeFields()` is intentional. This is a pre-1.0 library. No grace period needed.

**Success:** All tests pass after rename; `normalizeFields()` no longer maps `text → label`; grep for `fields\.text` returns zero results in non-testbed source.

---

## Step 3 — Missing test coverage

Three new spec files, ordered by importance:

### 3a. `packages/actions/spec/trigger.spec.js`

Test the `trigger.js` state machine (154 lines) used by Menu, Select, Dropdown:

- Initial closed state
- `open()` / `close()` / `toggle()` transitions
- Keyboard activation (Enter, Space open; Escape closes)
- `disabled` prevents open
- Event emissions on state change

### 3b. `packages/actions/spec/keymap.spec.js`

Test the `keymap.js` keyboard→action mapping (131 lines):

- ArrowDown/ArrowUp map to `moveNext`/`movePrev` in vertical orientation
- ArrowRight/ArrowLeft map to `moveNext`/`movePrev` in horizontal orientation
- Home/End map to `moveFirst`/`moveLast`
- Enter/Space map to `activate`
- RTL reverses horizontal arrow mapping
- Unknown keys return null/undefined

### 3c. `packages/states/spec/table-controller.spec.svelte.js`

Test `table-controller.svelte.js` (extends ListController):

- Initialization with tabular data
- `sortBy(column)` — ascending first call, descending second call on same column
- `sortBy(different column)` — resets to ascending
- Pagination: `nextPage()`, `prevPage()`, page size
- Column visibility toggle

**Skip:** `nav-constants.js` — constants only, no logic to test.

**Success:** 3 new spec files, all tests passing. Coverage for trigger, keymap, and table-controller is behavioral (not line-coverage targets).

---

## Sequencing

```
Step 1 (fix tests) → verify green → Step 2 (rename) → verify green → Step 3 (coverage)
```

Each step ends with `bun run test:ci` passing before the next begins.
