<script>
	// @ts-nocheck
	import { ScatterPlot } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const chartData = [
		{ sessions: 120, conversions: 18, channel: 'Email',   tier: 'Basic' },
		{ sessions: 340, conversions: 45, channel: 'Social',  tier: 'Pro' },
		{ sessions: 200, conversions: 22, channel: 'Email',   tier: 'Pro' },
		{ sessions: 480, conversions: 71, channel: 'Organic', tier: 'Enterprise' },
		{ sessions: 150, conversions: 14, channel: 'Paid',    tier: 'Basic' },
		{ sessions: 390, conversions: 60, channel: 'Social',  tier: 'Enterprise' },
		{ sessions: 270, conversions: 38, channel: 'Organic', tier: 'Pro' },
		{ sessions: 510, conversions: 82, channel: 'Paid',    tier: 'Enterprise' },
		{ sessions: 95,  conversions: 10, channel: 'Email',   tier: 'Basic' },
		{ sessions: 430, conversions: 55, channel: 'Organic', tier: 'Pro' }
	]

	let props = $state({
		colorField: 'channel',
		symbolField: 'tier',
		grid: true,
		legend: true
	})

	const schema = {
		type: 'object',
		properties: {
			colorField: { type: 'string' },
			symbolField: { type: 'string' },
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
				props: { options: ['', 'channel', 'tier'] }
			},
			{
				scope: '#/symbolField',
				label: 'symbol',
				props: { options: ['', 'channel', 'tier'] }
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
					Sessions vs Conversions
				</h4>
				<ScatterPlot
					data={chartData}
					x="sessions"
					y="conversions"
					color={props.colorField || undefined}
					symbol={props.symbolField || undefined}
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
		<InfoField label="symbol" value={props.symbolField || '(none)'} />
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
