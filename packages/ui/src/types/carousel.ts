/**
 * Carousel Component Types
 */

import type { Snippet } from 'svelte'

/** Transition effect between carousel slides. */
export type CarouselTransition = 'slide' | 'fade' | 'none'

/**
 * Props for the Carousel component.
 */
export interface CarouselProps {
	/** Number of slides (required when using the `children` snippet). */
	count?: number

	/** Current slide index (bindable). */
	current?: number

	/** Auto-advance slides. */
	autoplay?: boolean

	/** Autoplay interval in milliseconds. Default `5000`. */
	interval?: number

	/** Wrap around at the ends. Default `true`. */
	loop?: boolean

	/** Show navigation dots. Default `true`. */
	showDots?: boolean

	/** Show prev / next arrow buttons. Default `true`. */
	showArrows?: boolean

	/** Transition effect. Default `'slide'`. */
	transition?: CarouselTransition

	/** Accessible label overrides for built-in controls. */
	labels?: Record<string, string>

	/** Additional CSS class. */
	class?: string

	/** Slide content — receives `(index, current)`. */
	slide?: Snippet<[number, number]>

	/** Children snippet (alternative to `slide`). */
	children?: Snippet
}
