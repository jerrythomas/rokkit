<script lang="ts">
	import Tree from '../src/components/Tree.svelte'

	const {
		items = []
	}: {
		items?: unknown[]
	} = $props()
</script>

{#snippet pinned(proxy)}
	<span data-named-item>Pinned: {proxy.label}</span>
{/snippet}

<Tree {items} snippets={{ pinned }}>
	{#snippet itemContent(proxy)}
		<span data-default-item>Item: {proxy.label}</span>
	{/snippet}
</Tree>
