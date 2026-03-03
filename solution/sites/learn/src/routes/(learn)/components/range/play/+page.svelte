<script>
	// @ts-nocheck
	import { Range } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let value = $state(50)
	let lower = $state(20)
	let upper = $state(80)

	let props = $state({ min: 0, max: 100, step: 1, ticks: 0, labelSkip: 0, disabled: false })

	const schema = {
		type: 'object',
		properties: {
			min: { type: 'number' },
			max: { type: 'number' },
			step: { type: 'number' },
			ticks: { type: 'number' },
			labelSkip: { type: 'number' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/min', label: 'Min' },
			{ scope: '#/max', label: 'Max' },
			{ scope: '#/step', label: 'Step' },
			{ scope: '#/ticks', label: 'Ticks' },
			{ scope: '#/labelSkip', label: 'Label Skip' },
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8 px-4">
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Single slider</h4>
				<Range
					bind:value
					min={props.min}
					max={props.max}
					step={props.step}
					ticks={props.ticks}
					labelSkip={props.labelSkip}
					disabled={props.disabled}
				/>
				<p class="text-surface-z6 mt-1 text-sm">Value: <strong>{value}</strong></p>
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Range slider (dual handles)</h4>
				<Range
					range
					bind:lower
					bind:upper
					min={props.min}
					max={props.max}
					step={props.step}
					ticks={props.ticks}
					labelSkip={props.labelSkip}
					disabled={props.disabled}
				/>
				<p class="text-surface-z6 mt-1 text-sm">Lower: <strong>{lower}</strong> — Upper: <strong>{upper}</strong></p>
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">With tick marks</h4>
				<Range
					value={30}
					min={0}
					max={100}
					step={10}
					ticks={10}
					labelSkip={1}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Value" value={value} />
		<InfoField label="Lower" value={lower} />
		<InfoField label="Upper" value={upper} />
	{/snippet}
</PlaySection>
