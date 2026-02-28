# ListController

> Manages navigation state for flat or grouped list data: focus, selection, field mapping, and multi-selection range.

**Package**: `@rokkit/states`
**File**: `list-controller.svelte.js`

## Constructor

```javascript
const controller = new ListController(items, value, fields, options)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `items` | `unknown[]` | — | Data items |
| `value` | `unknown` | `null` | Initial selected value |
| `fields` | `Partial<FieldMapping>` | `defaultFields` | Field name mapping |
| `options` | `{ multiselect?: boolean }` | `{}` | Controller options |

## Reactive State

```javascript
controller.data              // Flat visible nodes: { key, value, depth }[] (derived)
controller.lookup            // Map<key, Proxy> (derived)
controller.focusedKey        // Currently focused key ($state)
controller.selectedKeys      // SvelteSet<string> of selected keys ($state)
controller.focused           // Value at focusedKey (derived)
controller.selected          // Array of selected item values (derived)
controller.currentIndex      // Numeric index of focusedKey in data
controller.expandedKeys      // SvelteSet<string> of expanded group keys ($state)
controller.items             // Item array (get/set)
controller.fields            // Field mapping (get/set)
```

## Navigation Methods

```javascript
controller.moveFirst()               // Focus first item
controller.moveLast()                // Focus last item
controller.moveNext()                // Focus next item
controller.movePrev()                // Focus previous item
controller.moveToIndex(index)        // Focus item at index
controller.moveToValue(value)        // Focus by value (full object or extracted primitive)
controller.moveTo(key)               // Focus by path key
```

## Selection Methods

```javascript
controller.select(key)               // Select + focus item; sets anchor for range
controller.extendSelection(key)      // Toggle if multiselect, else select
controller.toggleSelection(key)      // Toggle key in selectedKeys
controller.selectRange(key)          // Select all items between anchor and key
```

## Search

```javascript
controller.findByText(query, startAfterKey)
// Prefix match (case-insensitive), wraps around, skips disabled items
// Returns { key, value, index } or { index: -1 }
```

## Key Patterns

### With navigator action

```svelte
<script>
  import { ListController } from '@rokkit/states'
  import { navigator } from '@rokkit/actions'

  let controller = new ListController(items, value, fields)
</script>

<div use:navigator={{ wrapper: controller, direction: 'vertical' }} on:action={handleAction}>
  {#each controller.data as row (row.key)}
    <div data-path={row.key}>{row.value.text}</div>
  {/each}
</div>
```

### Multi-selection

```javascript
const controller = new ListController(items, null, fields, { multiselect: true })
controller.select('0')          // Select first, set anchor
controller.selectRange('3')     // Select 0-3 range
controller.extendSelection('5') // Toggle key 5
```

### Value sync guard (prevent fighting navigator)

```svelte
let lastSyncedValue = value

$effect(() => {
  if (value !== lastSyncedValue) {
    lastSyncedValue = value
    controller.moveToValue(value)
  }
})
```

## Notes

- `moveToValue()` accepts both full item objects and extracted `item[fields.value]` primitives.
- Items with `fields.disabled = true` are skipped by `moveNext/movePrev` and `findByText`.
- `expandedKeys` is also used in `NestedController`; in `ListController` it tracks which groups (items with children) are expanded for flat grouped lists.
- `#anchorKey` (private) tracks the range start for Shift+click/Space.
