## Responsive tile grid with arrow-key selection

Grid is a selectable tile layout built on CSS `grid-auto-fill`.
Pass an array of items; each item becomes a tile button. The
container reflows automatically as the viewport changes — the only
knob is `minSize`, the minimum width per tile.

## Basic example

```svelte
<script>
  import { Grid } from '@rokkit/ui'

  const items = [
    { label: 'Dashboard', icon: 'i-glyph:home' },
    { label: 'Reports',   icon: 'i-glyph:chart' },
    { label: 'Settings',  icon: 'i-glyph:settings' }
  ]

  let selected = $state(null)
</script>

<Grid {items} bind:value={selected} />
```

## Sizing

- `minSize` (CSS length, default `120px`) — minimum tile width.
  Higher values give larger, fewer-per-row tiles; lower values pack
  tighter.
- `gap` (CSS length, default `1rem`) — space between tiles.
- `size` — content size variant (`sm` / `md` / `lg`) that affects
  inner padding and icon scale, not the tile width.

## Field mapping

Same shape as List: default fields are `label`, `icon`, `value`,
`disabled`. Remap with the `fields` prop:

```svelte
<Grid items={data} fields={{ label: 'title', value: 'id' }} />
```

## Keyboard

Arrow keys move focus between tiles. Enter / Space selects the
focused tile, firing `onselect` and updating `value`. Disabled
tiles are skipped during navigation.

## Custom tile content

The `itemContent` snippet replaces the inside of each tile button
(the button wrapper with `data-path` is always rendered by the
component). Per-item overrides via `item.snippet = 'name'` work the
same as List.
