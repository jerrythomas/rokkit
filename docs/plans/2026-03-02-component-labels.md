# Component Labels Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all hardcoded English strings in 15 UI components with MessagesStore defaults, enabling app-global i18n and per-instance overrides.

**Architecture:** Extend MessagesStore with nested component label maps. Components read defaults from `messages.current.<component>`. Multi-label components get a `labels` prop merged over store defaults (same pattern as icons). Single-label components default their existing `label` prop from the store.

**Tech Stack:** Svelte 5, `@rokkit/states`, `@rokkit/ui`, `@rokkit/app`

**Design:** `docs/plans/2026-03-02-component-labels-design.md`

---

### Task 1: Extend MessagesStore — defaultMessages + deep-merge set()

**Files:**
- Modify: `packages/states/src/messages.svelte.js`

**Step 1: Write the failing test**

Create test in `packages/states/spec/messages.spec.js` (or extend existing). Tests needed:

```js
// Test 1: defaultMessages includes new nested keys
import { messages } from '../src/messages.svelte.js'

it('has nested component label defaults', () => {
  expect(messages.current.tree).toEqual({ label: 'Tree', expand: 'Expand', collapse: 'Collapse', loading: 'Loading', loadMore: 'Load More' })
  expect(messages.current.list).toEqual({ label: 'List' })
  expect(messages.current.carousel).toEqual({ label: 'Carousel', prev: 'Previous slide', next: 'Next slide', slides: 'Slide navigation' })
  expect(messages.current.mode).toEqual({ system: 'System', light: 'Light', dark: 'Dark' })
})

// Test 2: set() deep-merges nested objects
it('deep-merges nested objects on set()', () => {
  messages.set({ tree: { expand: 'Ouvrir' } })
  expect(messages.current.tree.expand).toBe('Ouvrir')
  expect(messages.current.tree.collapse).toBe('Collapse') // preserved
  expect(messages.current.tree.label).toBe('Tree') // preserved
  messages.reset()
})

// Test 3: set() still shallow-merges flat keys
it('still overrides flat keys on set()', () => {
  messages.set({ loading: 'Chargement...' })
  expect(messages.current.loading).toBe('Chargement...')
  expect(messages.current.emptyList).toBe('No items found') // preserved
  messages.reset()
})

// Test 4: reset() restores all defaults
it('reset() restores nested defaults', () => {
  messages.set({ tree: { expand: 'Ouvrir' }, loading: 'X' })
  messages.reset()
  expect(messages.current.tree.expand).toBe('Expand')
  expect(messages.current.loading).toBe('Loading...')
})
```

**Step 2: Run test to verify it fails**

Run: `cd solution && bun run vitest run packages/states/spec/messages`
Expected: FAIL — `messages.current.tree` is undefined, deep-merge not implemented.

**Step 3: Implement MessagesStore changes**

In `packages/states/src/messages.svelte.js`:

1. Extend `defaultMessages` with all 16 nested keys (list, tree, toolbar, menu, toggle, rating, stepper, breadcrumbs, carousel, tabs, code, range, search_, filter, floatingNav, mode).

2. Replace `set()` shallow merge with deep-merge:

```js
set(custom) {
  const merged = { ...defaultMessages }
  for (const key of Object.keys(custom)) {
    if (typeof custom[key] === 'object' && custom[key] !== null && typeof merged[key] === 'object' && merged[key] !== null) {
      merged[key] = { ...merged[key], ...custom[key] }
    } else {
      merged[key] = custom[key]
    }
  }
  this.#messages = merged
}
```

3. Update JSDoc types inline to reflect the new shape. The `Messages` type should document the nested structures.

**Step 4: Run tests to verify they pass**

