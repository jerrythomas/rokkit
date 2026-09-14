<script>
	import BreadCrumbs from '../src/components/BreadCrumbs.svelte'

	/** Wrapper so the spec can supply BreadCrumbs' `crumb` snippet. */
	let { withCrumbSnippet = false, ...rest } = $props()
</script>

{#snippet crumbSnippet(proxy, isLast)}
	<span data-custom-crumb data-custom-last={isLast || undefined}>{proxy.label}</span>
{/snippet}

{#if withCrumbSnippet}
	<BreadCrumbs {...rest} crumb={crumbSnippet} />
{:else}
	<BreadCrumbs {...rest} />
{/if}
