<script lang="ts">
	import { Toggle } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let value = $state<unknown>('list')
	let textValue = $state<unknown>('week')

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

	const viewOptions = [
		{ label: 'List', value: 'list', icon: 'i-lucide:list' },
		{ label: 'Grid', value: 'grid', icon: 'i-lucide:grid-2x2' },
		{ label: 'Board', value: 'board', icon: 'i-lucide:layout-grid' }
	]

	const textOnly = [
		{ label: 'Day', value: 'day' },
		{ label: 'Week', value: 'week' },
		{ label: 'Month', value: 'month' },
		{ label: 'Year', value: 'year' }
	]
</script>

<Playground title="Toggle" description="Radio-style button group for mutually exclusive selection.">
	{#snippet preview()}
		<div class="flex flex-col gap-6">
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">With icons</h4>
				<Toggle options={viewOptions} bind:value size={props.size as any} showLabels={props.showLabels} disabled={props.disabled} />
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Text only</h4>
				<Toggle options={textOnly} bind:value={textValue} size={props.size as any} showLabels={props.showLabels} disabled={props.disabled} />
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Value" {value} />
	{/snippet}
</Playground>
