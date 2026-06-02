/**
 * Divider Component Types
 */

/** Divider orientation. */
export type DividerOrientation = 'horizontal' | 'vertical'

/**
 * Props for the Divider component.
 */
export interface DividerProps {
	/** Orientation of the divider. */
	orientation?: DividerOrientation

	/** Optional label text rendered inline with the divider. */
	label?: string

	/** Additional CSS class. */
	class?: string
}
