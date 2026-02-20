# Table Component Requirements

> Requirements for a unified Table component supporting flat and hierarchical tabular data.

## 1. Overview

A single `Table` component in `@rokkit/ui` that renders both flat tables and tree tables. It follows the data-driven pattern: accepts a data array, uses field mapping via `ItemProxy`, delegates interactions to `use:` actions, and manages state through a controller class in `@rokkit/states`.

## 2. Data Input

### 2.1 Raw Data

- Accept an array of plain objects (JSON or CSV-parsed)
- Auto-derive column names and data types from the data using `@rokkit/data` utilities
- Support custom column definitions that override auto-derived ones

### 2.2 Column Visibility

- When `columns` is provided, only listed columns are visible
- Columns not listed are hidden (no extra `visible` flag needed)
- When `columns` is omitted, all data keys become visible columns

### 2.3 Column Merging

- A column can pull values from other data fields into itself
- Example: a "name" column can pull the "gender" field as an icon
- The source field does not appear as a separate column unless explicitly listed

```
Column "Employee" maps: { text: 'name', icon: 'gender' }
  → renders gender icon + name text in one cell
  → "gender" column hidden unless separately listed
```

### 2.4 Field Mapping

- Use `ItemProxy` from `@rokkit/ui/types` for per-row field access
- Support column-level field overrides (a column's `fields` prop maps data keys to cell display slots)
- Formatters transform values for display (e.g., currency, date, icon class)

## 3. Hierarchy

### 3.1 Path-Based Hierarchy

- A single column contains a path string (e.g., `/USA/California/LA`)
- Specified via `hierarchyField` prop with optional `separator` (default: `/`)
- Hierarchy derived using existing `deriveHierarchy()` from `@rokkit/data`

### 3.2 Multi-Column Grouping

- Multiple columns define the hierarchy levels (e.g., country > state > city)
- Specified via `hierarchyFields` array prop
- Synthetic parent rows are created for each group level
- Remaining non-group columns display at the leaf level
- Requires new `groupToHierarchy()` utility in `@rokkit/data`

### 3.3 Expand/Collapse

- Parent rows can be expanded or collapsed
- Expanded state is bindable via `expanded` prop (`Record<string, boolean>`)
- Support `expandAll` prop for initial state
- Collapsing a parent hides all descendants

### 3.4 Tree Column Rendering

- The first column (or designated hierarchy column) shows indentation and expand/collapse icons
- Indentation depth corresponds to tree depth
- Expand/collapse icons follow the state icons pattern from `@rokkit/core`
- Leaf nodes show no expand icon

## 4. Sorting

### 4.1 Column Sort

- Columns are sortable by default (opt-out per column with `sortable: false`)
- Click header to cycle: none → ascending → descending → none
- Sort indicator icons in header cells

### 4.2 Multi-Column Sort

- Shift+click or Ctrl+click adds a secondary sort
- Sort state is bindable via `sortBy` prop

### 4.3 Hierarchy-Aware Sort

- Sorting within a tree table sorts siblings within each parent group
- Uses existing `groupSort()` from `@rokkit/data`

## 5. Pagination

### 5.1 Client-Side Pagination

- Configurable `pageSize` (default: 50)
- Page navigation: first, previous, next, last, page number input
- Current `page` is bindable
- Hierarchy-aware: top-level nodes paginate; children travel with parent

### 5.2 Server-Side / Lazy Loading

- `onloadmore` callback for fetching additional data
- Callback receives `{ page, pageSize }`, returns `Promise<{ hasMore }>`
- Loading spinner shown while fetching (via `loading` snippet)

### 5.3 Row Limits

- Default max visible rows per page: 50
- Recommend max 200 rows without virtual scrolling
- Virtual scrolling is a future enhancement, not in initial scope

## 6. Filtering & Search

### 6.1 SearchFilter Component

A standalone `SearchFilter` component in `@rokkit/ui` that connects to any data-driven component (Table, List, Tree). It is NOT built into the Table — it follows the composition pattern.

#### Query Language

The SearchFilter uses the existing `parseFilters()` from `@rokkit/data` to parse user input into structured filter objects. The syntax supports:

- **Free text**: `alice` — case-insensitive regex match across all columns
- **Column filter**: `name:alice` — match "alice" in the `name` column
- **Comparison**: `age>30`, `age>=30`, `salary<=50000`
- **Exact match**: `status=active`, `city!=Chicago`
- **Regex**: `name~^A` (case-sensitive), `name~*^a` (case-insensitive)
- **Negation**: `name!~alice`, `city!~*new`
- **Quoted values**: `city:"New York"`, `"rock and roll"`
- **Combined**: `age>=30 city:"New York" alice` — all conditions AND together

#### Input → Filter → Data Flow

```
User types in SearchFilter
  → parseFilters(inputText) produces filter objects
  → filters bindable as prop (or emitted via onfilter callback)
  → Consumer applies filterData(data, filters) from @rokkit/data
  → Filtered data passed to Table (or List, Tree, etc.)
```

#### Component Requirements

- Single text input with optional clear button
- Debounced input (configurable delay, default 300ms)
- `filters` prop is bindable — the parsed filter array
- `onfilter` callback fires when filters change
- Does NOT own the data — only produces filter objects
- Shows active filter tags/pills for each parsed token (optional, via snippet)
- Supports placeholder text and column name hints

#### Usage

```svelte
<script>
  import { SearchFilter, Table } from '@rokkit/ui'
  import { filterData } from '@rokkit/data'

  let data = [...]
  let filters = $state([])
  let filtered = $derived(filterData(data, filters))
</script>

<SearchFilter bind:filters placeholder="Search... (e.g., name:alice age>30)" />
<Table data={filtered} caption="Results" />
```

#### Hierarchy-Aware Usage

```svelte
<script>
  import { SearchFilter, Table } from '@rokkit/ui'
  import { filterData } from '@rokkit/data'
  import { hierarchicalFilter } from '@rokkit/data'

  let data = [...]
  let filters = $state([])

  // For tree data: use hierarchicalFilter so parents remain visible
  // when children match
  let filtered = $derived.by(() => {
    const flat = filterData(data, filters)
    // hierarchicalFilter marks excluded/retained flags
    return flat
  })
</script>

<SearchFilter bind:filters />
<Table data={filtered} hierarchyField="path" />
```

### 6.2 Filter Utilities in `@rokkit/data`

The following utilities already exist but are not exported:

| Function | File | Purpose |
|----------|------|---------|
| `parseFilters(string)` | `parser.js` | Parses query string into filter objects `[{ column?, operator, value }]` |
| `filterObjectArray(data, filter)` | `filter.js` | Applies a single filter to data |
| `filterData(data, filters)` | `filter.js` | Applies multiple filters sequentially (AND logic) |
| `filterOperations` | `constants.js` | Operator implementations (`=`, `>`, `<`, `>=`, `<=`, `~`, `~*`, `!=`, `!~`, `!~*`) |
| `hierarchicalFilter(arr, fn)` | `hierarchy.js` | Filters tree data, retaining parents when children match |

**Action required**: Export `parseFilters`, `filterData`, and `filterObjectArray` from `@rokkit/data` index.

### 6.3 Composition with Other Components

The SearchFilter is not Table-specific. It produces filter objects that work with any data array:

```svelte
<!-- With List -->
<SearchFilter bind:filters />
<List items={filterData(items, filters)} />

<!-- With Tree -->
<SearchFilter bind:filters />
<Tree items={filterData(items, filters)} />
```

## 7. Selection

### 7.1 Single Selection

- Click a row to select it
- `value` prop is bindable (the selected row's data)
- `onselect` callback fires with row data

### 7.2 Multi-Selection

- Enabled via `multiSelect` prop
- Ctrl+click to toggle individual rows
- Shift+click for range selection
- `selected` prop is bindable (array of selected row data)
- Checkbox column appears when multi-select is enabled

## 8. Interactions via Actions

### 8.1 Keyboard Navigation (`use:navigator`)

- Use the existing `navigator` action from `@rokkit/actions`
- Wire to a `TableController` state class in `@rokkit/states`
- The action handles keyboard events and calls controller methods
- The controller manages focus, selection, and expansion state

| Key | Action |
|-----|--------|
| `ArrowDown` | Move focus to next row |
| `ArrowUp` | Move focus to previous row |
| `ArrowRight` | Expand tree node (if parent) |
| `ArrowLeft` | Collapse tree node (if parent) |
| `Enter` / `Space` | Select focused row |
| `Home` | Move focus to first row |
| `End` | Move focus to last row |
| `PageDown` | Next page |
| `PageUp` | Previous page |

### 8.2 Sort Action

- Header cells use click handlers to trigger sort
- Multi-column sort via modifier keys (Shift/Ctrl)
- Emits `onsort` event with column name, order, and extend flag

### 8.3 Click/Selection Action

- Row click triggers move + select via the navigator action
- Ctrl+click triggers extend selection (multi-select)
- Click on expand icon triggers toggle expansion

## 9. State Management

### 9.1 TableController (`@rokkit/states`)

A new state class that manages all table interaction state:

```
TableController
├── extends ListController (or composes it)
├── rows: processed row data (flat or hierarchy)
├── columns: column metadata with sort state
├── focusedKey: currently focused row
├── selectedKeys: selected row set
├── expanded: expansion state for tree nodes
├── page / pageSize / pageCount: pagination
│
├── moveFirst(), moveLast(), moveNext(), movePrev()
├── select(key), extendSelection(key)
├── expand(key), collapse(key), toggleExpansion(key)
├── sortBy(column, ascending, extend)
├── goToPage(page), setPageSize(size)
└── visibleRows: derived slice for current page
```

### 9.2 Reactivity

- Controller uses Svelte 5 `$state` and `$derived` runes
- The Table component creates a controller instance from props
- The `navigator` action receives the controller as its `wrapper`

## 10. Component Structure

### 10.1 File Organization

```
packages/ui/src/
  components/
    table/
      Table.svelte           # Main orchestrator
      TableHeader.svelte     # <thead> with sortable headers
      TableBody.svelte       # <tbody> with row iteration
      TableRow.svelte        # Single <tr> with cell rendering
      TableCell.svelte       # <td> with field mapping, hierarchy indent
      TableFooter.svelte     # <tfoot> with pagination
  types/
    table.ts                 # All table type definitions
```

### 10.2 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-table` | `<div>` wrapper | Root container |
| `data-table-header` | `<thead>` | Header section |
| `data-table-body` | `<tbody>` | Body section |
| `data-table-footer` | `<tfoot>` | Footer section |
| `data-table-row` | `<tr>` | Row element |
| `data-table-cell` | `<td>` | Cell element |
| `data-table-header-cell` | `<th>` | Header cell |
| `data-column={name}` | `<th>` / `<td>` | Column identifier |
| `data-sortable` | `<th>` | Sortable column |
| `data-sort-order={asc\|desc}` | `<th>` | Current sort direction |
| `data-depth={n}` | `<tr>` | Hierarchy depth |
| `data-selected` | `<tr>` | Selected row |
| `data-focused` | `<tr>` | Focused row |
| `data-expanded` | `<tr>` | Expanded parent row |
| `data-parent` | `<tr>` | Row that has children |

### 10.3 ARIA

| Element | Role/Attribute |
|---------|---------------|
| `<table>` | `role="treegrid"` (hierarchy) or `role="grid"` (flat) |
| `<tr>` | `role="row"` |
| `<tr>` (hierarchy) | `aria-level={depth+1}`, `aria-expanded` |
| `<tr>` | `aria-selected`, `aria-rowindex` |
| `<th>` | `scope="col"`, `aria-sort` |
| `<td>` | `role="gridcell"` |
| `<caption>` | Table description |

## 11. Snippet Customization

| Snippet | Parameters | Purpose |
|---------|-----------|---------|
| `header` | `(columns, sortState)` | Custom header rendering |
| `row` | `(row, columns, rowState)` | Custom full-row rendering |
| `cell` | `(value, column, row)` | Custom cell rendering |
| `footer` | `(pagination)` | Custom footer/pagination |
| `empty` | none | Empty state message |
| `loading` | none | Loading spinner for lazy load |
| Named snippets | `(value, column, row)` | Per-column cell via `column.snippet` |

## 12. Dependencies

### Uses from existing packages

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/data` | `deriveColumns`, `deriveHierarchy`, `groupSort`, `hierarchicalFilter`, `deriveMetadata` | Column inference, hierarchy, sort |
| `@rokkit/data` | `parseFilters`, `filterData`, `filterObjectArray` | Query parsing and data filtering (need to be exported) |
| `@rokkit/actions` | `navigator` | Keyboard/click interaction |
| `@rokkit/states` | `ListController` (extend to `TableController`) | Focus, selection, expansion state |
| `@rokkit/ui` | `ItemProxy`, `Connector`, `ItemContent` | Field mapping, tree lines, cell content |
| `@rokkit/core` | `defaultStateIcons`, `createEmitter` | Icons, event emission |

### New code required

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/data` | `groupToHierarchy()` | Multi-column grouping to tree nodes |
| `@rokkit/data` | `dataview` pagination extensions | `goToPage`, `setPageSize`, page-aware slicing |
| `@rokkit/data` | Export `parseFilters`, `filterData`, `filterObjectArray` | Already implemented, need to be added to index.js |
| `@rokkit/states` | `TableController` | Table-specific state management |
| `@rokkit/ui` | Table sub-components | Header, Body, Row, Cell, Footer |
| `@rokkit/ui` | `SearchFilter` component | Query input that produces filter objects |
| `@rokkit/ui` | `types/table.ts` | Type definitions |

## 13. TreeTable: Flat Data with Hierarchy Column

For use cases where data arrives as a flat array but contains a hierarchical path field:

```svelte
<script>
  // Flat tabular data
  const data = [
    { path: 'src/components/Button.svelte', size: 2048, modified: '2024-01-15' },
    { path: 'src/components/List.svelte', size: 4096, modified: '2024-01-14' },
    { path: 'src/utils/helpers.js', size: 1024, modified: '2024-01-13' }
  ]

  const columns = [
    { field: 'path', hierarchy: true, separator: '/' },  // Hierarchy column
    { field: 'size', format: 'bytes' },
    { field: 'modified', format: 'date' }
  ]
</script>

<Table {data} {columns} />
```

**Data transformation**:
- Uses `@rokkit/data` to transform flat data into hierarchical structure
- Hierarchy column config: `{ hierarchy: true, separator: '/' }`
- Preserves original row data at leaf nodes
- Intermediate nodes are auto-generated from path segments

**Note**: The archived `TreeTable.svelte` (`archive/ui/src/TreeTable.svelte`) is broken (see `docs/design/000-component-gaps.md`). The unified `Table` component handles this via the `hierarchyField` or column config approach.

## 14. Non-Goals (Future Phases)

- Virtual scrolling (10,000+ rows)
- Column resizing (drag-to-resize)
- Column reordering (drag-to-reorder)
- Inline cell editing
- Row drag-and-drop
- CSV/JSON export
- Frozen/pinned columns
- TypeScript migration of `DataSet` class
