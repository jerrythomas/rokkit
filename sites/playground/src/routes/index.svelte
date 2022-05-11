<script>
	import fs from 'fs';
	import { isEqual } from 'date-fns';
	import {
		Chart,
		Axis,
		AxisTicks,
		AxisLabels,
		BarPlot,
		LinePlot,
		BoxPlot,
		ViolinPlot,
		ScatterPlot
	} from '@sparsh-ui/chart';
	export let data = [];

	let width = 400;
	let height = 400;
	$: bars = data
		.map((d) => ({ ...d, year: new Date(d.year) }))
		.filter((d) => isEqual(d.year, new Date('2015-01-01')));
	$: console.log('bars', bars);
</script>

<main class="flex gap-5 flex-wrap">
	<card class="flex flex-col aspect-square p-4 rounded-lg shadow-lg">
		<Chart width={500} {height} data={bars} x="name" y="fired" marginLeft={10} marginBottom={10}>
			<Axis name="x">
				<AxisTicks side="bottom"><AxisLabels /></AxisTicks>
			</Axis>
			<Axis name="y" count={6}>
				<AxisTicks side="left"><AxisLabels /></AxisTicks>
			</Axis>
			<BarPlot />
		</Chart>
	</card>
	<card class="flex flex-col aspect-square p-4 rounded-lg shadow-lg">
		<Chart
			width={500}
			{height}
			data={bars}
			x="name"
			y="fired"
			marginLeft={60}
			marginBottom={10}
			flipCoords
		>
			<Axis name="x">
				<AxisTicks side="bottom"><AxisLabels /></AxisTicks>
			</Axis>
			<Axis name="y" count={6}>
				<AxisTicks side="left"><AxisLabels /></AxisTicks>
			</Axis>
			<BarPlot />
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
	<card class="flex flex-col w-64 h-64 aspect-square p-4 rounded-lg shadow-lg">
		<Chart {data} x="year" y="fired" fill="name" {width} {height} marginLeft={20} marginBottom={8}>
			<Axis name="x">
				<AxisTicks side="bottom"><AxisLabels /></AxisTicks>
			</Axis>
			<Axis name="y" count={6}>
				<AxisTicks side="left"><AxisLabels /></AxisTicks>
			</Axis>
			<ScatterPlot />
		</Chart>
	</card> -->
</main>

<style>
	card {
		@apply bg-skin-50;
	}
	:global(.axis) {
		stroke: #999999;
		stroke-width: 0.5;
	}
	:global(.axis .label) {
		fill: #666666;
		stroke: none;
	}
</style>
