# Chart System Design

> Date: 2026-03-22
> Issues: #99, #100, #101, #102, #103, #104, #105, #106, #107

---

## Overview

`@rokkit/chart` is a data-driven SVG chart library that follows the same field-mapping philosophy as the rest of Rokkit. Charts are configured by mapping data columns to visual channels (`x`, `y`, `color`, `pattern`, `fill`, `size`, `symbol`). A `ChartBrewer` assigns colors and patterns from a curated 21-color palette, computes D3 scales, and produces mark geometry. Charts can be used standalone or composed inside a shared `<Chart>` wrapper using a ggplot-style mutable builder API.

---

## Architecture

Three layers:

1. **Spec layer** — `ChartSpec` (mutable builder) and `chart()` factory function
2. **Brewer layer** — `ChartBrewer` (Svelte 5 reactive class): channel assignment, D3 scales, mark geometry
3. **Render layer** — `Chart.svelte` wrapper + individual chart components + `Plot.*` primitives

```
chart(data).aes({ x, y, color }).bar().legend()
     ↓ ChartSpec
Chart.svelte → ChartBrewer context → BarChart / LineChart / Plot.Bar / ...
```

---

## Builder API

Mutable builder — each method mutates and returns `this`:

```javascript
import { chart } from '@rokkit/chart'

// Method chaining
const spec = chart(data)
  .x('date')
  .y('revenue')
  .color('region')
  .bar()
  .line({ data: targets, y: 'target' })
  .grid()
  .legend()

// aes() shorthand for multiple channels
const spec = chart(data)
  .aes({ x: 'date', y: 'revenue', color: 'region' })
  .bar()
  .legend()
```

### ChartSpec internals

```javascript
class ChartSpec {
  data = []
  channels = {}      // x, y, color, pattern, fill, size, label, symbol
  layers = []        // [{ type, data?, channels?, options? }]
  options = {}       // grid, legend, axis_x, axis_y, width, height, responsive

  x(f)      { this.channels.x = f;     return this }
  y(f)      { this.channels.y = f;     return this }
  color(f)  { this.channels.color = f; return this }
  pattern(f){ this.channels.pattern = f; return this }
  aes(ch)   { Object.assign(this.channels, ch); return this }

  bar(opts = {})   { this.layers.push({ type: 'bar',   ...opts }); return this }
  line(opts = {})  { this.layers.push({ type: 'line',  ...opts }); return this }
  area(opts = {})  { this.layers.push({ type: 'area',  ...opts }); return this }
  arc(opts = {})   { this.layers.push({ type: 'arc',   ...opts }); return this }
  point(opts = {}) { this.layers.push({ type: 'point', ...opts }); return this }

  grid(opts = {})       { this.options.grid = opts;     return this }
  legend(opts = {})     { this.options.legend = opts;   return this }
  axis(type, opts = {}) { this.options[`axis_${type}`] = opts; return this }
  size(w, h)            { this.options.width = w; this.options.height = h; return this }
}

export function chart(data, channels = {}) {
  return new ChartSpec(data).aes(channels)
}
```

### Layer data override

Each layer can carry its own `data` and channel overrides, merged with the parent spec. Overriding `data` in a layer inherits parent scales unless that layer's channel domain exceeds the parent's — in which case scales are extended to fit.

```javascript
chart(sales).aes({ x: 'date', y: 'actual' })
  .bar()
  .line({ data: forecast, y: 'forecast' })  // same xScale, y extended to include forecast range
```

---

## Usage Modes

### Standalone component (no wrapper)

```svelte
<BarChart data={sales} x="category" y="revenue" color="region" />
```

Each standalone chart creates its own `ChartBrewer` instance.

### Declarative composition (shared wrapper)

```svelte
<Chart data={sales} x="date" y="revenue" color="region">
  <BarChart />
  <LineChart data={targets} y="target" />
  <Plot.Grid />
  <Plot.Legend />
</Chart>
```

### Programmatic spec

```svelte
<Chart {spec} />
```

The declarative form generates the same internal `ChartSpec` as the builder. `<Chart>` accepts either `spec=` or children — not both.