Run: `cd solution && bun run vitest run packages/states/spec/messages`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/states/src/messages.svelte.js packages/states/spec/messages*
git commit -m "feat(states): extend MessagesStore with component labels + deep-merge"
```

---

### Task 2: Migrate single-label components — List, Toolbar, Toggle, Rating, Stepper, BreadCrumbs

These 6 components have only one hardcoded string (the aria-label). Each gets a `label` prop defaulting from `messages.current.<component>.label`.

**Files:**
- Modify: `packages/ui/src/components/List.svelte` (line 109: `aria-label="List"`)
- Modify: `packages/ui/src/components/Toolbar.svelte` (line 263: `aria-label="Toolbar"`)
- Modify: `packages/ui/src/components/Toggle.svelte` (line 61: `aria-label="Selection"`)
- Modify: `packages/ui/src/components/Rating.svelte` (line 76: `aria-label="Rating"`)
- Modify: `packages/ui/src/components/Stepper.svelte` (line 109: `aria-label="Progress"`)
- Modify: `packages/ui/src/components/BreadCrumbs.svelte` (line 52: `aria-label="Breadcrumb"`)

**Pattern for each component:**

1. Add `import { messages } from '@rokkit/states'` (skip if already imported from there).
2. Add `label` prop with store default: `label = messages.current.<key>.label`
3. Replace hardcoded `aria-label="X"` with `aria-label={label}`

Example for List:
```svelte
<script>
  import { messages } from '@rokkit/states'
  let { label = messages.current.list.label, ...rest } = $props()
</script>
<div aria-label={label}>
```

**Note:** List, Toolbar, Toggle, BreadCrumbs already import from `@rokkit/states` (ProxyItem, Wrapper, etc.) — just add `messages` to existing import. Rating and Stepper do NOT import from `@rokkit/states` — add new import line.

**Step 1: Write failing tests**

For each component, add a test verifying:
- Default label comes from messages.current (check aria-label attribute)
- Custom `label` prop overrides the default

**Step 2: Run tests to verify they fail**

Run: `cd solution && bun run vitest run packages/ui/spec/{List,Toolbar,Toggle,Rating,Stepper,BreadCrumbs}`
Expected: FAIL

**Step 3: Implement the changes in all 6 components**

**Step 4: Run tests to verify they pass**

Run: `cd solution && bun run vitest run packages/ui/spec/{List,Toolbar,Toggle,Rating,Stepper,BreadCrumbs}`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ui/src/components/{List,Toolbar,Toggle,Rating,Stepper,BreadCrumbs}.svelte packages/ui/spec/*
git commit -m "feat(ui): migrate 6 single-label components to MessagesStore defaults"
```

---

### Task 3: Migrate Menu — update existing label prop default

Menu already has `label = 'Menu'` prop (line 64). Just change the default to read from the store.

**Files:**
- Modify: `packages/ui/src/components/Menu.svelte` (line 64: `label = 'Menu'`)

**Step 1: Write failing test**

Test that default label reads from `messages.current.menu.label`.

**Step 2: Run test to verify it fails**

Run: `cd solution && bun run vitest run packages/ui/spec/Menu`
Expected: FAIL

**Step 3: Implement**

1. Add `messages` to the existing `@rokkit/states` import.
2. Change `label = 'Menu'` to `label = messages.current.menu.label`.
3. No template changes needed — already uses `aria-label={label}`.

**Step 4: Run tests**

Run: `cd solution && bun run vitest run packages/ui/spec/Menu`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ui/src/components/Menu.svelte packages/ui/spec/Menu*
git commit -m "feat(ui): migrate Menu label prop to MessagesStore default"
```

---

### Task 4: Migrate Tree and LazyTree — labels prop (5 keys)

Both share the same `messages.current.tree` store key.

**Files:**
- Modify: `packages/ui/src/components/Tree.svelte`
  - Line 72: `aria-label="Tree"`
  - Line 97: `aria-label={proxy.expanded ? 'Collapse' : 'Expand'}`
- Modify: `packages/ui/src/components/LazyTree.svelte`
  - Line 83: `aria-label="Tree"`
  - Line 111: `aria-label={isLoading ? 'Loading' : proxy.expanded ? 'Collapse' : 'Expand'}`
  - Line 159: `label="Load More"` (or similar button text)

**Pattern:**
```svelte
<script>
  import { messages } from '@rokkit/states'
  let { labels: userLabels = {}, ...rest } = $props()
  const labels = $derived({ ...messages.current.tree, ...userLabels })
</script>
<div aria-label={labels.label}>
  <!-- expand/collapse button -->
  <button aria-label={proxy.expanded ? labels.collapse : labels.expand}>
  <!-- LazyTree loading state -->
  <button aria-label={isLoading ? labels.loading : proxy.expanded ? labels.collapse : labels.expand}>
  <!-- Load more button -->
  <button>{labels.loadMore}</button>
