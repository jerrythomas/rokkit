/**
 * ProgressBar Component Types
 */

/**
 * Props for the ProgressBar component.
 *
 * Pass `value = null` (or omit it) to render in indeterminate state.
 */
export interface ProgressBarProps {
	/** Current progress value. `null` (or undefined) renders indeterminate. */
	value?: number | null

	/** Maximum value. Default `100`. */
	max?: number

	/** Additional CSS class. */
	class?: string
}
