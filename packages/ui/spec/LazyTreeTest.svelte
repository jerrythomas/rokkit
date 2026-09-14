<script>
	import LazyTree from '../src/components/LazyTree.svelte'

	/**
	 * `content` is not a prop — LazyTree resolves it with
	 * `resolveSnippet(snippets, proxy, ITEM_SNIPPET)`, so the snippet arrives in the
	 * rest props under the name `itemContent` (or whatever the item's own `snippet`
	 * field names).
	 */
	let { withContent = false, ...rest } = $props()
</script>

{#snippet itemContent(proxy)}
	<span data-custom-content>{proxy.label}</span>
{/snippet}

{#if withContent}
	<LazyTree {...rest} {itemContent} />
{:else}
	<LazyTree {...rest} />
{/if}
