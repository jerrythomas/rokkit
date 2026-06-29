<script lang="ts">
	import Tree from '../src/components/Tree.svelte'

	const {
		items = []
	}: {
		items?: unknown[]
	} = $props()
</script>

<Tree {items}>
	{#snippet pinned(proxy)}
		<span data-named-item>Pinned: {proxy.label}</span>
	{/snippet}
	{#snippet itemContent(proxy)}
		<span data-default-item>Item: {proxy.label}</span>
	{/snippet}
</Tree>
