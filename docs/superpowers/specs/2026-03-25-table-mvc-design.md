# Table MVC Architecture Design

## Overview

This document describes the Model-View-Controller architecture for the Table component, integrating `ReactiveDataSet` as the data model, `Table.svelte` as the pure rendering view, and `TableWrapper` (extending `Wrapper`) as the navigation and sort controller. The design also covers composite view columns, TreeTable support, and two construction flavors.

---

## 1. Architecture

### Three Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  MODEL: ReactiveDataSet  (packages/data/src/dataset.svelte.js)  │
│  - Source rows ($state)                                         │
│  - Derived view rows: filter → transform → sort pipeline        │
│  - Column definitions (derived)                                 │
│  - CRUD: push, remove, update, setData                          │
└─────────────────────────────────────────────────────────────────┘
           ↑ sort execution           ↑ rows / columns
┌─────────────────────────────────────────────────────────────────┐
│  CONTROLLER: TableWrapper  (packages/states/src/tabular.svelte) │
│  - Extends Wrapper (ProxyTree navigation)                       │
│  - sortState: [{field, direction}]  ($state)                    │
│  - treeState: node expansion map    ($state)                    │
│  - viewColumns: derived from model.columns + column overrides   │
│  - sortBy(field, extend): cycles none → asc → desc              │
│  - toggle(node): expand/collapse tree node                      │
│  - Owns or references ReactiveDataSet                           │
└─────────────────────────────────────────────────────────────────┘
           ↑ props (controller, columns)
┌─────────────────────────────────────────────────────────────────┐
│  VIEW: Table.svelte  (packages/ui/src/components/Table.svelte)  │
│  - use:navigator wired to controller                            │
│  - Renders controller.viewColumns as headers                    │
│  - Renders controller.rows as tbody rows                        │
│  - Click on sortable header → controller.sortBy(field, shift)   │
│  - Click on tree toggle → controller.toggle(node)              │
│  - Fires onsort, onselect events                               │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principle: Separation of Concerns

| Concern                              | Owner                                  |
| ------------------------------------ | -------------------------------------- |
| Data storage, CRUD, filtering        | `ReactiveDataSet`                      |
| Sort execution (comparator)          | `ReactiveDataSet.sortBy()`             |
| Sort state (which fields, direction) | `TableWrapper.sortState`               |
| Which columns are sortable           | `TableWrapper.viewColumns[n].sortable` |
| Tree node expand/collapse state      | `TableWrapper`                         |
| Keyboard navigation                  | `Wrapper` (base class)                 |
| Rendering                            | `Table.svelte`                         |

---

## 2. Construction Flavors

### Flavor A — Raw Data (Table manages dataset internally)

```svelte
<Table items={data} columns={columnOverrides} />
```

Internally `Table.svelte` creates a `TableWrapper` with a `ReactiveDataSet` from the raw array. The dataset is private. Sorting and filtering are fully managed by the component.

### Flavor B — External ReactiveDataSet (caller manages dataset)

```svelte
<script>
  const ds = reactiveDataset(data).where(activeFilter).sortBy('name')
</script>

<Table dataset={ds} columns={columnOverrides} />
```

`Table.svelte` wraps the caller-provided dataset in a `TableWrapper`. The dataset lifecycle (filtering, mutation) belongs to the caller. The table handles column display, sort UI, and navigation.

**Resolution rule inside `Table.svelte`:**

```js
const controller = $derived(
  props.dataset
    ? new TableWrapper(props.dataset, props.columns)
    : new TableWrapper(reactiveDataset(props.items ?? []), props.columns)
)
```

---

## 3. TableWrapper Class Design

`TableWrapper` extends `Wrapper` from `packages/states/src/wrapper.svelte.js`. It follows the same pattern as `LazyWrapper`.

