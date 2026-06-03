# Tree-Table Support + Table Component Simplification

**Date:** 2026-05-22
**Status:** Closed 2026-06-03 — both parts shipped.
- Part A landed in `4a6022a4 feat(states): add ProxyTable as tabular data layer` + `cfaf066a refactor(ui): migrate Table to ProxyTable + Wrapper + Navigator class` (Table.svelte script 144 → 93 lines, all 33 existing specs pass unchanged).
- Part B landed in `0631cf65 feat(ui): add TreeTable + nestByPath/nestByColumns helpers` with the per-sibling-sort `ProxyTableTree`, the `nestByPath` / `nestByColumns` data helpers, and the `<TreeTable>` component. Demo at `apps/learn/src/lib/koan/demos/tree-table/`.
- Follow-up tweak `9cd20d4d refactor(ui): TreeTable hierarchy column shows label at every level` cleaned up the first-column convention for `nestByColumns` and switched chevrons to the `node-opened`/`node-closed` semantic icons.
**Site Applicability:** Library work (`@rokkit/ui` Table, `@rokkit/data` helpers) — site-agnostic, applies to current Koan/learn app.
**Related:** `2026-05-20-actions-controllers-simplification-investigation.md`, ADR-003

## Summary

Current `Table.svelte` + `TableController` are flat-only. A historical `TreeTable.svelte` (deleted in `4ef37ef4`) handled hierarchy via a single path-string column, but was removed in the ADR-003 cleanup and never ported. This work restores tree-table functionality on the new ProxyTree/Wrapper foundation **and** simplifies `Table.svelte` to match the shape of `List.svelte` / `Tree.svelte`.

Two intertwined goals — keeping them in one item because the simplification is a prerequisite for adding the hierarchy variant cleanly.

---

## Part A — Simplify `Table.svelte` (prereq)

### Current shape (Table.svelte, 144 lines of script)

- `controller = untrack(() => new TableController(...))` — not reactive to `value`/`fields`/`multiselect` changes.
- Three `$effect` syncs (`data`, `columns`, `values`) that hand-mirror props into the controller.
- Custom DOM plumbing: `tableRef`, `addEventListener('action', onAction)`, `handleFocusIn`, `focusByKey` with manual `scrollIntoView`.
- Uses `use:navigator={{ wrapper: controller, ... }}` (the action) — and then *also* re-implements focus/scroll on top of it.

### Target shape (mirrors `List.svelte` / `Tree.svelte`)

```ts
const proxyTable = $derived(new ProxyTable(data, { columns, fields }))
const wrapper    = $derived(new TableWrapper(proxyTable, { onselect, onsort, multiselect }))

let tableRef = $state<HTMLElement | null>(null)
$effect(() => {
  if (!tableRef) return
  const dir = getComputedStyle(tableRef).direction || 'ltr'
  const nav = new Navigator(tableRef, wrapper, { orientation: 'vertical', dir })
  return () => nav.destroy()
})

$effect(() => wrapper.moveToValue(value))
```

Everything else — the action listener, the manual `focusByKey`, the focus-in handler, `untrack`, the three sync effects — goes away. The `Navigator` class (not the action) already handles focus + scroll for List/Tree; we just need it to handle the table case.

### What this requires in the state layer

- `TableController` becomes a *Wrapper* (rename to `TableWrapper` or keep the name but conform to the `IWrapper` interface that `Navigator` consumes: `focusedKey`, `next/prev/first/last`, `select`, `moveTo`, `moveToValue`, `expand/collapse`, `toggle`, `findByText`).
- Data layer becomes a thin `ProxyTable` (flat rows as `ProxyItem[]`) — analog of `ProxyTree` for tabular data. Rows have keys, columns are metadata on the proxy table, not on the proxies.
- Sort logic moves onto `ProxyTable` (it owns the row order) — `Wrapper`-side stays unaware.

### Acceptance for Part A

- `Table.svelte` script under ~60 lines.
- No manual `addEventListener('action', ...)`, no `focusByKey`, no `scrollIntoView` call in the component.
- `controller` becomes `$derived` (not `untrack`), so changing `fields` / `multiselect` props rebuilds it (matches List/Tree).
- All existing Table unit + e2e tests pass unchanged.

---

## Part B — Tree-Table (hierarchy support)

### One canonical input + two normalization helpers

`<TreeTable>` accepts **only nested rows** (`children: []`). Path-string and column-array shapes are converted *before* the data hits the component, via standalone helpers in `@rokkit/data`. Keeps the component focused on render + navigation; helpers are testable in isolation.

| Mode | Data shape | How it reaches the component |
|---|---|---|
| **Nested rows** *(canonical)* | rows with `children: []` | passed directly |
| **Path string** | flat rows + one column with a separator-delimited path | `nestByPath(rows, { column: 'path', separator: '/' })` |
| **Column array** | flat rows; group-by columns define levels | `nestByColumns(rows, ['region', 'country', 'city'])` |

