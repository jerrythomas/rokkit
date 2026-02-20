# Table Component Design

> A unified Table component for flat and hierarchical tabular data.

## Overview

A single `Table` component in `@rokkit/ui` that renders both flat tables and tree tables. It follows the established Rokkit patterns:

- **Data-driven**: accepts a data array, auto-derives columns
- **Field-mapped**: uses `ItemProxy` for per-row/per-cell data access
- **Action-driven**: delegates keyboard/mouse interactions to `use:` actions from `@rokkit/actions`
- **State-managed**: a `TableController` class in `@rokkit/states` manages focus, selection, sort, and expansion
- **Snippet-customizable**: every visual element can be overridden with snippets

Data preparation (hierarchy derivation, sorting, filtering, pagination) lives in `@rokkit/data`. The Table component is purely presentational.

## Data Flow

```
Raw Data (JSON/CSV array of objects)
  │
  ├── columns provided?
  │     NO  → deriveColumns(data) auto-infers column metadata
  │     YES → use provided columns, fill defaults
  │
  ├── hierarchyField provided?
  │     YES → deriveHierarchy(data, { path, separator })
  │
  ├── hierarchyFields provided?
  │     YES → groupToHierarchy(data, groupFields)     [NEW]
  │
  ▼
TableController ($state)
  ├── rows: flat or hierarchy nodes
  ├── columns: metadata with sort state
  ├── focusedKey, selectedKeys
  ├── expanded state
  ├── page / pageSize
  └── visibleRows: $derived slice
  │
  ▼
Table.svelte (renders controller state)
  ├── use:navigator={{ wrapper: controller }}     ← keyboard/click
  ├── TableHeader ← sort interactions
  ├── TableBody → TableRow → TableCell
  └── TableFooter ← pagination
```

## Usage Examples

### Flat Table (auto-derived columns)

```svelte
<script>
  import { Table } from '@rokkit/ui'

  const data = [
    { name: 'Alice', age: 28, city: 'Boston' },
    { name: 'Bob', age: 35, city: 'Seattle' }
  ]
</script>

<Table {data} caption="Employees" />
```

### Field mapping — hide and combine columns

```svelte
<script>
  import { Table } from '@rokkit/ui'

  const data = [
    { name: 'Alice', gender: 'F', salary: 85000, department: 'Engineering' },
    { name: 'Bob', gender: 'M', salary: 92000, department: 'Design' }
  ]

  const columns = [
    {
      name: 'name',
      label: 'Employee',
      fields: { icon: 'gender' },
      iconFormatter: (v) => v === 'F' ? 'i-mdi-gender-female' : 'i-mdi-gender-male'
    },
    { name: 'salary', label: 'Annual Salary', formatter: (v) => `$${v.toLocaleString()}` }
    // department omitted → hidden
    // gender consumed by name column → not shown separately
  ]
</script>

<Table {data} {columns} caption="Team" />
```

The `name` column's `fields: { icon: 'gender' }` tells `ItemProxy` to pull the icon value from the `gender` data field. The `iconFormatter` converts `'F'`/`'M'` to an icon class. Since `gender` and `department` are not listed in `columns`, they are hidden.

### Tree Table — path-based hierarchy

```svelte
<script>
  import { Table } from '@rokkit/ui'

  const data = [
    { name: 'Smith Family', lineage: '/Smith', role: 'Patriarch' },
    { name: 'Alice Smith', lineage: '/Smith/Alice', role: 'Daughter' },
    { name: 'Lexi Smith', lineage: '/Smith/Alice/Lexi', role: 'Granddaughter' },
    { name: 'Bob Smith', lineage: '/Smith/Bob', role: 'Son' }
  ]
</script>

<Table {data} hierarchyField="lineage" caption="Family Tree" />
```

### Tree Table — multi-column grouping

```svelte
<script>
  import { Table } from '@rokkit/ui'

  const data = [
    { country: 'USA', state: 'California', city: 'LA', population: 3900000 },
    { country: 'USA', state: 'California', city: 'SF', population: 870000 },
    { country: 'USA', state: 'New York', city: 'NYC', population: 8300000 },
    { country: 'India', state: 'Karnataka', city: 'Bangalore', population: 12000000 }
  ]
</script>

<Table
  {data}
  hierarchyFields={['country', 'state', 'city']}
  caption="World Cities"
/>
```

