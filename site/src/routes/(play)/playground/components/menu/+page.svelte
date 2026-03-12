<script>
	// @ts-nocheck
	import { Menu } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let selected = $state('')

	let props = $state({
		label: 'Actions',
		size: 'md',
		align: 'start',
		direction: 'down',
		showArrow: true,
		disabled: false
	})

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
			{ scope: '#/align', label: 'Align', props: { options: ['start', 'end'] } },
			{ scope: '#/direction', label: 'Direction', props: { options: ['down', 'up'] } },
			{ scope: '#/showArrow', label: 'Show arrow' },
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}

	const items = [
		{ label: 'Cut', value: 'cut', icon: 'i-lucide:scissors', shortcut: 'Ctrl+X' },
		{ label: 'Copy', value: 'copy', icon: 'i-lucide:copy', shortcut: 'Ctrl+C' },
		{ label: 'Paste', value: 'paste', icon: 'i-lucide:clipboard', shortcut: 'Ctrl+V' },
		{ label: 'Delete', value: 'delete', icon: 'i-lucide:trash' }
	]

	const groupedItems = [
		{
			label: 'File',
			children: [
				{ label: 'New', value: 'new', icon: 'i-lucide:file', shortcut: 'Ctrl+N' },
				{ label: 'Open', value: 'open', icon: 'i-lucide:folder-open', shortcut: 'Ctrl+O' },
				{ label: 'Save', value: 'save', icon: 'i-lucide:save', shortcut: 'Ctrl+S' }
			]
		},
		{
			label: 'Edit',
			children: [
				{ label: 'Undo', value: 'undo', shortcut: 'Ctrl+Z' },
				{ label: 'Redo', value: 'redo', shortcut: 'Ctrl+Y' }
			]
		}
	]

	function handleSelect(value) {
		selected = String(value)
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-wrap gap-8">
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Flat</h4>
				<Menu
					{items}
					label={props.label}
					icon="i-lucide:menu"
					size={props.size}
					align={props.align}
					direction={props.direction}
					disabled={props.disabled}
					showArrow={props.showArrow}
					onselect={handleSelect}
				/>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Grouped</h4>
				<Menu
					items={groupedItems}
					label="File Menu"
					size={props.size}
					align={props.align}
					direction={props.direction}
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
</PlaySection>
