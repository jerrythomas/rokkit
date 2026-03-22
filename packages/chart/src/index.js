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

// Export utilities
export { ChartBrewer } from './lib/brewing/index.svelte.js'
export * from './lib/brewing/index.svelte.js'