### With external filtering (composition pattern)

```svelte
<script>
  import { Table } from '@rokkit/ui'

  let searchTerm = $state('')
  let allData = $state([...])

  // Filter at data layer — Table stays presentational
  let filtered = $derived(
    searchTerm
      ? allData.filter(row =>
          Object.values(row).some(v =>
            String(v).toLowerCase().includes(searchTerm.toLowerCase())
          ))
      : allData
  )
</script>

<input type="search" bind:value={searchTerm} placeholder="Search..." />
<Table data={filtered} caption="Results" />
```

### Lazy loading

```svelte
<Table
  {data}
  {columns}
  onloadmore={async ({ page, pageSize }) => {
    const result = await api.fetchProducts({ page, pageSize })
    data = [...data, ...result.items]
    return { hasMore: result.hasMore }
  }}
  caption="Product Catalog"
/>
```

---

## Component Architecture

### File Structure

```
packages/ui/src/
  components/
    table/
      Table.svelte            # Main orchestrator (public API)
      TableHeader.svelte      # <thead> with sortable column headers
      TableBody.svelte        # <tbody> row iteration
      TableRow.svelte         # Single <tr> with cells
      TableCell.svelte        # <td> with field mapping + hierarchy indent
      TableFooter.svelte      # <tfoot> with pagination
  types/
    table.ts                  # All table types + helpers

packages/states/src/
  table-controller.svelte.js  # TableController state class

packages/actions/src/
  (existing navigator.svelte.js — reused, potentially extended)

packages/data/src/
  hierarchy.js                # (existing + groupToHierarchy)
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **Table** | Creates `TableController`, passes to sub-components, applies `use:navigator` on the root element, wires events to callbacks |
| **TableHeader** | Renders `<thead>`, each `<th>` handles sort click (with Shift/Ctrl for multi-sort), renders sort indicator icons |
| **TableBody** | Renders `<tbody>`, iterates `controller.visibleRows`, renders `TableRow` for each |
| **TableRow** | Renders `<tr>` with data attributes for depth/selected/expanded state, iterates columns to render `TableCell` |
| **TableCell** | Renders `<td>`, creates `ItemProxy` per cell with column-level field overrides, handles hierarchy indent + expand icon for the hierarchy column, applies formatters |
| **TableFooter** | Renders `<tfoot>` with `TablePagination` or custom footer snippet |

---

## State Management — TableController

### Class Design

```
TableController (in @rokkit/states)
│
├── extends ListController
│   ├── items, fields, focusedKey, selectedKeys
│   ├── moveFirst(), moveLast(), moveNext(), movePrev()
│   ├── select(key), extendSelection(key)
│   └── data (flat visible nodes), lookup (Map<key, Proxy>)
│
├── Table-specific state ($state runes)
│   ├── columns         — column metadata with sort state
│   ├── hierarchyNodes  — processed tree nodes (or flat rows)
│   ├── sortState       — current sort columns + direction
│   ├── page            — current page number
│   ├── pageSize        — rows per page
│   └── expandedState   — Record<string, boolean>
│
├── Table-specific derived ($derived)
│   ├── sortedRows      — rows sorted by sortState
│   ├── pageCount       — ceil(totalRows / pageSize)
│   └── visibleRows     — page slice of sortedRows
│
├── Sort methods
│   ├── sortBy(column, ascending, extend)
│   └── clearSort()
│
├── Expansion methods (from NestedController)
│   ├── expand(key), collapse(key), toggleExpansion(key)
│   └── ensureVisible(value)
│
└── Pagination methods
    ├── goToPage(page)
    ├── nextPage(), prevPage()
    └── setPageSize(size)
