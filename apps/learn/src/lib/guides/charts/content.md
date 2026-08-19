# Charts

`@rokkit/chart` is an SVG charting layer built on the same
field-mapped, data-first principles as the rest of Rokkit. It
ships nine prebuilt chart shapes for the common cases plus a
lower-level `<PlotChart>` you compose with explicit `Plot.*`
geoms when you need something custom.

## The nine prebuilt shapes

| Shape         | Geom                     | Use when…                            |
| ------------- | ------------------------ | ------------------------------------ |
| `BarChart`    | bar                      | categorical × numeric                |
| `LineChart`   | line                     | ordered numeric × numeric (trends)   |
| `AreaChart`   | area                     | LineChart with the area filled       |
| `PieChart`    | arc                      | parts of a whole (use sparingly)     |
| `ScatterPlot` | point                    | numeric × numeric + optional color   |
| `BubbleChart` | point + size             | scatter + a size channel             |
| `BoxPlot`     | box                      | 5-number summary per category        |
| `ViolinPlot`  | violin                   | distribution per category w/ density |
| `Sparkline`   | line / bar / area (tiny) | inline KPI / table cell              |

See the [Charts demo](/app/chart) for a live, interactive
explorer — pick a type and tweak its aesthetics.

## Common props

The prebuilt shapes share most of their prop surface:

- `data` — your row array.
- `x` / `y` — field names for the axes.
- `fill` (Bar / Area / Box / Violin / Pie) or `color`
  (Line / Scatter / Bubble) — colour-group channel.
- `size` (Scatter / Bubble) — bubble radius field.
- `stat` — `identity` (default) or `sum` / `mean` / `count` /
  `min` / `max` for rollups.
- `legend`, `grid`, `tooltip` — display toggles.
- `width` / `height` — explicit dimensions (responsive otherwise).

## Aesthetics — colour, fill, pattern, position

Every geom shares one ggplot-style aesthetic surface. Most channels
take a **field name**, and the palette assigns one colour per distinct
value of that field:

- `fill` — interior colour-group (Bar / Area / Box / Violin / Pie).
- `color` — outline/stroke colour-group (Line / Scatter / Bubble).
  `fill` falls back to `color` when only one is set.
- `group` — sub-series field for stacking/dodging; defaults to
  `fill ?? color`.
- `pattern` — a field mapped to texture fills (hatch, dots…), so
  series read apart without relying on colour alone.
- `alpha` — a fixed opacity `0–1` for the whole geom.
- `position` (Bar / Area) — how grouped series sit together:
  `dodge` (default, side-by-side) · `stack` (stacked; the value axis
  grows to the column total) · `fill` (stacked and normalised to 100%
  — read share, not totals) · `identity` (overlaid on a shared
  baseline).
- `orientation` (Bar) — `vertical` (default) or `horizontal`.

A **literal** colour — `var(--token)`, `oklch(…)`, `#hex` or
`currentColor` — is painted as the exact fill/stroke instead of being
read as a field, so a geom can be coloured straight from a design token
(`fill="var(--accent)"`).

```svelte
<PlotChart {data} width={640} height={360} legend>
  <!-- colour-group by product, stack the series, texture each, 90% opacity -->
  <Plot.Bar x="quarter" y="revenue" fill="product" position="stack" pattern="product" alpha={0.9} />
</PlotChart>
```

Explore every channel interactively in the [Charts demo](/app/chart) —
switch chart type and tweak orientation, position, colour/fill, pattern
and opacity live.

## When to drop to `<PlotChart>`

For multiple geoms on one canvas (e.g. bar + line overlay),
custom aesthetics (jitter, ribbons), or faceted small multiples,
compose `<PlotChart>` with explicit `<Plot.Bar/>`, `<Plot.Line/>`
children:

```svelte
<PlotChart data={sales} width={600} height={300}>
  <Plot.Bar x="quarter" y="revenue" />
  <Plot.Line x="quarter" y="forecast" color="var(--accent)" />
</PlotChart>
```

## Faceted plots

`FacetPlot` wraps small-multiples — one mini-chart per
category, sharing axes:

```svelte
<FacetPlot data={mpg} x="displ" y="hwy" facet="class">
  <Plot.Point />
</FacetPlot>
```

## Animated transitions

`AnimatedPlot` cross-fades between data snapshots — pass an
`active` snapshot id, swap the data, and the geoms tween
smoothly between states.

## Crossfilter

For linked dashboards where brushing one chart filters the
others, wrap multiple plots in `CrossFilter`. Each plot's data
flows through the shared filter state automatically.

## Theming charts

Chart colours come from a **preset** — a list of palette roles
that follows the active skin and light/dark mode. Override it
with `createChartPreset` and wrap a subtree in `ChartProvider`:

```svelte
<script>
  import { ChartProvider, createChartPreset, BarChart } from '@rokkit/chart'
  const preset = createChartPreset({ colors: ['rose', 'amber', 'teal'] })
</script>

<ChartProvider {preset}>
  <BarChart {data} x="quarter" y="revenue" fill="product" />
</ChartProvider>
```

