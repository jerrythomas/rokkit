/**
 * Tilt Component Types
 */

import type { Snippet } from 'svelte'

/**
 * Props for the Tilt component.
 *
 * Wraps content in a container that rotates in response to pointer
 * movement, with optional brightness modulation.
 */
export interface TiltProps {
	/** Maximum rotation angle in degrees. Default `10`. */
	maxRotation?: number

	/** Whether to adjust brightness based on pointer Y position. */
	setBrightness?: boolean

	/** CSS perspective value in pixels. Default `600`. */
	perspective?: number

	/** Additional CSS class. */
	class?: string

	/** Content to tilt. */
	children?: Snippet
}
