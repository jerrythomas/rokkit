<script lang="ts">
	import { FloatingAction } from '@rokkit/ui'
	import Playground from '$lib/Playground.svelte'
	import { PropSelect, PropCheckbox, PropInfo } from '$lib/controls'

	let lastAction = $state('')
	let size = $state('md')
	let expand = $state('vertical')
	let position = $state('bottom-right')
	let backdrop = $state(false)

	const actions = [
		{ text: 'Edit', value: 'edit', icon: 'i-lucide:edit' },
		{ text: 'Copy', value: 'copy', icon: 'i-lucide:copy' },
		{ text: 'Share', value: 'share', icon: 'i-lucide:share' },
		{ text: 'Delete', value: 'delete', icon: 'i-lucide:trash' }
	]

	function handleSelect(value: unknown) {
		lastAction = String(value)
	}
</script>

<Playground
	title="FloatingAction"
	description="Floating action button (FAB) with radial, vertical, or horizontal expansion."
>
	{#snippet preview()}
		<div class="fab-area">
			<FloatingAction
				items={actions}
				icon="i-lucide:plus"
				expand={expand as any}
				position={position as any}
				size={size as any}
				{backdrop}
				contained
				onselect={handleSelect}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<PropSelect label="Size" bind:value={size} options={['sm', 'md', 'lg']} />
		<PropSelect label="Expand" bind:value={expand} options={['vertical', 'horizontal', 'radial']} />
		<PropSelect
			label="Position"
			bind:value={position}
			options={['bottom-right', 'bottom-left', 'top-right', 'top-left']}
		/>
		<PropCheckbox label="Backdrop" bind:checked={backdrop} />
		<hr />
		<PropInfo label="Last action" value={lastAction || '—'} />
	{/snippet}
</Playground>

<style>
	.fab-area {
		position: relative;
		height: 300px;
		border: 1px dashed rgb(var(--color-surface-300));
		border-radius: 0.5rem;
	}
	hr {
		border: none;
		border-top: 1px solid rgb(var(--color-surface-200));
		margin: 0;
	}
</style>
