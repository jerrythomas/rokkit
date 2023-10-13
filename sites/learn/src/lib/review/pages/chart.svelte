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

<main class="flex flex-col flex-wrap gap-8">
	<card class="aspect-square flex flex-col rounded-lg p-2 shadow-lg">
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
	<card class="aspect-square flex flex-col rounded-lg p-2 shadow-lg">
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
	<card class="flex flex-col rounded-lg p-2 shadow-lg">
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
	<card class="flex flex-col rounded-lg p-2 shadow-lg">
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
	<!-- <card class="aspect-square h-64 w-64 flex flex-col rounded-lg p-4 shadow-lg">
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
	<card class="aspect-square h-64 w-64 flex flex-col rounded-lg p-4 shadow-lg">
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
	<card class="aspect-square h-64 w-64 flex flex-col rounded-lg p-4 shadow-lg">
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
		@apply bg-neutral-50;
	}
	:global(.chart) {
		@apply border border-neutral-200 bg-neutral-50 text-neutral-100 rounded-lg;
	}
	:global(.axis) {
		@apply text-neutral-700 stroke-current;
		stroke-width: 0.5;
	}
	:global(.axis .label) {
		@apply text-neutral-700 fill-current;
		stroke: none;
	}
	:global(.axis .grid) {
		stroke: #cccccc;
		stroke-dasharray: 5, 3;
	}
</style>