```

**Step 1: Write failing tests for both Tree and LazyTree**

- Default labels from store
- Custom `labels` prop overrides (e.g. `labels={{ expand: 'Open' }}`)

**Step 2: Run tests**

Run: `cd solution && bun run vitest run packages/ui/spec/{Tree,LazyTree}`
Expected: FAIL

**Step 3: Implement both components**

Both already import from `@rokkit/states` — add `messages` to existing import.

**Step 4: Run tests**

Run: `cd solution && bun run vitest run packages/ui/spec/{Tree,LazyTree}`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/ui/src/components/{Tree,LazyTree}.svelte packages/ui/spec/{Tree,LazyTree}*
git commit -m "feat(ui): migrate Tree + LazyTree to labels prop via MessagesStore"
```

---

### Task 5: Migrate Carousel — labels prop (4 keys)

**Files:**
- Modify: `packages/ui/src/components/Carousel.svelte`
  - Line 95: `aria-label="Carousel"`
  - Line 137: `aria-label="Previous slide"`
  - Line 147: `aria-label="Next slide"`
  - Line 156: `aria-label="Slide navigation"`

**Pattern:**
```svelte
<script>
  import { messages } from '@rokkit/states'
  let { labels: userLabels = {}, ...rest } = $props()
  const labels = $derived({ ...messages.current.carousel, ...userLabels })
</script>
<div aria-label={labels.label}>
  <button aria-label={labels.prev}>
  <button aria-label={labels.next}>
  <div aria-label={labels.slides}>
```

Carousel does NOT currently import from `@rokkit/states` — add new import.

**Step 1-5:** Same TDD cycle as above.

**Commit message:** `feat(ui): migrate Carousel to labels prop via MessagesStore`

---

### Task 6: Migrate Tabs — labels prop (2 keys)

**Files:**
- Modify: `packages/ui/src/components/Tabs.svelte`
  - Line 89: `aria-label="Remove tab"`
  - Line 156: `aria-label="Add tab"`

**Pattern:**
```svelte
<script>
  import { messages } from '@rokkit/states'
  let { labels: userLabels = {}, ...rest } = $props()
  const labels = $derived({ ...messages.current.tabs, ...userLabels })
</script>
<button aria-label={labels.remove}>
<button aria-label={labels.add}>
```

Tabs already imports from `@rokkit/states`.

**Step 1-5:** Same TDD cycle.

**Commit message:** `feat(ui): migrate Tabs to labels prop via MessagesStore`

---

### Task 7: Migrate Code — labels prop (2 keys)

**Files:**
- Modify: `packages/ui/src/components/Code.svelte`
  - Line 58: `aria-label={copied ? 'Copied!' : 'Copy code'}`

**Pattern:**
```svelte
<script>
  import { messages } from '@rokkit/states'
  let { labels: userLabels = {}, ...rest } = $props()
  const labels = $derived({ ...messages.current.code, ...userLabels })
</script>
<button aria-label={copied ? labels.copied : labels.copy}>
```

Code does NOT currently import from `@rokkit/states` — add new import.

**Step 1-5:** Same TDD cycle.

**Commit message:** `feat(ui): migrate Code to labels prop via MessagesStore`

---

### Task 8: Migrate Range — labels prop (3 keys)

**Files:**
- Modify: `packages/ui/src/components/Range.svelte`
  - Line 276: `aria-label="Lower bound"`
  - Line 299: `aria-label={rangeMode ? 'Upper bound' : 'Value'}`

**Pattern:**
```svelte
<script>
  import { messages } from '@rokkit/states'
  let { labels: userLabels = {}, ...rest } = $props()
  const labels = $derived({ ...messages.current.range, ...userLabels })
</script>
<input aria-label={labels.lower}>
<input aria-label={rangeMode ? labels.upper : labels.value}>
```

Range does NOT currently import from `@rokkit/states` — add new import.

**Step 1-5:** Same TDD cycle.

**Commit message:** `feat(ui): migrate Range to labels prop via MessagesStore`

---

### Task 9: Migrate SearchFilter — labels prop (2 keys from 2 store paths)

SearchFilter has strings from two different message groups: `search_.clear` and `filter.remove`.

**Files:**
- Modify: `packages/ui/src/components/SearchFilter.svelte`
  - Line 55: `aria-label="Clear search"`
  - Line 72: `aria-label="Remove filter"`

