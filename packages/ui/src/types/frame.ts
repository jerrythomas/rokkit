/**
 * Frame Component Types
 *
 * Generic header / body / footer container primitive — used by CodeBlock,
 * PlotPlugin and other "card-shaped UI block" surfaces. For an interactive
 * card (link / button) prefer `<Card/>`.
 */

import type { Snippet } from 'svelte'

/**
 * Props for the Frame component.
 */
export interface FrameProps {
	/** Top slot — title, action chips, status badges, etc. */
	header?: Snippet

	/** Main content. */
	children?: Snippet

	/** Bottom slot — metadata, actions, secondary controls. */
	footer?: Snippet

	/**
	 * When true the body slot has zero padding so the inner artifact
	 * (a chart, a `<pre>`, a table) controls its own padding.
	 */
	flush?: boolean
}
