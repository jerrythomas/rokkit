<script>
	// @ts-nocheck
	import { ScatterPlot } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	// Multi-channel data: different categories and channels
	const data = [
		{ sessions: 120, conversions: 18, channel: 'Email', tier: 'Basic' },
		{ sessions: 340, conversions: 45, channel: 'Social', tier: 'Pro' },
		{ sessions: 200, conversions: 22, channel: 'Email', tier: 'Pro' },
		{ sessions: 480, conversions: 71, channel: 'Organic', tier: 'Enterprise' },
		{ sessions: 150, conversions: 14, channel: 'Paid', tier: 'Basic' },
		{ sessions: 390, conversions: 60, channel: 'Social', tier: 'Enterprise' },
		{ sessions: 270, conversions: 38, channel: 'Organic', tier: 'Pro' },
		{ sessions: 510, conversions: 82, channel: 'Paid', tier: 'Enterprise' },
		{ sessions: 95,  conversions: 10, channel: 'Email', tier: 'Basic' },
		{ sessions: 430, conversions: 55, channel: 'Organic', tier: 'Pro' }
	]

	let props = $state({
		colorField: 'channel',
		symbolField: 'tier',
		grid: true,
		legend: false
	})

	const schema = {
		type: 'object',
		properties: {
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
				scope: '#/colorField',
				label: 'Color field',
				props: { options: ['', 'channel', 'tier'] }
			},
			{
				scope: '#/symbolField',
				label: 'Symbol field',
				props: { options: ['', 'channel', 'tier'] }
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
					Sessions vs Conversions
				</h4>
				<ScatterPlot
					{data}
					x="sessions"
					y="conversions"
					color={props.colorField || undefined}
					symbol={props.symbolField || undefined}
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
		<InfoField label="Symbol field" value={props.symbolField || '(none)'} />
		<InfoField label="Grid" value={String(props.grid)} />
		<InfoField label="Legend" value={String(props.legend)} />
	{/snippet}
</PlaySection>
