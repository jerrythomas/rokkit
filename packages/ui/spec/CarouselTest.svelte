<script>
	import Carousel from '../src/components/Carousel.svelte'

	/** Wrapper so the spec can supply Carousel's `slide` snippet. */
	let { withSlides = false, ...rest } = $props()
</script>

{#snippet slideSnippet(index, current)}
	<span data-custom-slide data-slide-index={index} data-slide-current={index === current || undefined}>
		Slide {index}
	</span>
{/snippet}

{#if withSlides}
	<Carousel {...rest} slide={slideSnippet} />
{:else}
	<Carousel {...rest} />
{/if}
