<script>
	// @ts-nocheck
	// Set item.snippet = 'name' to route specific items to a named snippet
	const items = [
		{ label: 'Apple', snippet: 'fruit', icon: 'i-lucide:apple' },
		{ label: 'Carrot', snippet: 'vegetable', icon: 'i-lucide:carrot' }
	]
</script>

<List {items}>
	{#snippet fruit(proxy)}
		<span class={proxy.icon}></span>
		<span>{proxy.text}</span>
		<span class="text-error-z5 text-xs">fruit</span>
	{/snippet}
	{#snippet vegetable(proxy)}
		<span class={proxy.icon}></span>
		<span>{proxy.text}</span>
		<span class="text-success-z5 text-xs">veggie</span>
	{/snippet}
</List>
