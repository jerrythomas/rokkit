<script lang="ts">
	import { Toolbar } from '@rokkit/ui'
	import Playground from '$lib/Playground.svelte'
	import { PropSelect, PropCheckbox, PropInfo } from '$lib/controls'

	let lastAction = $state('')
	let size = $state('md')
	let compact = $state(false)
	let disabled = $state(false)
	let showDividers = $state(false)

	const items = [
		{ text: 'Bold', value: 'bold', icon: 'i-lucide:bold', type: 'toggle' },
		{ text: 'Italic', value: 'italic', icon: 'i-lucide:italic', type: 'toggle' },
		{ text: 'Underline', value: 'underline', icon: 'i-lucide:underline', type: 'toggle' },
		{ type: 'separator' },
		{ text: 'Align left', value: 'align-left', icon: 'i-lucide:align-left' },
		{ text: 'Align center', value: 'align-center', icon: 'i-lucide:align-center' },
		{ text: 'Align right', value: 'align-right', icon: 'i-lucide:align-right' }
	]

	const withSpacer = [
		{ text: 'Save', value: 'save', icon: 'i-lucide:save' },
		{ text: 'Download', value: 'download', icon: 'i-lucide:download' },
		{ type: 'spacer' },
		{ text: 'Share', value: 'share', icon: 'i-lucide:share' },
		{ text: 'Settings', value: 'settings', icon: 'i-lucide:settings' }
	]

	function handleClick(value: unknown) {
		lastAction = String(value)
	}
</script>

<Playground
	title="Toolbar"
	description="Data-driven or slot-based action bar with separators and spacers."
>
	{#snippet preview()}
		<div class="demos">
			<div>
				<h4>With separators</h4>
				<Toolbar
					{items}
					size={size as any}
					{compact}
					{disabled}
					{showDividers}
					onclick={handleClick}
				/>
			</div>
			<div>
				<h4>With spacer</h4>
				<Toolbar
					items={withSpacer}
					size={size as any}
					{compact}
					{disabled}
					{showDividers}
					onclick={handleClick}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<PropSelect label="Size" bind:value={size} options={['sm', 'md', 'lg']} />
		<PropCheckbox label="Compact" bind:checked={compact} />
		<PropCheckbox label="Show dividers" bind:checked={showDividers} />
		<PropCheckbox label="Disabled" bind:checked={disabled} />
		<hr />
		<PropInfo label="Last action" value={lastAction || '—'} />
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
