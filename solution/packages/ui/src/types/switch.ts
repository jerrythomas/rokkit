/**
 * Switch Component Types
 *
 * Provides types for the iOS-style Switch component.
 * Field mapping and data access is handled by ProxyItem from @rokkit/states.
 */

// =============================================================================
// Field Mapping Types
// =============================================================================

/**
 * Field mapping configuration for switch option data.
 * Maps custom data field names to the component's expected properties.
 */
export interface SwitchFields {
	text?: string
	value?: string
	icon?: string
	disabled?: string
	description?: string
}

// =============================================================================
// Switch Item Types
// =============================================================================

/**
 * A switch option — can be any object, primitive, or boolean.
 * Processed through ProxyItem for field resolution.
 */
export type SwitchItem = Record<string, unknown> | string | number | boolean

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the Switch component
 */
export interface SwitchProps {
	/**
	 * Exactly two options. First = off/unchecked. Second = on/checked.
	 * @default [false, true]
	 */
	options?: [SwitchItem, SwitchItem]

	/** Field mapping configuration */
	fields?: SwitchFields

	/** Currently selected value */
	value?: unknown

	/** Called when the switch changes */
	onchange?: (value: unknown, item: SwitchItem) => void

	/** Whether to show text labels beside the track */
	showLabels?: boolean

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** Whether the switch is disabled */
	disabled?: boolean

	/** Additional CSS classes */
	class?: string
}