**Pattern:**
```svelte
<script>
  import { messages } from '@rokkit/states'
  let { labels: userLabels = {}, ...rest } = $props()
  const labels = $derived({
    clear: messages.current.search_.clear,
    remove: messages.current.filter.remove,
    ...userLabels
  })
</script>
<button aria-label={labels.clear}>
<button aria-label={labels.remove}>
```

SearchFilter does NOT currently import from `@rokkit/states` — add new import.

**Step 1-5:** Same TDD cycle.

**Commit message:** `feat(ui): migrate SearchFilter to labels prop via MessagesStore`

---

### Task 10: Migrate FloatingNavigation — labels prop (2 keys) + existing label prop

FloatingNavigation already has `label = 'Page navigation'` (line 16) used for the nav title. The pin/unpin strings are separate.

**Files:**
- Modify: `packages/ui/src/components/FloatingNavigation.svelte`
  - Line 16: `label = 'Page navigation'` → default from store
  - Line 171: `aria-label={pinned ? 'Unpin navigation' : 'Pin navigation'}`

**Pattern:**
```svelte
<script>
  import { messages } from '@rokkit/states'
  let { label = messages.current.floatingNav.label, labels: userLabels = {}, ...rest } = $props()
  const labels = $derived({ ...messages.current.floatingNav, ...userLabels })
</script>
<nav aria-label={label}>
<button aria-label={pinned ? labels.unpin : labels.pin}>
```

**Note:** FloatingNavigation's `floatingNav` store key needs a `label` key too. Add `label: 'Page navigation'` to the `floatingNav` entry in defaultMessages.

FloatingNavigation already imports from `@rokkit/states` — add `messages` to existing import.

**Step 1-5:** Same TDD cycle.

**Commit message:** `feat(ui): migrate FloatingNavigation to labels prop via MessagesStore`

---

### Task 11: Migrate ThemeSwitcherToggle — buildThemeSwitcherOptions reads store

**Files:**
- Modify: `packages/app/src/types/theme-switcher.ts` (lines 41-51: `buildThemeSwitcherOptions()`)
- Modify: `packages/app/src/components/ThemeSwitcherToggle.svelte` (line 24: calls `buildThemeSwitcherOptions`)

**Pattern for types file:**
```ts
import { messages } from '@rokkit/states'

export function buildThemeSwitcherOptions(
  icons: ThemeSwitcherIcons = defaultThemeSwitcherIcons,
  modes: string[] = ['system', 'light', 'dark'],
  labels: Partial<typeof messages.current.mode> = {}
): ThemeSwitcherOption[] {
  const mergedLabels = { ...messages.current.mode, ...labels }
  const all: ThemeSwitcherOption[] = [
    { value: 'system', text: mergedLabels.system, icon: icons.system },
    { value: 'light', text: mergedLabels.light, icon: icons.light },
    { value: 'dark', text: mergedLabels.dark, icon: icons.dark }
  ]
  return modes ? all.filter((o) => modes.includes(o.value)) : all
}
```

**Pattern for component:**
```svelte
<script>
  let { labels: userLabels = {}, ...rest } = $props()
  const options = $derived(buildThemeSwitcherOptions(icons, modes, userLabels))
</script>
```

**Step 1-5:** Same TDD cycle.

**Commit message:** `feat(app): migrate ThemeSwitcherToggle to labels via MessagesStore`

---

### Task 12: Run full test suite + verify no remaining hardcoded strings

**Step 1: Run full test suite**

```bash
cd solution && bun run test:ci
```

Expected: All tests pass (2500+).

**Step 2: Run lint**

```bash
cd solution && bun run lint
```

Expected: 0 errors.

**Step 3: Grep for remaining hardcoded aria-label strings**

Verify no hardcoded English aria-labels remain in the 15 migrated components:
```bash
grep -n 'aria-label="' packages/ui/src/components/{List,Tree,LazyTree,Toolbar,Toggle,Rating,Stepper,BreadCrumbs,Carousel,Tabs,Code,Range,SearchFilter,FloatingNavigation}.svelte
```

Expected: No matches (all should now use `aria-label={label}` or `aria-label={labels.xxx}`).

**Step 4: Update project files**

- `agents/plan.md` — mark backlog #64 complete
- `agents/journal.md` — log completion with commit hashes
- `docs/backlog/2026-03-01-ui-components.md` — mark #64 DONE

**Step 5: Commit**

```bash
git add agents/ docs/backlog/
git commit -m "docs: mark backlog #64 complete"
```
