---
name: charts-rokkit
description: Use when building, styling, customizing, or theming data visualizations with @rokkit/chart in a Svelte 5 app — the ggplot-style geom/aesthetic model (fill/color/pattern/group/size/symbol/alpha/position/orientation + literal-colour tokens), the PlotChart root + Plot.* geom namespace and prebuilt chart shapes, the spec API, and the preset system (colors/patterns/symbols via createChartPreset + ChartProvider, plus how to ADD a new colour palette, pattern, or symbol to the library).
---

# Charts — Rokkit (`@rokkit/chart`)

`@rokkit/chart` is an SVG charting layer with one rendering path: every chart resolves to a
reactive `PlotState` that a `PlotChart` renders. It follows ggplot2's grammar — you map **data
fields** to **aesthetic channels** on **geoms**, and a **preset** supplies the colours, patterns,
and symbols. There is no per-chart `palette` array prop; customization goes through the preset.

```text
data + channels (or spec)
   → PlotState  (scales, colorMap, patternMap, symbolMap, geom registry, selection, zoom)
   → PlotChart  (SVG: geoms + axes + grid + legend + tooltip + overlays)

preset (colors / patterns / symbols / shades / opacity)
   → assignColors / assignPatterns / assignSymbols  → the maps PlotState hands to geoms
```

Design reference: `docs/design/20-chart.md` (architecture) and `docs/design/22-chart-preset.md`
(preset system). Live explorer: `/app/chart` in the learn app.

---

## Three ways to render a chart

**1. Prebuilt shape** (declarative shorthand — one geom, named channels):

```svelte
<script>
  import { BarChart } from '@rokkit/chart'
</script>
<BarChart {data} x="quarter" y="revenue" fill="product" position="stack" legend />
```

Shapes: `BarChart`, `LineChart`, `AreaChart`, `PieChart`, `ScatterPlot`, `BubbleChart`, `BoxPlot`,
`ViolinPlot`, `Sparkline`.

**2. Compose geoms** under a `PlotChart` root (multi-geom overlays, custom encodings):

```svelte
<script>
  import { PlotChart, Plot } from '@rokkit/chart'
</script>
<PlotChart {data} width={640} height={360} legend>
  <Plot.Bar x="quarter" y="revenue" fill="product" position="dodge" />
  <Plot.Line x="quarter" y="forecast" color="var(--accent)" />
</PlotChart>
```

`Plot` is a **namespace object** (`Plot.Bar`, `Plot.Line`, …), not a component — the root is
`PlotChart`. Each member equals its `Geom*` export (`Plot.Bar === GeomBar`); use either. Full set:
`Bar`, `Line`, `Area`, `Point`, `Jitter`, `Arc`, `Box`, `Violin`, `Heatmap`, `Hexbin`,
`Candlestick`, `Waterfall`, `Ribbon`, `Rule`, plus overlays `Highlight` / `Trend`.

**3. Spec API** (full control from a plain object — same result as composition):

```svelte
<PlotChart {data} spec={{
  geoms: [
    { type: 'bar',  channels: { x: 'quarter', y: 'revenue', fill: 'product' }, stat: 'sum' },
    { type: 'line', channels: { x: 'quarter', y: 'forecast', color: 'class' } }
  ]
}} />
```

---

## Aesthetic channels

Map data fields to visual encodings. Most channels take a **field name**; the palette assigns one
value per distinct field value.

| Channel | Encoding | Applies to |
| --- | --- | --- |
| `x` / `y` | Position | all (Arc uses `theta`/`y` for the slice value) |
| `fill` | Interior colour-group (field) | Bar / Area / Box / Violin / Pie / Heatmap |
| `color` | Outline/stroke colour-group (field) | Line / Scatter / Bubble — `fill` falls back to `color` |
| `pattern` | Texture-fill (field) | Bar / Area / Box / Violin / Pie |
| `group` | Sub-series field for stack/dodge | Bar / Area (defaults to `fill ?? color`) |
| `size` | Point radius (field) | Point / Bubble |
| `symbol` | Point shape (field) | Point |
| `alpha` | Fixed opacity `0–1` (the single opacity knob) | all geoms |
| `position` | `dodge` (Bar default) · `stack` · `fill` (100%) · `identity` | Bar / Area |
| `orientation` | `vertical` (default) · `horizontal` | Bar |

