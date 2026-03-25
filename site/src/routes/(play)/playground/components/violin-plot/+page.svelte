<script>
	// @ts-nocheck
	import { ViolinPlot } from '@rokkit/chart'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'
	import { mpg } from '$lib/data/mpg.js'

	// mpg: 234 raw observations — x=class, y=hwy, fill=drv
	// fill=drv groups violins within each class band (3 drv values × 7 classes = 12 combos)

	let props = $state({
		xField: 'class',
		yField: 'hwy',
		fillField: 'drv',
		grid: true,
		legend: true
	})

	const schema = {
		type: 'object',
		properties: {
			xField:    { type: 'string' },
			yField:    { type: 'string' },
			fillField: { type: 'string' },
			grid:      { type: 'boolean' },
			legend:    { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/xField',
				label: 'x',
				props: { options: ['class', 'drv', 'manufacturer', 'cyl', 'fl'] }
			},
			{
				scope: '#/yField',
				label: 'y',
				props: { options: ['hwy', 'cty', 'displ'] }
			},
			{
				scope: '#/fillField',
				label: 'fill',
				props: { options: ['', 'drv', 'class', 'cyl', 'fl'] }
			},
			{ scope: '#/grid',   label: 'grid' },
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
					Highway MPG Distribution by Vehicle Class
				</h4>
				<ViolinPlot
					data={mpg}
					x={props.xField}
					y={props.yField}
					fill={props.fillField || undefined}
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
						{#each Object.keys(mpg[0]) as col}
							<th class="text-surface-z4 py-1 pr-3 text-left font-medium">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each mpg as row}
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
