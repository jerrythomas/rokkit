<script>
	// @ts-nocheck
	import { browser } from '$app/environment'
	import { AnimatedPlot } from '@rokkit/chart'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'
	import { mpg } from '$lib/data/mpg.js'
	import { stackoverflow } from '$lib/data/stackoverflow.js'

	// Multi-year dataset with 6 years × 5 categories for richer animation
	const regionalSales = [
		{ region: 'North', year: 2018, revenue: 120 },
		{ region: 'North', year: 2019, revenue: 148 },
		{ region: 'North', year: 2020, revenue: 105 },
		{ region: 'North', year: 2021, revenue: 162 },
		{ region: 'North', year: 2022, revenue: 175 },
		{ region: 'North', year: 2023, revenue: 190 },
		{ region: 'South', year: 2018, revenue: 95 },
		{ region: 'South', year: 2019, revenue: 110 },
		{ region: 'South', year: 2020, revenue: 88 },
		{ region: 'South', year: 2021, revenue: 130 },
		{ region: 'South', year: 2022, revenue: 145 },
		{ region: 'South', year: 2023, revenue: 158 },
		{ region: 'East', year: 2018, revenue: 200 },
		{ region: 'East', year: 2019, revenue: 185 },
		{ region: 'East', year: 2020, revenue: 160 },
		{ region: 'East', year: 2021, revenue: 210 },
		{ region: 'East', year: 2022, revenue: 240 },
		{ region: 'East', year: 2023, revenue: 265 },
		{ region: 'West', year: 2018, revenue: 175 },
		{ region: 'West', year: 2019, revenue: 195 },
		{ region: 'West', year: 2020, revenue: 145 },
		{ region: 'West', year: 2021, revenue: 220 },
		{ region: 'West', year: 2022, revenue: 255 },
		{ region: 'West', year: 2023, revenue: 280 },
		{ region: 'Central', year: 2018, revenue: 80 },
		{ region: 'Central', year: 2019, revenue: 92 },
		{ region: 'Central', year: 2020, revenue: 70 },
		{ region: 'Central', year: 2021, revenue: 105 },
		{ region: 'Central', year: 2022, revenue: 118 },
		{ region: 'Central', year: 2023, revenue: 130 }
	]

	const datasets = { stackoverflow, regionalSales, mpg }

	let props = $state({
		dataset: 'stackoverflow',
		animateBy: 'date',
		x: 'pct',
		y: 'language',
		color: 'language',
		geom: 'bar',
		stat: 'identity',
		fill: '',
		pattern: '',
		duration: 400,
		loop: true,
		tween: true,
		sorted: true,
		dynamicDomain: false,
		label: true,
		grid: true,
		legend: false
	})

	const schema = {
		type: 'object',
		properties: {
			dataset: { type: 'string' },
			animateBy: { type: 'string' },
			x: { type: 'string' },
			y: { type: 'string' },
			color: { type: 'string' },
			geom: { type: 'string' },
			stat: { type: 'string' },
			fill: { type: 'string' },
			pattern: { type: 'string' },
			duration: { type: 'number' },
			loop: { type: 'boolean' },
			tween: { type: 'boolean' },
			sorted: { type: 'boolean' },
			dynamicDomain: { type: 'boolean' },
			label: { type: 'boolean' },
			grid: { type: 'boolean' },
			legend: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/dataset',
				label: 'dataset',
				props: { options: ['stackoverflow', 'regionalSales', 'mpg'] }
			},
			{
				scope: '#/animateBy',
				label: 'animate by',
				props: { options: ['date', 'year', 'cyl', 'drv', 'fl'] }
			},
			{
				scope: '#/x',
				label: 'x',
				props: { options: ['pct', 'region', 'class', 'manufacturer', 'drv', 'cyl'] }
			},
			{
				scope: '#/y',
				label: 'y',
				props: { options: ['language', 'region', 'hwy', 'cty', 'displ', 'revenue'] }
			},
			{
				scope: '#/geom',
				label: 'geom',
				props: { options: ['bar', 'line', 'area', 'point'] }
			},
			{
				scope: '#/stat',
				label: 'stat',
				props: { options: ['identity', 'mean', 'sum', 'count', 'min', 'max'] }
			},
			{
				scope: '#/color',
				label: 'color',
				props: { options: ['language', '', 'drv', 'class', 'cyl', 'fl'] }
			},
			{
				scope: '#/fill',
				label: 'fill',
				props: { options: ['', 'drv', 'class', 'cyl'] }
			},
			{
				scope: '#/pattern',
				label: 'pattern',
				props: { options: ['', 'drv', 'class', 'cyl'] }
			},
			{
				scope: '#/duration',
				label: 'duration (ms)',
				props: { options: [200, 400, 800, 1200, 2000] }
			},
			{ scope: '#/loop', label: 'loop' },
			{ scope: '#/tween', label: 'tween' },
			{ scope: '#/sorted', label: 'sorted (bar chart race)' },
			{ scope: '#/dynamicDomain', label: 'dynamic domain' },
			{ scope: '#/label', label: 'labels inside bars' },
			{ scope: '#/grid', label: 'grid' },
			{ scope: '#/legend', label: 'legend' },
			{ type: 'separator' }
		]
	}

	const activeData = $derived(datasets[props.dataset] ?? stackoverflow)
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-4 p-6">
			<h4 class="text-surface-z5 m-0 text-xs font-semibold tracking-widest uppercase">
				{props.dataset === 'stackoverflow'
					? 'Stack Overflow Questions by Language'
					: props.dataset === 'regionalSales'
						? 'Revenue by Region'
						: 'Highway MPG by Class'} — animated by {props.animateBy}
			</h4>
			{#if browser}
				<AnimatedPlot
					data={activeData}
					animate={{ by: props.animateBy, duration: props.duration, loop: props.loop }}
					x={props.x}
					y={props.y}
					color={props.color || undefined}
					fill={props.fill || undefined}
					pattern={props.pattern || undefined}
					geom={props.geom}
					stat={props.stat}
					tween={props.tween}
					sorted={props.sorted}
					dynamicDomain={props.dynamicDomain}
					label={props.label}
					width={860}
					height={480}
					grid={props.grid}
					legend={props.legend}
				/>
			{/if}
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
	{/snippet}

	{#snippet data()}
		<div class="overflow-x-auto">
			<table class="w-full text-xs">
				<thead>
					<tr class="border-surface-z2 border-b">
						{#each Object.keys(activeData[0]) as col (col)}
							<th class="text-surface-z4 py-1 pr-3 text-left font-medium">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each activeData.slice(0, 50) as row, i (i)}
						<tr class="border-surface-z2 border-b last:border-0">
							{#each Object.values(row) as val, j (j)}
								<td class="py-1 pr-3">{val}</td>
							{/each}
						</tr>
					{/each}
					{#if activeData.length > 50}
						<tr>
							<td class="text-surface-z3 py-1 pr-3 italic" colspan="99">
								…{activeData.length - 50} more rows
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	{/snippet}
</PlaySection>
