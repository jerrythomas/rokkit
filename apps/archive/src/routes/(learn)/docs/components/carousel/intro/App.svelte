<script>
	import { Carousel } from '@rokkit/ui'

	let current = $state(0)

	const slides = [
		{ title: 'Welcome', color: 'bg-primary/20', icon: 'i-glyph:star' },
		{ title: 'Features', color: 'bg-secondary/20', icon: 'i-glyph:bolt' },
		{ title: 'Get Started', color: 'bg-accent/20', icon: 'i-glyph:rocket' }
	]
</script>

<div class="w-full max-w-lg">
	<Carousel count={slides.length} bind:current>
		{#snippet slide(index)}
			<div class="flex h-48 flex-col items-center justify-center gap-4 {slides[index].color}">
				<span class="{slides[index].icon} text-4xl"></span>
				<h3 class="text-lg font-semibold">{slides[index].title}</h3>
				<p class="text-surface-z6 text-sm">Slide {index + 1} of {slides.length}</p>
			</div>
		{/snippet}
	</Carousel>
</div>
