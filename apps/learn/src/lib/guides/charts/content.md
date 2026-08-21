# Charts

`@rokkit/chart` is an SVG charting layer built on the same
field-mapped, data-first principles as the rest of Rokkit. It
ships ten prebuilt chart shapes for the common cases plus a
lower-level `<PlotChart>` you compose with explicit `Plot.*`
geoms when you need something custom.

## The ten prebuilt shapes

| Shape         | Geom                     | Use when…                            |
| ------------- | ------------------------ | ------------------------------------ |
| `BarChart`    | bar                      | categorical × numeric                |
| `LineChart`   | line                     | ordered numeric × numeric (trends)   |
| `AreaChart`   | area                     | LineChart with the area filled       |
| `PieChart`    | arc                      | parts of a whole (use sparingly)     |
| `RadarChart`  | radar                    | compare profiles across shared axes  |
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

Word-sized ` ```sparkline ` blocks. Each fence sets a `title`, so it renders as a
labelled card — line, area and bar with baselines, markers and trend overlays,
laid out as a wrapping row of equal-sized cards:

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "line", "width": 180, "height": 48, "title": "Line" }
```

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "line", "curve": "smooth", "highlight": ["last"], "width": 180, "height": 48, "title": "Smooth · last point" }
```

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "area", "highlight": ["min", "max", "last"], "width": 180, "height": 48, "title": "Area · min / max / last" }
```

```sparkline
{ "data": [12, -8, 23, -17, 34, 56, -9, 41], "type": "bar", "baseline": 0, "width": 180, "height": 48, "title": "Bars · zero baseline" }
```

```sparkline
{ "data": [12, -8, 23, -17, 34, 56, -9, 41], "type": "area", "baseline": 0, "width": 180, "height": 48, "title": "Area · fills above / below zero" }
```

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "line", "trend": "linear", "width": 180, "height": 48, "title": "Linear trend" }
```

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "area", "color": "accent", "trend": "avg", "width": 180, "height": 48, "title": "Mean trend" }
```

### Spark — composing sparklines from real geoms

`Sparkline` above is the convenient one-liner: a `type` prop picks line/area/bar and a
handful of flat props (`baseline`/`highlight`/`trend`) cover the common cases. Internally,
`Sparkline` is just a composition of `<Spark>` — the lean container — wrapping the SAME
`<Line>`/`<Area>`/`<Bar>`/`<Trend>`/`<Highlight>` geoms a full `<PlotChart>` uses. Reach for
`<Spark>` directly when a cell needs more than one geom's worth of aesthetics at once, or a
combination `Sparkline`'s flat prop surface doesn't cover:

```svelte
<Spark data={rows} x="day" y="sales" width={80} height={24}>
  <Line x="day" y="sales" />
  <Trend trend="avg" x="day" y="sales" />
</Spark>
```

Two things catch people out the first time:

- **Geoms need their own `x`/`y` — they do NOT inherit from `<Spark>`.** `GeomState.marks`
  reads a geom's own props only, never the container's. Set `x`/`y` on every geom you compose,
  even when they repeat the container's.
- **`baseline` does double duty.** It's read by `<Spark>` itself (not a geom prop): it extends
  the y-domain to include the anchor value AND draws a `[data-plot-baseline]` reference line —
  one prop, two effects, owned by the container because it applies to bar sparks too, not just
  area.

`pattern` on `<Spark>` takes a **literal pattern name** (e.g. `pattern="diagonal"`), not a field
— a spark is single-series, so there's no per-row value to assign a texture to, only "texture
this one fill."

`<Spark>` deliberately has **no axes, legend, or tooltip** — if you need those, drop to
`<PlotChart>` with chrome disabled (`axes={false} legend={false}`) instead of reaching for Spark.

The table below is the scenario `<Spark>` targets — a trend column where every row composes its
own `<Spark><Line/><Trend/></Spark>`, next to the equivalent `<Sparkline trend="avg">` one-liner
for the same series so the relationship is obvious: same pixels, two ways to get there.

```spark-table
{
  "title": "Weekly signups by team — composed from Spark + Line + Trend",
  "trend": "avg",
  "rows": [
    { "label": "Growth", "data": [4, 8, 5, 11, 7, 13, 9, 15] },
    { "label": "Platform", "data": [10, 9, 11, 8, 7, 6, 8, 9] },
    { "label": "Sales", "data": [3, 5, 4, 9, 12, 10, 14, 16] }
  ]
}
```

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "line", "trend": "avg", "width": 180, "height": 48, "title": "Same series, via <Sparkline trend=\"avg\">" }
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