---

## ChartBrewer

Svelte 5 reactive class. Lives in context when inside `<Chart>`, created locally for standalone components.

```javascript
// Shared context pattern
// Chart.svelte:
const brewer = new ChartBrewer()
setContext('chart-brewer', brewer)

// BarChart.svelte:
const brewer = getContext('chart-brewer') ?? new ChartBrewer()
```

### Responsibilities

1. Extract distinct values per channel from data
2. Assign colors from `palette.json` (21 curated chart-safe colors), cycling if more than 21 series
3. Assign patterns in distinctness order: Dots → CrossHatch → Waves → Brick → Triangles → Circles → Tile → OutlineCircles → CurvedWave
4. Compute D3 scales: `xScale` (band or time/linear), `yScale` (linear), `sizeScale` (sqrt for bubbles)
5. Expose computed mark geometry: `bars`, `lines`, `areas`, `arcs`, `points`

### Color assignment

```javascript
// palette.json — 21 colors, each with light + dark mode shades
// { name: 'blue', shades: { light: { fill: '#93c5fd', stroke: '#1d4ed8' }, dark: { fill: '#3b82f6', stroke: '#93c5fd' } } }

#assignColors() {
  const values = distinct(this.#data, this.#channels.color)
  return new Map(values.map((v, i) => [v, palette[i % 21].shades[this.#mode]]))
}
```

`mode` (`'light' | 'dark'`) is read from a media query or explicit prop. Mark colors are applied as inline SVG `fill`/`stroke` attributes — not via theme CSS.

### Dual-coding

When `color` and `pattern` reference the same field, each distinct value gets both a color and a pattern. ChartBrewer detects this and produces combined assignments.

---

## SVG Utility Classes (Prerequisite)

Add `stroke-{role}-z{n}` and `fill-{role}-z{n}` utilities to `site/uno.config.js`, following the same generation pattern as existing `text-*-z*`, `bg-*-z*`, `border-*-z*` shortcuts.

Roles: `surface`, `primary`, `secondary`, `accent`, `success`, `warning`, `danger`, `info`
Levels: z0–z10 (matching existing tone scale)

These are required for chart theme CSS to style axis lines, tick labels, and grid lines using palette tokens.

---

## Theme CSS

### Data attributes

```
[data-chart]               — root wrapper div (contains SVG)
[data-chart-canvas]        — inner plot area <g> (clipped to margins)
[data-chart-axis="x|y"]    — axis group
[data-chart-axis-line]     — axis baseline line
[data-chart-tick]          — tick group (line + label)
[data-chart-tick-label]    — tick text
[data-chart-grid]          — grid group
[data-chart-grid-line]     — individual grid line
[data-chart-legend]        — legend container
[data-chart-legend-item]   — legend row (swatch + label)
[data-chart-legend-swatch] — color/pattern preview box
[data-chart-bar]           — bar rect mark
[data-chart-line]          — line path mark
[data-chart-area]          — area path mark
[data-chart-point]         — scatter/bubble point mark
[data-chart-arc]           — pie/donut arc mark
[data-chart-label]         — in-chart data label text
[data-dimmed]              — applied to marks outside CrossFilter selection
```

### File locations

```
packages/themes/src/base/chart.css      — structure, typography, pointer-events
packages/themes/src/rokkit/chart.css    — visual: stroke/fill tokens, hover, dimmed
packages/themes/src/minimal/chart.css
packages/themes/src/material/chart.css
packages/themes/src/glass/chart.css
packages/themes/src/ant-design/chart.css
packages/themes/src/bits-ui/chart.css
packages/themes/src/carbon/chart.css
packages/themes/src/daisy-ui/chart.css
packages/themes/src/grada-ui/chart.css
packages/themes/src/shadcn/chart.css
```

### Example — rokkit theme

