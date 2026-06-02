/**
 * NavContent Component Types
 */

import type { Snippet } from 'svelte'

/** Layout orientation. */
export type NavContentOrientation = 'horizontal' | 'vertical'

/**
 * Props for the NavContent component.
 */
export interface NavContentProps {
	/** Layout orientation. */
	orientation?: NavContentOrientation

	/** Nav panel width (horizontal) or height (vertical) — CSS length value. */
	navSize?: string

	/** Collapse the nav panel on small screens. */
	collapsible?: boolean

	/** Nav panel snippet. */
	nav: Snippet

	/** Content panel snippet. */
	content: Snippet

	/** Additional CSS class. */
	class?: string
}
