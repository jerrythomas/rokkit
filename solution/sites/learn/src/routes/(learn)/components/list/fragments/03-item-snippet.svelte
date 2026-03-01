<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'
</script>

<!-- itemContent receives a ProxyItem — use proxy.get('field') for custom fields -->
<List {items} bind:value onselect={(v) => (value = v)}>
	{#snippet itemContent(proxy)}
		{#if proxy.icon}
			<span class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span class="flex-1">{proxy.label}</span>
		<span class="badge">{proxy.get('status')}</span>
	{/snippet}
</List>
