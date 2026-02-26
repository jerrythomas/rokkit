<script lang="ts">
	import type { Snippet } from 'svelte'
	import { swipeable, keyboard } from '@rokkit/actions'

	interface CarouselProps {
		/** Number of slides (required when using children snippet) */
		count?: number
		/** Current slide index (bindable) */
		current?: number
		/** Auto-advance slides */
		autoplay?: boolean
		/** Autoplay interval in milliseconds (default: 5000) */
		interval?: number
		/** Wrap around at ends (default: true) */
		loop?: boolean
		/** Show navigation dots (default: true) */
		showDots?: boolean
		/** Show prev/next arrow buttons (default: true) */
		showArrows?: boolean
		/** Transition effect (default: 'slide') */
		transition?: 'slide' | 'fade' | 'none'
		/** Additional CSS class */
		class?: string
		/** Slide content — receives (index, current) */
		slide?: Snippet<[number, number]>
		/** Children snippet (alternative to slide) */
		children?: Snippet
	}

	let {
		count = 0,
		current = $bindable(0),
		autoplay = false,
		interval = 5000,
		loop = true,
		showDots = true,
		showArrows = true,
		transition = 'slide',
		class: className = '',
		slide,
		children
	}: CarouselProps = $props()

	let hovered = $state(false)

	const keyMap = {
		prev: ['ArrowLeft'],
		next: ['ArrowRight'],
		first: ['Home'],
		last: ['End']
	}

	function prev() {
		if (current > 0) {
			current--
		} else if (loop) {
			current = count - 1
		}
	}

	function next() {
		if (current < count - 1) {
			current++
		} else if (loop) {
			current = 0
		}
	}

	function goTo(index: number) {
		if (index >= 0 && index < count) {
			current = index
		}
	}

	// Autoplay
	$effect(() => {
		if (!autoplay || hovered || count <= 1) return

		const timer = setInterval(() => {
			next()
		}, interval)

		return () => clearInterval(timer)
	})
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	data-carousel
	data-carousel-transition={transition}
	class={className || undefined}
	role="application"
	aria-roledescription="carousel"
	aria-label="Carousel"
	tabindex="0"
	use:swipeable={{ horizontal: true, vertical: false }}
	use:keyboard={keyMap}
	onswipeLeft={next}
	onswipeRight={prev}
	onprev={prev}
	onnext={next}
	onfirst={() => goTo(0)}
	onlast={() => goTo(count - 1)}
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
>
	<div data-carousel-viewport>
		<div
			data-carousel-track
			style:--carousel-current={current}
			style:--carousel-count={count}
		>
			{#if slide}
				{#each Array(count) as _, index (index)}
					<div
						data-carousel-slide
						data-active={index === current || undefined}
						role="tabpanel"
						aria-roledescription="slide"
						aria-label="Slide {index + 1} of {count}"
						aria-hidden={index !== current}
					>
						{@render slide(index, current)}
					</div>
				{/each}
			{:else if children}
				{@render children()}
			{/if}
		</div>
	</div>

	{#if showArrows && count > 1}
		<button
			data-carousel-prev
			type="button"
			aria-label="Previous slide"
			onclick={prev}
			disabled={!loop && current === 0}
		>
			<span class="i-lucide:chevron-left" aria-hidden="true"></span>
		</button>

		<button
			data-carousel-next
			type="button"
			aria-label="Next slide"
			onclick={next}
			disabled={!loop && current === count - 1}
		>
			<span class="i-lucide:chevron-right" aria-hidden="true"></span>
		</button>
	{/if}

	{#if showDots && count > 1}
		<div data-carousel-dots role="tablist" aria-label="Slide navigation">
			{#each Array(count) as _, index (index)}
				<button
					data-carousel-dot
					data-active={index === current || undefined}
					type="button"
					role="tab"
					aria-selected={index === current}
					aria-label="Go to slide {index + 1}"
					onclick={() => goTo(index)}
				></button>
			{/each}
		</div>
	{/if}
</div>
