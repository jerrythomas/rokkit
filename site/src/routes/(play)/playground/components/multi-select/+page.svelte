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
		{ label: 'Red', value: 'red' },
		{ label: 'Green', value: 'green' },
		{ label: 'Blue', value: 'blue' },
		{ label: 'Yellow', value: 'yellow' },
		{ label: 'Purple', value: 'purple' },
		{ label: 'Orange', value: 'orange' },
		{ label: 'Pink', value: 'pink' },
		{ label: 'Teal', value: 'teal' }
	]

	const withIcons = [
		{ label: 'Home', value: 'home', icon: 'i-lucide:home' },
		{ label: 'Settings', value: 'settings', icon: 'i-lucide:settings' },
		{ label: 'User', value: 'user', icon: 'i-lucide:user' },
		{ label: 'Mail', value: 'mail', icon: 'i-lucide:mail' },
		{ label: 'Bell', value: 'bell', icon: 'i-lucide:bell' }
	]
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-wrap gap-8">
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Colors</h4>
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
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">With icons</h4>
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
