<script>
	import Swatch from '../src/components/Swatch.svelte'

	/** Wrapper so the spec can supply Swatch's `item` snippet. */
	let { withItemSnippet = false, ...rest } = $props()
</script>

{#snippet itemSnippet(proxy, selected)}
	<span data-custom-swatch data-custom-selected={selected || undefined}>{proxy.label}</span>
{/snippet}

{#if withItemSnippet}
	<Swatch {...rest} item={itemSnippet} />
{:else}
	<Swatch {...rest} />
{/if}
