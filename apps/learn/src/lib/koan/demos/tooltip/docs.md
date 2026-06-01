## Hover / focus tooltip with auto-flip

Tooltip wraps any trigger element and reveals contextual text after
a delay on `mouseenter` / `focusin`. It hides immediately on
`mouseleave` / `focusout` / `Escape`, and auto-flips to the
opposite side when the preferred position would overflow the
viewport.

## Basic example

```svelte
<script>
  import { Tooltip, Button } from '@rokkit/ui'
</script>

<Tooltip content="Saves your changes" position="top">
  <Button>Save</Button>
</Tooltip>
```

## Position + auto-flip

- `position` — preferred side: `top` (default) / `right` /
  `bottom` / `left`.
- When the preferred side doesn't fit in the viewport, the tooltip
  flips to the opposite side. If that also doesn't fit, it picks
  any side that does. `data-tooltip-position` on the bubble
  reflects the _resolved_ position, not the preferred one.

## Delay

`delay` (ms, default `300`) is the hover-in delay before the
tooltip appears. Hides are always immediate — the user already
moved on. Set `delay={0}` for snappy debugging.

## Rich content

For more than plain text, use the `tooltipContent` snippet:

```svelte
<Tooltip position="bottom">
  <Button>Status</Button>
  {#snippet tooltipContent()}
    <div class="grid">
      <strong>Build</strong> <span>passing</span>
      <strong>Deploy</strong> <span>queued</span>
    </div>
  {/snippet}
</Tooltip>
```

## Accessibility

The bubble carries `role="tooltip"` and a generated `id`, and the
trigger wrapper points at it via `aria-describedby`. Screen readers
announce the content when the trigger receives focus.
