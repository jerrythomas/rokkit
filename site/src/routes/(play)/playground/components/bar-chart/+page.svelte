<script>
	// @ts-nocheck
	import { BarChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	// 32 rows: 4 regions × 8 quarters
	// With x=region + stat=sum/mean/count: 4 aggregated bars (good stat demo)
	// With x=quarter + no fill + stat=sum: 8 aggregated bars
	// With x=quarter + fill=region: 32 bars at 8 positions (overlap — dodge not yet supported)
	const chartData = [
		{ quarter: 'Q1', revenue: 42000, margin: 26, region: 'North' },
		{ quarter: 'Q2', revenue: 38000, margin: 22, region: 'North' },
		{ quarter: 'Q3', revenue: 51000, margin: 29, region: 'North' },
		{ quarter: 'Q4', revenue: 67000, margin: 34, region: 'North' },
		{ quarter: 'Q5', revenue: 45000, margin: 27, region: 'North' },
		{ quarter: 'Q6', revenue: 72000, margin: 36, region: 'North' },
		{ quarter: 'Q7', revenue: 59000, margin: 31, region: 'North' },
		{ quarter: 'Q8', revenue: 83000, margin: 38, region: 'North' },
		{ quarter: 'Q1', revenue: 58000, margin: 33, region: 'South' },
		{ quarter: 'Q2', revenue: 63000, margin: 35, region: 'South' },
		{ quarter: 'Q3', revenue: 47000, margin: 28, region: 'South' },
		{ quarter: 'Q4', revenue: 71000, margin: 37, region: 'South' },
		{ quarter: 'Q5', revenue: 54000, margin: 30, region: 'South' },
		{ quarter: 'Q6', revenue: 80000, margin: 39, region: 'South' },
		{ quarter: 'Q7', revenue: 66000, margin: 34, region: 'South' },
		{ quarter: 'Q8', revenue: 91000, margin: 41, region: 'South' },
		{ quarter: 'Q1', revenue: 35000, margin: 21, region: 'East' },
		{ quarter: 'Q2', revenue: 49000, margin: 26, region: 'East' },
		{ quarter: 'Q3', revenue: 61000, margin: 32, region: 'East' },
		{ quarter: 'Q4', revenue: 44000, margin: 25, region: 'East' },
		{ quarter: 'Q5', revenue: 77000, margin: 38, region: 'East' },
		{ quarter: 'Q6', revenue: 53000, margin: 29, region: 'East' },
		{ quarter: 'Q7', revenue: 68000, margin: 35, region: 'East' },
		{ quarter: 'Q8', revenue: 85000, margin: 40, region: 'East' },
		{ quarter: 'Q1', revenue: 73000, margin: 36, region: 'West' },
		{ quarter: 'Q2', revenue: 56000, margin: 30, region: 'West' },
		{ quarter: 'Q3', revenue: 82000, margin: 39, region: 'West' },
		{ quarter: 'Q4', revenue: 39000, margin: 23, region: 'West' },
		{ quarter: 'Q5', revenue: 64000, margin: 33, region: 'West' },
		{ quarter: 'Q6', revenue: 48000, margin: 27, region: 'West' },
		{ quarter: 'Q7', revenue: 91000, margin: 42, region: 'West' },
		{ quarter: 'Q8', revenue: 75000, margin: 37, region: 'West' }
	]

	let props = $state({
		xField: 'region',
		yField: 'revenue',
		fillField: 'region',
		patternField: '',
		stat: 'sum',
		grid: true,
		legend: true
	})

	const schema = {
		type: 'object',
		properties: {
			xField: { type: 'string' },
			yField: { type: 'string' },
			fillField: { type: 'string' },
			patternField: { type: 'string' },
			stat: { type: 'string' },
			grid: { type: 'boolean' },
			legend: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/xField',
				label: 'x',
				props: { options: ['region', 'quarter'] }
			},
			{
				scope: '#/yField',
				label: 'y',
				props: { options: ['revenue', 'margin'] }
			},
			{
				scope: '#/fillField',
				label: 'fill',
				props: { options: ['', 'region', 'quarter'] }
			},
			{
				scope: '#/patternField',
				label: 'pattern',
				props: { options: ['', 'region', 'quarter'] }
			},
			{
				scope: '#/stat',
				label: 'stat',
				props: { options: ['identity', 'sum', 'mean', 'min', 'max', 'count'] }
			},
			{ scope: '#/grid', label: 'grid' },
			{ scope: '#/legend', label: 'legend' },
			{ type: 'separator' }
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8 p-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-3 text-xs uppercase tracking-widest font-semibold">
					Revenue by Region
				</h4>
				<BarChart
					data={chartData}
					x={props.xField}
					y={props.yField}
					fill={props.fillField || undefined}
					pattern={props.patternField || undefined}
					stat={props.stat}
					grid={props.grid}
					legend={props.legend}
					width={560}
					height={320}
				/>
			</div>
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
						{#each Object.keys(chartData[0]) as col}
							<th class="text-surface-z4 py-1 pr-3 text-left font-medium">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each chartData as row}
						<tr class="border-surface-z2 border-b last:border-0">
							{#each Object.values(row) as val}
								<td class="py-1 pr-3">{val}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/snippet}
</PlaySection>
