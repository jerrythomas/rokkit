<script lang="ts">
	import { Menu } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let selected = $state('')

	let props = $state({ label: 'Actions', size: 'md', align: 'left', direction: 'down', showArrow: true, disabled: false })

	const schema = {
		type: 'object',
		properties: {
			label: { type: 'string' },
			size: { type: 'string' },
			align: { type: 'string' },
			direction: { type: 'string' },
			showArrow: { type: 'boolean' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/label', label: 'Label' },
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/align', label: 'Align', props: { options: ['left', 'right'] } },
			{ scope: '#/direction', label: 'Direction', props: { options: ['down', 'up'] } },
			{ scope: '#/showArrow', label: 'Show arrow' },
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}

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
		<div class="flex gap-8 flex-wrap">
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Flat</h4>
				<Menu
					options={items}
					label={props.label}
					icon="i-lucide:menu"
					size={props.size as any}
					align={props.align as any}
					direction={props.direction as any}
					disabled={props.disabled}
					showArrow={props.showArrow}
					onselect={handleSelect}
				/>
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Grouped</h4>
				<Menu
					options={groupedItems}
					label="File Menu"
					size={props.size as any}
					align={props.align as any}
					direction={props.direction as any}
					disabled={props.disabled}
					showArrow={props.showArrow}
					onselect={handleSelect}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Selected" value={selected || '—'} />
	{/snippet}
</Playground>
