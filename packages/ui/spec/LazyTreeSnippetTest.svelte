<script lang="ts">
	import LazyTree from '../src/components/LazyTree.svelte'

	const {
		items = []
	}: {
		items?: unknown[]
	} = $props()
</script>

<LazyTree {items}>
	{#snippet pinned(proxy)}
		<span data-named-item>Pinned: {proxy.label}</span>
	{/snippet}
	{#snippet itemContent(proxy)}
		<span data-default-item>Item: {proxy.label}</span>
	{/snippet}
</LazyTree>
