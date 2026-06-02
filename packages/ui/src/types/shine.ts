/**
 * Shine Component Types
 *
 * Renders an SVG specular-lighting filter that tracks pointer position to
 * give wrapped content a moving highlight.
 */

import type { Snippet } from 'svelte'

/**
 * Props for the Shine component.
 */
export interface ShineProps {
	/** Light color. Default `'rgb(var(--primary-500))'`. */
	color?: string

	/** Light source distance / height — controls highlight spread. Default `300`. */
	radius?: number

	/** Gaussian blur depth applied to the highlight. Default `1`. */
	depth?: number

	/** Surface height for the light filter. Default `2`. */
	surfaceScale?: number

	/** Reflection size — bigger = bigger reflection. Default `0.75`. */
	specularConstant?: number

	/** Light source focus — bigger = brighter. Default `120`. */
	specularExponent?: number

	/** Additional CSS class. */
	class?: string

	/** Content the highlight wraps. */
	children?: Snippet
}
