<script lang="ts">
	import { Tabs } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let value = $state<unknown>('overview')

	let props = $state({ orientation: 'horizontal', position: 'before', align: 'start', disabled: false })

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
			{ scope: '#/orientation', label: 'Orientation', props: { options: ['horizontal', 'vertical'] } },
			{ scope: '#/position', label: 'Position', props: { options: ['before', 'after'] } },
			{ scope: '#/align', label: 'Align', props: { options: ['start', 'center', 'end'] } },
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}

	const tabs = [
		{ text: 'Overview', value: 'overview', icon: 'i-lucide:home', content: 'Welcome to the overview panel. This is the main dashboard view.' },
		{ text: 'Settings', value: 'settings', icon: 'i-lucide:settings', content: 'Configure your preferences and application settings here.' },
		{ text: 'Activity', value: 'activity', icon: 'i-lucide:activity', content: 'View recent activity and event logs.' }
	]

	const simpleTabs = [
		{ text: 'Tab 1', value: 'tab1', content: 'Content for the first tab.' },
		{ text: 'Tab 2', value: 'tab2', content: 'Content for the second tab.' },
		{ text: 'Tab 3', value: 'tab3', content: 'Content for the third tab.' }
	]
</script>

<Playground title="Tabs" description="Tabbed navigation with keyboard support and panel content.">
	{#snippet preview()}
		<div class="flex flex-col gap-8 w-full">
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">With icons</h4>
				<Tabs
					options={tabs}
					bind:value
					orientation={props.orientation as any}
					position={props.position as any}
					align={props.align as any}
					disabled={props.disabled}
				/>
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Simple</h4>
				<Tabs
					options={simpleTabs}
					value="tab1"
					orientation={props.orientation as any}
					position={props.position as any}
					align={props.align as any}
					disabled={props.disabled}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Value" {value} />
	{/snippet}
</Playground>
