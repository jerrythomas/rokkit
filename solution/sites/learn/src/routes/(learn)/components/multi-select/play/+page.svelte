<script>
	// @ts-nocheck
	import { MultiSelect } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let value = $state([])

	let props = $state({
		placeholder: 'Pick colors...',
		size: 'md',
		disabled: false
	})

	const schema = {
		type: 'object',
		properties: {
			placeholder: { type: 'string' },
			size: { type: 'string' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/placeholder', label: 'Placeholder' },
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}

	const colors = [
		{ text: 'Red', value: 'red' },
		{ text: 'Green', value: 'green' },
		{ text: 'Blue', value: 'blue' },
		{ text: 'Yellow', value: 'yellow' },
		{ text: 'Purple', value: 'purple' },
		{ text: 'Orange', value: 'orange' },
		{ text: 'Pink', value: 'pink' },
		{ text: 'Teal', value: 'teal' }
	]

	const withIcons = [
		{ text: 'Home', value: 'home', icon: 'i-lucide:home' },
		{ text: 'Settings', value: 'settings', icon: 'i-lucide:settings' },
		{ text: 'User', value: 'user', icon: 'i-lucide:user' },
		{ text: 'Mail', value: 'mail', icon: 'i-lucide:mail' },
		{ text: 'Bell', value: 'bell', icon: 'i-lucide:bell' }
	]
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex gap-8 flex-wrap">
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">Colors</h4>
				<div class="w-[300px]">
					<MultiSelect
						items={colors}
						placeholder={props.placeholder}
						size={props.size}
						disabled={props.disabled}
						bind:value
					/>
				</div>
			</div>
			<div>
				<h4 class="m-0 mb-2 text-xs text-surface-z5 uppercase tracking-wide">With icons</h4>
				<div class="w-[300px]">
					<MultiSelect
						items={withIcons}
						placeholder="Pick pages..."
						size={props.size}
						disabled={props.disabled}
					/>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Count" value={value.length} />
		<InfoField label="Selected" value={value.join(', ') || '—'} />
	{/snippet}
</PlaySection>
