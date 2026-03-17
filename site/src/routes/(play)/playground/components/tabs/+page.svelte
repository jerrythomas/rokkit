<script>
	// @ts-nocheck
	import { Tabs } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let value = $state('overview')

	let props = $state({
		orientation: 'horizontal',
		position: 'before',
		align: 'start',
		disabled: false
	})

	const schema = {
		type: 'object',
		properties: {
			orientation: { type: 'string' },
			position: { type: 'string' },
			align: { type: 'string' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/orientation',
				label: 'Orientation',
				props: { options: ['horizontal', 'vertical'] }
			},
			{ scope: '#/position', label: 'Position', props: { options: ['before', 'after'] } },
			{ scope: '#/align', label: 'Align', props: { options: ['start', 'center', 'end'] } },
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}

	const tabs = [
		{
			label: 'Overview',
			value: 'overview',
			icon: 'i-glyph:home',
			content: 'Welcome to the overview panel. This is the main dashboard view.'
		},
		{
			label: 'Settings',
			value: 'settings',
			icon: 'i-glyph:settings',
			content: 'Configure your preferences and application settings here.'
		},
		{
			label: 'Activity',
			value: 'activity',
			icon: 'i-glyph:chart',
			content: 'View recent activity and event logs.'
		}
	]

	const simpleTabs = [
		{ label: 'Tab 1', value: 'tab1', content: 'Content for the first tab.' },
		{ label: 'Tab 2', value: 'tab2', content: 'Content for the second tab.' },
		{ label: 'Tab 3', value: 'tab3', content: 'Content for the third tab.' }
	]
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex w-full flex-col gap-8">
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">With icons</h4>
				<Tabs
					options={tabs}
					bind:value
					orientation={props.orientation}
					position={props.position}
					align={props.align}
					disabled={props.disabled}
				/>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Simple</h4>
				<Tabs
					options={simpleTabs}
					value="tab1"
					orientation={props.orientation}
					position={props.position}
					align={props.align}
					disabled={props.disabled}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Value" {value} />
	{/snippet}
</PlaySection>
