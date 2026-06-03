## Hierarchical tabular data

TreeTable extends the same sortable-grid behavior as Table to rows that
have parent/child relationships. One designated column (the "hierarchy
column") owns the expand chevron and the tree connectors; every other
column renders flat values exactly like in Table.

The data layer is `ProxyTableTree` — a `ProxyTable` that knows about
`children: []` and sorts siblings within each parent. The component
itself is a thin shell over the same `Wrapper + Navigator class`
pattern as Table.

## Three ways to feed it

TreeTable only accepts the **canonical nested shape** — rows that
already carry `children: []`. Two `@rokkit/data` helpers convert the
common flat shapes into that representation before the data reaches
the component:

```ts
import { nestByPath, nestByColumns } from '@rokkit/data'

// Path-string flat rows  → nestByPath
nestByPath(rows, { column: 'path', separator: '/' })

// Group-by columns        → nestByColumns
nestByColumns(rows, ['region', 'country'])
```

Both are pure functions — easy to test in isolation, easy to compose
with other data transforms.

## Notable features

- **Hierarchy column** — defaults to the first column; opt a different
  column in by setting `column.hierarchy: true`
- **Per-sibling sort** — sorting by any column reorders siblings within
  each parent so the hierarchy survives
- **Same keyboard behavior as Tree** — Arrow Right expands / first
  child, Arrow Left collapses / parent, Up/Down skip collapsed
  subtrees
- **Selection** — single (default) or multi (`selectable="multi"`)
- **Connector lines** — reused from the Tree component for
  visual consistency

## Quick start

```svelte
<script>
  import { TreeTable } from '@rokkit/ui'

  const data = [
    {
      region: 'EMEA',
      sales: 1840,
      children: [
        { region: 'France', sales: 540 },
        { region: 'Germany', sales: 920 }
      ]
    }
  ]
</script>

<TreeTable {data} />
```
