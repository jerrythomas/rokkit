<script>
	// @ts-nocheck
	import { PieChart } from '@rokkit/chart'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	// 3 months × 5 segments — allows sum/mean/min/max/count to produce different results
	const chartData = [
		{ segment: 'Mobile', month: 'Jan', share: 38 },
		{ segment: 'Mobile', month: 'Feb', share: 42 },
		{ segment: 'Mobile', month: 'Mar', share: 46 },
		{ segment: 'Desktop', month: 'Jan', share: 38 },
		{ segment: 'Desktop', month: 'Feb', share: 35 },
		{ segment: 'Desktop', month: 'Mar', share: 33 },
		{ segment: 'Tablet', month: 'Jan', share: 14 },
		{ segment: 'Tablet', month: 'Feb', share: 15 },
		{ segment: 'Tablet', month: 'Mar', share: 15 },
		{ segment: 'Smart TV', month: 'Jan', share: 4 },
		{ segment: 'Smart TV', month: 'Feb', share: 5 },
		{ segment: 'Smart TV', month: 'Mar', share: 6 },
		{ segment: 'Other', month: 'Jan', share: 6 },
		{ segment: 'Other', month: 'Feb', share: 3 },
		{ segment: 'Other', month: 'Mar', share: 1 }
	]

	let props = $state({
		yField: 'share',
		fillField: 'segment',
		patternField: 'segment',
		innerRadius: 0,
		stat: 'sum',
		customLabel: false,
		tooltip: true,
		legend: true
	})

	const schema = {
		type: 'object',
		properties: {
			yField: { type: 'string' },
			fillField: { type: 'string' },
			patternField: { type: 'string' },
			innerRadius: { type: 'number', minimum: 0, maximum: 1 },
			stat: { type: 'string' },
			customLabel: { type: 'boolean' },
			tooltip: { type: 'boolean' },
			legend: { type: 'boolean' }
		}
	}

	// Custom labelFn: show actual y value rounded to 2 decimals
	const customLabelFn = (d) => Number(d[props.yField]).toFixed(2)

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/yField',
				label: 'y',
				props: { options: ['share'] }
			},
			{
				scope: '#/fillField',
				label: 'fill',
				props: { options: ['', 'segment', 'month'] }
			},
			{
				scope: '#/patternField',
				label: 'pattern',
				props: { options: ['', 'segment', 'month'] }
			},
			{
				scope: '#/innerRadius',
				label: 'innerRadius',
				props: { min: 0, max: 1, step: 0.05 }
			},
			{
				scope: '#/stat',
				label: 'stat',
				props: { options: ['sum', 'mean', 'min', 'max', 'count'] }
			},
			{ scope: '#/customLabel', label: 'custom label' },
			{ scope: '#/tooltip', label: 'tooltip' },
			{ scope: '#/legend', label: 'legend' },
			{ type: 'separator' }
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8 p-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-3 text-xs font-semibold tracking-widest uppercase">
					Market Share by Device
				</h4>
				<PieChart
					data={chartData}
					y={props.yField}
					label={props.fillField || undefined}
					fill={props.fillField || undefined}
					pattern={props.patternField || undefined}
					innerRadius={props.innerRadius}
					stat={props.stat}
					labelFn={props.customLabel ? customLabelFn : undefined}
					tooltip={props.tooltip}
					legend={props.legend}
					width={400}
					height={400}
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
						{#each Object.keys(chartData[0]) as col (col)}
							<th class="text-surface-z4 py-1 pr-3 text-left font-medium">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each chartData as row, i (i)}
						<tr class="border-surface-z2 border-b last:border-0">
							{#each Object.values(row) as val, j (j)}
								<td class="py-1 pr-3">{val}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/snippet}
</PlaySection>
