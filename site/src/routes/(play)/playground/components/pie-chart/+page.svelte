<script>
	// @ts-nocheck
	import { PieChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const data = [
		{ segment: 'Mobile', share: 42 },
		{ segment: 'Desktop', share: 35 },
		{ segment: 'Tablet', share: 15 },
		{ segment: 'Other', share: 8 }
	]

	let props = $state({
		patternField: '',
		legend: false
	})

	const schema = {
		type: 'object',
		properties: {
			patternField: { type: 'string' },
			legend: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/patternField',
				label: 'Pattern field',
				props: { options: ['', 'segment'] }
			},
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
					Market Share by Device
				</h4>
				<PieChart
					{data}
					label="segment"
					y="share"
					color="segment"
					pattern={props.patternField || undefined}
					legend={props.legend}
					width={400}
					height={400}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Pattern field" value={props.patternField || '(none)'} />
		<InfoField label="Legend" value={String(props.legend)} />
	{/snippet}
</PlaySection>
