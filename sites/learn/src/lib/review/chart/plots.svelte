<script>
	import {
		Chart,
		Grid,
		Axis,
		BoxPlot,
		ViolinPlot,
		ScatterPlot
	} from '@rokkit/chart'
	import { data } from './data'
	import ChartControls from './ChartControls.svelte'

	let theme = {
		grid: {
			thickness: 0.2,
			stroke: 'currentColor',
			opacity: 1,
			dasharray: '1 3'
		},
		tick: {
			size: { inner: 6, outer: 6, padding: 3 },
			x: { orient: 'bottom' },
			y: { orient: 'left' }
		},
		background: 'bg-gray-50'
	}

	let params = {
		width: 600,
		height: 400,
		margin: {
			left: 50,
			top: 20,
			right: 30,
			bottom: 30
		},
		ticks: {
			y: { count: 5 }
		}
	}

	let fields = {
		x: 'Species',
		y: 'Sepal_Length',
		fill: 'Species'
	}
</script>

<div class="h-full flex flex-row">
	<content class="flex-grow px-8">
		<h1>Plots</h1>
		<div class="natural-light flex flex-col items-center p-4">
			<Chart {theme} {params} {fields} {data}>
				<Grid />
				<Axis orient="bottom" />
				<Axis orient="left" />
				<BoxPlot />
				<ViolinPlot />
				<ScatterPlot offset={50} />
			</Chart>
		</div>
	</content>

	<ChartControls {data} />
</div>
