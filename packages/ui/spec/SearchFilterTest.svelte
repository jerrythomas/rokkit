<script>
	import SearchFilter from '../src/components/SearchFilter.svelte'

	/** Wrapper so the spec can supply SearchFilter's `tag` snippet. */
	let { withTagSnippet = false, ...rest } = $props()
</script>

{#snippet tagSnippet(filter, remove)}
	<span data-custom-tag>
		<span data-custom-tag-text>{String(filter.value)}</span>
		<button type="button" data-custom-tag-remove onclick={() => remove()}>x</button>
	</span>
{/snippet}

{#if withTagSnippet}
	<SearchFilter {...rest} tag={tagSnippet} />
{:else}
	<SearchFilter {...rest} />
{/if}
