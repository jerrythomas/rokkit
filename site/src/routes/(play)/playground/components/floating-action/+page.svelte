<script>
	// @ts-nocheck
	import { FloatingAction } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let lastAction = $state('')

	let props = $state({
		size: 'md',
		expand: 'vertical',
		position: 'bottom-right',
		itemAlign: 'center',
		backdrop: false
	})

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
			{
				scope: '#/expand',
				label: 'Expand',
				props: { options: ['vertical', 'horizontal', 'radial'] }
			},
			{
				scope: '#/position',
				label: 'Position',
				props: { options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'] }
			},
			{ scope: '#/itemAlign', label: 'Item Align', props: { options: ['start', 'center', 'end'] } },
			{ scope: '#/backdrop', label: 'Backdrop' },
			{ type: 'separator' }
		]
	}

	const actions = [
		{ label: 'Edit', value: 'edit', icon: 'i-lucide:edit' },
		{ label: 'Copy', value: 'copy', icon: 'i-lucide:copy' },
		{ label: 'Share', value: 'share', icon: 'i-lucide:share' },
		{ label: 'Delete', value: 'delete', icon: 'i-lucide:trash' }
	]

	function handleSelect(value) {
		lastAction = String(value)
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div
			class="border-surface-z3 relative h-[400px] w-full overflow-visible rounded-lg border border-dashed"
		>
			<FloatingAction
				items={actions}
				icon="i-lucide:plus"
				expand={props.expand}
				position={props.position}
				itemAlign={props.itemAlign}
				size={props.size}
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
</PlaySection>