```css
[data-style='rokkit'] [data-chart-axis-line],
[data-style='rokkit'] [data-chart-tick] line {
  @apply stroke-surface-z4;
}
[data-style='rokkit'] [data-chart-tick-label] {
  @apply fill-surface-z6;
}
[data-style='rokkit'] [data-chart-grid-line] {
  @apply stroke-surface-z2;
  stroke-dasharray: 4 4;
}
[data-style='rokkit'] [data-chart-legend-item]:hover {
  @apply text-surface-z9;
}
[data-style='rokkit'] [data-chart-bar][data-dimmed],
[data-style='rokkit'] [data-chart-point][data-dimmed],
[data-style='rokkit'] [data-chart-arc][data-dimmed] {
  opacity: 0.15;
}
```

---

## Sparkline

Separate lightweight component — no ChartBrewer, no axes, no legend. Safe to embed inline in cards, table cells, list items.

```svelte
<Sparkline data={[12, 45, 23, 67, 34, 89]} />
<Sparkline data={rows} field="revenue" type="bar" color="danger" />
<Sparkline data={rows} field="value"   type="area" width={120} height={32} />
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `number[] \| object[]` | — | Series data |
| `field` | `string` | — | Field name if data is objects |
| `type` | `'line' \| 'bar' \| 'area'` | `'line'` | Chart type |
| `color` | `string` | `'primary'` | Semantic color role |
| `width` | `number` | `80` | SVG width |
| `height` | `number` | `24` | SVG height |
| `min` / `max` | `number` | auto | Y domain override |

Uses `--color-{role}-500` / `--color-{role}-300` CSS variables directly. No `data-chart-*` attributes — too small to theme individually.

---

## File Structure

```
packages/chart/src/
├── index.js                        — exports Chart, BarChart, LineChart,
│                                     AreaChart, PieChart, ScatterPlot,
│                                     Sparkline, Plot, chart()
├── Chart.svelte                    — wrapper: spec= or children
├── Sparkline.svelte                — lightweight inline chart
├── charts/
│   ├── BarChart.svelte
│   ├── LineChart.svelte
│   ├── AreaChart.svelte
│   ├── PieChart.svelte
│   └── ScatterPlot.svelte
├── spec/
│   └── chart-spec.js               — ChartSpec class + chart() factory
├── lib/
│   └── brewing/
│       ├── brewer.svelte.js        — ChartBrewer (replaces index.svelte.js)
│       ├── colors.js               — palette.json assignment
│       ├── patterns.js             — pattern order + assignment
│       ├── scales.js               — D3 scale builders
│       └── marks/
│           ├── bars.js
│           ├── lines.js
│           ├── areas.js
│           ├── arcs.js
│           └── points.js
├── Plot/                           — existing + new primitives
│   ├── Root.svelte                 — existing
│   ├── Axis.svelte                 — existing
│   ├── Bar.svelte                  — existing
│   ├── Grid.svelte                 — existing
│   ├── Legend.svelte               — existing
│   ├── Line.svelte                 — new
│   ├── Area.svelte                 — new
│   ├── Point.svelte                — new
│   └── Arc.svelte                  — new
└── patterns/ symbols/ template/    — existing, unchanged
```

---

## Build Order

| Step | Work | Issues |
|---|---|---|
| 0 | Add `stroke-*-z*` + `fill-*-z*` utilities to `uno.config.js` | prerequisite |
| 1 | `base/chart.css` + all 10 theme `chart.css` files | #99 |
| 2 | `ChartSpec` builder + `chart()` factory | #100 |
| 3 | `ChartBrewer` refactor (colors, patterns, scales, marks) | #100 |
| 4 | `Sparkline` component | #105 |
| 5 | `Plot.Line`, `Plot.Area`, `Plot.Point`, `Plot.Arc` | #107 |
| 6 | `Chart.svelte` wrapper (spec= + children modes) | #99 |
| 7 | `BarChart`, `LineChart`, `AreaChart`, `PieChart`, `ScatterPlot` | #99 |
| 8 | Playground page + learn docs | #99 |

---

## Out of Scope (separate issues)

- `AnimatedChart` + `TimelineControls` — #101
- `CrossFilter` — #102
- Accessibility (keyboard nav, sr table) — #103
- `ChartExporter` — #106
