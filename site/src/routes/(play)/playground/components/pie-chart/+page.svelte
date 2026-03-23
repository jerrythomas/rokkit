<script>
	// @ts-nocheck
	import { PieChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const chartData = [
		{ segment: 'Mobile',  share: 42, yoy: +8,  avgSession: 4.2 },
		{ segment: 'Desktop', share: 35, yoy: -3,  avgSession: 9.7 },
		{ segment: 'Tablet',  share: 15, yoy: +1,  avgSession: 6.1 },
		{ segment: 'Smart TV', share: 5, yoy: +12, avgSession: 22.4 },
		{ segment: 'Other',   share: 3,  yoy: -1,  avgSession: 2.8 }
	]

	let props = $state({
		colorField: 'segment',
		patternField: 'segment',
		stat: 'sum',
		legend: true
	})

	const schema = {
		type: 'object',
		properties: {
			colorField: { type: 'string' },
			patternField: { type: 'string' },
			stat: { type: 'string' },
			legend: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/colorField',
				label: 'color',
				props: { options: ['', 'segment'] }
			},
			{
				scope: '#/patternField',
				label: 'pattern',
				props: { options: ['', 'segment'] }
			},
			{
				scope: '#/stat',
				label: 'stat',
				props: { options: ['sum', 'mean', 'min', 'max', 'count'] }
			},
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
					Market Share by Device
				</h4>
				<PieChart
					data={chartData}
					label="segment"
					y="share"
					color={props.colorField || undefined}
					pattern={props.patternField || undefined}
					stat={props.stat}
					legend={props.legend}
					width={400}
					height={400}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="label" value="segment" />
		<InfoField label="y" value="share" />
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