**`position`** — `dodge` side-by-side, `stack` cumulative (axis grows to the total), `fill`
normalised to 100% (read share), `identity` overlaid. Supersedes the old boolean `stack` prop
(`stack` is a deprecated alias). Works under `orientation="horizontal"`.

**Literal colours** — a `fill`/`color` value that is a CSS colour (`var(--token)`, `oklch(…)`,
`#hex`, `currentColor`) is painted **directly** as the mark's fill/stroke instead of being read as
a field (no group-by, no palette lookup). Works on every geom — colour a series straight from a
design token:

```svelte
<Plot.Bar x="q" y="rev" fill="var(--primary)" />   <!-- one token-coloured series -->
<Plot.Line x="q" y="rev" color="oklch(60% 0.2 250)" />
```

---

## The preset — colours, patterns, symbols

Every categorical encoding is driven by a **preset** (`packages/chart/src/lib/preset.js`). The
`defaultPreset`:

```js
{
  colors:  ['blue','emerald','rose','amber','violet','sky','pink','teal', … 14 palette NAMES],
  shades:  { light: { fill: '300', stroke: '700' }, dark: { fill: '500', stroke: '200' } },
  opacity: { area: 0.6, box: 0.5, violin: 0.5, point: 0.8, … },  // per-geom default; `alpha` overrides
  patterns:['diagonal','dots','triangles', … 21 pattern NAMES],
  symbols: ['circle','square','triangle','diamond','cross','star']
}
```

Each list is **names into a registry**, cycled across your data's distinct values:

- `colors` → palette names in **`lib/palette.json`** (each name → 11 shades `50–950`).
  `assignColors(values, mode, preset)` picks `palette[name][shades[mode].fill|stroke]` — so a chart
  re-colours correctly for light/dark automatically.
- `patterns` → names in **`patterns/patterns.js`** (`PATTERNS`, the SVG mark defs).
- `symbols` → names in **`lib/brewing/marks/points.js`** (`SYMBOL_NAMES` ↔ `SYMBOL_TYPES`).

### Selecting / reordering a set at runtime (no library change)

Build a preset with `createChartPreset()` (deep-merges with the default — partial overrides work)
and share it via `ChartProvider`:

```svelte
<script>
  import { ChartProvider, createChartPreset, BarChart, LineChart } from '@rokkit/chart'
  const preset = createChartPreset({
    colors: ['teal', 'orange', 'rose'],   // subset/reorder of palette.json names
    patterns: ['dots', 'hatch'],
    shades: { dark: { fill: '400' } }      // partial shade override (merges)
  })
</script>

<ChartProvider {preset}>
  <BarChart … />
  <LineChart … />
</ChartProvider>
```

**There is no per-chart `preset` prop.** Preset resolution is context-only: `PlotState` reads the
`'chart-preset'` context, falling back to `defaultPreset`. To override for one chart or a subtree,
**nest another `<ChartProvider>`**. Separately, a **named** preset (`'default'` / `'accessible'` /
`'print'`, or one registered via `helpers.presets`) can be selected through `spec.preset`.

---

## Customization recipes

### Add a NEW colour palette

1. Add an 11-shade entry to `packages/chart/src/lib/palette.json` (shades `50`→`950`, light→dark):

   ```json
   "brand": { "50": "#f4f7ff", "100": "…", "300": "#93b4ff", "500": "#3b6cff",
              "700": "#1f45c8", "900": "#122a78", "950": "#0b1a4d" }
   ```

2. Reference the name in a preset's `colors` and provide it via `ChartProvider`:

   ```js
   createChartPreset({ colors: ['brand', 'emerald', 'rose'] })
   ```

   `shades[mode].fill|stroke` decides which stops become the fill/stroke per mode — pick shades
   that keep text/marks legible on the paper in both light and dark.

