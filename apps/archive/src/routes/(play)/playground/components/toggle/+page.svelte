<script>
	// @ts-nocheck
	import { Toggle } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let iconValue = $state('day')
	let textValue = $state('weekly')
	let modeValue = $state('system')

	let props = $state({ size: 'md', showLabels: true, disabled: false })

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

	const withIcons = [
		{ label: 'Day', value: 'day', icon: 'i-glyph:sun' },
		{ label: 'Week', value: 'week', icon: 'i-glyph:calendar' },
		{ label: 'Month', value: 'month', icon: 'i-glyph:calendar' }
	]

	const textOnly = ['Daily', 'Weekly', 'Monthly', 'Yearly']

	const modeOptions = [
		{ value: 'system', icon: 'i-glyph:monitor', label: 'System' },
		{ value: 'light', icon: 'i-glyph:sun', label: 'Light' },
		{ value: 'dark', icon: 'i-glyph:moon', label: 'Dark' }
	]
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">With icons</h4>
				<Toggle
					options={withIcons}
					bind:value={iconValue}
					size={props.size}
					showLabels={props.showLabels}
					disabled={props.disabled}
				/>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Text only</h4>
				<Toggle
					options={textOnly}
					bind:value={textValue}
					size={props.size}
					showLabels={props.showLabels}
					disabled={props.disabled}
				/>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Icon-only mode</h4>
				<Toggle
					options={modeOptions}
					bind:value={modeValue}
					size={props.size}
					showLabels={false}
					disabled={props.disabled}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Icons" value={iconValue} />
		<InfoField label="Text" value={textValue} />
		<InfoField label="Mode" value={modeValue} />
	{/snippet}
</PlaySection>
