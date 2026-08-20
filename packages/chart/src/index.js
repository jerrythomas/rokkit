import Root from './Plot/Root.svelte'
import Axis from './Plot/Axis.svelte'
import Bar from './geoms/Bar.svelte'
import Grid from './Plot/Grid.svelte'
import Legend from './Plot/Legend.svelte'
import Line from './geoms/Line.svelte'
import Area from './geoms/Area.svelte'
import Point from './geoms/Point.svelte'
import Arc from './geoms/Arc.svelte'
import Highlight from './geoms/Highlight.svelte'
import Trend from './geoms/Trend.svelte'
import Box from './geoms/Box.svelte'
import Violin from './geoms/Violin.svelte'
import Jitter from './geoms/Jitter.svelte'
import Candlestick from './geoms/Candlestick.svelte'
import Heatmap from './geoms/Heatmap.svelte'
import Hexbin from './geoms/Hexbin.svelte'
import Ribbon from './geoms/Ribbon.svelte'
import Waterfall from './geoms/Waterfall.svelte'
import Rule from './geoms/Rule.svelte'

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
	Arc,
	Highlight,
	Trend,
	Box,
	Violin,
	Jitter,
	Candlestick,
	Heatmap,
	Hexbin,
	Ribbon,
	Waterfall,
	Rule
}

/** @deprecated Use Plot instead */
export const PlotLayers = Plot

// New Plot system
export { default as PlotChart } from './Plot.svelte'
export { default as ChartProvider } from './ChartProvider.svelte'
export { default as ChartLegend } from './ChartLegend.svelte'
export { default as ChartExporter } from './ChartExporter.svelte'
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
export { default as GeomHeatmap } from './geoms/Heatmap.svelte'
export { default as GeomCandlestick } from './geoms/Candlestick.svelte'
export { default as GeomWaterfall } from './geoms/Waterfall.svelte'
export { default as GeomHexbin } from './geoms/Hexbin.svelte'
export { default as GeomRibbon } from './geoms/Ribbon.svelte'
export { default as GeomHighlight } from './geoms/Highlight.svelte'
export { default as GeomTrend } from './geoms/Trend.svelte'
export { default as GeomJitter } from './geoms/Jitter.svelte'
export { default as GeomRule } from './geoms/Rule.svelte'

// Export standalone components
export { default as Chart } from './Chart.svelte'
export { default as Sparkline } from './Sparkline.svelte'
export { default as Spark } from './Spark.svelte'
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
export { SparkState, GEOM_CONTRACT } from './SparkState.svelte.js'

// Export utilities
export { buildSequentialScale, buildDivergingScale } from './lib/brewing/colors.js'

// CrossFilter system
export { createCrossFilter } from './crossfilter/createCrossFilter.svelte.js'
export { default as CrossFilter } from './crossfilter/CrossFilter.svelte'
export { default as FilterBar } from './crossfilter/FilterBar.svelte'
export { default as FilterSlider } from './crossfilter/FilterSlider.svelte'
export { default as FilterHistogram } from './crossfilter/FilterHistogram.svelte'