```js
// packages/states/src/tabular.svelte.js

import { Wrapper } from './wrapper.svelte.js'
import { deriveHierarchy, toggleExpansion, hierarchicalFilter } from '@rokkit/data'

export class TableWrapper extends Wrapper {
  // ── Model ──────────────────────────────────────────────────────
  #dataset = null // ReactiveDataSet

  // ── Sort state ─────────────────────────────────────────────────
  sortState = $state([]) // [{field, direction}]

  // ── Column config (view-layer overrides) ───────────────────────
  #columnOverrides = $state([]) // TableColumn[] passed by consumer

  // ── Tree state ─────────────────────────────────────────────────
  #treeField = $derived(this.#columnOverrides.find((c) => c.tree)?.field ?? null)
  // Derived tree nodes (flat list with depth/isHidden/isExpanded)
  #treeNodes = $derived(
    this.#treeField ? deriveHierarchy(this.#dataset.rows, { path: this.#treeField }) : null
  )

  // ── Public derived ─────────────────────────────────────────────
  // Rows visible in the view (filtered by tree expansion, etc.)
  rows = $derived(this.#treeNodes ? this.#treeNodes.filter((n) => !n.isHidden) : this.#dataset.rows)

  // Merged column definitions: auto-derived + consumer overrides
  viewColumns = $derived(mergeColumns(this.#dataset.columns, this.#columnOverrides, this.sortState))

  constructor(dataset, columnOverrides = []) {
    // Wrapper needs a ProxyTree — we build a thin one from rows
    super(buildProxyTree(() => this.rows))
    this.#dataset = dataset
    this.#columnOverrides = columnOverrides
  }

  // ── Sort ───────────────────────────────────────────────────────
  sortBy(field, extend = false) {
    this.sortState = nextSortState(this.sortState, field, extend)
    this.#dataset.sortBy(...this.sortState.map((s) => [s.field, s.direction === 'ascending']))
  }

  // ── Tree ───────────────────────────────────────────────────────
  toggleNode(node) {
    toggleExpansion(node)
    // isHidden on nodes is mutated in-place by toggleExpansion;
    // rows $derived re-filters automatically
  }
}
```

### `nextSortState` — cycling logic

```js
// none → ascending → descending → (removed from sort)
function nextSortState(current, field, extend) {
  const existing = current.find((s) => s.field === field)
  let next

  if (!existing) {
    next = { field, direction: 'ascending' }
  } else if (existing.direction === 'ascending') {
    next = { field, direction: 'descending' }
  } else {
    next = null // remove
  }

  if (extend) {
    // Multi-column: keep other fields, update/remove this one
    const others = current.filter((s) => s.field !== field)
    return next ? [...others, next] : others
  } else {
    // Single-column: replace entire sort state
    return next ? [next] : []
  }
}
```

---

## 4. Sort Interaction Flow

```
User clicks column header "Revenue"
          │
          ▼
Table.svelte: handleSort(event, column)
  → controller.sortBy(column.field, event.shiftKey)
          │
          ▼
TableWrapper.sortBy('revenue', false)
  1. Compute nextSortState: [] + 'revenue' → [{field:'revenue', direction:'ascending'}]
  2. this.sortState = [{field:'revenue', direction:'ascending'}]
  3. this.#dataset.sortBy(['revenue', true])
          │
          ▼
ReactiveDataSet.sortBy(['revenue', true])
  → updates internal sort param
  → rows $derived re-executes: executeFused(source, ops)
          │
          ▼
TableWrapper.rows $derived re-runs (dataset.rows changed)
TableWrapper.viewColumns $derived re-runs (sortState changed → sort indicators updated)
          │
          ▼
Table.svelte re-renders with new row order + sort indicator on "Revenue"
          │
          ▼
Table.svelte fires: onsort?.({ sortState: controller.sortState })
```

**Second click (same column):** `ascending` → `descending`
**Third click:** removed from sort state (column unsorted)
**Shift+click:** adds field to multi-column sort (or cycles if already present)

---

## 5. Composite View Columns

A view column may display data from **multiple model fields** combined into one cell. This is purely a view-layer concern — the model stores raw fields separately.

### Column Definition

```ts
interface TableColumn {
  name: string // display name / label
  field?: string // single data field (simple case)
  fields?: string[] // multiple data fields for composite display
  formatter?: (values: Record<string, unknown>, row: unknown) => string
  sortField?: string // which field governs sort (defaults to field/fields[0])
  sortable?: boolean // default: true if field/sortField exists
  tree?: boolean // marks this as the tree-indent column
  width?: string
  align?: 'left' | 'center' | 'right'
}
```

### Examples

**Full name from two fields:**

