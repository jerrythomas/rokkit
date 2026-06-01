# Charts

`@rokkit/chart` is an SVG charting layer built on the same
field-mapped, data-first principles as the rest of Rokkit. It
ships nine prebuilt chart shapes for the common cases plus a
lower-level `<Plot>` you compose with explicit geoms when you
need something custom.

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

See the [Charts demo](/app/chart) for a live gallery.

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

## When to drop to `<Plot>`

For multiple geoms on one canvas (e.g. bar + line overlay),
custom aesthetics (jitter, ribbons), or faceted small multiples,
use `<Plot>` with explicit `<GeomBar/>`, `<GeomLine/>` children:

```svelte
<Plot data={sales} width={600} height={300}>
  <GeomBar x="quarter" y="revenue" />
  <GeomLine x="quarter" y="forecast" color="primary" />
</Plot>
```

## Faceted plots

`FacetPlot` wraps small-multiples — one mini-chart per
category, sharing axes:

```svelte
<FacetPlot data={mpg} x="displ" y="hwy" facet="class">
  <GeomPoint />
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

Chart colours map to the same semantic roles as the rest of
Rokkit (`--primary`, `--accent`, `--success`, …). Pass a custom
`palette` per chart to override per-instance:

```svelte
<BarChart {data} x="quarter" y="revenue"
  palette={['#b1170e', '#f57c00', '#fbc02d']} />
```

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
