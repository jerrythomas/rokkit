# Data Table

> Interactive tabular display with column sorting, row selection, and keyboard navigation built on `@rokkit/data` and `@rokkit/states`.

---

## Overview

`DataTable` is the interactive counterpart to `Table`. Where `Table` is a static renderer, `DataTable` integrates with `TabularStore` for sort state and selection, `@rokkit/data` for dataset operations, and the navigator pattern for keyboard navigation.

`DataTable` owns no data transformation internally. It either accepts pre-sorted/filtered data from `@rokkit/data` operations applied externally, or it can sort internally when `sortable` is set and no external sort handler is provided.

---

## Props

```typescript
interface ColumnDef {
  key: string // property name in item
  label: string // header text
  width?: string // CSS width value (e.g., '200px', '20%')
  align?: 'left' | 'center' | 'right'
  sortable?: boolean // overrides the table-level sortable default
  render?: Snippet<[unknown, Record<string, unknown>]> // custom cell snippet
}

interface DataTableProps {
  items: Record<string, unknown>[] // row data
  fields: ColumnDef[] // column definitions
  value?: unknown // bindable — selected row item (single)
  values?: unknown[] // bindable — selected row items (multi)
  sortable?: boolean // enable sorting on all columns (default: false)
  selectable?: 'single' | 'multi' | false // selection mode (default: false)
  onselect?: (item: unknown) => void
  onSort?: (key: string, dir: 'asc' | 'desc' | null) => void
}
```

`value` and `values` are mutually exclusive. Providing `values` activates multi-selection mode regardless of the `selectable` prop. `value` activates single selection. Providing neither disables selection.

---

## Column Definitions

```javascript
const fields = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', width: '240px', sortable: true },
  { key: 'role', label: 'Role', align: 'center' },
  {
    key: 'status',
    label: 'Status',
    render: statusCell // Svelte snippet: (value, row) => ...
  }
]
```

Column-level `sortable` takes precedence over the table-level `sortable` prop. A column with `sortable: false` is never sortable even when the table has `sortable: true`.

The `render` snippet receives `(cellValue, rowItem)` and renders inside `data-table-cell`. When absent, the cell value is rendered as text.

---

## Sorting

Clicking a sortable column header cycles through three states: `asc` → `desc` → unsorted (null). The active sort direction is tracked in `TabularStore`.

When `onSort` is provided, the consumer is responsible for re-ordering `items` (typically via `@rokkit/data` sort operations). The table rerenders with whatever order `items` arrives in.

When `onSort` is absent and `sortable` is true, `DataTable` sorts `items` internally using `@rokkit/data`'s sort function on each header click. This is the zero-config path for in-memory datasets.

```javascript
// External sort via @rokkit/data
import { sort } from '@rokkit/data'

let sortedItems = $derived(
  sortKey ? sort(items, [{ key: sortKey, dir: sortDir }]) : items
)

<DataTable
  items={sortedItems}
  {fields}
  onSort={(key, dir) => { sortKey = key; sortDir = dir }}
/>
```

---

## Selection

`DataTable` uses the same `value`/`values` binding pattern as other Rokkit components.

Single selection — bind `value`:

```svelte
<DataTable {items} {fields} selectable="single" bind:value={selectedRow} />
```

Multi-selection — bind `values`:

```svelte
<DataTable {items} {fields} selectable="multi" bind:values={selectedRows} />
```

Row click fires `onselect(item)` and updates the binding. In multi-select mode, clicking a selected row deselects it. Space bar toggles selection on the focused row.

---

## Keyboard Navigation

`DataTable` uses the navigator pattern (`use:navigator`) on the table body for arrow key movement between cells. Tab focuses the table as a unit; arrow keys move within it.

| Key              | Action                                 |
| ---------------- | -------------------------------------- |
| Tab              | Enter / leave the table                |
| Arrow Up/Down    | Move focus between rows                |
| Arrow Left/Right | Move focus between cells in a row      |
| Space            | Toggle row selection (when selectable) |
| Enter            | Activate row (fires `onselect`)        |
| Home / End       | Move to first / last cell in row       |

Column headers are separately focusable. Tab cycles through sortable headers; Enter or Space activates sort on the focused header.

---

## DOM Structure and Data Attributes

```html
<div data-data-table>
  <table role="grid">
    <thead data-table-header>
      <tr>
        <th data-table-header-cell data-sortable data-sort-dir="asc">
          Name <span data-sort-icon></span>
        </th>
        <th data-table-header-cell>Email</th>
        <th data-table-header-cell data-sortable>Role</th>
      </tr>
    </thead>
    <tbody data-table-body>
      <tr data-table-row data-active data-selected>
        <td data-table-cell>Jane Smith</td>
        <td data-table-cell>jane@example.com</td>
        <td data-table-cell>Admin</td>
      </tr>
      <tr data-table-row>
        <td data-table-cell>Bob Jones</td>
        ...
      </tr>
    </tbody>
  </table>
</div>
```

### Data attributes reference

| Attribute                | Element   | Purpose                                                |
| ------------------------ | --------- | ------------------------------------------------------ |
| `data-data-table`        | root div  | Component root                                         |
| `data-table-header`      | `<thead>` | Header section                                         |
| `data-table-header-cell` | `<th>`    | Header cell                                            |
| `data-sortable`          | `<th>`    | Present when column is sortable                        |
| `data-sort-dir`          | `<th>`    | Active sort direction: `asc` or `desc` (absent = none) |
| `data-table-body`        | `<tbody>` | Body section                                           |
| `data-table-row`         | `<tr>`    | Body row                                               |
| `data-selected`          | `<tr>`    | Present when row is in selection                       |
| `data-active`            | `<tr>`    | Present when row has keyboard focus                    |
| `data-table-cell`        | `<td>`    | Body cell                                              |

---

## Accessibility

- Root `<table>` has `role="grid"` (interactive table with navigable cells).
- Sortable `<th>` elements have `aria-sort="ascending"`, `aria-sort="descending"`, or `aria-sort="none"`.
- Selected `<tr>` elements have `aria-selected="true"`.
- The focused row's `<tr>` receives `tabindex="0"`; all other rows have `tabindex="-1"`.
- `aria-multiselectable="true"` on the grid root when in multi-select mode.
- Sticky header: `position: sticky; top: 0` applied via theme CSS on `[data-table-header]`.

---

## Integration with @rokkit/data and @rokkit/states

`DataTable` uses `TabularStore` from `@rokkit/states` to hold sort column/direction and active row index. The store is created internally and not exposed unless the consumer passes a pre-built store instance via the `store` prop (advanced use case for coordinating multiple tables).

For full pipeline integration:

```javascript
import { dataset, sort, filter } from '@rokkit/data'
import { createTabularStore } from '@rokkit/states'

const store = createTabularStore()
const processed = $derived(sort(filter(items, activeFilters), store.sortOrder))
```

```svelte
<DataTable items={processed} {fields} {store} bind:values />
```

When `store` is provided externally, `DataTable` reads sort state from it and calls `store.setSort` on header click instead of managing its own sort state.

---

## Component File Map

```
packages/ui/src/
└── DataTable/
    ├── DataTable.svelte         — root component
    ├── DataTableHeader.svelte   — thead with sortable column cells
    ├── DataTableBody.svelte     — tbody with navigator, row/cell rendering
    └── index.js                 — exports
```
