<script>
	// @ts-nocheck
	import { AreaChart } from '@rokkit/chart'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'
	import { mpg } from '$lib/data/mpg.js'

	// mpg: 234 rows — x=cyl (4,5,6,8), y=hwy, fill=drv, stat=mean
	// shows area under highway mpg curve per drive type across cylinder counts

	let props = $state({
		xField: 'cyl',
		yField: 'hwy',
		fillField: 'drv',
		patternField: '',
		stat: 'mean',
		curve: 'linear',
		stack: false,
		grid: true,
		legend: true
	})

	const schema = {
		type: 'object',
		properties: {
			xField: { type: 'string' },
			yField: { type: 'string' },
			fillField: { type: 'string' },
			patternField: { type: 'string' },
			stat: { type: 'string' },
			curve: { type: 'string' },
			stack: { type: 'boolean' },
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
				props: { options: ['cyl', 'class', 'year'] }
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
			{
				scope: '#/patternField',
				label: 'pattern',
				props: { options: ['', 'drv', 'class', 'fl'] }
			},
			{
				scope: '#/stat',
				label: 'stat',
				props: { options: ['identity', 'mean', 'sum', 'min', 'max', 'count'] }
			},
			{
				scope: '#/curve',
				label: 'curve',
				props: { options: ['linear', 'smooth', 'step'] }
			},
			{ scope: '#/stack', label: 'stack' },
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
				<h4 class="text-surface-z5 m-0 mb-3 text-xs font-semibold tracking-widest uppercase">
					Highway MPG by Cylinders
				</h4>
				<AreaChart
					data={mpg}
					x={props.xField}
					y={props.yField}
					fill={props.fillField || undefined}
					pattern={props.patternField || undefined}
					stat={props.stat}
					curve={props.curve}
					stack={props.stack}
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
