/**
 * Reveal Component Types
 */

import type { Snippet } from 'svelte'

/** Slide direction for the reveal animation. */
export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none'

/**
 * Props for the Reveal component.
 *
 * Wraps the `reveal` action so children animate in once they intersect the
 * viewport.
 */
export interface RevealProps {
	/** Slide direction. Default `'up'`. */
	direction?: RevealDirection

	/** Slide distance — CSS length value. Default `'1.5rem'`. */
	distance?: string

	/** Transition duration in milliseconds. Default `600`. */
	duration?: number

	/** Delay before animation starts in milliseconds. Default `0`. */
	delay?: number

	/**
	 * Delay increment per direct child in milliseconds — used for staggered
	 * reveals. Default `0`.
	 */
	stagger?: number

	/** Animate only on first intersection. Default `true`. */
	once?: boolean

	/** IntersectionObserver threshold (0–1). Default `0.1`. */
	threshold?: number

	/** CSS easing function. */
	easing?: string

	/** Additional CSS class. */
	class?: string

	/** Content to reveal. */
	children?: Snippet
}
