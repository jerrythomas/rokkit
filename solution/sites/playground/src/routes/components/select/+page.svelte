<script lang="ts">
	import { Select } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

	let value = $state<unknown>(undefined)

	let props = $state({ placeholder: 'Choose a fruit...', size: 'md', align: 'start', direction: 'down', disabled: false, filterable: false })

	const schema = {
		type: 'object',
		properties: {
			placeholder: { type: 'string' },
			size: { type: 'string' },
			align: { type: 'string' },
			direction: { type: 'string' },
			disabled: { type: 'boolean' },
			filterable: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/placeholder', label: 'Placeholder' },
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/align', label: 'Align', props: { options: ['start', 'end'] } },
			{ scope: '#/direction', label: 'Direction', props: { options: ['down', 'up'] } },
			{ scope: '#/disabled', label: 'Disabled' },
			{ scope: '#/filterable', label: 'Filterable' },
			{ type: 'separator' }
		]
	}

	const fruits = [
		{ text: 'Apple', value: 'apple', icon: 'i-lucide:circle' },
		{ text: 'Banana', value: 'banana', icon: 'i-lucide:circle' },
		{ text: 'Cherry', value: 'cherry', icon: 'i-lucide:circle' },
		{ text: 'Date', value: 'date', icon: 'i-lucide:circle' },
		{ text: 'Elderberry', value: 'elderberry', icon: 'i-lucide:circle' }
	]

	const grouped = [
		{
			text: 'Fruits',
			children: [
				{ text: 'Apple', value: 'apple' },
				{ text: 'Banana', value: 'banana' },
				{ text: 'Cherry', value: 'cherry' }
			]
		},
		{
			text: 'Vegetables',
			children: [
				{ text: 'Carrot', value: 'carrot' },
				{ text: 'Broccoli', value: 'broccoli' },
				{ text: 'Spinach', value: 'spinach' }
			]
		}
	]
</script>

<Playground
	title="Select"
	description="Single-selection dropdown with field mapping and keyboard navigation."
>
	{#snippet preview()}
		<div class="flex gap-8 flex-wrap">
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Simple</h4>
				<div class="w-[250px]">
					<Select
						items={fruits}
						placeholder={props.placeholder}
						size={props.size as any}
						align={props.align as any}
						direction={props.direction as any}
						disabled={props.disabled}
						filterable={props.filterable}
						bind:value
					/>
				</div>
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Grouped</h4>
				<div class="w-[250px]">
					<Select
						items={grouped}
						placeholder="Choose..."
						size={props.size as any}
						align={props.align as any}
						direction={props.direction as any}
						disabled={props.disabled}
						filterable={props.filterable}
						bind:value
					/>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Value" {value} />
	{/snippet}
</Playground>
