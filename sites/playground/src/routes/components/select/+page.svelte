<script lang="ts">
	import { Select } from '@rokkit/ui'
	import Playground from '$lib/Playground.svelte'
	import { PropSelect, PropCheckbox, PropText, PropInfo } from '$lib/controls'

	let value = $state<unknown>(undefined)
	let size = $state('md')
	let align = $state('left')
	let direction = $state('down')
	let disabled = $state(false)
	let placeholder = $state('Choose a fruit...')

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
		<div class="demos">
			<div>
				<h4>Simple</h4>
				<div class="constrained">
					<Select
						options={fruits}
						{placeholder}
						size={size as any}
						align={align as any}
						direction={direction as any}
						{disabled}
						bind:value
					/>
				</div>
			</div>
			<div>
				<h4>Grouped</h4>
				<div class="constrained">
					<Select
						options={grouped}
						placeholder="Choose..."
						size={size as any}
						align={align as any}
						direction={direction as any}
						{disabled}
						bind:value
					/>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<PropText label="Placeholder" bind:value={placeholder} />
		<PropSelect label="Size" bind:value={size} options={['sm', 'md', 'lg']} />
		<PropSelect label="Align" bind:value={align} options={['left', 'right']} />
		<PropSelect label="Direction" bind:value={direction} options={['down', 'up']} />
		<PropCheckbox label="Disabled" bind:checked={disabled} />
		<hr />
		<PropInfo label="Value" {value} />
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
		width: 250px;
	}
	hr {
		border: none;
		border-top: 1px solid rgb(var(--color-surface-200));
		margin: 0;
	}
</style>
