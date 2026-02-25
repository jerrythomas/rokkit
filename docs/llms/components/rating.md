# Rating

> Star/icon rating input with keyboard navigation.

**Export**: `Rating` from `@rokkit/ui`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current rating (bindable) |
| `max` | `number` | `5` | Maximum rating |
| `disabled` | `boolean` | `false` | Read-only mode |
| `filledIcon` | `string` | `'i-star-filled'` | Icon CSS class for filled stars |
| `emptyIcon` | `string` | `'i-star'` | Icon CSS class for empty stars |
| `class` | `string` | `''` | Extra CSS classes |
| `onchange` | `(value) => void` | — | Called on rating change |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowLeft / ArrowDown` | Decrease by 1 |
| `ArrowRight / ArrowUp` | Increase by 1 |
| `Home` | Set to 0 |
| `End` | Set to max |

## Examples

### Basic

```svelte
<script>
  import { Rating } from '@rokkit/ui'
  let stars = $state(3)
</script>

<Rating bind:value={stars} onchange={(v) => console.log(v)} />
```

### Read-only display

```svelte
<Rating value={4.5} disabled />
```

### Custom icons

```svelte
<Rating filledIcon="i-heart-filled" emptyIcon="i-heart" bind:value={likes} />
```