### Add a NEW pattern

1. Add an entry to `PATTERNS` in `packages/chart/src/patterns/patterns.js`. A pattern is an array
   of SVG marks in unit (0–1) tile coordinates (`DefinePatterns.svelte` renders them into
   `<defs>`):

   ```js
   crosshatch: [
     { type: 'line', x1: 0, y1: 0, x2: 1, y2: 1 },
     { type: 'line', x1: 1, y1: 0, x2: 0, y2: 1 }
   ]
   ```

2. Reference `'crosshatch'` in a preset's `patterns`, and set a geom's `pattern` channel to a field
   (or enable "Pattern fill" in the demo). Patterns are the accessibility/print fallback when
   colour alone is insufficient.

### Add a NEW symbol

1. In `packages/chart/src/lib/brewing/marks/points.js`, add a d3 symbol generator to `SYMBOL_TYPES`
   and its label to `SYMBOL_NAMES` **at the same index** (import the type from `d3-shape`, e.g.
   `symbolWye`):

   ```js
   const SYMBOL_TYPES = [symbolCircle, symbolSquare, …, symbolWye]
   const SYMBOL_NAMES = ['circle', 'square', …, 'wye']
   ```

2. Reference `'wye'` in a preset's `symbols`; set a Point/Scatter geom's `symbol` channel to a
   field to encode a category as shape.

### Theme the mark colours without changing data-grouping

Use a literal `fill`/`color` (design token) on the geom for a fixed colour, or override
`--chart-*` CSS variables for overlays/decorations (grid/trend/highlight/selected). Marks and
decorations expose `data-*` hooks: `[data-plot-geom="<type>"]`, `[data-plot-element]`
(`data-fill`/`data-group`), `[data-plot-grid-line]`, `[data-plot-trend]`, `[data-plot-highlight]`,
`[data-plot-selected]`.

---

## Stats, interaction, and extras

- **Stats** — `stat` aggregates rows sharing an x before rendering: `identity` (default), `sum`,
  `mean`, `min`, `max`, `count`, `median`. Box/violin use a quartile `box` stat. Register custom
  stats via `helpers.stats` (`{ p90: (values) => quantile(values, 0.9) }`).
- **Selection** — set `onselect`/`selectable` on `PlotChart` to make marks clickable +
  keyboard-activatable; `selected` is `$bindable`. Selected marks carry `data-plot-selected`.
- **Overlays** — `highlight` (mark first/last/min/max/index/predicate) and `trend` (mean/median/
  min/max/value or fitted linear/ma/ema/exp) render above the geoms without affecting scales.
- **Layout & motion** — `Sparkline` (inline, no axes), `FacetPlot` (small multiples by a facet
  field), `AnimatedPlot` (frame-based over a time field), `CrossFilter` (linked filtering),
  `ChartExporter` (SVG/PNG export).
- **Grid / zoom / tooltip** — `grid: boolean|'x'|'y'|'both'`, `zoom`, `tooltip` on the root.

---

## Gotchas

- The root is **`PlotChart`**, not `<Plot>` — `Plot` is the geom namespace object.
- **No `palette` prop and no per-chart `preset` prop** — customise via `createChartPreset` +
  `ChartProvider` (nest to scope), or `spec.preset` for named presets.
- `alpha` is the single opacity knob (a fixed `0–1` on the geom/root); it overrides the preset's
  per-geom `opacity` defaults. There is no `opacity` prop.
- `position="stack"` supersedes the boolean `stack` prop; grouping needs a `fill`/`color`/`group`
  field (a stack with no group field renders individual bars, not a stacked total).
- A literal colour on `fill`/`color` is applied directly — it is **not** a legend group.

## Verify

- Live: `/app/chart` — switch type and tweak orientation / position / colour / fill / pattern /
  opacity, and read the emitted `Plot.*` usage.
- Types + lint: `bun run check` (or `bun run lint`); chart unit tests: `bun run test:ci --project chart`.