```js
{
  name: 'Name',
  fields: ['firstName', 'lastName'],
  formatter: ({ firstName, lastName }) => `${firstName} ${lastName}`,
  sortField: 'lastName'
}
```

**Currency composite (convention: `{base}_currency` field):**

When `deriveColumnDefs` encounters a field named `salary_currency`, it auto-merges it into the `salary` column:

```js
// Auto-derived composite:
{
  name: 'salary',
  fields: ['salary', 'salary_currency'],
  formatter: ({ salary, salary_currency }) =>
    new Intl.NumberFormat('en', { style: 'currency', currency: salary_currency })
      .format(salary),
  sortField: 'salary',
  scale: 'continuous'
}
```

This convention (`{base}_currency` → merge into `{base}`) is implemented in `deriveColumnDefs` inside `packages/data/src/infer.js`.

### Cell Rendering in Table.svelte

```svelte
{#each viewColumns as col}
  <td>
    {#if col.fields}
      {col.formatter?.(pick(col.fields, row), row) ?? col.fields.map((f) => row[f]).join(' ')}
    {:else}
      {col.formatter?.(row[col.field], row) ?? row[col.field]}
    {/if}
  </td>
{/each}
```

---

## 6. TreeTable

TreeTable is **not a separate component** — it is a mode of `Table.svelte` activated when any column has `tree: true`.

### Data Flavors for Tree

**Flavor 1 — Path separator (flat data with hierarchical path field):**

```js
// Raw data
[
  { category: 'Electronics/Phones/Smartphones', revenue: 1000 },
  { category: 'Electronics/Phones', revenue: 500 },
  { category: 'Electronics', revenue: 300 },
]
// Column config
{ field: 'category', tree: true }
// TableWrapper passes to deriveHierarchy({ path: 'category', separator: '/' })
```

**Flavor 2 — Nested children (from `nestedJoin` / `flattenNestedChildren`):**

```js
// Pre-processed data with children arrays
const ds = dataset(parents).nestedJoin(children, matcher)
// flattenNestedChildren already flattens to [{row, children, depth, ...}]
// Pass directly to TableWrapper — no need for deriveHierarchy
```

### Tree Interaction Flow

```
User clicks expand toggle on row "Electronics"
          │
          ▼
Table.svelte: handleToggle(node)
  → controller.toggleNode(node)
          │
          ▼
TableWrapper.toggleNode(node)
  → toggleExpansion(node)     // from @rokkit/data/hierarchy.js
     - flips node.isExpanded
     - recurses: sets child.isHidden = parent.isHidden || !parent.isExpanded
          │
          ▼
TableWrapper.rows $derived re-runs
  → treeNodes.filter(n => !n.isHidden)   // collapsed children disappear
          │
          ▼
Table.svelte re-renders: "Electronics/Phones" and its children hidden
```

### Tree Column Rendering

The column with `tree: true` gets an indent and toggle button:

```svelte
{#if col.tree}
  <td style="padding-left: {node.depth * 1.5}rem">
    {#if node.isParent}
      <button onclick={() => controller.toggleNode(node)}
              aria-expanded={node.isExpanded}>
        <ChevronIcon rotated={node.isExpanded} />
      </button>
    {:else}
      <span class="leaf-indent" />
    {/if}
    {node.value}  <!-- the leaf label portion of the path -->
  </td>
```

### TreeTable with `dataFilter` (for filtering while preserving parents)

When filtering is applied to a tree, `hierarchicalFilter` from `@rokkit/data` is used — it preserves parent rows of matching children so the tree remains navigable:

```js
// In TableWrapper or ReactiveDataSet
applyFilter(fn) {
  if (this.#treeNodes) {
    hierarchicalFilter(this.#treeNodes, fn)
    // nodes get .excluded / .retainedByChild flags
    // rows re-derived filters to: !n.isHidden && (!n.excluded || n.retainedByChild)
  } else {
    this.#dataset.where(fn)
  }
}
```

---

## 7. Column Definition Pipeline

`deriveColumnDefs` in `packages/data/src/infer.js` handles auto-detection:

1. Scan all rows to collect unique field names and sample values
2. For each field, call `inferScale(values)` → `'continuous'` | `'discrete'`
3. Detect `{base}_currency` fields → merge as composite column with currency formatter
4. Apply `enhancements` (consumer overrides: label, formatter, sortable, etc.)
5. Return `TableColumn[]` with `name`, `scale`, `formatter`, `fields?`

`ReactiveDataSet.columns` is `$derived(() => deriveColumnDefs(this.#source, this.#columnEnhancements))`.

`TableWrapper.viewColumns` then merges the model's column defs with the consumer's `TableColumn[]` overrides (tree flag, width, custom formatters, etc.):

```js
function mergeColumns(modelCols, overrides, sortState) {
  return modelCols.map((col) => {
    const override = overrides.find((o) => o.field === col.name || o.name === col.name)
    const sort = sortState.find((s) => s.field === (override?.sortField ?? col.name))
    return {
      ...col,
      ...override,
      sortDirection: sort?.direction ?? null,
      sortIndex: sort ? sortState.indexOf(sort) + 1 : null
    }
  })
}
```

---

## 8. TypeScript Types

```ts
// packages/ui/src/types/table.ts

export type SortDirection = 'ascending' | 'descending'

export interface SortEntry {
  field: string
  direction: SortDirection
}

export type SortState = SortEntry[]

export interface TableColumn {
  name: string
  field?: string
  fields?: string[]
  formatter?: (valueOrValues: unknown, row: unknown) => string
  sortField?: string
  sortable?: boolean
  tree?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  // Derived by TableWrapper (not set by consumer):
  sortDirection?: SortDirection | null
  sortIndex?: number | null
  scale?: 'continuous' | 'discrete'
}

export interface TableProps {
  // Flavor A
  items?: unknown[]
  // Flavor B
  dataset?: ReactiveDataSet
  // Common
  columns?: TableColumn[]
  onsort?: (event: { sortState: SortState }) => void
  onselect?: (event: { row: unknown }) => void
}
```

---

## 9. Hierarchy Factory (Completing the Stub)

The commented-out `hierarchy()` factory in `packages/data/src/hierarchy.js` is the natural API for TreeTable consumers:

```js
export function hierarchy(data, options) {
  const nodes = deriveHierarchy(data, options)

  return {
    nodes,
    filter: (fn) => {
      hierarchicalFilter(nodes, fn)
      return api
    },
    visible: () => nodes.filter((n) => !n.isHidden),
    toggle: (node) => {
      toggleExpansion(node)
      return api
    }
  }

  var api = { nodes, filter, visible, toggle }
  return api
}
```

`TableWrapper` can use this factory internally when `treeField` is set, replacing raw `deriveHierarchy` calls.

---

## 10. File Change Summary

| File                                      | Change                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `packages/data/src/hierarchy.js`          | Complete `hierarchy()` factory                                          |
| `packages/data/src/infer.js`              | Add `_currency` composite column convention in `deriveColumnDefs`       |
| `packages/data/src/dataset.svelte.js`     | `sortBy()` accepts `[field, ascending]` tuple args                      |
| `packages/states/src/tabular.svelte.js`   | Full `TableWrapper extends Wrapper` implementation                      |
| `packages/ui/src/types/table.ts`          | New types: `SortEntry`, `SortState`, `TableColumn` updates              |
| `packages/ui/src/components/Table.svelte` | Wire to `TableWrapper`; tree column rendering; composite cell rendering |

---

## 11. Open Questions for Review

1. **Tree + external dataset**: When the caller provides a `ReactiveDataSet`, should `TableWrapper` wrap its rows in `deriveHierarchy` on top, or should the caller pre-process the hierarchy themselves?
   - Proposed: TableWrapper wraps automatically when `tree: true` column is present.

2. **Multi-column sort UI**: Should the sort index badge (1, 2, 3…) appear on headers? The `sortIndex` field in `viewColumns` supports this.
   - Proposed: yes, shown when `sortState.length > 1`.

3. **Tree + sort interaction**: When a tree table is sorted, should we sort within sibling groups (preserving hierarchy) or flatten all and sort globally?
   - Proposed: sort within sibling groups (sort children arrays, not the flat view).

4. **`_currency` convention**: Should this auto-detection be opt-in (via `detectCurrencyColumns: true` option) or always on?
   - Proposed: always on, since the `_currency` suffix is unambiguous.
