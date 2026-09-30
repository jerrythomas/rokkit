## Data-driven charts — one family, many shapes

The `@rokkit/chart` package ships nine chart components that all
follow the same data-first contract: pass an array of rows, name
the field that maps to each visual channel (`x`, `y`, `fill`,
`color`, `size`), and the SVG is built for you.

## Available shapes

| Component     | Use when…                                                   |
| ------------- | ----------------------------------------------------------- |
| `BarChart`    | categorical × numeric                                       |
| `LineChart`   | ordered numeric × numeric (trends)                          |
| `AreaChart`   | LineChart with the area under the curve filled              |
| `PieChart`    | parts of a whole (use sparingly — bars usually read better) |
| `ScatterPlot` | numeric × numeric, optional color / symbol channels         |
| `BubbleChart` | ScatterPlot + a size channel                                |
| `BoxPlot`     | distribution per category (5-number summary)                |
| `ViolinPlot`  | BoxPlot + density estimate for richer distributions         |
| `Sparkline`   | tiny inline chart for table cells / KPIs                    |

## Common props (Cartesian charts)

- `data` — row array.
- `x` / `y` — field names for the axes.
- `fill` (Bar / Area / Box / Violin) or `color` (Line / Scatter / Bubble)
  — adds a colour-grouped channel.
- `size` (Scatter / Bubble) — bubble radius field.
- `stat` (Bar / Line / Area) — aggregation when multiple rows share an
  x value (`sum` / `mean` / `count` / `min` / `max`).
- `legend`, `grid`, `tooltip` — booleans; defaults vary per chart.

## Basic example

```svelte
<script>
  import { BarChart } from '@rokkit/chart'
  const data = [
    { quarter: 'Q1', revenue: 120 },
    { quarter: 'Q2', revenue: 180 },
    { quarter: 'Q3', revenue: 160 },
    { quarter: 'Q4', revenue: 210 }
  ]
</script>

<BarChart {data} x="quarter" y="revenue" />
```

## Sparkline

Sparkline takes a numeric array (or object rows with `x` / `y`
fields) and renders into the inline size you specify via `width` /
`height`. Use `type="line"` (default), `bar`, or `area`:

```svelte
<Sparkline data={[12, 45, 23, 67, 34, 89]} type="area" width={120} height={32} />
```

## Theming

Colours come from the active theme palette by default — the same
`primary` / `accent` / `success` / `warning` / `danger` roles that
power every other Rokkit component. Pass a `palette` array of CSS
colour strings to override for a specific chart (e.g. brand-aligned
report).

## Annotating the plane — Rule, Region, Hull, Contour

Four primitives describe the metric plane rather than any one row. Put them **before** the
marks they sit behind — SVG paints in document order.

| Primitive | Draws |
| --- | --- |
| `Plot.Rule` | reference lines: `x` / `y` values, or `slope` + `intercept` (clipped to the plot) |
| `Plot.Region` | a shaded band (`x` / `y` as `[lo, hi]`; `null` runs to the axis edge) or a polygon (`points`) in data coordinates, with a label |
| `Plot.Hull` | the convex hull of each group of the `fill` / `color` field, padded clear of its points |
| `Plot.Contour` | kernel-density contours per group — rings, or `filled` bands |

A region reads no data and never moves the scales, so when the theory — not the rows —
defines the frame, fix it: `<PlotChart xDomain={[0, 1]} yDomain={[0, 1]}>`.

## Architecture analysis

The **Architecture** group composes those primitives over real metrics measured from this
repo (`apps/learn/scripts/build-architecture-metrics.mjs`), so every dot is a rokkit component
or module:

- **Main sequence** — Robert Martin's instability × abstractness. The line `A + I = 1` is a
  sloped `Rule`; the zones of pain and uselessness are `Region` polygons; hulls outline each
  package; contours show the pile-up on the `A = 0` edge.
- **Hotspots** — complexity × churn. Code that is complex *and* keeps changing is where
  refactoring pays back.
- **Complexity × coverage** — the complex, under-tested corner.
- **Fan-in × fan-out** — hubs everyone leans on, and modules that reach everywhere.
- **God modules** — past the 95th percentile on both complexity and fan-out.

The thresholds are percentiles of the codebase itself — what counts as complex is relative.

## When to reach for `Plot` instead

For anything beyond these prebuilt shapes — multiple geometries on
one canvas, a custom encoding, faceted small multiples — use
`<Plot>` with explicit `<GeomBar/>`, `<GeomLine/>`, etc. The chart
components above are sugar over that same layer.
