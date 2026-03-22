<script>
	// @ts-nocheck
	import { LineChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const data = [
		{ month: 'Jan', revenue: 32000 },
		{ month: 'Feb', revenue: 41000 },
		{ month: 'Mar', revenue: 38000 },
		{ month: 'Apr', revenue: 52000 },
		{ month: 'May', revenue: 61000 },
		{ month: 'Jun', revenue: 58000 }
	]

	let props = $state({
		grid: true,
		legend: false
	})

	const schema = {
		type: 'object',
		properties: {
			grid: { type: 'boolean' },
			legend: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
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
					Monthly Revenue
				</h4>
				<LineChart
					{data}
					x="month"
					y="revenue"
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
		<InfoField label="Grid" value={String(props.grid)} />
		<InfoField label="Legend" value={String(props.legend)} />
	{/snippet}
</PlaySection>
