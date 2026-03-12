# @rokkit/chart

Data-driven D3 chart components for Svelte 5, inspired by the composable approach of [dc.js](https://dc-js.github.io/dc.js/).

## Install

```bash
bun add @rokkit/chart
# or
npm install @rokkit/chart
```

## Overview

`@rokkit/chart` provides composable SVG chart components built on D3. All components are placed inside `Plot.Root`, which manages shared state (scales, dimensions, color mapping) via Svelte context. Child components read from that context — you do not wire them together manually.

## Usage

### Basic bar chart

```svelte
<script>
  import { Plot } from '@rokkit/chart'

  const data = [
    { month: 'Jan', sales: 120, returns: 30 },
    { month: 'Feb', sales: 150, returns: 20 },
    { month: 'Mar', sales: 90,  returns: 40 }
  ]
</script>

<Plot.Root {data} width={600} height={400} fill="month">
  <Plot.Grid />
  <Plot.Axis type="x" field="month" label="Month" />
  <Plot.Axis type="y" field="sales" label="Sales" />
  <Plot.Bar x="month" y="sales" />
  <Plot.Legend />
</Plot.Root>
```

### Using `@rokkit/data` for preprocessing

```svelte
<script>
  import { Plot } from '@rokkit/chart'
  import { dataset } from '@rokkit/data'

  const raw = [
    { category: 'Electronics', name: 'A', revenue: 450 },
    { category: 'Clothing',    name: 'B', revenue: 320 },
    { category: 'Electronics', name: 'C', revenue: 620 }
  ]

  const data = dataset(raw)
    .groupBy('category')
    .summarize('name', { total: (vals) => vals.reduce((s, v) => s + v.revenue, 0) })
    .rollup()
</script>

<Plot.Root {data} fill="category" width={500} height={350}>
  <Plot.Axis type="x" field="category" />
  <Plot.Axis type="y" field="total" />
  <Plot.Bar x="category" y="total" />
  <Plot.Legend />
</Plot.Root>
```

### Using `ChartBrewer` for advanced control

`ChartBrewer` is the reactive state manager that `Plot.Root` uses internally. Use it directly when you need programmatic access to scales, axes, or legend state outside of the component tree.

```js
import { ChartBrewer, createScales, createBars } from '@rokkit/chart'

const brewer = new ChartBrewer({
  width: 600,
  height: 400,
  margin: { top: 20, right: 30, bottom: 40, left: 50 },
  padding: 0.2,
  animationDuration: 300
})

brewer.setData(data)
brewer.setFields({ x: 'month', y: 'sales', color: 'month' })
brewer.createScales()

const scales = brewer.getScales()
const dimensions = brewer.getDimensions()
```

## API

### Components (`Plot` namespace)

| Component | Description |
|-----------|-------------|
| `Plot.Root` | Chart container. Manages dimensions, scales, and context. |
| `Plot.Bar` | Bar series. Reads x/y fields and renders SVG rects. |
| `Plot.Axis` | X or Y axis with optional label and tick formatting. |
| `Plot.Grid` | Background grid lines derived from axis scales. |
| `Plot.Legend` | Color legend; clicking items filters the visible series. |

### `Plot.Root` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `array \| dataset` | `[]` | Chart data. Accepts a plain array or a `@rokkit/data` dataset object. |
| `width` | `number` | `600` | SVG width in pixels. |
| `height` | `number` | `400` | SVG height in pixels. |
| `margin` | `object` | `{top:20,right:30,bottom:40,left:50}` | Chart margins. |
| `fill` | `string` | `null` | Field name used for color mapping. |
| `responsive` | `boolean` | `true` | Resize with the container. |
| `animationDuration` | `number` | `300` | Transition duration in ms. |

### `Plot.Bar` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `x` | `string` | — | Field for x-axis values. |
| `y` | `string` | — | Field for y-axis values. |
| `fill` | `string` | — | Field for color mapping (overrides root). |
| `color` | `string` | `'#4682b4'` | Fallback bar color when no fill field is set. |
| `opacity` | `number` | `1` | Bar opacity. |
| `animationDuration` | `number` | `300` | Per-bar transition duration in ms. |
| `onClick` | `function` | `null` | Click handler; receives the data row. |

### `Plot.Axis` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'x' \| 'y'` | `'x'` | Axis orientation. |
| `field` | `string` | — | Data field this axis represents. |
| `label` | `string` | `''` | Axis label. |
| `ticks` | `number` | — | Suggested tick count. |
| `tickFormat` | `function` | — | D3 tick formatter. |
| `grid` | `boolean` | `false` | Render grid lines from this axis. |

### Utility functions

| Export | Description |
|--------|-------------|
| `createDimensions(width, height, margin)` | Compute chart area dimensions with margins |
| `createScales(data, fields, dimensions)` | Generate D3 band/linear scales |
| `createBars(data, scales, fields)` | Compute bar x/y/width/height attributes |
| `createGroupedBars(data, scales, fields)` | Compute grouped bar layout |
| `createLegend(data, colorScale)` | Build legend item array |
| `filterByLegend(data, activeItems)` | Filter data rows by active legend selection |
| `createXAxis(scale, options)` | Build D3 x-axis descriptor |
| `createYAxis(scale, options)` | Build D3 y-axis descriptor |
| `createGrid(scales, dimensions)` | Build grid line descriptors |

## Dependencies

- `d3-scale`, `d3-axis`, `d3-format`, `d3-selection`, `d3-array`, `d3-transition`, `d3-scale-chromatic`
- `@rokkit/core`, `@rokkit/data`, `@rokkit/states`

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
