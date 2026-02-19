<script lang="ts">
	import { MultiSelect } from '@rokkit/ui'
	import Playground from '$lib/Playground.svelte'
	import { PropSelect, PropCheckbox, PropText, PropInfo } from '$lib/controls'

	let value = $state<Record<string, unknown>[]>([])
	let size = $state('md')
	let disabled = $state(false)
	let placeholder = $state('Pick colors...')

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

<Playground
	title="MultiSelect"
	description="Multi-selection dropdown with tags, keyboard navigation, and bindable value array."
>
	{#snippet preview()}
		<div class="demos">
			<div>
				<h4>Colors</h4>
				<div class="constrained">
					<MultiSelect options={colors} {placeholder} size={size as any} {disabled} bind:value />
				</div>
			</div>
			<div>
				<h4>With icons</h4>
				<div class="constrained">
					<MultiSelect
						options={withIcons}
						placeholder="Pick pages..."
						size={size as any}
						{disabled}
					/>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<PropText label="Placeholder" bind:value={placeholder} />
		<PropSelect label="Size" bind:value={size} options={['sm', 'md', 'lg']} />
		<PropCheckbox label="Disabled" bind:checked={disabled} />
		<hr />
		<PropInfo label="Count" value={value.length} />
		<PropInfo label="Selected" value={value.map((v) => v.text).join(', ') || '—'} />
	{/snippet}
</Playground>

<style>
	.demos {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
	}
	.demos h4 {
		margin: 0 0 0.5rem;
		font-size: 0.75rem;
		color: rgb(var(--color-surface-500));
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.constrained {
		width: 300px;
	}
	hr {
		border: none;
		border-top: 1px solid rgb(var(--color-surface-200));
		margin: 0;
	}
</style>
