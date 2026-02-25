# navigator

> High-level navigation action — keyboard + click routing, focus management, and scroll-into-view. Requires a `ListController` or `NestedController`.

**Package**: `@rokkit/actions`
**File**: `navigator.svelte.js`

## Usage

```svelte
<div
  use:navigator={{ wrapper: controller, direction: 'vertical' }}
  on:action={(e) => handle(e.detail.name, e.detail.data)}
>
  {#each controller.data as row (row.key)}
    <div data-path={row.key} tabindex="-1">{row.value.text}</div>
  {/each}
</div>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wrapper` | `ListController \| NestedController` | — | **Required** — controller that manages navigation state |
| `direction` | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Arrow key axis |
| `enabled` | `boolean` | `true` | Enable/disable the action |
| `multiselect` | `boolean` | `false` | Enable Shift+click/Space range selection |
| `typeahead` | `boolean` | `false` | Enable type-ahead search (calls `controller.findByText`) |
| `nested` | `boolean` | `false` | Enable ArrowLeft/Right for expand/collapse (NestedController) |

## Events Emitted

The action dispatches a single `action` CustomEvent on the element:

```javascript
element.addEventListener('action', (e) => {
  const { name, data } = e.detail
  // name: 'move' | 'select' | 'toggle' | 'range'
  // data: { key, value, path, ... }
})
```

| Action name | Trigger | Description |
|-------------|---------|-------------|
| `move` | Arrow keys, Home/End, type-ahead, expand/collapse focus change | Focus moved |
| `select` | Enter, click | Item selected |
| `toggle` | ArrowLeft/Right (nested), click on expand icon | Node expanded/collapsed |
| `range` | Shift+click, Shift+Space | Range selection |

## Keyboard Mapping

| Key | Direction | Action |
|-----|-----------|--------|
| `ArrowDown` | vertical/both | `movePrev` / `moveNext` |
| `ArrowUp` | vertical/both | `movePrev` |
| `ArrowRight` | horizontal/both | `moveNext` or `expand` |
| `ArrowLeft` | horizontal/both | `movePrev` or `collapse` |
| `Home` | any | `moveFirst` |
| `End` | any | `moveLast` |
| `Enter` | any | `select` |
| `Space` | any | `select` (or `toggle` if no selection) |
| `Shift+Space` | multiselect | `range` |
| `Escape` | any | deselect |
| Printable char | typeahead | `move` to matching item |

## Click Routing

Navigator intercepts `click` events on all descendant elements with a `data-path` attribute.
- Regular click → `select` action
- `Ctrl+click` or `Meta+click` → `extendSelection` (multiselect)
- `Shift+click` → `range` action (multiselect)

**Critical**: Do NOT add `onclick` handlers on elements that also have `data-path` — this causes double-handling.

## Pattern: Full MVC

```svelte
<script>
  import { ListController } from '@rokkit/states'
  import { navigator } from '@rokkit/actions'

  let controller = new ListController(items, value, fields)
  let lastSyncedValue = value

  // Sync external value changes → controller (avoid fighting navigator)
  $effect(() => {
    if (value !== lastSyncedValue) {
      lastSyncedValue = value
      controller.moveToValue(value)
    }
  })

  function handleAction(e) {
    const { name, data } = e.detail
    if (name === 'select') {
      value = data.value[fields.value ?? 'value']
      lastSyncedValue = value
      onchange?.(value, data.value)
    }
  }
</script>

<div use:navigator={{ wrapper: controller, direction: 'vertical' }} on:action={handleAction}>
  {#each controller.data as row (row.key)}
    <div data-path={row.key} tabindex="-1" data-focused={row.key === controller.focusedKey || null}>
      {row.value.text}
    </div>
  {/each}
</div>
```

## Notes

- `scrollIntoView?.()` is called on the focused element after each move.
- The `move` event is also emitted when `expand`/`collapse` changes focus (NestedController tree-style navigation).
- Type-ahead buffer resets after 500ms of inactivity and on navigation actions.
