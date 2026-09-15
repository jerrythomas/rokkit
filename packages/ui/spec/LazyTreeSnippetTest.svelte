<script lang="ts">
	import LazyTree from '../src/components/LazyTree.svelte'

	const {
		items = []
	}: {
		items?: unknown[]
	} = $props()
</script>

{#snippet pinned(proxy)}
	<span data-named-item>Pinned: {proxy.label}</span>
{/snippet}

<LazyTree {items} snippets={{ pinned }}>
	{#snippet itemContent(proxy)}
		<span data-default-item>Item: {proxy.label}</span>
	{/snippet}
</LazyTree>
