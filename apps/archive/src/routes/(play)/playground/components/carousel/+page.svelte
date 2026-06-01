<script>
	// @ts-nocheck
	import { Carousel } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let props = $state({
		autoplay: false,
		interval: 5000,
		loop: true,
		showDots: true,
		showArrows: true,
		transition: 'slide'
	})

	const schema = {
		type: 'object',
		properties: {
			autoplay: { type: 'boolean' },
			interval: { type: 'number' },
			loop: { type: 'boolean' },
			showDots: { type: 'boolean' },
			showArrows: { type: 'boolean' },
			transition: { type: 'string', enum: ['slide', 'fade', 'none'] }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/transition', label: 'Transition' },
			{ scope: '#/autoplay', label: 'Autoplay' },
			{ scope: '#/interval', label: 'Interval (ms)' },
			{ scope: '#/loop', label: 'Loop' },
			{ scope: '#/showDots', label: 'Show Dots' },
			{ scope: '#/showArrows', label: 'Show Arrows' }
		]
	}

	const slides = [
		{ bg: 'bg-primary-z3', label: 'Slide 1', icon: 'i-glyph:gallery' },
		{ bg: 'bg-accent-z3', label: 'Slide 2', icon: 'i-glyph:star' },
		{ bg: 'bg-surface-z3', label: 'Slide 3', icon: 'i-glyph:heart' },
		{ bg: 'bg-primary-z2', label: 'Slide 4', icon: 'i-glyph:bolt' }
	]
</script>

<PlaySection>
	{#snippet preview()}
		<div class="mx-auto w-full max-w-lg p-4">
			<Carousel
				count={slides.length}
				autoplay={props.autoplay}
				interval={props.interval}
				loop={props.loop}
				showDots={props.showDots}
				showArrows={props.showArrows}
				transition={props.transition}
			>
				{#snippet slide(index)}
					<div class="flex h-64 items-center justify-center rounded-lg {slides[index].bg}">
						<div class="flex flex-col items-center gap-3">
							<span class="{slides[index].icon} text-5xl"></span>
							<span class="text-lg font-semibold">{slides[index].text}</span>
						</div>
					</div>
				{/snippet}
			</Carousel>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
	{/snippet}
</PlaySection>
