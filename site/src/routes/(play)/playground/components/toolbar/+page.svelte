<script>
	// @ts-nocheck
	import { Toolbar, ToolbarGroup, Button } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let props = $state({
		position: 'top',
		size: 'md',
		compact: false,
		showDividers: true,
		disabled: false
	})

	const schema = {
		type: 'object',
		properties: {
			position: { type: 'string' },
			size: { type: 'string' },
			compact: { type: 'boolean' },
			showDividers: { type: 'boolean' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/position',
				label: 'Position',
				props: { options: ['top', 'bottom', 'left', 'right'] }
			},
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/compact', label: 'Compact' },
			{ scope: '#/showDividers', label: 'Show dividers' },
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}

	const items = [
		{ label: 'Bold', icon: 'i-lucide:bold', value: 'bold' },
		{ label: 'Italic', icon: 'i-lucide:italic', value: 'italic' },
		{ label: 'Underline', icon: 'i-lucide:underline', value: 'underline' },
		{ type: 'separator' },
		{ label: 'Align Left', icon: 'i-lucide:align-left', value: 'align-left' },
		{ label: 'Align Center', icon: 'i-lucide:align-center', value: 'align-center' },
		{ label: 'Align Right', icon: 'i-lucide:align-right', value: 'align-right' },
		{ type: 'spacer' },
		{ label: 'Settings', icon: 'i-lucide:settings', value: 'settings' }
	]

	let lastAction = $state('')

	function handleClick(value) {
		lastAction = value
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex w-full flex-col gap-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Data-driven items</h4>
				<Toolbar
					{items}
					position={props.position}
					size={props.size}
					compact={props.compact}
					showDividers={props.showDividers}
					disabled={props.disabled}
					onclick={handleClick}
				/>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">
					Slot-based (start / center / end)
				</h4>
				<Toolbar
					position={props.position}
					size={props.size}
					compact={props.compact}
					showDividers={props.showDividers}
					disabled={props.disabled}
				>
					{#snippet start()}
						<Button label="New" icon="i-lucide:plus" style="ghost" size={props.size} />
						<Button label="Open" icon="i-lucide:folder-open" style="ghost" size={props.size} />
					{/snippet}
					{#snippet center()}
						<span class="text-surface-z6 text-sm">document.txt</span>
					{/snippet}
					{#snippet end()}
						<Button label="Save" icon="i-lucide:save" style="ghost" size={props.size} />
					{/snippet}
				</Toolbar>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Last action" value={lastAction || '—'} />
	{/snippet}
</PlaySection>
