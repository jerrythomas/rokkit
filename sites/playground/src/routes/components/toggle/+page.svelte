<script lang="ts">
	import { Toggle } from '@rokkit/ui'
	import Playground from '$lib/Playground.svelte'
	import { PropSelect, PropCheckbox, PropInfo } from '$lib/controls'

	let value = $state<unknown>('list')
	let size = $state('md')
	let showLabels = $state(true)
	let disabled = $state(false)

	const viewOptions = [
		{ text: 'List', value: 'list', icon: 'i-lucide:list' },
		{ text: 'Grid', value: 'grid', icon: 'i-lucide:grid-2x2' },
		{ text: 'Board', value: 'board', icon: 'i-lucide:layout-grid' }
	]

	const textOnly = [
		{ text: 'Day', value: 'day' },
		{ text: 'Week', value: 'week' },
		{ text: 'Month', value: 'month' },
		{ text: 'Year', value: 'year' }
	]
</script>

<Playground title="Toggle" description="Radio-style button group for mutually exclusive selection.">
	{#snippet preview()}
		<div class="demos">
			<div>
				<h4>With icons</h4>
				<Toggle options={viewOptions} bind:value size={size as any} {showLabels} {disabled} />
			</div>
			<div>
				<h4>Text only</h4>
				<Toggle options={textOnly} value="week" size={size as any} {showLabels} {disabled} />
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<PropSelect label="Size" bind:value={size} options={['sm', 'md', 'lg']} />
		<PropCheckbox label="Show labels" bind:checked={showLabels} />
		<PropCheckbox label="Disabled" bind:checked={disabled} />
		<hr />
		<PropInfo label="Value" {value} />
	{/snippet}
</Playground>

<style>
	.demos {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.demos h4 {
		margin: 0 0 0.5rem;
		font-size: 0.75rem;
		color: rgb(var(--color-surface-500));
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	hr {
		border: none;
		border-top: 1px solid rgb(var(--color-surface-200));
		margin: 0;
	}
</style>
