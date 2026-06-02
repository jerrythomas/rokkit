/**
 * Rating Component Types
 */

/**
 * Icon overrides for the Rating component.
 */
export interface RatingIcons {
	/** Icon class for a filled star. */
	filled?: string

	/** Icon class for an empty star. */
	empty?: string

	/** Icon class for a half-filled star. */
	half?: string
}

/**
 * Props for the Rating component.
 */
export interface RatingProps {
	/** Current rating value (bindable). */
	value?: number

	/** Maximum number of stars. Default `5`. */
	max?: number

	/** Disabled state. */
	disabled?: boolean

	/** Accessible label for the surrounding radio group. */
	label?: string

	/** Custom icon overrides. */
	icons?: RatingIcons

	/** Called when the value changes. */
	onchange?: (value: number) => void

	/** Additional CSS class. */
	class?: string
}
