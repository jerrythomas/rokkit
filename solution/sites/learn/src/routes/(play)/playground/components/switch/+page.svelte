<script>
	// @ts-nocheck
	import { Switch } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let boolValue = $state(false)
	let textValue = $state('off')
	let iconValue = $state(0)

	let props = $state({ size: 'md', showLabels: false, disabled: false })

	const schema = {
		type: 'object',
		properties: {
			size: { type: 'string' },
			showLabels: { type: 'boolean' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/showLabels', label: 'Show labels' },
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}

	const textOptions = [
		{ text: 'Off', value: 'off' },
		{ text: 'On', value: 'on' }
	]

	const iconOptions = [
		{ text: 'Dark', value: 0, icon: 'i-lucide:moon' },
		{ text: 'Light', value: 1, icon: 'i-lucide:sun' }
	]
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-6">
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Boolean (default)</h4>
				<Switch bind:value={boolValue} size={props.size} showLabels={props.showLabels} disabled={props.disabled} />
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Text options</h4>
				<Switch options={textOptions} bind:value={textValue} size={props.size} showLabels={props.showLabels} disabled={props.disabled} />
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">With icons</h4>
				<Switch options={iconOptions} bind:value={iconValue} size={props.size} showLabels={props.showLabels} disabled={props.disabled} />
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Boolean" value={boolValue} />
		<InfoField label="Text" value={textValue} />
		<InfoField label="Icon" value={iconValue} />
	{/snippet}
</PlaySection>
