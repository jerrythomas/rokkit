# Chart Component Requirements

> Requirements for the `@rokkit/chart` package.

## 1. Overview

The `@rokkit/chart` package provides data visualization components built on d3. Current exports: `Plot` (Root, Axis, Bar, Grid, Legend) and `ChartBrewer` for color schemes.

## 2. Current Architecture

```
Plot (composable namespace)
├── Plot.Root — SVG container with scales
├── Plot.Axis — X/Y axis rendering
├── Plot.Bar — Bar chart marks
├── Plot.Grid — Background grid
└── Plot.Legend — Chart legend

ChartBrewer — Color scheme utilities from d3-scale-chromatic
```

## 3. Animated Time Series

Support animated transitions showing data evolution over time:

```svelte
<script>
  import { AnimatedChart, BarChart } from '@rokkit/chart'

  const timeSeriesData = [
    { year: 2020, data: [...] },
    { year: 2021, data: [...] },
    { year: 2022, data: [...] }
  ]
</script>

<AnimatedChart
  data={timeSeriesData}
  timeField="year"
  duration={500}
  interpolate={true}
>
  <BarChart />
</AnimatedChart>
```

**Features**:
- Wrapper component handles animation
- Uses Svelte's tweened/spring for smooth transitions
- Extends array interpolation for object arrays
- Bars smoothly shift positions as values change

## 4. Accessible Chart Patterns

Support for color perception accessibility:

```svelte
<BarChart {data} accessible={true}>
  <!-- Uses patterns/textures instead of colors only -->
</BarChart>
```

**Implementation**:
- Symbol library for data points
- Texture library for filled areas (already has `@rokkit/chart` patterns: Brick, Circles, CrossHatch, CurvedWave, Dots, OutlineCircles, Tile, Triangles, Waves)
- Pattern fills for bars/areas
- Works alongside color for dual-coding

## 5. Dependencies

| Dependency | Purpose |
|-----------|---------|
| `d3-array` | Data manipulation |
| `d3-axis` | Axis rendering |
| `d3-scale` | Scale calculations |
| `d3-scale-chromatic` | Color schemes |
| `d3-selection` | DOM manipulation |
| `d3-transition` | Animations |
| `bits-ui` | Review — may not be needed |
| `ramda` | Review — trivial usage, should remove |

## 6. Gaps

1. No line chart, area chart, scatter plot, or pie chart marks
2. No animated time series wrapper
3. Heavy dependency set for 5 sub-components
4. `bits-ui` dependency may be unnecessary for charts
