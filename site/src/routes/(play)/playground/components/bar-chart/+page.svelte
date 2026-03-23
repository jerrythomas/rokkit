<script>
	// @ts-nocheck
	import { BarChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const chartData = [
		{ category: 'Q1', revenue: 42000, cost: 31000, margin: 26, region: 'North' },
		{ category: 'Q2', revenue: 58000, cost: 39000, margin: 33, region: 'South' },
		{ category: 'Q3', revenue: 51000, cost: 36000, margin: 29, region: 'East' },
		{ category: 'Q4', revenue: 73000, cost: 48000, margin: 34, region: 'West' },
		{ category: 'Q5', revenue: 67000, cost: 44000, margin: 34, region: 'North' },
		{ category: 'Q6', revenue: 80000, cost: 52000, margin: 35, region: 'South' },
		{ category: 'Q7', revenue: 74000, cost: 49000, margin: 34, region: 'East' },
		{ category: 'Q8', revenue: 91000, cost: 60000, margin: 34, region: 'West' }
	]

	let props = $state({
		fillField: 'region',
		patternField: 'region',
		stat: 'identity',
		grid: true,
		legend: true
	})

	const schema = {
		type: 'object',
		properties: {
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
				scope: '#/fillField',
				label: 'fill',
				props: { options: ['', 'region', 'category'] }
			},
			{
				scope: '#/patternField',
				label: 'pattern',
				props: { options: ['', 'region', 'category'] }
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
					Quarterly Revenue
				</h4>
				<BarChart
					data={chartData}
					x="category"
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
		<InfoField label="x" value="category" />
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
