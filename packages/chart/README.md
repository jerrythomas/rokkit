# @rokkit/chart

Data-driven chart components for Svelte inspired by [dc.js](https://dc-js.github.io/dc.js/docs/stock.html). This package combines the power of D3.js with the reactivity and component-based approach of Svelte.

## Installation

```bash
npm install @rokkit/chart
```

## Usage

The chart package provides a set of composable components that can be combined to create various chart types.

### Basic Bar Chart Example

```svelte
<script>
   import { Plot } from '@rokkit/chart'
   import { dataset } from '@rokkit/data'
   
   // Sample data
   const sampleData = [
     { model: 'Model A', name: 'Product 1', category: 'Electronics', count: 45 },
     { model: 'Model B', name: 'Product 2', category: 'Clothing', count: 32 },
     { model: 'Model C', name: 'Product 3', category: 'Electronics', count: 62 },
     // More data...
   ]
   
   // Use the dataset class to process the data
   let data = dataset(sampleData)
     .groupBy('model')
     .summarize('name', { count: values => values.length })
     .rollup()
</script>

<Plot.Root {data} width={600} height={400} margin={{ top: 20, right: 30, bottom: 40, left: 50 }}>
   <Plot.Grid direction="y" />
   <Plot.Axis type="x" field="model" label="Model" />
   <Plot.Axis type="y" field="count" label="Count" />
   <Plot.Bar x="model" y="count" fill="category" />
   <Plot.Legend title="Categories" />
</Plot.Root>
```

## Available Components

### Plot.Root

The container component for all charts.

**Props:**
- `data` - The dataset to visualize (array or dataset object)
- `width` - Width of the chart in pixels (default: 600)
- `height` - Height of the chart in pixels (default: 400)
- `margin` - Object with top, right, bottom, left margins (default: `{ top: 20, right: 30, bottom: 40, left: 50 }`)
- `fill` - Field to use for color mapping (optional)
- `responsive` - Whether to make the chart responsive (default: true)
- `animationDuration` - Duration of animations in milliseconds (default: 300)

### Plot.Axis

Renders an axis for the chart.

**Props:**
- `type` - Type of axis ('x' or 'y')
- `field` - Data field to use for this axis
- `label` - Axis label text
- `ticks` - Number of ticks to display (optional)
- `tickFormat` - Function to format tick labels (optional)
- `grid` - Whether to show grid lines (default: false)

### Plot.Bar

Renders a bar chart.

**Props:**
- `x` - Field to use for x-axis values
- `y` - Field to use for y-axis values
- `fill` - Field to use for coloring the bars (optional)
- `color` - Fixed color for bars if fill is not provided (default: "#4682b4")
- `opacity` - Opacity of the bars (default: 1)
- `animationDuration` - Duration of animations in milliseconds (default: 300)
- `onClick` - Callback for click events on bars (optional)

### Plot.Grid

Renders grid lines for the chart.

**Props:**
- `direction` - Direction of grid lines ('x', 'y', or 'both') (default: 'both')
- `xTicks` - Number of ticks for x-axis grid (optional)
- `yTicks` - Number of ticks for y-axis grid (optional)
- `color` - Color of grid lines (default: 'currentColor')
- `opacity` - Opacity of grid lines (default: 0.1)
- `lineStyle` - Line style for grid lines ('solid', 'dashed', 'dotted') (default: 'solid')

### Plot.Legend

Renders a legend for the chart.

**Props:**
- `title` - Title for the legend (optional)
- `align` - Alignment of the legend ('left', 'right', 'center') (default: 'right')
- `verticalAlign` - Vertical position of the legend ('top', 'bottom') (default: 'top')
- `shape` - Shape for legend items ('circle', 'rect') (default: 'rect')
- `markerSize` - Size of the legend markers (default: 10)
- `onClick` - Callback when a legend item is clicked (optional)

## Using with Rokkit Dataset Class

The chart components work seamlessly with the `@rokkit/data` package, allowing for powerful data transformations:

```svelte
<script>
   import { Plot } from '@rokkit/chart'
   import { dataset } from '@rokkit/data'
   
   let input = [
     // Your raw data here
   ]
   
   $: processedData = dataset(input)
     .groupBy('category')
     .summarize('name', { count: values => values.length, total: values => values.reduce((a, b) => a + b, 0) })
     .rollup()
</script>

<Plot.Root data={processedData} fill="category">
   <Plot.Axis type="x" field="category" />
   <Plot.Axis type="y" field="count" />
   <Plot.Bar x="category" y="count" />
</Plot.Root>
```

## Advanced Features

- Tooltips are automatically generated for data points
- Interactive legends for filtering data
- Responsive design by default
- Animated transitions when data changes