```

### How it connects to `use:navigator`

The `navigator` action from `@rokkit/actions` expects a `wrapper` object with:
- `moveFirst`, `moveLast`, `moveNext`, `movePrev`
- `select`, `extendSelection`
- `expand`, `collapse`, `toggleExpansion`
- `focusedKey` (for scroll-into-view)

`TableController` already implements all of these by extending `ListController`/`NestedController`. The `navigator` action handles keyboard events and calls the appropriate controller method. The controller mutates `$state`, Svelte re-renders.

### Wiring in Table.svelte

```svelte
<script>
  import { navigator } from '@rokkit/actions'
  import { TableController } from '@rokkit/states'

  let { data, columns, hierarchyField, ... } = $props()

  let controller = $derived(new TableController(data, {
    columns,
    hierarchyField,
    separator,
    expandAll,
    pageSize
  }))
</script>

<div
  data-table
  use:navigator={{
    wrapper: controller,
    orientation: 'vertical',
    nested: !!hierarchyField || !!hierarchyFields
  }}
  onaction={handleAction}
>
  <table role={hierarchyField ? 'treegrid' : 'grid'} aria-label={caption}>
    <TableHeader columns={controller.columns} onsort={handleSort} {icons} />
    <TableBody rows={controller.visibleRows} columns={controller.columns} {controller} />
    {#if pageSize}
      <TableFooter {controller} onpagechange />
    {/if}
  </table>
</div>
```

The `onaction` custom event from `navigator` carries `{ name, data }` where `name` is `'move'`, `'select'`, or `'toggle'`. The Table maps these to its callback props (`onselect`, `onexpandedchange`).

---

## Column Field Mapping with ItemProxy

### Per-Column Field Overrides

Each column can define a `fields` object that remaps which data keys feed into the cell's display slots. This uses the same `ItemProxy` pattern as List/Tree but applied per-column.

```typescript
interface TableColumn {
  name: string                        // data key for this column
  label?: string                      // display header text
  type?: string                       // data type (auto-derived)
  sortable?: boolean                  // default: true
  sorted?: 'none' | 'ascending' | 'descending'
  width?: string                      // CSS width
  align?: 'left' | 'center' | 'right'

  // Hierarchy
  path?: boolean                      // this column contains hierarchy path
  separator?: string                  // path separator

  // Field mapping — maps ItemProxy slots to data keys
  fields?: {
    text?: string                     // which data key provides display text
    icon?: string                     // which data key provides icon
    badge?: string                    // which data key provides badge
    description?: string              // which data key provides secondary text
  }

  // Formatters
  formatter?: (value: unknown, row: Record<string, unknown>) => string
  iconFormatter?: (value: unknown) => string

  // Custom rendering
  snippet?: string                    // named snippet for this column's cells
}
```

### How TableCell Uses ItemProxy

```svelte
<!-- TableCell.svelte -->
<script>
  import { ItemProxy } from '../types/item-proxy.js'

  let { row, column, isHierarchyColumn, node } = $props()

  // Build per-cell fields: column's primary key as text, plus any overrides
  let cellFields = $derived({
    text: column.name,
    ...column.fields
  })

  let proxy = $derived(new ItemProxy(row, cellFields))
</script>

<td data-table-cell data-column={column.name}>
  <div data-cell-content>
    {#if isHierarchyColumn}
      <!-- Indent spans for tree depth -->
      {#each Array(node.depth) as _, i}
        <span data-indent></span>
      {/each}
      <!-- Expand/collapse icon for parents -->
      {#if node.isParent}
        <button data-tree-toggle onclick={toggleExpansion} tabindex={-1}>
          <span class={node.isExpanded ? icons.opened : icons.closed}></span>
        </button>
      {:else if node.depth > 0}
        <span data-indent></span>
      {/if}
    {/if}

    <!-- Icon (from mapped field, formatted) -->
    {#if proxy.icon}
      {@const iconClass = column.iconFormatter ? column.iconFormatter(proxy.get('icon')) : proxy.icon}
      <span data-cell-icon class={iconClass} aria-hidden="true"></span>
    {/if}

    <!-- Text value (formatted) -->
    {#if column.formatter}
      <span data-cell-value>{column.formatter(proxy.get('text'), row)}</span>
    {:else}
      <span data-cell-value>{proxy.text}</span>
    {/if}
  </div>
</td>
```

### Column Merge Example Walkthrough

Data: `{ name: 'Alice', gender: 'F', salary: 85000 }`

Column config:
```javascript
{
  name: 'name',
  label: 'Employee',
  fields: { icon: 'gender' },
  iconFormatter: (v) => v === 'F' ? 'i-mdi-gender-female' : 'i-mdi-gender-male'
}
```

Processing:
1. `cellFields = { text: 'name', icon: 'gender' }`
2. `proxy = new ItemProxy(row, cellFields)`
3. `proxy.text` → `row['name']` → `'Alice'`
4. `proxy.icon` → `row['gender']` → `'F'`
5. `iconFormatter('F')` → `'i-mdi-gender-female'`
6. Cell renders: `[female-icon] Alice`

---

## Hierarchy Design

### Internal Representation

Both path-based and multi-column grouping produce the same `TreeTableNode` shape:

```typescript
interface TreeTableNode {
  row: Record<string, unknown>       // original data row (or synthetic for groups)
  depth: number                       // 0 = root
  value: string                       // display value for the hierarchy column
  path: string                        // unique path key
  isParent: boolean
  isExpanded: boolean
  isHidden: boolean                   // controlled by parent's expansion
  children: TreeTableNode[]
  parent: TreeTableNode | null
}
```

### Path-Based (`hierarchyField`)

Uses existing `deriveHierarchy(data, { path, separator })` from `@rokkit/data`.

### Multi-Column Grouping (`hierarchyFields`)

New utility in `@rokkit/data`:

```javascript
/**
 * Groups flat data by multiple columns into a tree hierarchy.
 *
 * @param {Array<Object>} data - Flat data array
 * @param {string[]} groupFields - Column names defining the hierarchy levels
 * @param {Object} [options] - { expanded: boolean }
 * @returns {Array<TreeTableNode>}
 */
export function groupToHierarchy(data, groupFields, options = {}) {
  const { expanded = false } = options

  if (groupFields.length === 0) {
    return data.map((row, i) => ({ depth: 0, row, path: String(i), ...leafDefaults }))
  }

  const [field, ...remaining] = groupFields
  const groups = Map.groupBy(data, (row) => row[field])

  return Array.from(groups.entries()).map(([key, rows]) => {
    const path = `/${key}`
    const children = remaining.length > 0
      ? groupToHierarchy(rows, remaining, options)  // recurse with remaining fields
      : rows.map((row, i) => ({                     // leaf level
          depth: groupFields.length,
          row, value: String(row[remaining[0]] ?? i),
          path: `${path}/${i}`, ...leafDefaults
        }))

    return {
      depth: 0,  // relative — adjusted by recursion caller
      value: String(key),
      path,
      row: { [field]: key },  // synthetic parent row
      isParent: true,
      isExpanded: expanded,
      isHidden: false,
      children,
      parent: null
    }
  })
}
```

---

## Sorting

### Sort Flow

```
User clicks column header
  → TableHeader calls onsort(column, order, extend)
  → Table passes to TableController.sortBy(column, ascending, extend)
  → Controller updates sortState ($state)
  → sortedRows ($derived) recomputes
  → visibleRows ($derived) re-slices for pagination
  → Svelte re-renders
```

### Multi-Column Sort

- Click: replace sort with single column
- Shift+click: add column to sort stack
- Sort indicator icons: `sort-none`, `sort-ascending`, `sort-descending` (state icons pattern)

### Hierarchy Sort

For tree data, sorting happens within each sibling group using `groupSort()` from `@rokkit/data`. The tree structure is preserved — only the order within each parent changes.

---

## Pagination

### Client-Side

```
TableController:
  page = $state(0)
  pageSize = $state(50)
  totalRows = $derived(sortedRows.length)
  pageCount = $derived(Math.ceil(totalRows / pageSize))
  visibleRows = $derived(sortedRows.slice(page * pageSize, (page + 1) * pageSize))
```

For hierarchy data, pagination applies to **top-level nodes** — children always travel with their parent.

### Lazy Loading

```
onloadmore callback
  → Table shows loading snippet at bottom
  → Awaits Promise<{ hasMore }>
  → Appends results to data
  → Updates controller
```

---

## Keyboard & Mouse Interactions

### `use:navigator` Integration

The Table root element uses the existing `navigator` action:

```svelte
<div
  data-table
  use:navigator={{
    wrapper: controller,
    orientation: 'vertical',
    nested: hasHierarchy
  }}
>
```

The `navigator` action:
1. Listens for `keyup` and `click` on the element
2. Maps keys to actions via `getKeyboardAction()` from `@rokkit/actions/kbd`
3. Calls the matching controller method (`moveNext`, `select`, `toggleExpansion`, etc.)
4. Emits a custom `action` event on the DOM node with `{ name, data }`
5. Scrolls the focused element into view

### Action → Event Mapping

| Action from navigator | Controller method | Custom event emitted | Table callback |
|----------------------|-------------------|---------------------|----------------|
| `next` | `moveNext()` | `action: { name: 'move' }` | — |
| `previous` | `movePrev()` | `action: { name: 'move' }` | — |
| `first` | `moveFirst()` | `action: { name: 'move' }` | — |
| `last` | `moveLast()` | `action: { name: 'move' }` | — |
| `select` | `select(key)` | `action: { name: 'select' }` | `onselect` |
| `extend` | `extendSelection(key)` | `action: { name: 'select' }` | `onselect` |
| `expand` | `expand(key)` | `action: { name: 'toggle' }` | `onexpandedchange` |
| `collapse` | `collapse(key)` | `action: { name: 'toggle' }` | `onexpandedchange` |
| `toggle` | `toggleExpansion(key)` | `action: { name: 'toggle' }` | `onexpandedchange` |

### Additional Key Bindings (Table-specific)

These are handled directly by the Table component (not by `navigator`):

| Key | Action |
|-----|--------|
| `PageDown` | `controller.nextPage()` |
| `PageUp` | `controller.prevPage()` |

### Sort Interaction (on TableHeader)

Sort clicks go through the header, not the navigator:

```svelte
<!-- TableHeader.svelte -->
<th
  data-table-header-cell
  data-sortable={column.sortable}
  data-sort-order={column.sorted}
  onclick={(e) => handleSort(e, column)}
>
```

`handleSort` checks modifier keys for multi-sort and calls the `onsort` callback.

---

## ARIA

```html
<div data-table>
  <table role="treegrid" aria-label={caption}>     <!-- or role="grid" for flat -->
    <caption>{caption}</caption>
    <thead data-table-header>
      <tr>
        <th scope="col" aria-sort="ascending" data-sortable>Name</th>
        <th scope="col" aria-sort="none">Age</th>
      </tr>
    </thead>
    <tbody data-table-body>
      <tr
        data-table-row
        role="row"
        data-path="0"
        data-depth="0"
        data-parent
        data-expanded
        aria-level="1"
        aria-expanded="true"
        aria-selected="false"
        aria-rowindex="1"
      >
        <td data-table-cell role="gridcell">...</td>
      </tr>
    </tbody>
    <tfoot data-table-footer>
      <tr><td colspan="...">Page 1 of 5</td></tr>
    </tfoot>
  </table>
</div>
```

---

## Snippet Customization

| Snippet | Signature | Purpose |
|---------|-----------|---------|
| `header` | `(columns: TableColumn[], sortState: SortState[])` | Custom header rendering |
| `row` | `(row: Record, columns: TableColumn[], state: RowState)` | Custom row rendering |
| `cell` | `(proxy: ItemProxy, column: TableColumn, row: Record)` | Custom cell rendering |
| `footer` | `(page: number, pageCount: number, controller: TableController)` | Custom footer |
| `empty` | `()` | Empty state |
| `loading` | `()` | Loading spinner |
| Named snippets | `(proxy: ItemProxy, column: TableColumn, row: Record)` | Per-column cell via `column.snippet` |

Follows the same `svelte:boundary` fallback pattern used by Tree and List.

---

## Data Attributes (Styling Hooks)

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-table` | root `<div>` | Container |
| `data-table-header` | `<thead>` | Header section |
| `data-table-body` | `<tbody>` | Body section |
| `data-table-footer` | `<tfoot>` | Footer section |
| `data-table-row` | `<tr>` | Row |
| `data-table-cell` | `<td>` | Cell |
| `data-table-header-cell` | `<th>` | Header cell |
| `data-column={name}` | `<th>`, `<td>` | Column identifier |
| `data-sortable` | `<th>` | Sortable column |
| `data-sort-order={asc\|desc\|none}` | `<th>` | Sort direction |
| `data-depth={n}` | `<tr>` | Hierarchy depth |
| `data-path={key}` | `<tr>` | Row key (for navigator scroll-to) |
| `data-selected` | `<tr>` | Selected state |
| `data-focused` | `<tr>` | Focused state |
| `data-expanded` | `<tr>` | Expanded parent |
| `data-parent` | `<tr>` | Has children |
| `data-striped` | `<table>` | Alternating rows |
| `data-size={sm\|md\|lg}` | root `<div>` | Size variant |

---

## SearchFilter Component

A standalone component in `@rokkit/ui` that parses user input into structured filter objects using `parseFilters()` from `@rokkit/data`. It connects to Table (or any data-driven component) via composition — not built into Table.

### Query Language

The existing `parseFilters()` in `@rokkit/data/parser.js` supports:

```
alice                       → { operator: '~*', value: /alice/i }            free text across all columns
name:alice                  → { column: 'name', operator: '~*', value: /alice/i }
age>30                      → { column: 'age', operator: '>', value: 30 }
city:"New York"             → { column: 'city', operator: '~*', value: /New York/i }
age>=30 city:"New York"     → two filters, AND'd together
name~^A                     → { column: 'name', operator: '~', value: /^A/ }  case-sensitive regex
status!=active              → { column: 'status', operator: '!=', value: 'active' }
```

Applied via `filterData(data, filters)` from `@rokkit/data/filter.js`, which chains `filterObjectArray()` for each filter using operators from `filterOperations` in `constants.js`.

### Data Flow

```
User types: "alice age>30"
  │
  ▼
SearchFilter.svelte
  ├── debounce (300ms default)
  ├── parseFilters("alice age>30")
  │     → [
  │         { column: 'age', operator: '>', value: 30 },
  │         { operator: '~*', value: /alice/i }
  │       ]
  ├── bind:filters (bindable prop)
  └── onfilter callback
  │
  ▼
Consumer page ($derived)
  ├── filterData(data, filters)       ← flat data
  │   OR
  ├── hierarchicalFilter(nodes, fn)   ← tree data (parents stay visible)
  │
  ▼
<Table data={filtered} />
```

### Component Design

```
packages/ui/src/
  components/
    SearchFilter.svelte
  types/
    search-filter.ts
```

#### Props

```typescript
interface SearchFilterProps {
  filters?: FilterObject[]          // bindable — parsed filter array
  debounce?: number                 // delay in ms (default: 300)
  placeholder?: string
  columns?: string[]                // column hints for autocomplete
  onfilter?: (filters: FilterObject[]) => void
  class?: string
  size?: 'sm' | 'md' | 'lg'
  tag?: Snippet<[FilterObject, () => void]>   // custom filter tag rendering
}

interface FilterObject {
  column?: string                   // undefined = all columns
  operator: string                  // '=', '!=', '>', '<', '>=', '<=', '~', '~*', '!~', '!~*'
  value: string | number | RegExp
}
```

#### Internal Structure

```svelte
<script>
  import { parseFilters } from '@rokkit/data'

  let { filters = $bindable([]), debounce: delay = 300, placeholder, onfilter, ... } = $props()

  let inputText = $state('')
  let timer

  function handleInput() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      filters = parseFilters(inputText)
      onfilter?.(filters)
    }, delay)
  }

  function removeFilter(index) {
    filters = filters.filter((_, i) => i !== index)
    onfilter?.(filters)
  }

  function clear() {
    inputText = ''
    filters = []
    onfilter?.(filters)
  }
</script>

<div data-search-filter data-size={size} class={className}>
  <input
    type="search"
    data-search-input
    bind:value={inputText}
    oninput={handleInput}
    {placeholder}
  />
  {#if inputText}
    <button data-search-clear onclick={clear} aria-label="Clear search">×</button>
  {/if}

  {#if filters.length > 0}
    <div data-search-tags>
      {#each filters as filter, i}
        {#if tag}
          {@render tag(filter, () => removeFilter(i))}
        {:else}
          <span data-search-tag>
            {filter.column ? `${filter.column} ${filter.operator} ` : ''}{filter.value}
            <button onclick={() => removeFilter(i)} aria-label="Remove filter">×</button>
          </span>
        {/if}
      {/each}
    </div>
  {/if}
</div>
```

#### Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-search-filter` | root `<div>` | Container |
| `data-search-input` | `<input>` | Text input |
| `data-search-clear` | `<button>` | Clear button |
| `data-search-tags` | `<div>` | Filter tags container |
| `data-search-tag` | `<span>` | Individual filter tag |
| `data-size` | root `<div>` | Size variant |

### Composition Examples

#### With Table

```svelte
<script>
  import { SearchFilter, Table } from '@rokkit/ui'
  import { filterData } from '@rokkit/data'

  let data = [...]
  let filters = $state([])
  let filtered = $derived(filterData(data, filters))
</script>

<SearchFilter bind:filters placeholder="e.g. name:alice age>30" />
<Table data={filtered} caption="Employees" />
```

#### With List or Tree

```svelte
<SearchFilter bind:filters />
<List items={filterData(items, filters)} />
```

### Required `@rokkit/data` Exports

These exist but are not exported. Add to `packages/data/src/index.js`:

```javascript
export { parseFilters } from './parser'
export { filterData, filterObjectArray } from './filter'
```

---

## Gaps to Address

### Required before implementation

1. **`TableController`** in `@rokkit/states` — extends `ListController` with sort, pagination, hierarchy awareness
2. **`groupToHierarchy()`** in `@rokkit/data` — multi-column grouping to tree nodes
3. **Column-level `ItemProxy`** — per-cell field mapping with column `fields` overrides
4. **`navigator` action compatibility** — verify the existing `navigator` works with `TableController`'s API surface (same `wrapper` interface)
5. **Export `parseFilters`, `filterData`, `filterObjectArray`** from `@rokkit/data` index

### Required for full feature set (can be phased)

6. **`dataview` pagination** — `goToPage`, `setPageSize`, page-aware slicing
7. **Aggregate rows** for multi-column grouping — summary values at parent levels

### Future phases (not in scope)

8. Virtual scrolling
9. Column resizing/reordering
10. Inline cell editing
11. Row drag-and-drop
12. CSV/JSON export
13. Frozen/pinned columns

---

## Implementation Plan

### Phase 1: Core Flat Table + SearchFilter

1. Export `parseFilters`, `filterData`, `filterObjectArray` from `@rokkit/data`
2. Create `types/table.ts` — all type definitions
3. Create `types/search-filter.ts` — SearchFilter types
4. Create `TableController` in `@rokkit/states` — flat rows, sort, focus, selection
5. Create `table/TableHeader.svelte` — sortable column headers
6. Create `table/TableCell.svelte` — cell with `ItemProxy` field mapping
7. Create `table/TableRow.svelte` — row with data attributes
8. Create `table/TableBody.svelte` — iterates `controller.visibleRows`
9. Create `table/Table.svelte` — orchestrator with `use:navigator`
10. Create `SearchFilter.svelte` — query input producing filter objects
11. Export from `components/index.ts`
12. Tests: rendering, column auto-derivation, sorting, selection, keyboard nav, search filter parsing

### Phase 2: Hierarchy

1. Add `groupToHierarchy()` to `@rokkit/data`
2. Extend `TableController` with expansion (compose `NestedController` logic)
3. Add hierarchy indent + expand icon to `TableCell`
4. Support `hierarchyField` and `hierarchyFields` props
5. Tests: tree rendering, expand/collapse, path-based and multi-column grouping

### Phase 3: Pagination

1. Add pagination state to `TableController`
2. Create `table/TableFooter.svelte` with pagination controls
3. Hierarchy-aware page slicing (top-level nodes paginate)
4. `onloadmore` with loading state
5. Tests: pagination, lazy loading

### Phase 4: Polish

1. Snippet customization for all visual elements
2. Named column snippets
3. Accessibility audit
4. Documentation and learn site examples
