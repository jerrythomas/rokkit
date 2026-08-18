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
