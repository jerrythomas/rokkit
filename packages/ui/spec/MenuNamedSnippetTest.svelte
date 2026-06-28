<script lang="ts">
	import Menu from '../src/components/Menu.svelte'

	const {
		items = []
	}: {
		items?: unknown[]
	} = $props()
</script>

<Menu {items}>
	{#snippet header(proxy)}
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
</Menu>
