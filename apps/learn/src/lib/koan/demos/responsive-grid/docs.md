## Auto-fit grid that reflows on its own

ResponsiveGrid is a thin wrapper over a CSS `grid` using the
`repeat(auto-fit, minmax(...))` idiom. You give it a *minimum* column
width; it fits as many columns as the available space allows and
reflows automatically as that space changes — no media queries, no
breakpoints, no JavaScript resize listeners.

Reach for it for card decks, stat tiles, image galleries, and any
"as many across as fit" layout.

## Basic example

```svelte
<script>
  import { ResponsiveGrid } from '@rokkit/ui'
</script>

<ResponsiveGrid minWidth="220px" gap="1rem">
  <div data-card>One</div>
  <div data-card>Two</div>
  <div data-card>Three</div>
  <div data-card>Four</div>
</ResponsiveGrid>
```

## Sizing knobs

- `minWidth` (`'240px'`) — the smallest a column may get before the grid
  drops to fewer columns. Drives `--grid-min-width`.
- `gap` (`'1rem'`) — spacing between cells. Drives `--grid-gap`.
- `maxCols` — an optional hard cap on the column count, so a very wide
  container doesn't sprawl into too many thin columns. Drives
  `--grid-max-cols`.

All three accept any CSS length (`px`, `rem`, `ch`, `%`, …) except
`maxCols`, which is a plain number.

## Theming hook

`[data-responsive-grid]` is the only element. It reads the three custom
properties above, so you can also override sizing from a stylesheet
without touching the props.
