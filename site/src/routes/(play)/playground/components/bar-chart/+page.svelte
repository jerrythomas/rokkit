<script>
	// @ts-nocheck
	import { BarChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const data = [
		{ category: 'Q1', revenue: 42000, region: 'North' },
		{ category: 'Q2', revenue: 58000, region: 'South' },
		{ category: 'Q3', revenue: 51000, region: 'East' },
		{ category: 'Q4', revenue: 73000, region: 'West' }
	]

	let props = $state({
		colorField: 'region',
		patternField: '',
		grid: true,
		legend: false
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
				label: 'Color field',
				props: { options: ['', 'region', 'category'] }
			},
			{
				scope: '#/patternField',
				label: 'Pattern field',
				props: { options: ['', 'region', 'category'] }
			},
			{ scope: '#/grid', label: 'Grid' },
			{ scope: '#/legend', label: 'Legend' },
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
					{data}
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
		<InfoField label="Color field" value={props.colorField || '(none)'} />
		<InfoField label="Pattern field" value={props.patternField || '(none)'} />
		<InfoField label="Grid" value={String(props.grid)} />
		<InfoField label="Legend" value={String(props.legend)} />
	{/snippet}
</PlaySection>
