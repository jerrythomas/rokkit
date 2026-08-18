# Chart Package (`@rokkit/chart`)

> Design for `@rokkit/chart` — SVG data visualization: a ggplot-style geom/aesthetic model
> rendered from a reactive `PlotState`, with prebuilt chart shapes, faceting, animation,
> cross-filtering, sparklines, and SVG/raster export.
>
> Implements: `docs/requirements/020-chart.md`
>
> **Status:** Current. This is the single authoritative chart design doc; it supersedes and
> replaces the former `21-charts.md` (folded in) and the retired `ChartBrewer` architecture.

---

## Architecture Overview

One rendering path. Every chart — prebuilt shape, composed geoms, or sparkline — resolves to a
`PlotState` instance that a `PlotChart` renders as SVG. There is no separate "brewer" path.

```text
data + channels/spec
   → PlotState (reactive: scales, colorMap, patternMap, geom registry, selection, zoom)
   → PlotChart  (SVG: geoms + axes + grid + legend + tooltip + overlays)
```

The categorical color scale UNIONs the distinct values of every `color`/`fill` field across all
geoms on a plot, so multi-geom charts share one consistent legend and palette.

---

## Component Hierarchy

### Layer 1 — Primitives

- **`PlotChart`** (`Plot.svelte`) — the core rendering root. Owns a `PlotState`, reads a `spec` or
  channel props, renders geoms + axes + grid + legend + tooltip. Responsive width comes from
  `PlotSurface` (a `ResizeObserver`); `width`/`height` are fallbacks.
- **`Plot`** — a **namespace object** of geom components: `Plot.Bar`, `Plot.Line`, `Plot.Area`,
  `Plot.Point`, `Plot.Arc`, `Plot.Box`, `Plot.Violin`, `Plot.Heatmap`, `Plot.Hexbin`,
  `Plot.Candlestick`, `Plot.Waterfall`, `Plot.Ribbon`, `Plot.Rule`, `Plot.Highlight`, `Plot.Trend`,
  `Plot.Jitter`, plus `Plot.Root`/`Plot.Axis`/`Plot.Grid`/`Plot.Legend`. Each member is the same
  component as the `Geom*` export (`Plot.Bar === GeomBar`) — use either name.
- **`Sparkline`** — a minimal inline chart (no axes/grid/legend) for table cells and small containers.

> The root is `PlotChart`, not `<Plot>`. `Plot` is the geom namespace object; `<Plot …>` is not a
> component. `Chart` is a thin back-compat wrapper over `PlotChart` (a fluent `spec` → geoms).

### Layer 2 — Wrappers

| Component | Purpose |
| --- | --- |
| `Chart` | Back-compat wrapper mapping a fluent `ChartSpec` to `PlotChart` geoms |
| `AnimatedPlot` | Frame-based animation over a `by` time field; renders `PlotChart` with a changing slice + `Timeline` |
| `FacetPlot` | Splits data by a facet field, one `PlotChart` panel per group |
| `ChartProvider` | Svelte context provider for a shared `createChartPreset()` config |
| `ChartExporter` | Toolbar + helpers to export the chart SVG to SVG/PNG |

### Layer 3 — Prebuilt Chart Shapes (declarative shorthand)

Thin wrappers over `PlotChart` with a `spec` pre-built from named channel props:

| Component | Geom | Key props |
| --- | --- | --- |
| `BarChart` | bar | `x`, `y`, `fill`, `color`, `position`, `orientation` |
| `LineChart` | line | `x`, `y`, `color` |
| `AreaChart` | area | `x`, `y`, `fill`, `color`, `position` |
| `ScatterPlot` | point | `x`, `y`, `size`, `color`, `symbol`, `jitter` |
| `BubbleChart` | point | `x`, `y`, `size`, `color` |
| `BoxPlot` | box | `x`, `y`, `fill` |
| `ViolinPlot` | violin | `x`, `y`, `fill` |
| `PieChart` | arc | `theta` (`y`), `fill`, `innerRadius` |
| `Sparkline` | line/bar/area (tiny) | `data`, `type`, `width`, `height` |

