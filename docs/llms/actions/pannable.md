# pannable

> Pan/drag gesture detection with coordinate tracking.

**Package**: `@rokkit/actions`
**File**: `pannable.svelte.js`

## Usage

```svelte
<div use:pannable on:panstart on:panmove={(e) => e.detail.dx} on:panend>
```

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `panstart` | `{ x, y }` | Drag started |
| `panmove` | `{ x, y, dx, dy }` | Dragging — `dx`/`dy` are delta from start |
| `panend` | `{ x, y, dx, dy }` | Drag ended |

## Example

```svelte
<script>
  let offsetX = $state(0)
  let startX = 0
</script>

<div
  use:pannable
  on:panstart={(e) => startX = offsetX}
  on:panmove={(e) => offsetX = startX + e.detail.dx}
  style="transform: translateX({offsetX}px)"
>
  Drag me
</div>
```

## Notes

- Works with both mouse and touch events.
- `Range` component uses `pannable` for handle dragging.
- Works alongside `swipeable` when both are needed.
