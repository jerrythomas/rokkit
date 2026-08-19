## Sparkline — a tiny inline chart

A `Sparkline` is a word-sized chart: no axes, no legend, just the shape of a
series. Drop it in a table cell, a KPI tile, or a sentence to show a trend at a
glance. It follows the same data-first contract as the rest of `@rokkit/chart`:
pass a numeric array (or object rows with a `field`), then size it with `width`
/ `height`.

## Basic usage

```svelte
<script>
  import { Sparkline } from '@rokkit/chart'
</script>

<Sparkline data={[12, 45, 23, 67, 34, 89]} type="area" width={120} height={32} />
```

## Enriched props

- `type` — `line` (default), `bar`, or `area`.
- `baseline` — draw a reference rule at a value (e.g. `0`). Bars with negative
  values auto-anchor to `0`.
- `highlight` — mark notable points: `'first' | 'last' | 'min' | 'max'`, a
  numeric index, or an array of them.
- `trend` — overlay a trend/reference line: `'avg'`, `'linear'`, `'median'`, a
  moving average, or a constant value (also accepts an array).
- `curve` — `'linear'` (default) or `'smooth'`.
- `color` — a palette role (`primary`, `accent`, …) for stroke/fill.
- `width` / `height` — the inline size in px (defaults `80 × 24`).

## In a table row

```svelte
<td>
  <Sparkline data={row.last8} type="line" highlight={['last']} width={120} height={24} />
</td>
```
