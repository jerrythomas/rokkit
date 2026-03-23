<script>
	// @ts-nocheck
	import { BarChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	// 32 rows: 4 regions × 8 quarters — enables aggregation demos (x=region, stat=sum → 4 bars)
	const chartData = [
		{ quarter: 'Q1', revenue: 42000, region: 'North' },
		{ quarter: 'Q2', revenue: 38000, region: 'North' },
		{ quarter: 'Q3', revenue: 51000, region: 'North' },
		{ quarter: 'Q4', revenue: 67000, region: 'North' },
		{ quarter: 'Q5', revenue: 45000, region: 'North' },
		{ quarter: 'Q6', revenue: 72000, region: 'North' },
		{ quarter: 'Q7', revenue: 59000, region: 'North' },
		{ quarter: 'Q8', revenue: 83000, region: 'North' },
		{ quarter: 'Q1', revenue: 58000, region: 'South' },
		{ quarter: 'Q2', revenue: 63000, region: 'South' },
		{ quarter: 'Q3', revenue: 47000, region: 'South' },
		{ quarter: 'Q4', revenue: 71000, region: 'South' },
		{ quarter: 'Q5', revenue: 54000, region: 'South' },
		{ quarter: 'Q6', revenue: 80000, region: 'South' },
		{ quarter: 'Q7', revenue: 66000, region: 'South' },
		{ quarter: 'Q8', revenue: 91000, region: 'South' },
		{ quarter: 'Q1', revenue: 35000, region: 'East' },
		{ quarter: 'Q2', revenue: 49000, region: 'East' },
		{ quarter: 'Q3', revenue: 61000, region: 'East' },
		{ quarter: 'Q4', revenue: 44000, region: 'East' },
		{ quarter: 'Q5', revenue: 77000, region: 'East' },
		{ quarter: 'Q6', revenue: 53000, region: 'East' },
		{ quarter: 'Q7', revenue: 68000, region: 'East' },
		{ quarter: 'Q8', revenue: 85000, region: 'East' },
		{ quarter: 'Q1', revenue: 73000, region: 'West' },
		{ quarter: 'Q2', revenue: 56000, region: 'West' },
		{ quarter: 'Q3', revenue: 82000, region: 'West' },
		{ quarter: 'Q4', revenue: 39000, region: 'West' },
		{ quarter: 'Q5', revenue: 64000, region: 'West' },
		{ quarter: 'Q6', revenue: 48000, region: 'West' },
		{ quarter: 'Q7', revenue: 91000, region: 'West' },
		{ quarter: 'Q8', revenue: 75000, region: 'West' }
	]

	let props = $state({
		xField: 'quarter',
		fillField: 'region',
		patternField: '',
		stat: 'identity',
		grid: true,
		legend: true
	})

	const schema = {
		type: 'object',
		properties: {
			xField: { type: 'string' },
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
				props: { options: ['quarter', 'region'] }
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
					Quarterly Revenue by Region
				</h4>
				<BarChart
					data={chartData}
					x={props.xField}
					y="revenue"
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
		<InfoField label="y" value="revenue" />
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
