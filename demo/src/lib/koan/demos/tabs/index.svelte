<script lang="ts">
	import { Tabs } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'

	let value = $state('overview')

	let layout = $state({
		orientation: 'horizontal',
		position: 'before',
		align: 'start',
		disabled: false
	})

	let mapping = $state({
		iconField: 'icon',
		showIcons: true
	})

	const items = [
		{
			label: 'Overview',
			value: 'overview',
			icon: 'i-glyph:home',
			image: 'i-glyph:user',
			content: 'Welcome to the overview panel — your starting point.'
		},
		{
			label: 'Settings',
			value: 'settings',
			icon: 'i-glyph:settings',
			image: 'i-glyph:palette',
			content: 'Configure your preferences here.'
		},
		{
			label: 'Activity',
			value: 'activity',
			icon: 'i-glyph:chart',
			image: 'i-glyph:bell',
			content: 'View recent activity and event logs.'
		}
	]

	const fields = $derived(
		mapping.showIcons ? { icon: mapping.iconField } : { icon: '__none__' }
	)

	const layoutSchema = {
		type: 'object',
		properties: {
			orientation: { type: 'string' },
			position: { type: 'string' },
			align: { type: 'string' },
			disabled: { type: 'boolean' }
		}
	}
	const layoutLayout = {
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

	const mappingSchema = {
		type: 'object',
		properties: {
			iconField: { type: 'string' },
			showIcons: { type: 'boolean' }
		}
	}
	const mappingLayout = {
		type: 'vertical',
		elements: [
			{ scope: '#/iconField', label: 'Icon field', props: { options: ['icon', 'image'] } },
			{ scope: '#/showIcons', label: 'Show icons' }
		]
	}
</script>

<section class="tabs-demo">
	<div class="grid">
		<div class="preview">
			<Tabs
				options={items}
				bind:value
				{fields}
				orientation={layout.orientation}
				position={layout.position}
				align={layout.align}
				disabled={layout.disabled}
			/>
		</div>
		<div class="controls">
			<fieldset>
				<legend>Layout</legend>
				<FormRenderer bind:data={layout} schema={layoutSchema} layout={layoutLayout} />
			</fieldset>
			<fieldset>
				<legend>Field mapping</legend>
				<FormRenderer bind:data={mapping} schema={mappingSchema} layout={mappingLayout} />
			</fieldset>
			<InfoField label="Selected value" value={value} />
		</div>
	</div>

	<details class="data">
		<summary>Data preview</summary>
		<pre><code>{JSON.stringify(items, null, 2)}</code></pre>
	</details>

	<p class="intro">
		Rokkit components adapt to your data via field mapping. Try mapping the icon field to
		<code>image</code> — the same Tabs component renders different visuals without touching the data.
	</p>
</section>

<style>
	.tabs-demo {
		display: flex;
		flex-direction: column;
		gap: 20px;
		max-width: 1080px;
		margin: 0 auto;
	}

	.grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 24px;
	}

	.preview {
		@apply bg-surface-z0 border border-surface-z2;
		padding: 20px;
		border-radius: var(--radius-md, 6px);
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 16px;
		@apply bg-surface-z0 border border-surface-z2;
		padding: 16px;
		border-radius: var(--radius-md, 6px);
	}

	fieldset {
		@apply border border-surface-z2 text-ink-z1;
		padding: 12px;
		border-radius: var(--radius-sm, 4px);
	}

	legend {
		@apply text-ink-z3;
		padding: 0 6px;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.data summary {
		@apply text-ink-z3;
		cursor: pointer;
		font-size: 13px;
	}

	.data pre {
		@apply bg-surface-z0 border border-surface-z2 text-ink-z2;
		padding: 12px;
		border-radius: var(--radius-sm, 4px);
		overflow-x: auto;
		font-size: 12px;
		font-family: var(--font-mono);
	}

	.intro {
		@apply text-ink-z3;
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 22px;
		margin: 0;
		text-align: center;
	}

	.intro code {
		font-family: var(--font-mono);
		font-size: 15px;
		@apply bg-surface-z2 text-ink-z1;
		padding: 1px 6px;
		border-radius: var(--radius-sm, 4px);
	}
</style>
