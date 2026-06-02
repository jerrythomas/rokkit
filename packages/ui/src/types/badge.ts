/**
 * Badge Component Types
 */

import type { Snippet } from 'svelte'

/** Semantic color variant for a badge. */
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * Props for the Badge component.
 *
 * Badge can be used standalone or wrapped around a child via the `children`
 * snippet, in which case it positions itself absolutely over the child.
 */
export interface BadgeProps {
	/** Numeric count to display. */
	count?: number

	/** Maximum count before rendering as `${max}+`. Default `99`. */
	max?: number

	/** Visual variant. */
	variant?: BadgeVariant

	/** Render as a small dot without content. */
	dot?: boolean

	/**
	 * Content to wrap. When provided, the badge positions absolutely over
	 * the rendered child.
	 */
	children?: Snippet

	/** Additional CSS class. */
	class?: string
}
