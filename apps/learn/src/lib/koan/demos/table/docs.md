## Tabular data, sortable out of the box

Tables display structured rows with sortable columns and keyboard
navigation. Built on the same `ProxyTable + Wrapper + Navigator` stack
as List/Tree, the Table component auto-derives columns from your data —
get started with just an array of objects.

## Notable features

- **Auto-columns** — column headers inferred from the object keys
- **Click-to-sort** — ascending → descending → none, per column
- **Shift-click** — adds secondary sort columns for multi-column sort
- **Keyboard nav** — arrow keys, Home, End, Enter to select
- **Single or multi-select** — `selectable="single"` (default) or
  `selectable="multi"` for ctrl/cmd-click toggle and shift-click range
- **Custom columns** — declare `columns` for labels, width, alignment,
  cell formatters, and `sortable: false`
- **Composable** — pair with `SearchFilter` to filter rows reactively

For hierarchical rows (nested children, drilldowns, rollups), use the
[TreeTable](/app/tree-table) component instead — it adds chevron + indent +
per-sibling sort on top of the same data layer.

## Basic example

Pass an array of objects to the `data` prop. Click a row to select
it; the bound `value` reflects the selection.

```svelte
<Table {data} bind:value={selected} />
```

## Sorting

All columns are sortable by default. Click a header to cycle through
ascending → descending → unsorted. Hold **Shift** while clicking to
add secondary sort columns.

## Multi-select

Pass `selectable="multi"` and bind `values` (an array) to enable
ctrl/cmd-click toggle and shift-click range selection. The same
keyboard shortcuts (`Ctrl+Space`, `Shift+Space`) work as well.

```svelte
<Table {data} selectable="multi" bind:values={picked} />
```

## Custom columns and formatters

Provide a `columns` array to control which fields appear and how:

```svelte
const columns = [
  { name: 'name',   label: 'Product' },
  { name: 'price',  label: 'Unit price', align: 'end',
    formatter: (v) => '$' + v.toLocaleString() },
  { name: 'role',   sortable: false }
]
```

The `formatter` receives the raw cell value and the full row, returning
the display string.

## Filtering with SearchFilter

`SearchFilter` parses search queries into structured filters — free
text matches every column, `column:value` syntax narrows to a column,
comparison operators (`age>30`, `salary>=90000`) work on numerics.
Bind the filtered output and pass it to Table.

## Snippets

- **`header`** — custom header row rendering
- **`row`** — custom row rendering (`row`, `columns`, `index`,
  `isSelected`)
- **`cell`** — custom cell rendering (`value`, `column`, `row`)
- **`empty`** — what to show when `data` is empty