Or colour a single geom straight from a design token with a
literal `fill`/`color` (see the Aesthetics section above).

## In Markdown

Use `PlotPlugin` from `@rokkit/blocks` to embed live charts in
prose via fenced `plot` code blocks:

```markdown
\`\`\`plot
{ "data": [...], "x": "quarter", "y": "revenue", "geoms": [{"type": "bar"}] }
\`\`\`
```

See the [AI Chatbots guide](/guides/ai-chatbots) for how this
plays with LLM responses.

## Live gallery

The blocks below are **real components**, rendered from fenced code blocks by the
same `@rokkit/blocks` plugin system the chat demo uses — no screenshots, no
iframes. Everything is authored as JSON in a ` ```sparkline ` or ` ```plot `
fence and rendered client-side.

### Sparklines

Word-sized ` ```sparkline ` blocks — line, area and bar, with baselines, markers
and trend overlays.

A plain line, and a smooth line marking its latest point:

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "line", "width": 160, "height": 40 }
```

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "line", "curve": "smooth", "highlight": ["last"], "width": 160, "height": 40 }
```

An area with the min, max and last points called out:

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "area", "highlight": ["min", "max", "last"], "width": 200, "height": 44 }
```

Bars over a mixed-sign series, anchored to a zero baseline:

```sparkline
{ "data": [12, -8, 23, -17, 34, 56, -9, 41], "type": "bar", "baseline": 0, "width": 200, "height": 44 }
```

A line with a linear trend overlay, and an accent-coloured area with a mean line:

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "line", "trend": "linear", "width": 200, "height": 44 }
```

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "area", "color": "accent", "trend": "avg", "width": 200, "height": 44 }
```

### Charts

Full ` ```plot ` blocks — the same `PlotSpec` you'd pass to `<PlotChart>`,
rendered live. Each carries an explicit `width`/`height` so the gallery lays out
predictably.

A single-series bar chart:

```plot
{ "data": [{ "quarter": "Q1", "revenue": 120 }, { "quarter": "Q2", "revenue": 180 }, { "quarter": "Q3", "revenue": 160 }, { "quarter": "Q4", "revenue": 210 }], "x": "quarter", "y": "revenue", "width": 520, "height": 300, "geoms": [{ "type": "bar" }] }
```

Grouped bars with a colour-mapped series and a legend:

```plot
{ "data": [{ "quarter": "Q1", "product": "A", "revenue": 80 }, { "quarter": "Q1", "product": "B", "revenue": 40 }, { "quarter": "Q2", "product": "A", "revenue": 110 }, { "quarter": "Q2", "product": "B", "revenue": 70 }, { "quarter": "Q3", "product": "A", "revenue": 90 }, { "quarter": "Q3", "product": "B", "revenue": 70 }, { "quarter": "Q4", "product": "A", "revenue": 130 }, { "quarter": "Q4", "product": "B", "revenue": 80 }], "x": "quarter", "y": "revenue", "fill": "product", "legend": true, "width": 520, "height": 300, "geoms": [{ "type": "bar" }] }
```

The same six-month trend as a line, then as a filled area:

```plot
{ "data": [{ "month": "Jan", "users": 20 }, { "month": "Feb", "users": 28 }, { "month": "Mar", "users": 24 }, { "month": "Apr", "users": 36 }, { "month": "May", "users": 44 }, { "month": "Jun", "users": 52 }], "x": "month", "y": "users", "width": 520, "height": 300, "geoms": [{ "type": "line" }] }
```

```plot
{ "data": [{ "month": "Jan", "users": 20 }, { "month": "Feb", "users": 28 }, { "month": "Mar", "users": 24 }, { "month": "Apr", "users": 36 }, { "month": "May", "users": 44 }, { "month": "Jun", "users": 52 }], "x": "month", "y": "users", "width": 520, "height": 300, "geoms": [{ "type": "area" }] }
```

A scatter plot:

```plot
{ "data": [{ "x": 1, "y": 2 }, { "x": 2, "y": 5 }, { "x": 3, "y": 4 }, { "x": 4, "y": 8 }, { "x": 5, "y": 7 }, { "x": 6, "y": 11 }], "x": "x", "y": "y", "width": 520, "height": 300, "geoms": [{ "type": "point" }] }
```

Two geoms on one canvas — bars with a forecast line overlaid:

```plot
{ "data": [{ "quarter": "Q1", "revenue": 120, "forecast": 130 }, { "quarter": "Q2", "revenue": 180, "forecast": 170 }, { "quarter": "Q3", "revenue": 160, "forecast": 175 }, { "quarter": "Q4", "revenue": 210, "forecast": 200 }], "x": "quarter", "y": "revenue", "width": 520, "height": 300, "geoms": [{ "type": "bar" }, { "type": "line", "y": "forecast", "color": "var(--accent)" }] }
```
