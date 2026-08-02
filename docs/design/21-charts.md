# Chart System Design

**Status:** Complete
**Last updated:** 2026-03-27

This document covers the architecture of `@rokkit/chart`: the component hierarchy, rendering pipeline, aesthetic channels, geom types, stat system, color/palette system, animation, faceting, crossfilter, patterns, accessibility, and zoom.

---

## Component Hierarchy

There are three layers of chart components:

### Layer 1 — Primitives (`Plot`, `Sparkline`)

`Plot` is the core rendering primitive. It owns a `PlotState` instance, reads a `spec` or channel props, and renders geoms, axes, grid, legend, and tooltip.

`Sparkline` is a minimal inline chart with no axes, no grid, and no legend — designed for use inside table cells or small containers.

### Layer 2 — Wrappers

| Component | Purpose |
|-----------|---------|
| `Chart` | Thin wrapper that adds responsive `ResizeObserver` and forwards all props to `Plot` |
| `AnimatedPlot` | Frame-based animation over a `by` time field; renders `Plot` with a changing data slice + `Timeline` |
| `FacetPlot` | Splits data by a facet field and renders one `Plot` panel per group |
| `ChartProvider` | Svelte context provider for a shared `createChartPreset()` config |

### Layer 3 — Chart Types (Declarative Shorthand)

Pre-wired channel mappings for common chart shapes:

| Component | Geom | Key props |
|-----------|------|-----------|
| `BarChart` | bar | `x`, `y`, `color`, `fill`, `stack` |
| `LineChart` | line | `x`, `y`, `color` |
| `AreaChart` | area | `x`, `y`, `color`, `fill` |
| `ScatterPlot` | point | `x`, `y`, `size`, `color`, `symbol`, `jitter` |
| `BubbleChart` | point | `x`, `y`, `size`, `color` |
| `BoxPlot` | box | `x`, `y` |
| `ViolinPlot` | violin | `x`, `y` |
| `PieChart` | arc | `theta`, `color`, `fill`, `innerRadius` |

These are all thin wrappers over `Plot` with `spec` pre-built from their props.

---

## PlotState — Reactive Core

`PlotState` is a plain Svelte 5 class (not a component) that holds all chart state as `$state` and `$derived` fields. `Plot` creates one instance per render.

**Inputs it accepts:**

- `data` — raw array of objects
- `spec` — optional explicit spec object (see Spec API below)
- `channels` — `{ x, y, color, fill, pattern, symbol, size }` field names
- `width`, `height`, `margin` — dimensions
- `mode` — `'light'` | `'dark'`
- `chartPreset` — from `ChartProvider` context or `defaultPreset`

**Key derived state:**

- `orientation` — auto-detected from field types (`'vertical'` | `'horizontal'` | `'none'`)
- `xScale`, `yScale` — d3 scales built from data extents + field type inference
- `colorMap` — `Map<value, {fill, stroke}>` built by `assignColors()`
- `patternMap` — `Map<value, string>` built by `assignPatterns()`
- `symbolMap` — `Map<value, string>` built by `assignSymbols()`
- `hovered` — the currently hovered data row (for tooltip)
- `focusedKey` — used by keyboard navigation
- `zoomTransform` — current d3-zoom transform

---

## Aesthetic Channels

Channels map data fields to visual encodings. They follow ggplot2 conventions:

| Channel | Encoding | Geoms |
|---------|----------|-------|
| `x` | Horizontal position | All |
| `y` | Vertical position | All except Arc |
| `color` | Stroke/line color | Line, Box, Violin |
| `fill` | Fill color | Bar, Area, Point, Arc |
| `pattern` | SVG pattern fill | Bar, Area, Sparkline |
| `symbol` | Point shape | Point |
| `size` | Point radius | Point (BubbleChart) |

**Separation of `fill` and `color`:** These are independent aesthetics. `fill` maps to body/interior, `color` maps to stroke/border. Both can reference field names for auto-groupBy coloring, or CSS literal values (see Static Colors below).

### Static Color Literals

When a channel value is detected as a CSS color (hex, `rgb()`, `hsl()`, `oklch()`, etc.) rather than a field name, it is applied as-is without triggering group-by logic. Detection is done by `isLiteralColor()`.

```svelte
<Bar fill="#e66" />           <!-- static red fill -->
<Line color="oklch(60% 0.2 250)" />  <!-- static blue line -->
```

---

## Spec API vs. Declarative API

**Declarative API** — used by high-level chart components and most direct `Plot` usage:

```svelte
<Plot data={mpg} x="year" y="hwy" color="class" geom="line" />
```

**Spec API** — full control, used for multi-geom compositions:

```svelte
<Plot data={mpg} spec={{
  geoms: [
    { type: 'bar', channels: { x: 'year', y: 'hwy', fill: 'class' }, stat: 'mean' },
    { type: 'line', channels: { x: 'year', y: 'hwy', color: 'class' }, stat: 'mean' }
  ]
}} />
```

`helpers` prop provides custom stat functions, format functions, and tooltip renderers:

