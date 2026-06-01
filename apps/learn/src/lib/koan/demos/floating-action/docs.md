## Floating action button with expandable actions

FloatingAction renders a single FAB that — when activated — reveals
a set of secondary actions. The reveal can be `vertical` (a stack
above/below), `horizontal` (a row left/right), or `radial` (an arc
around the trigger).

## Basic example

```svelte
<script>
  import { FloatingAction } from '@rokkit/ui'

  const actions = [
    { label: 'Edit', value: 'edit', icon: 'i-glyph:edit' },
    { label: 'Copy', value: 'copy', icon: 'i-glyph:copy' },
    { label: 'Share', value: 'share', icon: 'i-glyph:share' }
  ]
</script>

<FloatingAction
  items={actions}
  icon="i-glyph:add-circle"
  onselect={(v) => console.log(v)}
/>
```

## Position

`position` puts the FAB at one of the four viewport corners
(`top-left`, `top-right`, `bottom-left`, `bottom-right`). When
`contained={true}`, the FAB anchors to its parent's corner rather
than the viewport — useful for card-level actions.

## Expansion

- `expand: 'vertical'` (default) — items stack vertically.
- `expand: 'horizontal'` — items spread along a row.
- `expand: 'radial'` — items distribute on an arc around the trigger.

`itemAlign` chooses how labels sit relative to the icons inside
each action — handy when you want a tooltip-style label that
animates in alongside the icon.

## Backdrop

When `backdrop={true}` (default), opening dims the surrounding UI
and click-outside closes the FAB. Set `backdrop={false}` if the FAB
should stay non-modal.
