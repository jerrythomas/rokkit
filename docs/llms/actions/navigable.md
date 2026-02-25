# navigable

> Simplified directional keyboard navigation — emits events without requiring a controller.

**Package**: `@rokkit/actions`
**File**: `navigable.svelte.js`

## Usage

```svelte
<div use:navigable on:previous on:next on:expand on:collapse on:select>
```

## Events

| Event | Key | Description |
|-------|-----|-------------|
| `previous` | `ArrowUp`, `ArrowLeft` | Move backward |
| `next` | `ArrowDown`, `ArrowRight` | Move forward |
| `expand` | `ArrowRight` (context) | Expand item |
| `collapse` | `ArrowLeft` (context) | Collapse item |
| `select` | `Enter` | Select item |

## When to Use

Use `navigable` when:
- You manage navigation state yourself (no controller)
- You want simple directional events without the full `navigator` MVC setup
- The component is too simple for a controller (e.g. custom accordion, simple slider)

Use `navigator` when:
- You have a `ListController` or `NestedController`
- You need focus tracking, selection, type-ahead, scroll-into-view

## Example

```svelte
<script>
  let index = $state(0)
</script>

<div
  use:navigable
  on:next={() => index = Math.min(index + 1, items.length - 1)}
  on:previous={() => index = Math.max(index - 1, 0)}
>
  {#each items as item, i}
    <div class:focused={i === index}>{item.text}</div>
  {/each}
</div>
```