```js
helpers = {
  stats: { myAgg: (values) => values.reduce(...) },
  formats: { x: (v) => v.toFixed(2) },
  tooltip: (row) => `${row.name}: ${row.value}`
}
```

---

## Geom Types

Each geom is a Svelte component in `packages/chart/src/geoms/`:

| Geom | Component | Shape | Notes |
|------|-----------|-------|-------|
| `bar` | `Bar.svelte` | Rectangles | Auto-detects orientation; supports stacked and grouped |
| `line` | `Line.svelte` | Path | Connects ordered x values |
| `area` | `Area.svelte` | Filled path | `opacity` from preset |
| `point` | `Point.svelte` | Circle/symbol | `size` channel for bubble sizing; `jitter` for scatter |
| `arc` | `Arc.svelte` | Pie/donut slice | `theta` channel; `innerRadius` for donut |
| `box` | `Box.svelte` | Box-and-whisker | Quartile stats from `@rokkit/data` |
| `violin` | `Violin.svelte` | Density shape | Catmull-Rom curve over quartile anchors |

### Bar Orientation

BarChart auto-detects horizontal vs vertical: if `y` is categorical and `x` is numeric, the orientation is horizontal. `PlotState.orientation` drives how bars are built and how axes are assigned.

### Stacked / Grouped Bars

- `stack=true` → stacked bars via cumulative y offsets
- No `stack` + `fill` maps to a multi-value field → grouped bars via `buildGroupedBars()`
- No `fill` → single series, ungrouped

---

## Stat System

Stats aggregate raw data before rendering. Applied in `PlotState` via `applyGeomStat()`.

Built-in stats: `identity` (passthrough), `sum`, `mean`, `min`, `max`, `count`, `median`

Box/violin geoms use a special `box` stat that computes `q1`, `q2` (median), `q3`, `lower` (whisker), `upper` (whisker), and `outliers` — delegated to `@rokkit/data`.

Custom stats are registered via `helpers.stats`:

```js
helpers = {
  stats: {
    p90: (values) => quantile(values, 0.9)
  }
}
```

---

## Color / Palette System

### Palette

The master palette is `packages/chart/src/lib/palette.json` — a collection of named color palettes (blue, emerald, rose, amber, violet, etc.), each containing Tailwind-style shade entries (50–950).

### Preset

`defaultPreset` defines:

```js
{
  colors: ['blue', 'emerald', 'rose', 'amber', 'violet', ...],  // 14 palette names
  shades: {
    light: { fill: '300', stroke: '700' },
    dark:  { fill: '500', stroke: '200' }
  },
  opacity: { area: 0.6, box: 0.5, violin: 0.5, point: 0.8 },
  patterns: ['diagonal', 'dots', 'triangles', ...],             // 21 patterns
  symbols: ['circle', 'square', 'triangle', 'diamond', 'cross', 'star']
}
```

`assignColors(values, mode, preset)` maps each distinct value to `{ fill, stroke }` hex colors by indexing into `palette.json` at the preset's shade level for the current mode. This means the same chart automatically produces correct colors for both light and dark mode.

### ChartProvider Context

Wrap charts in `<ChartProvider preset={myPreset}>` to share a custom preset across an entire dashboard:

```svelte
<ChartProvider preset={createChartPreset({ colors: ['teal', 'orange'] })}>
  <BarChart ... />
  <LineChart ... />
</ChartProvider>
```

`Plot` reads the preset from the `'chart-preset'` Svelte context, falling back to `defaultPreset`.

---

## Pattern Fills

21 SVG patterns are available for color-insufficient contexts (print, colorblind accessibility).

Pattern shapes: `diagonal`, `dots`, `triangles`, `hatch`, `lattice`, `swell`, `checkerboard`, `waves`, `petals`, `brick`, `diamonds`, `tile`, `scales`, `circles`, `pip`, `rings`, `chevrons`, `shards`, `wedge`, `argyle`, `shell`

**How they work:**

1. `DefinePatterns.svelte` renders `<defs>` with all pattern SVG elements. It is auto-included inside `Plot`'s SVG.
2. `assignPatterns(values, preset)` maps each distinct value to a pattern name from the preset's `patterns` array.
3. Geoms (Bar, Area) read `patternMap` from `PlotState` and use `url(#pattern-name)` as the fill.
4. The `pattern` channel accepts a field name to enable automatic pattern assignment per series.

Sparkline has a dedicated `pattern` prop for single-series pattern fills.

---

## Animation (AnimatedPlot)

`AnimatedPlot` implements frame-based animation where each frame is a snapshot of a time dimension.

**Props:**

```
animate: { by: string, duration?: number, loop?: boolean }
tween: boolean     — smooth tweening between frames (default: true)
sorted: boolean    — sort x values within each frame
dynamicDomain: boolean — recalculate axes per-frame vs. fixed across all frames
label: boolean | string | fn — data labels on bars
```

**Pipeline:**

