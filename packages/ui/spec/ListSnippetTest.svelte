<script lang="ts">
	import List from '../src/components/List.svelte'

	const {
		items = [],
		collapsible = false
	}: {
		items?: unknown[]
		collapsible?: boolean
	} = $props()
</script>

<List {items} {collapsible}>
	{#snippet observatoryHeader(proxy)}
		<span data-named-group>Observatory: {proxy.label}</span>
	{/snippet}
	{#snippet pinned(proxy)}
		<span data-named-item>Pinned: {proxy.label}</span>
	{/snippet}
	{#snippet groupContent(proxy)}
		<span data-default-group>Group: {proxy.label}</span>
	{/snippet}
	{#snippet itemContent(proxy)}
		<span data-default-item>Item: {proxy.label}</span>
	{/snippet}
</List>
