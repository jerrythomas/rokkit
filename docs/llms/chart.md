# @rokkit/chart

> Data-driven chart components with D3 scales, axes, and SVG rendering.

## Position in Dependency Hierarchy
**Depends on**: @rokkit/core, @rokkit/data, @rokkit/states, d3-array, d3-axis, d3-scale, d3-scale-chromatic, d3-selection, d3-transition, ramda
**Note**: bits-ui listed as dependency but **never imported** — dead dependency to remove.

## Exports

### Components (Plot namespace)

| Export | Key Props | Description |
|--------|-----------|-------------|
| `Plot.Root` | data, width, height, margin, fill, responsive, animationDuration | Chart container with ChartBrewer management |
| `Plot.Axis` | type ('x'\|'y'), field, label, ticks, tickFormat, grid | SVG axis with ticks and labels |
| `Plot.Bar` | — | Bar chart visualization |
| `Plot.Grid` | — | Grid lines for chart background |
| `Plot.Legend` | — | Legend showing data series |

### ChartBrewer

Main class managing chart state and data preparation.

```javascript
const brewer = new ChartBrewer({ width: 800, height: 600, padding: 0.15 })
  .setData(dataArray)
  .setFields({ x: 'category', y: 'value', color: 'series' })
  .createScales()

const bars = brewer.createBars()
const xAxis = brewer.createXAxis({ tickCount: 5 })
```

### Functions

| Export | Signature | Description |
|--------|-----------|-------------|
| `createDimensions(w, h, margin)` | Creates chart dimensions with margins |
| `updateDimensions(dims, updates)` | Updates existing dimensions |
| `createScales(data, fields, dims, opts)` | Creates D3 scales for x, y, color |
| `createBars(data, fields, scales, dims)` | Generates bar positioning data |
| `createGroupedBars(...)` | Creates grouped bar data |
| `createXAxis(scales, dims, opts)` | Generates x-axis tick data |
| `createYAxis(scales, dims, opts)` | Generates y-axis tick data |
| `createGrid(scales, dims, opts)` | Generates grid line data |
| `createLegend(data, fields, scales, dims, opts)` | Generates legend data |
| `getOrigin(scales, dims)` | Gets origin coordinates |

## Key Patterns

### Responsive Chart

```svelte
<Plot.Root data={myData} width={600} height={400} responsive>
  <Plot.Axis type="x" field="category" label="Categories" />
  <Plot.Axis type="y" field="value" label="Values" />
  <Plot.Bar />
  <Plot.Legend />
</Plot.Root>
```

## Internal

| Module | What | Notes |
|--------|------|-------|
| `lib/brewing/` | Dimensions, scales, axes, bars, legends | Core chart computation |
| `lib/context.js` | Svelte context (key: 'chart-brewer') | Shares ChartBrewer with child components |
| `patterns/` | SVG fill patterns | CrossHatch, Waves, Dots, Brick, Triangles, etc. |
