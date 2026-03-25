<script>
	// @ts-nocheck
	import { browser } from '$app/environment'
	import { AnimatedPlot } from '@rokkit/chart'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'
	import { mpg } from '$lib/data/mpg.js'

	// mpg: 234 rows — animate by year (2 frames: 1999/2008), x=class, y=hwy, stat=mean
	// Shows a bar chart that transitions between 1999 and 2008 highway MPG by vehicle class.
	// Timeline controls allow play/pause, scrub, and speed adjustment.

	let props = $state({
		animateBy: 'year',
		x: 'class',
		y: 'hwy',
		color: '',
		stat: 'mean',
		duration: 800,
		loop: true,
		grid: true,
		legend: false
	})

	const schema = {
		type: 'object',
		properties: {
			animateBy: { type: 'string' },
			x: { type: 'string' },
			y: { type: 'string' },
			color: { type: 'string' },
			stat: { type: 'string' },
			duration: { type: 'number' },
			loop: { type: 'boolean' },
			grid: { type: 'boolean' },
			legend: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/animateBy',
				label: 'animate by',
				props: { options: ['year', 'cyl', 'drv', 'fl'] }
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
				scope: '#/duration',
				label: 'duration (ms)',
				props: { options: [400, 800, 1200, 2000] }
			},
			{ scope: '#/loop', label: 'loop' },
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
				Highway MPG by Vehicle Class — animated by {props.animateBy}
			</h4>
			{#if browser}
				<AnimatedPlot
					data={mpg}
					animate={{ by: props.animateBy, duration: props.duration, loop: props.loop }}
					x={props.x}
					y={props.y}
					color={props.color || undefined}
					geoms={[{ type: 'bar', stat: props.stat }]}
					width={860}
					height={260}
					grid={props.grid}
					legend={props.legend}
				/>
			{/if}
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
