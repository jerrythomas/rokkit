<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'

	const items = [
		{ label: 'Apple', snippet: 'fruit', icon: 'i-lucide:apple' },
		{ label: 'Carrot', snippet: 'vegetable', icon: 'i-lucide:carrot' },
		{ label: 'Banana', snippet: 'fruit', icon: 'i-lucide:banana' },
		{ label: 'Broccoli', snippet: 'vegetable', icon: 'i-lucide:leaf' },
		{ label: 'Cherry', snippet: 'fruit', icon: 'i-lucide:cherry' },
		{ label: 'Spinach', snippet: 'vegetable', icon: 'i-lucide:leaf' }
	]

	let value = $state(null)
</script>

<List {items} bind:value onselect={(v) => (value = v)}>
	{#snippet fruit(proxy)}
		{#if proxy.icon}
			<span class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span class="flex-1">{proxy.label}</span>
		<span class="text-error-z5 text-xs">fruit</span>
	{/snippet}
	{#snippet vegetable(proxy)}
		{#if proxy.icon}
			<span class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span class="flex-1">{proxy.label}</span>
		<span class="text-success-z5 text-xs">veggie</span>
	{/snippet}
</List>

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected: <strong>{value.label ?? value}</strong></p>
{/if}
