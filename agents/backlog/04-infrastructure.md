# Backlog: Infrastructure & Technical Debt

Priority 4 — Code quality, dependency cleanup, migration.

---

## 23. Project-Wide Ramda Removal

**Affected packages:** core, states, actions, data, forms, chart, helpers

**What's needed:**
- [ ] Replace `isNil(v)` → `v == null`
- [ ] Replace `pick`/`omit` → native `Object.fromEntries` + `Object.entries` with filter
- [ ] Replace `pipe`, `map`, `filter` with native equivalents
- [ ] Remove ramda from all package.json files

**Priority:** Low — no functional impact, reduces bundle size.

---

## 24. @rokkit/helpers — Under-Exported Utilities

**Source:** docs/llms/ analysis

**What's needed:**
- [ ] Audit exports vs internal utilities
- [ ] Export useful utilities that are currently internal-only

---

## 25. @rokkit/chart — Dead bits-ui Dependency

**Source:** ADR-003

**What's needed:**
- [ ] Remove bits-ui from chart package.json
- [ ] Verify no imports reference bits-ui

---

## 58. Svelte 4 → 5 Migration — Remaining Files

**Source:** ESLint upgrade revealed 41 files still using Svelte 4 patterns. Currently excluded from lint via `ignores`.

### `packages/chart/` (20+ files)
- All pattern, symbol, texture, and element components
- See full list in original backlog

### `packages/forms/` (3 files — overlaps with #8)
- `src/FieldLayout.svelte`
- `src/ListEditor.svelte`
- `src/NestedEditor.svelte`

### `sites/learn/src/stories/` (8 files)
- Chart-related stories and nav-content stories

### `archive/ui/src/` (7 files — low priority, may be deleted)
- Legacy components from archive

**Migration pattern per file:**
- `export let` → `$props()` destructuring
- `$:` reactive → `$derived()` / `$derived.by()`
- `createEventDispatcher()` → callback props
- `$$restProps` → `{...restProps}` from `$props()`

**Blocked by:** `packages/chart` also has dead bits-ui dependency (#25) and ramda usage (#23) — consider combining into a single chart modernization effort.

**When done:** Remove corresponding entries from `eslint.config.mjs` ignores.
