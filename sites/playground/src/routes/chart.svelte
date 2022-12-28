<script>
	import { isEqual } from 'date-fns'
	import { timeFormat } from 'd3-time-format'

	import {
		Chart,
		Axis,
		AxisTicks,
		AxisLabels,
		AxisGrid,
		BarPlot,
		// LinePlot,
		// BoxPlot,
		// ViolinPlot,
		ScatterPlot
	} from '@rokkit/chart'
	export let data = []

	let width = 400
	let height = 400
	$: data = data.map((d) => ({ ...d, year: new Date(d.year) }))
	$: bars = data.filter((d) => isEqual(d.year, new Date('2015-01-01')))
</script>

<main class="flex flex-col gap-8 flex-wrap">
	<card class="flex flex-col aspect-square p-2 rounded-lg shadow-lg">
		<Chart
			{width}
			{height}
			data={bars}
			x="name"
			y="fired"
			marginLeft={30}
			marginBottom={60}
			spacing={0.02}
		>
			<Axis name="x" count={7} gap={10}>
				<AxisTicks side="bottom">
					<AxisLabels angle={-60} />
				</AxisTicks>
			</Axis>
			<Axis name="y" gap={10}>
				<AxisTicks side="left">
					<AxisLabels />
				</AxisTicks>
				<AxisGrid />
			</Axis>
			<BarPlot />
		</Chart>
	</card>
	<card class="flex flex-col aspect-square p-2 rounded-lg shadow-lg">
		<Chart
			{width}
			{height}
			data={bars}
			x="name"
			y="fired"
			marginLeft={10}
			marginBottom={10}
			spacing={0.1}
			flipCoords
		>
			<BarPlot labels />
			<Axis name="x" count={5}>
				<AxisTicks side="bottom"><AxisLabels /></AxisTicks>
				<AxisGrid />
			</Axis>
			<Axis name="y">
				<!-- <AxisTicks side="left"><AxisLabels /></AxisTicks> -->
			</Axis>
		</Chart>
	</card>
	<card class="flex flex-col p-2 rounded-lg shadow-lg">
		<Chart
			{data}
			x="year"
			y="fired"
			fill="name"
			{width}
			{height}
			marginLeft={20}
			marginBottom={8}
		>
			<Axis name="x">
				<AxisTicks side="bottom">
					<AxisLabels format={timeFormat('%Y')} />
				</AxisTicks>
			</Axis>
			<Axis name="y" count={6}>
				<AxisTicks side="left"><AxisLabels /></AxisTicks>
			</Axis>
			<ScatterPlot />
		</Chart>
	</card>
	<card class="flex flex-col p-2 rounded-lg shadow-lg">
		<Chart
			{data}
			x="year"
			y="fired"
			fill="name"
			{width}
			{height}
			marginLeft={20}
			marginBottom={8}
			flipCoords
		>
			<Axis name="x">
				<AxisTicks side="bottom"><AxisLabels /></AxisTicks>
			</Axis>
			<Axis name="y" count={6}>
				<AxisTicks side="left">
					<AxisLabels format={timeFormat('%Y')} />
				</AxisTicks>
			</Axis>
			<ScatterPlot />
		</Chart>
	</card>
	<!-- <card class="flex flex-col w-64 h-64 aspect-square p-4 rounded-lg shadow-lg">
		<Chart {width} {height} {data} x="year" y="age" color="name" marginLeft={10} marginBottom={8}>
			<Axis name="x">
				<AxisTicks side="bottom"><AxisLabels /></AxisTicks>
			</Axis>
			<Axis name="y" count={6}>
				<AxisTicks side="left"><AxisLabels /></AxisTicks>
			</Axis>
			<LinePlot />
		</Chart>
	</card>
	<card class="flex flex-col w-64 h-64 aspect-square p-4 rounded-lg shadow-lg">
		<Chart {width} {height} {data} x="year" y="age" color="name" marginLeft={10} marginBottom={8}>
			<Axis name="x">
				<AxisTicks side="bottom"><AxisLabels /></AxisTicks>
			</Axis>
			<Axis name="y" count={6}>
				<AxisTicks side="left"><AxisLabels /></AxisTicks>
			</Axis>
			<BoxPlot />
		</Chart>
	</card>
	<card class="flex flex-col w-64 h-64 aspect-square p-4 rounded-lg shadow-lg">
		<Chart {width} {height} {data} x="year" y="age" color="name" marginLeft={10} marginBottom={8}>
			<Axis name="x">
				<AxisTicks side="bottom"><AxisLabels /></AxisTicks>
			</Axis>
			<Axis name="y" count={6}>
				<AxisTicks side="left"><AxisLabels /></AxisTicks>
			</Axis>
			<ViolinPlot />
		</Chart>
	</card>
	 -->
</main>

<style lang="postcss">
	card {
		@apply bg-skin-50;
	}
	:global(.chart) {
		@apply border border-skin-200 bg-skin-50 text-skin-100 rounded-lg;
	}
	:global(.axis) {
		@apply text-skin-700 stroke-current;
		stroke-width: 0.5;
	}
	:global(.axis .label) {
		@apply text-skin-700 fill-current;
		stroke: none;
	}
	:global(.axis .grid) {
		stroke: #cccccc;
		stroke-dasharray: 5, 3;
	}
</style>