---

## PlotState — Reactive Core

`PlotState` is a plain Svelte 5 class (not a component) holding all chart state as `$state`/
`$derived`. `PlotChart` creates one instance per render; geoms `registerGeom()` into it.

**Inputs:** `data`, optional `spec`, `channels` (`{ x, y, color, fill, pattern, symbol, size }`),
`width`/`height`/`margin`, `mode` (`'light'|'dark'`), and `chartPreset` (from `ChartProvider`
context or `defaultPreset`).

**Key derived state:** `orientation` (auto-detected from field types), `xScale`/`yScale`,
`colorMap` (`Map<value,{fill,stroke}>` via `assignColors()`), `patternMap`, `symbolMap`,
`hovered` (tooltip), `focusedKey` (keyboard nav), `interactive` (selection hit-targets on/off),
a `SvelteSet` of selected rows, and `zoomTransform`.

---

## Aesthetic Channels

The geom aesthetic surface follows ggplot2 conventions. Most channels take a **field name** and the
palette assigns one value per distinct field value; `fill`/`color` also accept a literal colour.

| Channel | Encoding | Notes |
| --- | --- | --- |
| `x` / `y` | Position | `y` omitted for Arc (uses `theta`) |
| `fill` | Interior colour-group (field) | Bar / Area / Box / Violin / Pie / Heatmap |
| `color` | Outline/stroke colour-group (field) | Line / Scatter / Bubble; `fill` falls back to `color` |
| `pattern` | Texture-fill (field) | Bar / Area / Box / Violin / Pie |
| `group` | Sub-series field for stack/dodge | Defaults to `fill ?? color` |
| `size` | Point radius (field) | Point / Bubble |
| `symbol` | Point shape (field) | Point |
| `alpha` | Fixed opacity `0–1` | All geoms (overrides the preset default) |
| `position` | Multi-series arrangement | Bar / Area — see below |
| `orientation` | `vertical` (default) / `horizontal` | Bar |

### `position`

- `dodge` (Bar default) — grouped side-by-side.
- `stack` — cumulative; the value axis grows to the column total.
- `fill` — stacked then normalised to 100% (read share, not totals). Area default.
- `identity` — overlaid on a shared baseline.

`position` supersedes the old boolean `stack` prop (`stack: true` remains a deprecated alias for
`position="stack"`). Stacked/`fill` bars transpose correctly under `orientation="horizontal"`.

### Literal colours (`#146`)

When a `fill`/`color` value is a CSS literal — `var(--token)`, `oklch(…)`, `#hex`, `currentColor` —
it is painted directly as the mark's fill/stroke instead of being read as a field (no group-by, no
palette lookup). Detected by `isLiteralColor()`; applied uniformly across **all** geoms (Bar,
Line, Area, Point, Jitter, Arc, Box, Violin, Heatmap, Ribbon) via `literalColor()` + `markEntry()`
in `lib/brewing/colors.js`. This lets a geom be coloured straight from a design token.

```svelte
<Plot.Bar fill="#e66" />                <!-- literal fill -->
<Plot.Line color="var(--accent)" />     <!-- literal stroke from a token -->
```

---

## Composition APIs

**Declarative** — a prebuilt shape (one geom, named channels):

```svelte
<LineChart data={mpg} x="year" y="hwy" color="class" />
```

**Component composition** — a `PlotChart` root with explicit `Plot.*` children (multi-geom overlays):

```svelte
<PlotChart data={mpg}>
  <Plot.Bar x="year" y="hwy" fill="class" stat="mean" />
  <Plot.Line x="year" y="hwy" color="class" stat="mean" />
</PlotChart>
```

**Spec API** — full control from a plain object, same result:

