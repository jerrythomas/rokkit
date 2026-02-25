# Table

> Data table with column headers, sorting, keyboard navigation, and custom cell rendering.

**Export**: `Table` from `@rokkit/ui`
**Navigation**: `TableController` + `navigator`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `unknown[]` | `[]` | Row data |
| `fields` | `Partial<FieldMapping>` | — | Field mapping for rows |
| `columns` | `ColumnMetadata[]` | — | Column definitions (auto-derived if omitted) |
| `value` | `unknown` | — | Selected row value (bindable) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Row size |
| `disabled` | `boolean` | `false` | Disables interaction |
| `icons` | `Partial<TableStateIcons>` | — | Override sort icon CSS classes |
| `class` | `string` | `''` | Extra CSS classes |
| `onselect` | `(value, item) => void` | — | Called on row selection |
| `onsort` | `(field, direction) => void` | — | Called on column sort |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `header` | `(column, index)` | Custom column header |
| `row` | `(item, fields, handlers)` | Custom row renderer |
| `cell` | `(value, column, item)` | Custom cell renderer |
| `empty` | `()` | Empty state (no rows) |

## Column Metadata

```typescript
interface ColumnMetadata {
  name: string         // Column identifier
  label?: string       // Display label (defaults to name)
  dataType?: string    // 'string' | 'number' | 'date' | 'boolean'
  sortable?: boolean   // Enable column sorting
  align?: 'left' | 'center' | 'right'
  fields?: Partial<FieldMapping>  // Column-specific field mapping
  formatter?: (value) => string   // Value formatter
  action?: boolean     // Action column (no sort, special styling)
}
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowUp / ArrowDown` | Move row focus |
| `Home / End` | First / last row |
| `Enter` | Select focused row |

## Examples

### Auto-derived columns

```svelte
<script>
  import { Table } from '@rokkit/ui'
  const items = [
    { name: 'Alice', age: 30, role: 'Admin' },
    { name: 'Bob', age: 25, role: 'User' },
  ]
  let value = $state()
</script>

<Table {items} bind:value onselect={(v, row) => console.log(row)} />
```

### Explicit columns

```svelte
<Table
  {items}
  columns={[
    { name: 'name', label: 'Full Name', sortable: true },
    { name: 'age', label: 'Age', dataType: 'number', sortable: true, align: 'right' },
    { name: 'role', label: 'Role' },
  ]}
  bind:value
  onsort={(field, dir) => sortData(field, dir)}
/>
```

### Custom cell rendering

```svelte
{#snippet cell(value, column, item)}
  {#if column.name === 'role'}
    <span class="badge badge-{item.role.toLowerCase()}">{value}</span>
  {:else}
    {value}
  {/if}
{/snippet}

<Table {items} {cell} bind:value />
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-table` | Root | Always |
| `data-table-header` | `<th>` | Always |
| `data-sortable` | `<th>` | Column is sortable |
| `data-sort-asc` | `<th>` | Sorted ascending |
| `data-sort-desc` | `<th>` | Sorted descending |
| `data-table-row` | `<tr>` | Always |
| `data-focused` | `<tr>` | Keyboard focused |
| `data-selected` | `<tr>` | Selected |
