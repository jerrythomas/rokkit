import Root from './Plot/Root.svelte'
import Axis from './Plot/Axis.svelte'
import Bar from './Plot/Bar.svelte'
import Grid from './Plot/Grid.svelte'
import Legend from './Plot/Legend.svelte'
import Line from './Plot/Line.svelte'
import Area from './Plot/Area.svelte'
import Point from './Plot/Point.svelte'
import Arc from './Plot/Arc.svelte'

// Export components
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

// Export standalone components
export { default as Chart } from './Chart.svelte'
export { default as Sparkline } from './Sparkline.svelte'
export { default as BarChart } from './charts/BarChart.svelte'
export { default as LineChart } from './charts/LineChart.svelte'
export { default as AreaChart } from './charts/AreaChart.svelte'
export { default as PieChart } from './charts/PieChart.svelte'
export { default as ScatterPlot } from './charts/ScatterPlot.svelte'

// Export utilities
export { ChartBrewer } from './lib/brewing/index.svelte.js'
export * from './lib/brewing/index.svelte.js'
