/**
 * Range Component Types
 *
 * Custom slider with single or dual-handle modes,
 * tick marks, drag interaction, and keyboard support.
 */

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the Range component
 */
export interface RangeProps {
	/** Current value in single mode (bindable) */
	value?: number

	/** Lower bound value in range mode (bindable) */
	lower?: number

	/** Upper bound value in range mode (bindable) */
	upper?: number

	/** Minimum value (default: 0) */
	min?: number

	/** Maximum value (default: 100) */
	max?: number

	/** Step increment (default: 1, 0 = continuous) */
	step?: number

	/** Whether to show dual handles for range selection */
	range?: boolean

	/** Number of tick divisions (default: 0 = no ticks) */
	ticks?: number

	/** Show label every N ticks (default: 0 = show all) */
	labelSkip?: number

	/** Disabled state */
	disabled?: boolean

	/** Called when value changes */
	onchange?: (value: number | [number, number]) => void

	/** Additional CSS class */
	class?: string
}
