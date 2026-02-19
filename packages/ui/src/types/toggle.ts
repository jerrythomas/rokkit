/**
 * Toggle Component Types
 *
 * Provides types for the data-driven Toggle component.
 * Field mapping and data access is handled by ItemProxy.
 */

// =============================================================================
// Field Mapping Types
// =============================================================================

/**
 * Field mapping configuration for toggle data.
 * Maps custom data field names to the component's expected properties.
 */
export interface ToggleFields {
	/** Field for display text - default: 'text' */
	text?: string

	/** Field for the value to emit on select - default: 'value' */
	value?: string

	/** Field for icon class name - default: 'icon' */
	icon?: string

	/** Field for disabled state - default: 'disabled' */
	disabled?: string

	/** Field for tooltip/description text - default: 'description' */
	description?: string
}

/**
 * Default field mapping values
 */
export const defaultToggleFields: Required<ToggleFields> = {
	text: 'text',
	value: 'value',
	icon: 'icon',
	disabled: 'disabled',
	description: 'description'
}

// =============================================================================
// Toggle Item Types
// =============================================================================

/**
 * Generic toggle item - can be any object with mapped fields
 */
export type ToggleItem = Record<string, unknown>

// =============================================================================
// Snippet Types
// =============================================================================

/**
 * Handlers passed to custom item snippets
 */
export interface ToggleItemHandlers {
	/** Call to trigger item selection */
	onclick: () => void
	/** Forward keyboard events for accessibility */
	onkeydown: (event: KeyboardEvent) => void
}

/**
 * Snippet type for rendering toggle items.
 * Fourth parameter is whether the item is currently selected.
 */
export type ToggleItemSnippet = import('svelte').Snippet<
	[ToggleItem, ToggleFields, ToggleItemHandlers, boolean]
>

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the Toggle component
 */
export interface ToggleProps {
	/** Array of toggle options */
	options?: ToggleItem[]

	/** Field mapping configuration */
	fields?: ToggleFields

	/** Currently selected value */
	value?: unknown

	/** Called when selection changes */
	onchange?: (value: unknown, item: ToggleItem) => void

	/** Whether to show text labels alongside icons */
	showLabels?: boolean

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** Whether the entire toggle is disabled */
	disabled?: boolean

	/** Additional CSS classes */
	class?: string

	/** Custom snippet for rendering toggle items */
	item?: ToggleItemSnippet
}
