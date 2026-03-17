<script>
	// @ts-nocheck
	import { Select } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let value = $state(undefined)

	let props = $state({
		placeholder: 'Choose a fruit...',
		size: 'md',
		align: 'start',
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
			{ scope: '#/align', label: 'Align', props: { options: ['start', 'end'] } },
			{ scope: '#/direction', label: 'Direction', props: { options: ['down', 'up'] } },
			{ scope: '#/disabled', label: 'Disabled' },
			{ scope: '#/filterable', label: 'Filterable' },
			{ type: 'separator' }
		]
	}

	const fruits = [
		{ label: 'Apple', value: 'apple', icon: 'i-glyph:close-circle' },
		{ label: 'Banana', value: 'banana', icon: 'i-glyph:close-circle' },
		{ label: 'Cherry', value: 'cherry', icon: 'i-glyph:close-circle' },
		{ label: 'Date', value: 'date', icon: 'i-glyph:close-circle' },
		{ label: 'Elderberry', value: 'elderberry', icon: 'i-glyph:close-circle' }
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
		<div class="flex flex-wrap gap-8">
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Simple</h4>
				<div class="w-[250px]">
					<Select
						items={fruits}
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
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Grouped</h4>
				<div class="w-[250px]">
					<Select
						items={grouped}
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