A **4-quadrant** scatter — mixed-sign data makes the axes cross at the data origin (a BCG / risk matrix), placed by the shared coordinate layer:

```plot
{ "data": [{ "x": -4, "y": 3 }, { "x": 6, "y": 5 }, { "x": -3, "y": -2 }, { "x": 5, "y": -4 }, { "x": 2, "y": 6 }, { "x": -6, "y": -5 }], "x": "x", "y": "y", "width": 520, "height": 300, "geoms": [{ "type": "point" }] }
```

A **radar** comparing two profiles across five shared axes. Radar is polar, so it takes no cartesian grid or axes — it draws its own rings and spokes. Note `options.axes`: the axis order is an analytical choice (adjacent spokes read as related), so declare it rather than letting it fall out of row order.

```plot
{ "data": [{ "metric": "Speed", "score": 9, "team": "Model A" }, { "metric": "Comfort", "score": 4, "team": "Model A" }, { "metric": "Safety", "score": 6, "team": "Model A" }, { "metric": "Range", "score": 8, "team": "Model A" }, { "metric": "Value", "score": 5, "team": "Model A" }, { "metric": "Speed", "score": 5, "team": "Model B" }, { "metric": "Comfort", "score": 9, "team": "Model B" }, { "metric": "Safety", "score": 8, "team": "Model B" }, { "metric": "Range", "score": 4, "team": "Model B" }, { "metric": "Value", "score": 7, "team": "Model B" }], "x": "metric", "y": "score", "color": "team", "grid": false, "axes": false, "legend": true, "width": 520, "height": 360, "geoms": [{ "type": "radar", "options": { "grid": true, "axes": ["Speed", "Comfort", "Safety", "Range", "Value"] } }] }
```

Two things radar gets wrong if you let it. **Area exaggerates** — perceived area grows with the square of the radius, so a doubled value looks four times bigger; that is what `radiusScale: "sqrt"` is for, and why radar compares *shape*, not magnitudes read off the rings. And an **inferred domain is unstable** — adding or removing a series can change an axis's max, silently rescaling that spoke and reshaping every other series on it. Declare a `domain` per axis whenever the chart is compared across renders or over time.

Two geoms on one canvas — bars with a forecast line overlaid:

```plot
{ "data": [{ "quarter": "Q1", "revenue": 120, "forecast": 130 }, { "quarter": "Q2", "revenue": 180, "forecast": 170 }, { "quarter": "Q3", "revenue": 160, "forecast": 175 }, { "quarter": "Q4", "revenue": 210, "forecast": 200 }], "x": "quarter", "y": "revenue", "width": 520, "height": 300, "geoms": [{ "type": "bar" }, { "type": "line", "y": "forecast", "color": "var(--accent)" }] }
```

Small multiples with `FacetPlot` — one panel per drivetrain, points coloured by class:

```plot
{ "data": [{ "class": "compact", "drv": "f", "displ": 1.4, "hwy": 35 }, { "class": "compact", "drv": "r", "displ": 2.0, "hwy": 29 }, { "class": "midsize", "drv": "f", "displ": 2.0, "hwy": 30 }, { "class": "midsize", "drv": "4", "displ": 3.0, "hwy": 25 }, { "class": "suv", "drv": "4", "displ": 3.5, "hwy": 22 }, { "class": "suv", "drv": "r", "displ": 4.6, "hwy": 18 }, { "class": "pickup", "drv": "4", "displ": 5.0, "hwy": 17 }, { "class": "subcompact", "drv": "f", "displ": 1.4, "hwy": 38 }, { "class": "subcompact", "drv": "r", "displ": 2.0, "hwy": 28 }], "x": "displ", "y": "hwy", "color": "class", "facet": { "by": "drv", "cols": 3 }, "width": 520, "height": 300, "geoms": [{ "type": "point" }] }
```

An animated bar-race with `AnimatedPlot` — the bars tween across quarters:

```plot
{ "data": [{ "quarter": "Q1", "product": "Pro", "revenue": 80 }, { "quarter": "Q2", "product": "Pro", "revenue": 120 }, { "quarter": "Q3", "product": "Pro", "revenue": 110 }, { "quarter": "Q4", "product": "Pro", "revenue": 165 }, { "quarter": "Q1", "product": "Lite", "revenue": 40 }, { "quarter": "Q2", "product": "Lite", "revenue": 60 }, { "quarter": "Q3", "product": "Lite", "revenue": 50 }, { "quarter": "Q4", "product": "Lite", "revenue": 45 }], "x": "product", "y": "revenue", "animate": { "by": "quarter", "loop": true }, "width": 520, "height": 300, "geoms": [{ "type": "bar" }] }
```