After conversion, all three are the same internal representation: **a `ProxyTree` of rows**. The tree-table controller never sees the original flat form.

#### Helper specs (live in `@rokkit/data`)

```ts
// Path-string → nested. Synthesizes intermediate parent rows if missing.
nestByPath(rows, {
  column: string,            // field carrying the path
  separator?: string,        // default '/'
  keepPath?: boolean,        // keep the path field on the row (default true)
}): NestedRow[]

// Column-array → nested. Synthesizes group rows from the column values.
// Group rows expose { __group: true, [col]: value, children: [...] }
// so the renderer / formatter can spot synthetic rows.
nestByColumns(rows, columns: string[], {
  groupRowFactory?: (col, value, children) => Record<string, unknown>,
}): NestedRow[]
```

Both are pure functions, no Svelte deps — sit next to `deriveColumns` in `@rokkit/data`.

### Hierarchy column rendering

- One designated cell in each row owns the chevron + indent + tree connector lines (reuse `Connector.svelte` from `Tree.svelte`).
- Default hierarchy column = first column unless declared otherwise (`column.hierarchy = true` or `hierarchy.cell = 'name'`).
- Group rows in **column-array** mode are virtual — values for non-hierarchy columns aggregate or blank. Out of scope for v1 (decide: blank, leave to formatter, or expose `groupRow` snippet).

### Controller decision — extend `TableController` or new `TreeTableController`?

**Recommendation: split.** Mirrors how `List` uses `Wrapper` and `Tree` uses `LazyWrapper` — same data layer (ProxyTree), different navigation semantics.

```
ProxyTable          — flat tabular data + columns + sort       (new, Part A)
ProxyTableTree      — hierarchical tabular data + columns      (new, Part B; extends/wraps ProxyTree)

TableWrapper        — flat row navigation, no expand/collapse  (Part A, was TableController)
TreeTableWrapper    — hierarchical, expand/collapse, tree keys (Part B; analog of LazyWrapper)
```

Shared `column + sort` logic factored into a small `TableColumns` helper consumed by both ProxyTable variants. Sort semantics differ: flat sorts globally; tree sorts *within each parent's siblings* so parent/child relationships survive.

### Why not one class with a `hierarchy` flag?

Tried mentally and rejected:
- `data` getter returns two different shapes (flat array vs flatView with levels/lineTypes).
- Sort algorithms diverge.
- Focus/move semantics diverge (`expand`/`collapse` only meaningful for tree).
- Tests for one mode would touch branches relevant only to the other.

A `<TreeTable>` component thin-wraps `<Table hierarchy={...}>` is fine as sugar, but the controller split is real.

### Acceptance for Part B

- `TreeTable.svelte` component accepts nested-row data only.
- `nestByPath()` and `nestByColumns()` helpers in `@rokkit/data` with unit tests.
- Demo / docs show all three flows: nested-direct, `nestByPath(...)`, `nestByColumns(...)`.
- Keyboard: Right expands / moves to first child; Left collapses / moves to parent; Up/Down navigate visible rows only (skip collapsed subtrees) — same contract as `Tree`.
- Sort preserves hierarchy (siblings sort within parent).
- Selection: single + multi (already in `LazyWrapper` for Tree).
- `data-tree-level` + connector lines render in the hierarchy column only.
- Synthetic group rows from `nestByColumns` render with the row-level `__group` flag exposed to the `cell` snippet so consumers can style/aggregate them.

---

## Open questions

1. **Group-row aggregation** in column-array mode — `nestByColumns` synthesizes group rows; do they aggregate child values (sum/count) by default, or stay blank until a formatter fills them? (Lean: blank + `__group` flag exposed; aggregation is a follow-up helper.)
2. **Lazy loading** — Tree has `LazyWrapper`. Do tree-tables need it for v1, or is eager-load enough? (Lean: eager v1; lazy is a follow-up.)
3. **Bidirectional sort + hierarchy interaction** — when user sorts by a non-hierarchy column, do we still keep parent/child order intact, or does sort flatten? (Lean: keep hierarchy; sort siblings only.)
4. **Column-array mode aggregations** — do we need built-in sum/count for the synthetic group rows, or is that always user-formatter territory? (Lean: user-formatter for v1.)

## Out of scope

- Column grouping / multi-row headers (separate concern from row hierarchy).
- Editable cells.
- Virtual scrolling for large trees.
- Server-driven lazy loading of subtrees.

## Sequencing

1. Part A — `Table.svelte` simplification + `ProxyTable` / `TableWrapper` split. Tests pass on flat data with no API change.
2. Part B — `TreeTableWrapper` + `<TreeTable>` component + Connector-based hierarchy cell. New tests for the three input shapes.

Part A unlocks Part B but ships valuable on its own (smaller Table component, consistent with List/Tree).
