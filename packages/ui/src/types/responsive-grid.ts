/**
 * ResponsiveGrid Component Types
 */

import type { Snippet } from 'svelte'

/**
 * Props for the ResponsiveGrid component.
 */
export interface ResponsiveGridProps {
	/** Minimum column width — CSS length value. */
	minWidth?: string

	/** Gap between cells — CSS length value. */
	gap?: string

	/** Maximum number of columns. */
	maxCols?: number

	/** Grid children. */
	children: Snippet

	/** Additional CSS class. */
	class?: string
}
