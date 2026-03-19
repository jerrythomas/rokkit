<script>
	// @ts-nocheck
	import { Dropdown } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let value = $state('')

	let props = $state({
		placeholder: 'Select...',
		size: 'md',
		align: 'start',
		direction: 'down',
		showArrow: true,
		disabled: false
	})

	const schema = {
		type: 'object',
		properties: {
			placeholder: { type: 'string' },
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
			{ scope: '#/placeholder', label: 'Placeholder' },
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/align', label: 'Align', props: { options: ['start', 'end'] } },
			{ scope: '#/direction', label: 'Direction', props: { options: ['down', 'up'] } },
			{ scope: '#/showArrow', label: 'Show arrow' },
			{ scope: '#/disabled', label: 'Disabled' }
		]
	}

	const items = [
		{ label: 'Apple', value: 'apple' },
		{ label: 'Banana', value: 'banana' },
		{ label: 'Cherry', value: 'cherry' },
		{ label: 'Date', value: 'date', disabled: true },
		{ label: 'Elderberry', value: 'elderberry' }
	]

	const statusItems = [
		{ label: 'Active', value: 'active' },
		{ label: 'Paused', value: 'paused' },
		{ label: 'Archived', value: 'archived' }
	]
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-wrap gap-8">
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Basic</h4>
				<Dropdown
					{items}
					bind:value
					placeholder={props.placeholder}
					size={props.size}
					align={props.align}
					direction={props.direction}
					showArrow={props.showArrow}
					disabled={props.disabled}
				/>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">With Icon</h4>
				<Dropdown
					items={statusItems}
					bind:value
					icon="i-glyph:flag"
					placeholder="Set status"
					size={props.size}
					align={props.align}
					direction={props.direction}
					showArrow={props.showArrow}
					disabled={props.disabled}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Selected" value={value || '—'} />
	{/snippet}
</PlaySection>
