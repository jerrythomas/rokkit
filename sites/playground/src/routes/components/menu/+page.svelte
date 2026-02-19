<script lang="ts">
	import { Menu } from '@rokkit/ui'
	import Playground from '$lib/Playground.svelte'
	import { PropSelect, PropCheckbox, PropText, PropInfo } from '$lib/controls'

	let selected = $state('')
	let size = $state('md')
	let align = $state('left')
	let direction = $state('down')
	let disabled = $state(false)
	let showArrow = $state(true)
	let label = $state('Actions')

	const items = [
		{ text: 'Cut', value: 'cut', icon: 'i-lucide:scissors', shortcut: 'Ctrl+X' },
		{ text: 'Copy', value: 'copy', icon: 'i-lucide:copy', shortcut: 'Ctrl+C' },
		{ text: 'Paste', value: 'paste', icon: 'i-lucide:clipboard', shortcut: 'Ctrl+V' },
		{ text: 'Delete', value: 'delete', icon: 'i-lucide:trash' }
	]

	const groupedItems = [
		{
			text: 'File',
			children: [
				{ text: 'New', value: 'new', icon: 'i-lucide:file', shortcut: 'Ctrl+N' },
				{ text: 'Open', value: 'open', icon: 'i-lucide:folder-open', shortcut: 'Ctrl+O' },
				{ text: 'Save', value: 'save', icon: 'i-lucide:save', shortcut: 'Ctrl+S' }
			]
		},
		{
			text: 'Edit',
			children: [
				{ text: 'Undo', value: 'undo', shortcut: 'Ctrl+Z' },
				{ text: 'Redo', value: 'redo', shortcut: 'Ctrl+Y' }
			]
		}
	]

	function handleSelect(value: unknown) {
		selected = String(value)
	}
</script>

<Playground
	title="Menu"
	description="Dropdown menu with flat or grouped items, keyboard navigation, and custom rendering."
>
	{#snippet preview()}
		<div class="demos">
			<div>
				<h4>Flat</h4>
				<Menu
					options={items}
					{label}
					icon="i-lucide:menu"
					size={size as any}
					align={align as any}
					direction={direction as any}
					{disabled}
					{showArrow}
					onselect={handleSelect}
				/>
			</div>
			<div>
				<h4>Grouped</h4>
				<Menu
					options={groupedItems}
					label="File Menu"
					size={size as any}
					align={align as any}
					direction={direction as any}
					{disabled}
					{showArrow}
					onselect={handleSelect}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<PropText label="Label" bind:value={label} />
		<PropSelect label="Size" bind:value={size} options={['sm', 'md', 'lg']} />
		<PropSelect label="Align" bind:value={align} options={['left', 'right']} />
		<PropSelect label="Direction" bind:value={direction} options={['down', 'up']} />
		<PropCheckbox label="Show arrow" bind:checked={showArrow} />
		<PropCheckbox label="Disabled" bind:checked={disabled} />
		<hr />
		<PropInfo label="Selected" value={selected || '—'} />
	{/snippet}
</Playground>

<style>
	.demos {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
	}
	.demos h4 {
		margin: 0 0 0.5rem;
		font-size: 0.75rem;
		color: rgb(var(--color-surface-500));
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	hr {
		border: none;
		border-top: 1px solid rgb(var(--color-surface-200));
		margin: 0;
	}
</style>
