/**
 * Card Component Types
 */

import type { Snippet } from 'svelte'

/** Semantic color variant for a card. */
export type CardVariant = 'default' | 'primary' | 'secondary' | 'tertiary'

/**
 * Props for the Card component.
 *
 * When `href` is provided the card renders as an anchor. When `onclick` is
 * provided (and no `href`) it renders as a button. Otherwise it renders as
 * a plain container.
 */
export interface CardProps {
	/** Optional href — renders the card as an `<a>` link. */
	href?: string

	/** Click handler — applies only when no `href` is provided. */
	onclick?: () => void

	/** Visual variant. */
	variant?: CardVariant

	/** Additional CSS class. */
	class?: string

	/** Card header snippet. */
	header?: Snippet

	/** Card footer snippet. */
	footer?: Snippet

	/** Card body content. */
	children?: Snippet
}