```svelte
<PlotChart data={mpg} spec={{
  geoms: [
    { type: 'bar', channels: { x: 'year', y: 'hwy', fill: 'class' }, stat: 'mean' },
    { type: 'line', channels: { x: 'year', y: 'hwy', color: 'class' }, stat: 'mean' }
  ]
}} />
```

A `helpers` prop supplies custom stat functions, format functions, and tooltip renderers
(`{ stats, formats, tooltip }`).

---

## Geom Types

Each geom is a Svelte component in `packages/chart/src/geoms/`, registered into `PlotState` and
exposed both as `Plot.<Name>` and `Geom<Name>`.

| Geom | Component | Shape |
| --- | --- | --- |
| `bar` | `Bar.svelte` | Rectangles — orientation-aware; dodge/stack/fill/identity |
| `line` | `Line.svelte` | Path over ordered x (null y = gap) |
| `area` | `Area.svelte` | Filled path; stack/fill/identity |
| `point` | `Point.svelte` | Circle/symbol; `size` for bubbles |
| `jitter` | `Jitter.svelte` | Jittered/beeswarm points within a band |
| `arc` | `Arc.svelte` | Pie/donut slice (`theta`, `innerRadius`) |
| `box` | `Box.svelte` | Box-and-whisker (quartile stat) |
| `violin` | `Violin.svelte` | Density shape (Catmull-Rom over quartile anchors) |
| `heatmap` | `Heatmap.svelte` | Grid cells; sequential/categorical colour |
| `hexbin` | `Hexbin.svelte` | Hex density bins |
| `candlestick` | `Candlestick.svelte` | OHLC financial bars |
| `waterfall` | `Waterfall.svelte` | Running-total bars (y-domain spans the cumulative range) |
| `ribbon` | `Ribbon.svelte` | Sankey-style flow links + node boxes |
| `rule` | `Rule.svelte` | Reference line(s) at fixed `y` value(s); `stroke`/`strokeWidth`/`label` |

Overlays that render above the geoms without affecting scales: **`Highlight`** and **`Trend`**
(see below).

---

## Overlays — Highlight & Trend

Pure overlays that read `data` + `xScale`/`yScale` from `PlotState` and never `registerGeom` (no
effect on scale domains). Exposed as `Plot.Highlight`/`Plot.Trend` (aliases `GeomHighlight`/
`GeomTrend`); `PlotChart`, `AreaChart`, and `LineChart` forward the props.

- **`Highlight`** (`highlight` prop) — marks a specific observation:
  `'first' | 'last' | 'min' | 'max' | number(index) | (row,i)=>boolean` (a predicate matches many;
  `min`/`max` compare `y`). Logic in `lib/highlight.js` (`resolveHighlight`). Renders
  `<circle data-plot-highlight>` per match + optional `data-plot-highlight-label`. Themed via
  `[data-plot-highlight]` + `--chart-highlight-{color,radius,ring}` (default fill = accent).
- **`Trend`** (`trend` prop) — one or more computed trend/reference lines (single method or array).
  Calculators in `lib/trend.js` (`computeTrend`). **Constant** methods (`avg`/`mean`, `median`,
  `min`, `max`, `value`/fixed number) draw a horizontal line; **fitted** methods (`linear`,
  `{type:'ma',window}`, `ema`, `exp`) draw a per-x series. Degenerate inputs are skipped. Renders
  `<path data-plot-trend="<type>">`. Themed via `[data-plot-trend="<type>"]` +
  `--chart-trend-{color,width,dash,opacity}` (dashed by default).

---

## Stat System

Stats aggregate raw data before rendering, via `applyGeomStat()` in `PlotState`. Built-ins:
`identity` (passthrough), `sum`, `mean`, `min`, `max`, `count`, `median`. Box/violin use a `box`
stat (`q1`, `q2`/median, `q3`, whiskers, outliers) delegated to `@rokkit/data`. Custom stats
register via `helpers.stats` (e.g. `{ p90: (values) => quantile(values, 0.9) }`).

