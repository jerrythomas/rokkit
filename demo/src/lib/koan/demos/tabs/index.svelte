<script lang="ts">
	import { Tabs } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'

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
			{ scope: '#/disabled', label: 'Disabled' }
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

<section class="tabs-demo">
	<div class="grid">
		<div class="preview">
			<div class="example">
				<h4>With icons</h4>
				<Tabs
					options={tabs}
					bind:value
					orientation={props.orientation}
					position={props.position}
					align={props.align}
					disabled={props.disabled}
				/>
			</div>
			<div class="example">
				<h4>Simple</h4>
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
		<div class="controls">
			<FormRenderer bind:data={props} {schema} {layout} />
			<InfoField label="Value" {value} />
		</div>
	</div>
	<p class="intro">Tabs let you switch between related views. Use the controls on the right to experiment with orientation, position, alignment, and the disabled state.</p>
</section>

<style>
	.tabs-demo {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 1080px;
		margin: 0 auto;
	}

	.grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 24px;
	}

	.preview {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.example h4 {
		@apply text-ink-z4;
		margin: 0 0 8px;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 12px;
		@apply bg-surface-z0 border border-surface-z2;
		padding: 16px;
		border-radius: var(--radius-md, 6px);
	}

	.intro {
		@apply text-ink-z3;
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 22px;
		margin: 0;
		text-align: center;
	}
</style>
