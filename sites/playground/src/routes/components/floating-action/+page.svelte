<script lang="ts">
	import { FloatingAction } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let lastAction = $state('')

	let props = $state({ size: 'md', expand: 'vertical', position: 'bottom-right', itemAlign: 'center', backdrop: false })

	const schema = {
		type: 'object',
		properties: {
			size: { type: 'string' },
			expand: { type: 'string' },
			position: { type: 'string' },
			itemAlign: { type: 'string' },
			backdrop: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/expand', label: 'Expand', props: { options: ['vertical', 'horizontal', 'radial'] } },
			{ scope: '#/position', label: 'Position', props: { options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'] } },
			{ scope: '#/itemAlign', label: 'Item Align', props: { options: ['start', 'center', 'end'] } },
			{ scope: '#/backdrop', label: 'Backdrop' },
			{ type: 'separator' }
		]
	}

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
		<div class="relative w-full h-[400px] border-dashed border-surface-z3 border rounded-lg overflow-visible">
			<FloatingAction
				items={actions}
				icon="i-lucide:plus"
				expand={props.expand as any}
				position={props.position as any}
				itemAlign={props.itemAlign as any}
				size={props.size as any}
				backdrop={props.backdrop}
				contained
				onselect={handleSelect}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Last action" value={lastAction || '—'} />
	{/snippet}
</Playground>