---

## Color / Palette / Preset

- **Palette** — `lib/palette.json`: named palettes (blue, emerald, rose, amber, violet, …), each
  with Tailwind-style shades (50–950).
- **Preset** — `defaultPreset` (`lib/preset.js`):

  ```js
  {
    colors: ['blue', 'emerald', 'rose', 'amber', 'violet', ...],   // 14 palette names
    shades: { light: { fill: '300', stroke: '700' }, dark: { fill: '500', stroke: '200' } },
    opacity: { area: 0.6, box: 0.5, violin: 0.5, point: 0.8 },      // per-geom default; alpha overrides
    patterns: ['diagonal', 'dots', 'triangles', ...],              // 21 patterns
    symbols: ['circle', 'square', 'triangle', 'diamond', 'cross', 'star']
  }
  ```

  `assignColors(values, mode, preset)` maps each distinct value to `{ fill, stroke }` at the
  preset's shade level for the current mode, so a chart re-colours correctly for light/dark.

- **ChartProvider** — wrap a subtree to share a custom preset:

  ```svelte
  <ChartProvider preset={createChartPreset({ colors: ['teal', 'orange'] })}>
    <BarChart ... />
    <LineChart ... />
  </ChartProvider>
  ```

  `PlotState` reads the preset from the `'chart-preset'` context, falling back to `defaultPreset`.
  (`ChartProvider` replaced the retired `ChartBrewer` class; the palette/pattern helpers now live
  in `lib/brewing/`.)

---

## Pattern Fills

21 SVG patterns for colour-insufficient contexts (print, colourblind): `diagonal`, `dots`,
`triangles`, `hatch`, `lattice`, `swell`, `checkerboard`, `waves`, `petals`, `brick`, `diamonds`,
`tile`, `scales`, `circles`, `pip`, `rings`, `chevrons`, `shards`, `wedge`, `argyle`, `shell`.

`DefinePatterns.svelte` renders a `<defs>` block (auto-included in `PlotChart`);
`assignPatterns(values, preset)` maps each distinct value to a pattern name; geoms use
`url(#pattern-name)` as the fill. The `pattern` channel takes a field name for per-series
assignment. `Sparkline` has a dedicated single-series `pattern` prop.

---

## Interaction — Selection

Cartesian charts become interactive when a `PlotChart`-level `onselect` or `selectable` is set
(surfaced via `PlotState.interactive`, which turns on geom hit-targets). Line, Point, Bar, and Area
(per-vertex hit targets along the top edge) are then clickable and keyboard-activatable
(Enter/Space on a focused mark). Selection lives in `PlotState` as a `SvelteSet` keyed by **row
reference** (robust across multi-series and aggregated data).

- **`onselect(detail)`** — every observation click/activation; `detail =
  { datum, index, series, value, x, y, geom, event }` (`index` via `plotState.data.indexOf`).
- **`selectable`** — opt-in click-to-highlight; toggles the row in a multi-selection rendered via
  the Highlight overlay (a point that is both statically highlighted and selected renders as
  *selected*).
- **`selected`** — `$bindable` array (PlotState is the source of truth; shallow-equality guard
  avoids an effect loop). Forwarded through `AreaChart`/`LineChart`.

Theming: selected marks carry `data-plot-selected="true"` → `--chart-selected-{ring,ring-width,fill}`.
Overlay decorations that could sit above a data point (highlight dots, `[data-plot-axis-line]`) set
`pointer-events: none` so clicks reach the hit target beneath.

---

## Grid, Axes, Zoom

- **Grid** — `grid: boolean | 'x' | 'y' | 'both'`. `true` (default) is auto: horizontal (y) lines
  always; vertical (x) only for band/bar scales. `'both'`/`'x'` force vertical lines on
  continuous/time scales at x-tick positions; `'y'` horizontal-only; `false` off. Hooks:
  `[data-plot-grid-line="x"|"y"]` + `--chart-grid-{color,width,dash,opacity}`.
