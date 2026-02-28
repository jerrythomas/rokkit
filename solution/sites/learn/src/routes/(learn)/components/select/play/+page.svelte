<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let value = $state(undefined)

	let props = $state({
		placeholder: 'Choose a fruit...',
		size: 'md',
		align: 'left',
		direction: 'down',
		disabled: false,
		filterable: false
	})

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
			{ scope: '#/align', label: 'Align', props: { options: ['left', 'right'] } },
			{ scope: '#/direction', label: 'Direction', props: { options: ['down', 'up'] } },
			{ scope: '#/disabled', label: 'Disabled' },
			{ scope: '#/filterable', label: 'Filterable' },
			{ type: 'separator' }
		]
	}

	const fruits = [
		{ label: 'Apple', value: 'apple', icon: 'i-lucide:circle' },
		{ label: 'Banana', value: 'banana', icon: 'i-lucide:circle' },
		{ label: 'Cherry', value: 'cherry', icon: 'i-lucide:circle' },
		{ label: 'Date', value: 'date', icon: 'i-lucide:circle' },
		{ label: 'Elderberry', value: 'elderberry', icon: 'i-lucide:circle' }
	]

	const grouped = [
		{
			label: 'Fruits',
			children: [
				{ label: 'Apple', value: 'apple' },
				{ label: 'Banana', value: 'banana' },
				{ label: 'Cherry', value: 'cherry' }
			]
		},
		{
			label: 'Vegetables',
			children: [
				{ label: 'Carrot', value: 'carrot' },
				{ label: 'Broccoli', value: 'broccoli' },
				{ label: 'Spinach', value: 'spinach' }
			]
		}
	]
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex gap-8 flex-wrap">
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Simple</h4>
				<div class="w-[250px]">
					<Select
						options={fruits}
						placeholder={props.placeholder}
						size={props.size}
						align={props.align}
						direction={props.direction}
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
						options={grouped}
						placeholder="Choose..."
						size={props.size}
						align={props.align}
						direction={props.direction}
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
</PlaySection>
