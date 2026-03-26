<script>
	// @ts-nocheck
	import { BubbleChart } from '@rokkit/chart'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'
	import { mpg } from '$lib/data/mpg.js'

	// mpg: 234 rows — x=cty, y=hwy, size=displ, color=class
	// city vs highway efficiency, bubble size = engine displacement

	let props = $state({
		xField: 'cty',
		yField: 'hwy',
		sizeField: 'displ',
		colorField: 'class',
		symbolField: '',
		grid: true,
		legend: true
	})

	const schema = {
		type: 'object',
		properties: {
			xField: { type: 'string' },
			yField: { type: 'string' },
			sizeField: { type: 'string' },
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
				scope: '#/xField',
				label: 'x',
				props: { options: ['cty', 'displ', 'hwy'] }
			},
			{
				scope: '#/yField',
				label: 'y',
				props: { options: ['hwy', 'cty', 'displ'] }
			},
			{
				scope: '#/sizeField',
				label: 'size',
				props: { options: ['displ', 'cty', 'hwy'] }
			},
			{
				scope: '#/colorField',
				label: 'color',
				props: { options: ['', 'class', 'drv', 'cyl', 'fl', 'manufacturer'] }
			},
			{
				scope: '#/symbolField',
				label: 'symbol',
				props: { options: ['', 'drv', 'class'] }
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
					City vs Highway MPG (bubble = displacement)
				</h4>
				<BubbleChart
					data={mpg}
					x={props.xField}
					y={props.yField}
					size={props.sizeField}
					color={props.colorField || undefined}
					symbol={props.symbolField || undefined}
					grid={props.grid}
					legend={props.legend}
					width={560}
					height={380}
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
						{#each Object.keys(mpg[0]) as col (col)}
							<th class="text-surface-z4 py-1 pr-3 text-left font-medium">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each mpg as row, i (i)}
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
