import Root from './Plot/Root.svelte'
import Axis from './Plot/Axis.svelte'
import Bar from './Plot/Bar.svelte'
import Grid from './Plot/Grid.svelte'
import Legend from './Plot/Legend.svelte'
import Line from './Plot/Line.svelte'
import Area from './Plot/Area.svelte'
import Point from './Plot/Point.svelte'
import Arc from './Plot/Arc.svelte'

// Composable Plot primitives — use as <Plot.Root>, <Plot.Axis>, <Plot.Bar>, etc.
export const Plot = {
	Root,
	Axis,
	Bar,
	Grid,
	Legend,
	Line,
	Area,
	Point,
	Arc
}

/** @deprecated Use Plot instead */
export const PlotLayers = Plot

// New Plot system
export { default as PlotChart } from './Plot.svelte'
export { default as ChartProvider } from './ChartProvider.svelte'
export { createChartPreset, defaultPreset } from './lib/preset.js'

// Facets and Animation
export { default as FacetPlot } from './FacetPlot.svelte'
export { default as AnimatedPlot } from './AnimatedPlot.svelte'

// Geom components (for declarative use inside PlotChart)
export { default as GeomBar } from './geoms/Bar.svelte'
export { default as GeomLine } from './geoms/Line.svelte'
export { default as GeomArea } from './geoms/Area.svelte'
export { default as GeomPoint } from './geoms/Point.svelte'
export { default as GeomArc } from './geoms/Arc.svelte'
export { default as GeomBox } from './geoms/Box.svelte'
export { default as GeomViolin } from './geoms/Violin.svelte'

// Export standalone components
export { default as Chart } from './Chart.svelte'
export { default as Sparkline } from './Sparkline.svelte'
export { default as BarChart } from './charts/BarChart.svelte'
export { default as LineChart } from './charts/LineChart.svelte'
export { default as AreaChart } from './charts/AreaChart.svelte'
export { default as PieChart } from './charts/PieChart.svelte'
export { default as ScatterPlot } from './charts/ScatterPlot.svelte'
export { default as BoxPlot } from './charts/BoxPlot.svelte'
export { default as ViolinPlot } from './charts/ViolinPlot.svelte'
export { default as BubbleChart } from './charts/BubbleChart.svelte'

// Export state and types
export { PlotState } from './PlotState.svelte.js'

// Export utilities
export { ChartBrewer } from './lib/brewing/index.svelte.js'
export * from './lib/brewing/index.svelte.js'
export { CartesianBrewer } from './lib/brewing/CartesianBrewer.svelte.js'
export { PieBrewer } from './lib/brewing/PieBrewer.svelte.js'
export { QuartileBrewer } from './lib/brewing/QuartileBrewer.svelte.js'
export { BoxBrewer } from './lib/brewing/BoxBrewer.svelte.js'
export { ViolinBrewer } from './lib/brewing/ViolinBrewer.svelte.js'

// CrossFilter system
export { createCrossFilter } from './crossfilter/createCrossFilter.svelte.js'
export { default as CrossFilter } from './crossfilter/CrossFilter.svelte'
export { default as FilterBar } from './crossfilter/FilterBar.svelte'
export { default as FilterSlider } from './crossfilter/FilterSlider.svelte'
export { default as FilterHistogram } from './crossfilter/FilterHistogram.svelte'