1. `extractFrames(data, by)` — groups data into a `Map<frameKey, rows[]>` preserving insertion order
2. `completeFrames(data, channels, by)` — fills missing (x, color) combinations with `y=0` so bars animate smoothly rather than disappearing
3. `applyGeomStat()` — pre-aggregates the completed data
4. `computeStaticDomains()` — computes global x/y extents across all frames (used when `dynamicDomain=false`)
5. Timeline advances frame index; `tweened()` from `svelte/motion` interpolates numeric y values between frames using `sineInOut` easing
6. Each tick, the active frame's data is passed to `Plot`

The `Timeline` component shows frame labels and current progress as an animated indicator.

---

## Faceting (FacetPlot)

`FacetPlot` splits data by a categorical field and renders one `Plot` panel per distinct value.

```svelte
<FacetPlot
  data={mpg}
  facet={{ by: 'drv', cols: 3, scales: 'fixed' }}
  x="displ" y="hwy" geom="point"
/>
```

**`scales` option:**

| Value | Behavior |
|-------|----------|
| `'fixed'` | All panels share the same x and y domains |
| `'free'` | Each panel has its own x and y domains |
| `'free_x'` | Shared y, per-panel x |
| `'free_y'` | Shared x, per-panel y |

`getFacetDomains()` pre-computes global min/max across all panels for `fixed` mode.

---

## CrossFilter

`CrossFilter` enables linked filtering across multiple charts. When a user interacts with one chart, all charts sharing the same crossfilter instance dim or hide non-matching rows.

```svelte
<CrossFilter mode="dim" bind:filters>
  <BarChart data={...} crossfilter />
  <FilterBar field="year" />
  <FilterSlider field="hwy" />
</CrossFilter>
```

**Mode:**

- `'dim'` — non-matching bars remain visible but reduced opacity
- `'hide'` — non-matching bars are removed

`CrossFilter` exposes its instance via Svelte context (`'crossfilter'`). Geoms read it to determine which rows pass the current filter state.

`createCrossFilter()` creates a standalone instance that can be passed externally (useful when the crossfilter needs to outlive the component tree).

---

## Accessibility

### Screen Reader Support

Every `Plot` renders:
- `<svg role="img" aria-label={title}>` wrapping element
- `<title>` and optional `<desc>` elements for screen reader announcement
- `summary` prop for a longer description

### Keyboard Navigation

Geoms (Bar, Point, Line) support the `keyboard` prop. When enabled:

- Each data point gets `tabindex=0`, `role="graphics-symbol"`, and `aria-label` with a formatted value string
- The `keyboardNav` Svelte action handles ArrowLeft/ArrowRight between sibling `[data-plot-element]` elements within the same `[data-plot-geom]` container
- Enter/Space fire the `onselect` callback (same as click)

### Click Selection

`onselect` prop on Bar, Point, Line, Arc fires with the row data object on click, Enter, or Space. When active, the cursor changes to pointer and elements get `role="button"`.

---

## Zoom and Pan

`zoom={true}` on `Plot` enables d3-zoom behavior on the SVG:

- Mouse wheel to zoom, drag to pan
- `applyZoom(transform)` / `resetZoom()` on `PlotState` rescale the x and y scales
- `PlotState.zoomTransform` holds the current `d3.ZoomTransform`
- Axes and grid re-render automatically as scales update

---

## File Reference

| Path | Purpose |
|------|---------|
| `packages/chart/src/Plot.svelte` | Core rendering primitive |
| `packages/chart/src/PlotState.svelte.js` | Reactive chart state (scales, color maps, geoms) |
| `packages/chart/src/Chart.svelte` | Responsive wrapper (ResizeObserver) |
| `packages/chart/src/AnimatedPlot.svelte` | Frame-based animation |
| `packages/chart/src/FacetPlot.svelte` | Small-multiples layout |
| `packages/chart/src/ChartProvider.svelte` | Preset context provider |
| `packages/chart/src/Sparkline.svelte` | Inline mini-chart |
| `packages/chart/src/charts/` | Declarative chart components (BarChart, LineChart, etc.) |
| `packages/chart/src/geoms/` | Geom Svelte components (Bar, Line, Area, Point, Arc, Box, Violin) |
| `packages/chart/src/crossfilter/` | CrossFilter, FilterBar, FilterSlider, createCrossFilter |
| `packages/chart/src/lib/preset.js` | defaultPreset, createChartPreset() |
| `packages/chart/src/lib/palette.json` | Master color palette (named colors → shades) |
| `packages/chart/src/lib/brewing/colors.js` | assignColors(), isLiteralColor() |
| `packages/chart/src/lib/brewing/patterns.js` | assignPatterns() |
| `packages/chart/src/lib/plot/stat.js` | resolveStat(), applyGeomStat() |
| `packages/chart/src/lib/plot/frames.js` | extractFrames(), completeFrames(), computeStaticDomains() |
| `packages/chart/src/lib/plot/scales.js` | inferFieldType(), buildUnifiedXScale/YScale() |
| `packages/chart/src/lib/keyboard-nav.js` | keyboardNav Svelte action |
| `packages/chart/src/patterns/DefinePatterns.svelte` | SVG pattern defs |
