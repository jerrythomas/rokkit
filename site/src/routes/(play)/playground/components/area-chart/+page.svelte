<script>
	// @ts-nocheck
	import { AreaChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const chartData = [
		{ month: 'Jan', revenue: 32000, target: 30000, growth: 7,  region: 'North' },
		{ month: 'Feb', revenue: 41000, target: 38000, growth: 28, region: 'North' },
		{ month: 'Mar', revenue: 38000, target: 42000, growth: -7, region: 'North' },
		{ month: 'Apr', revenue: 52000, target: 45000, growth: 37, region: 'North' },
		{ month: 'May', revenue: 61000, target: 55000, growth: 17, region: 'North' },
		{ month: 'Jun', revenue: 58000, target: 60000, growth: -5, region: 'North' },
		{ month: 'Jul', revenue: 67000, target: 62000, growth: 16, region: 'North' },
		{ month: 'Aug', revenue: 74000, target: 70000, growth: 10, region: 'North' },
		{ month: 'Jan', revenue: 21000, target: 22000, growth: -5, region: 'South' },
		{ month: 'Feb', revenue: 29000, target: 27000, growth: 38, region: 'South' },
		{ month: 'Mar', revenue: 34000, target: 31000, growth: 17, region: 'South' },
		{ month: 'Apr', revenue: 31000, target: 35000, growth: -9, region: 'South' },
		{ month: 'May', revenue: 44000, target: 40000, growth: 42, region: 'South' },
		{ month: 'Jun', revenue: 40000, target: 43000, growth: -9, region: 'South' },
		{ month: 'Jul', revenue: 51000, target: 47000, growth: 28, region: 'South' },
		{ month: 'Aug', revenue: 55000, target: 52000, growth: 8,  region: 'South' }
	]

	let props = $state({
		fillField: 'region',
		patternField: 'region',
		curve: 'linear',
		grid: true,
		legend: true
	})

	const schema = {
		type: 'object',
		properties: {
			fillField: { type: 'string' },
			patternField: { type: 'string' },
			curve: { type: 'string' },
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
				props: { options: ['', 'region', 'month'] }
			},
			{
				scope: '#/patternField',
				label: 'pattern',
				props: { options: ['', 'region', 'month'] }
			},
			{
				scope: '#/curve',
				label: 'curve',
				props: { options: ['linear', 'smooth', 'step'] }
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
					Monthly Revenue
				</h4>
				<AreaChart
					data={chartData}
					x="month"
					y="revenue"
					fill={props.fillField || undefined}
					pattern={props.patternField || undefined}
					curve={props.curve}
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
		<InfoField label="x" value="month" />
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
