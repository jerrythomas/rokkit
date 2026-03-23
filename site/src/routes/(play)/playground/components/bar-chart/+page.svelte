<script>
	// @ts-nocheck
	import { BarChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const chartData = [
		{ category: 'Q1', revenue: 42000, region: 'North' },
		{ category: 'Q2', revenue: 58000, region: 'South' },
		{ category: 'Q3', revenue: 51000, region: 'East' },
		{ category: 'Q4', revenue: 73000, region: 'West' }
	]

	let props = $state({
		colorField: 'region',
		patternField: 'region',
		grid: true,
		legend: true
	})

	const schema = {
		type: 'object',
		properties: {
			colorField: { type: 'string' },
			patternField: { type: 'string' },
			grid: { type: 'boolean' },
			legend: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/colorField',
				label: 'color',
				props: { options: ['', 'region', 'category'] }
			},
			{
				scope: '#/patternField',
				label: 'pattern',
				props: { options: ['', 'region', 'category'] }
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
					color={props.colorField || undefined}
					pattern={props.patternField || undefined}
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
		<InfoField label="color" value={props.colorField || '(none)'} />
		<InfoField label="pattern" value={props.patternField || '(none)'} />
		<InfoField label="grid" value={String(props.grid)} />
		<InfoField label="legend" value={String(props.legend)} />
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
