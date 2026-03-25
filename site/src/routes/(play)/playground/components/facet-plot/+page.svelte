<script>
	// @ts-nocheck
	import { FacetPlot } from '@rokkit/chart'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'
	import { mpg } from '$lib/data/mpg.js'

	// mpg: 234 rows — facet by drv (3 values: 4/f/r), x=class, y=hwy, stat=mean
	// Shows 3 panels side-by-side, each panel a bar chart for one drive type.
	// scales=fixed keeps the same y-axis across panels for comparison.

	let props = $state({
		facetBy: 'drv',
		x: 'class',
		y: 'hwy',
		color: 'drv',
		stat: 'mean',
		scales: 'fixed',
		cols: 3,
		grid: true,
		legend: false
	})

	const schema = {
		type: 'object',
		properties: {
			facetBy: { type: 'string' },
			x: { type: 'string' },
			y: { type: 'string' },
			color: { type: 'string' },
			stat: { type: 'string' },
			scales: { type: 'string' },
			cols: { type: 'number' },
			grid: { type: 'boolean' },
			legend: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/facetBy',
				label: 'facet by',
				props: { options: ['drv', 'cyl', 'year', 'fl'] }
			},
			{
				scope: '#/x',
				label: 'x',
				props: { options: ['class', 'manufacturer', 'drv', 'cyl', 'year'] }
			},
			{
				scope: '#/y',
				label: 'y',
				props: { options: ['hwy', 'cty', 'displ'] }
			},
			{
				scope: '#/color',
				label: 'color',
				props: { options: ['', 'drv', 'class', 'cyl', 'year', 'fl'] }
			},
			{
				scope: '#/stat',
				label: 'stat',
				props: { options: ['mean', 'sum', 'count', 'min', 'max'] }
			},
			{
				scope: '#/scales',
				label: 'scales',
				props: { options: ['fixed', 'free', 'free_x', 'free_y'] }
			},
			{
				scope: '#/cols',
				label: 'cols',
				props: { options: [1, 2, 3, 4] }
			},
			{ scope: '#/grid', label: 'grid' },
			{ scope: '#/legend', label: 'legend' },
			{ type: 'separator' }
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-4 p-6">
			<h4 class="text-surface-z5 m-0 text-xs uppercase tracking-widest font-semibold">
				Highway MPG by Vehicle Class — faceted by {props.facetBy}
			</h4>
			<FacetPlot
				data={mpg}
				facet={{ by: props.facetBy, cols: props.cols, scales: props.scales }}
				x={props.x}
				y={props.y}
				color={props.color || undefined}
				geoms={[{ type: 'bar', stat: props.stat }]}
				width={860}
				height={260}
				grid={props.grid}
				legend={props.legend}
			/>
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
