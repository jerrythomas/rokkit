/**
 * Stack Component Types
 */

import type { Snippet } from 'svelte'

/** Layout direction. */
export type StackDirection = 'vertical' | 'horizontal'

/** Gap size between children — maps to the theme's spacing scale. */
export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Cross-axis alignment. */
export type StackAlign = 'start' | 'center' | 'end' | 'stretch'

/** Main-axis justification. */
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around'

/**
 * Props for the Stack component.
 */
export interface StackProps {
	/** Layout direction. */
	direction?: StackDirection

	/** Gap size between children. */
	gap?: StackGap

	/** Cross-axis alignment. */
	align?: StackAlign

	/** Main-axis justification. */
	justify?: StackJustify

	/** Stack children. */
	children: Snippet

	/** Additional CSS class. */
	class?: string
}
