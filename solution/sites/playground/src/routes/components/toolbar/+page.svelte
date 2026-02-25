<script lang="ts">
	import { Toolbar } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let lastAction = $state('')

	let props = $state({ size: 'md', compact: false, showDividers: false, disabled: false })

	const schema = {
		type: 'object',
		properties: {
			size: { type: 'string' },
			compact: { type: 'boolean' },
			showDividers: { type: 'boolean' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/compact', label: 'Compact' },
			{ scope: '#/showDividers', label: 'Show dividers' },
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}

	const items = [
		{ text: 'Bold', value: 'bold', icon: 'i-lucide:bold', type: 'toggle' },
		{ text: 'Italic', value: 'italic', icon: 'i-lucide:italic', type: 'toggle' },
		{ text: 'Underline', value: 'underline', icon: 'i-lucide:underline', type: 'toggle' },
		{ type: 'separator' },
		{ text: 'Align left', value: 'align-left', icon: 'i-lucide:align-left' },
		{ text: 'Align center', value: 'align-center', icon: 'i-lucide:align-center' },
		{ text: 'Align right', value: 'align-right', icon: 'i-lucide:align-right' }
	]

	const withSpacer = [
		{ text: 'Save', value: 'save', icon: 'i-lucide:save' },
		{ text: 'Download', value: 'download', icon: 'i-lucide:download' },
		{ type: 'spacer' },
		{ text: 'Share', value: 'share', icon: 'i-lucide:share' },
		{ text: 'Settings', value: 'settings', icon: 'i-lucide:settings' }
	]

	function handleClick(value: unknown) {
		lastAction = String(value)
	}
</script>

<Playground
	title="Toolbar"
	description="Data-driven or slot-based action bar with separators and spacers."
>
	{#snippet preview()}
		<div class="flex flex-col gap-6">
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">With separators</h4>
				<Toolbar
					{items}
					size={props.size as any}
					compact={props.compact}
					disabled={props.disabled}
					showDividers={props.showDividers}
					onclick={handleClick}
				/>
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">With spacer</h4>
				<Toolbar
					items={withSpacer}
					size={props.size as any}
					compact={props.compact}
					disabled={props.disabled}
					showDividers={props.showDividers}
					onclick={handleClick}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Last action" value={lastAction || '—'} />
	{/snippet}
</Playground>
