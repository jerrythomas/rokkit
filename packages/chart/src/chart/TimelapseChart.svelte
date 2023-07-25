<script>
	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { slidingWindow, uniques, brewer } from '../lib'

	import Grid from './AxisGrid.svelte'
	import Axis from './Axis.svelte'
	import BoxPlot from '../plots/BoxPlot.svelte'
	import ViolinPlot from '../plots/ViolinPlot.svelte'
	import ScatterPlot from '../plots/ScatterPlot.svelte'

	let chart = writable({})
	let axis
	setContext('chart', chart)

	export let data
	export let x
	export let y
	export let time
	export let theme

	export let current
	export let stages

	function base(data, x, y) {
		return {
			data,
			x,
			y,
			width: 800,
			height: 350,
			values: {
				x: uniques(data, x),
				y: uniques(data, y)
			}
		}
	}

	function sliceBy(data, attr, size, step, offset) {
		const values = uniques(data, attr)
		const groups = slidingWindow(values, size, step, offset).map((x) => ({
			...x,
			data: data.filter(
				(y) => y.Petal_Length >= x.lowerBound && y.Petal_Length < x.upperBound
			)
		}))

		return groups
	}

	function timed(data, x, y, time) {
		let chart = base(data, x, y)
		let temp = brewer().chart(data, x, y).use(theme).computeAxis()
		axis = temp.axis
		chart.data = sliceBy(chart.data, time, 3, 1)
		stages = chart.data.length - 1
		return chart
	}

	function switchChart(index) {
		let chart = {}
		if (index != null) {
			chart = brewer()
				.chart(phased.data[index].data, x, y)
				.use(theme)
				.computeAxis()
			chart.axis = axis
			// chart.margin = { left: 40, right: 10, top: 10, bottom: 30 }
		}
		return chart
	}
	let phased

	$: phased = timed(data, x, y, time)
	$: $chart = switchChart(current)


	// setup chart attributes that do not change over time
	// get scales for x & y
	// set margins

	// nest data by time attribute
	// set up sequence based on ascending values of time
	// set up the timer to switch between data values
	// On change set the context with new data set
	// Old data set needs exit animation, new data set needs entry animation
</script>

<svg viewBox="0 0 {phased.width} {phased.height}" class="chart flex">
	<Grid />
	<Axis orient="bottom" />
	<Axis orient="left" />
	<BoxPlot />
	<ViolinPlot />
	<ScatterPlot jitterWidth={50} offset={50} />
</svg>
