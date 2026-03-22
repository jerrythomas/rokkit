<script>
	// @ts-nocheck
	import { ScatterPlot } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const data = [
		{ sessions: 120, conversions: 18 },
		{ sessions: 340, conversions: 45 },
		{ sessions: 200, conversions: 22 },
		{ sessions: 480, conversions: 71 },
		{ sessions: 150, conversions: 14 },
		{ sessions: 390, conversions: 60 },
		{ sessions: 270, conversions: 38 },
		{ sessions: 510, conversions: 82 }
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
					Sessions vs Conversions
				</h4>
				<ScatterPlot
					{data}
					x="sessions"
					y="conversions"
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