- **Zoom** — `zoom={true}` enables d3-zoom on the SVG (wheel to zoom, drag to pan). `applyZoom()`/
  `resetZoom()` on `PlotState` rescale x/y; axes/grid re-render as `zoomTransform` changes.

---

## Animation (AnimatedPlot)

Frame-based animation where each frame is a snapshot of a time dimension.

```text
animate: { by: string, duration?: number, loop?: boolean }
tween: boolean          — smooth tweening between frames (default true)
sorted: boolean         — sort x within each frame
dynamicDomain: boolean  — per-frame axes vs. fixed across all frames
label: boolean|string|fn — data labels
```

Pipeline: `extractFrames(data, by)` → `completeFrames()` (fills missing (x, colour) combos with
`y=0` so bars don't pop) → `applyGeomStat()` → `computeStaticDomains()` (for `dynamicDomain=false`)
→ `Timeline` advances the frame index while `tweened()` (`svelte/motion`, `sineInOut`) interpolates
numeric y between frames. `lib/plot/frames.js` holds the frame helpers.

---

## Faceting (FacetPlot)

Splits data by a categorical field, one `PlotChart` panel per distinct value.

```svelte
<FacetPlot data={mpg} x="displ" y="hwy" facet={{ by: 'drv', cols: 3, scales: 'fixed' }}>
  <Plot.Point />
</FacetPlot>
```

`scales`: `'fixed'` (shared x+y), `'free'` (per-panel x+y), `'free_x'`, `'free_y'`.
`getFacetDomains()` pre-computes global extents for `fixed`.

---

## CrossFilter

Linked filtering across charts sharing one crossfilter instance.

```svelte
<CrossFilter mode="dim" bind:filters>
  <BarChart data={...} crossfilter />
  <FilterBar field="year" />
  <FilterSlider field="hwy" />
</CrossFilter>
```

`mode`: `'dim'` (non-matching reduced opacity) or `'hide'`. The instance is shared via the
`'crossfilter'` context; `createCrossFilter()` makes a standalone instance that can outlive the
component tree. `FilterBar`, `FilterSlider`, and `FilterHistogram` are the filter controls.

---

## Accessibility

- **Screen reader** — each `PlotChart` renders `<svg role="img" aria-label={title}>` with `<title>`/
  `<desc>` and an optional `summary`.
- **Keyboard** — geoms with `keyboard` give each mark `tabindex=0`, `role="graphics-symbol"`, and a
  formatted `aria-label`; the `keyboardNav` action moves ArrowLeft/Right between sibling
  `[data-plot-element]` in the same `[data-plot-geom]`; Enter/Space fire `onselect`.
- **Dual-coding** — pattern fills let series read apart without relying on colour.

---

## Sparkline

`Sparkline` computes inline scales with no axes/grid/legend, for table cells or KPIs. `type`
selects `line` | `bar` | `area`; a dedicated `pattern` prop applies a single-series texture.

Enrichment props (all optional, additive):

- `highlight` — `'first'|'last'|'min'|'max'|<index>|<predicate>` or an array; draws
  `data-plot-highlight` markers (deduped when selectors overlap). Reuses the geom
  `resolveHighlight` util and `--chart-highlight-*` tokens.
- `trend` — `'avg'|'median'|'min'|'max'|'linear'|'ema'|'exp'|<number>|{type:'ma',window}` or an
  array; draws `data-plot-trend` line(s) via the geom `computeTrend` util and `--chart-trend-*`
  tokens.
- `baseline` — the value bars grow *from* (positive up, negative down), and a `data-plot-baseline`
  reference rule. For `type="bar"` with any negative value it **defaults to `0`** so negative
  sparkbars render correctly; all-positive bars with no baseline stay min-anchored. The y-domain
  extends to include the baseline; explicit `min`/`max` still win (if they exclude the baseline, the
  anchor may fall at the domain edge). For `line`/`area` the series fill still anchors to the bottom,
  but a `baseline` outside the data range extends the y-domain (rescaling the series), not just draws
  the rule.

---

## SVG / Raster Export (ChartExporter)

`ChartExporter` provides a toolbar and helpers to serialise the rendered chart SVG to a standalone
SVG file or rasterise to PNG (inlining computed styles so the export is self-contained). Animated
exports capture the current frame.

---

## Data-Attribute Contract (theming hooks)

Marks and decorations expose `data-*` hooks so themes style them without class coupling:
`[data-chart]` (root), `[data-plot-geom="<type>"]`, `[data-plot-element]` (a mark; carries
`data-fill`/`data-group` where relevant), `[data-plot-axis]`, `[data-plot-grid-line]`,
`[data-legend]`, `[data-plot-highlight]`, `[data-plot-trend]`, `[data-plot-selected]`.

---

## Interactive demo

The `/app/chart` route (apps/learn) is an interactive **chart explorer**: pick from 14 types
grouped by purpose (Comparison / Trend / Part-to-whole / Relationship / Distribution / Financial /
Flow / Reference) and tweak orientation, position, colour/fill, pattern and opacity live. Its
conversation uses the shared `$lib/chat` kit; controls live in the composer "tweak" details slab.

---

## File Reference

| Path | Purpose |
| --- | --- |
| `packages/chart/src/Plot.svelte` | `PlotChart` — core rendering root |
| `packages/chart/src/PlotState.svelte.js` | Reactive state (scales, colour maps, geom registry, selection, zoom) |
| `packages/chart/src/Chart.svelte` | Back-compat fluent-spec wrapper |
| `packages/chart/src/AnimatedPlot.svelte` | Frame-based animation |
| `packages/chart/src/FacetPlot.svelte` | Small-multiples layout |
| `packages/chart/src/ChartProvider.svelte` | Preset context provider |
| `packages/chart/src/ChartExporter.svelte` | SVG/PNG export |
| `packages/chart/src/Sparkline.svelte` | Inline mini-chart |
| `packages/chart/src/charts/` | Prebuilt shapes (BarChart, LineChart, …) |
| `packages/chart/src/geoms/` | Geom components (Bar, Line, Area, Point, Arc, Box, Violin, Heatmap, Hexbin, Candlestick, Waterfall, Ribbon, Rule, Highlight, Trend, Jitter) |
| `packages/chart/src/geoms/lib/` | Geom mark builders (bars, areas, …) |
| `packages/chart/src/crossfilter/` | CrossFilter, FilterBar, FilterSlider, FilterHistogram, createCrossFilter |
| `packages/chart/src/lib/preset.js` | `defaultPreset`, `createChartPreset()` |
| `packages/chart/src/lib/palette.json` | Master palette (named colours → shades) |
| `packages/chart/src/lib/brewing/colors.js` | `assignColors()`, `isLiteralColor()`, `literalColor()`, `markEntry()` |
| `packages/chart/src/lib/brewing/patterns.js` | `assignPatterns()` |
| `packages/chart/src/lib/plot/stat.js` | `resolveStat()`, `applyGeomStat()` |
| `packages/chart/src/lib/plot/frames.js` | `extractFrames()`, `completeFrames()`, `computeStaticDomains()` |
| `packages/chart/src/lib/plot/scales.js` | field-type inference, unified scale builders |
| `packages/chart/src/lib/keyboard-nav.js` | `keyboardNav` action |
| `packages/chart/src/patterns/DefinePatterns.svelte` | SVG pattern defs |

---

## Cross-References

- Requirements: `docs/requirements/020-chart.md`
- Preset system: `docs/design/22-chart-preset.md`
- Guide: `apps/learn/src/lib/guides/charts/content.md` (rendered at `/guides/charts`)
- LLM specs: `docs/llms/components/{plot-chart,chart,bar-chart,line-chart,area-chart,…}.txt`
