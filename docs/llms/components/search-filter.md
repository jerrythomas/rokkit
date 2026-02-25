# SearchFilter

> Search input with structured filter parsing — displays parsed filters as removable tags.

**Export**: `SearchFilter` from `@rokkit/ui`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Raw search text (bindable) |
| `filters` | `FilterObject[]` | `[]` | Parsed filters (bindable, read) |
| `placeholder` | `string` | `'Search...'` | Input placeholder |
| `debounce` | `number` | `300` | Debounce delay (ms) |
| `disabled` | `boolean` | `false` | Disables input |
| `class` | `string` | `''` | Extra CSS classes |
| `onchange` | `(value, filters) => void` | — | Called on input change |
| `onfilter` | `(filters) => void` | — | Called when filters are parsed |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `tag` | `(filter, onremove)` | Custom filter tag renderer |

## FilterObject

Parsed from structured search syntax `field:value` or `field>value`:

```typescript
interface FilterObject {
  field: string     // e.g. 'name', 'age'
  operator: string  // ':', '>', '<', '~*', etc.
  value: string     // e.g. 'John', '25'
  raw: string       // e.g. 'name:John'
}
```

## Examples

### Basic search

```svelte
<script>
  import { SearchFilter } from '@rokkit/ui'
  let query = $state('')
  let filters = $state([])
</script>

<SearchFilter bind:value={query} bind:filters onchange={(q, f) => applySearch(q, f)} />
```

### Structured filter input

User types `name:John age>25 status:active` → parsed into:
```js
[
  { field: 'name', operator: ':', value: 'John', raw: 'name:John' },
  { field: 'age', operator: '>', value: '25', raw: 'age>25' },
  { field: 'status', operator: ':', value: 'active', raw: 'status:active' }
]
```
Each parsed filter appears as a removable tag. The remaining unstructured text stays in the input.

### Custom tag snippet

```svelte
{#snippet tag(filter, onremove)}
  <span class="filter-badge">
    <strong>{filter.field}</strong> {filter.operator} {filter.value}
    <button onclick={onremove}>×</button>
  </span>
{/snippet}

<SearchFilter bind:value bind:filters {tag} />
```

## Notes

- Uses `parseFilters` from `@rokkit/data` internally (not directly exported).
- Debounce applies to `onchange` and `onfilter`.
- Removing a tag via the × button updates both `value` and `filters`.
- Clear button (×) in the input clears all text and filters.
