<script>
	// @ts-nocheck
	import { LineChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const chartData = [
		{ month: 'Jan', value: 32000, target: 30000, units: 320, region: 'North' },
		{ month: 'Feb', value: 41000, target: 38000, units: 410, region: 'North' },
		{ month: 'Mar', value: 38000, target: 42000, units: 380, region: 'North' },
		{ month: 'Apr', value: 52000, target: 48000, units: 520, region: 'North' },
		{ month: 'May', value: 61000, target: 55000, units: 610, region: 'North' },
		{ month: 'Jun', value: 58000, target: 60000, units: 580, region: 'North' },
		{ month: 'Jul', value: 67000, target: 63000, units: 670, region: 'North' },
		{ month: 'Aug', value: 74000, target: 70000, units: 740, region: 'North' },
		{ month: 'Jan', value: 25000, target: 26000, units: 250, region: 'South' },
		{ month: 'Feb', value: 31000, target: 30000, units: 310, region: 'South' },
		{ month: 'Mar', value: 45000, target: 40000, units: 450, region: 'South' },
		{ month: 'Apr', value: 38000, target: 42000, units: 380, region: 'South' },
		{ month: 'May', value: 47000, target: 45000, units: 470, region: 'South' },
		{ month: 'Jun', value: 53000, target: 50000, units: 530, region: 'South' },
		{ month: 'Jul', value: 59000, target: 56000, units: 590, region: 'South' },
		{ month: 'Aug', value: 64000, target: 62000, units: 640, region: 'South' },
		{ month: 'Jan', value: 18000, target: 20000, units: 180, region: 'East' },
		{ month: 'Feb', value: 22000, target: 22000, units: 220, region: 'East' },
		{ month: 'Mar', value: 19000, target: 23000, units: 190, region: 'East' },
		{ month: 'Apr', value: 28000, target: 26000, units: 280, region: 'East' },
		{ month: 'May', value: 35000, target: 32000, units: 350, region: 'East' },
		{ month: 'Jun', value: 31000, target: 34000, units: 310, region: 'East' },
		{ month: 'Jul', value: 39000, target: 37000, units: 390, region: 'East' },
		{ month: 'Aug', value: 43000, target: 41000, units: 430, region: 'East' }
	]

	let props = $state({
		colorField: 'region',
		symbolField: 'region',
		curve: 'linear',
		grid: true,
		legend: true
	})

	const schema = {
		type: 'object',
		properties: {
			colorField: { type: 'string' },
			symbolField: { type: 'string' },
			curve: { type: 'string' },
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
				props: { options: ['', 'region'] }
			},
			{
				scope: '#/symbolField',
				label: 'symbol',
				props: { options: ['', 'region'] }
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
					Regional Revenue by Month
				</h4>
				<LineChart
					data={chartData}
					x="month"
					y="value"
					color={props.colorField || undefined}
					symbol={props.symbolField || undefined}
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
		<InfoField label="y" value="value" />
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
