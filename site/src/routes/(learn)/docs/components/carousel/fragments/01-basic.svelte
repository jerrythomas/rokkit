<script>
	import { Carousel } from '@rokkit/ui'

	let current = $state(0)
	const count = 3
</script>

<Carousel {count} bind:current>
	{#snippet slide(index)}
		<div class="flex h-48 items-center justify-center">
			<h3>Slide {index + 1}</h3>
		</div>
	{/snippet}
</Carousel>
