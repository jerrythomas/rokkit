/**
 * Select Component Types
 *
 * Provides types for the data-driven Select and MultiSelect components.
 * Field mapping and data access is handled by ItemProxy.
 */

import type { Snippet } from 'svelte'
import type { ItemFields } from './item-proxy.js'

// =============================================================================
// Field Mapping Types
// =============================================================================

/**
 * Field mapping configuration for select data.
 * Extends ItemFields for consistency.
 */
export type SelectFields = ItemFields

/**
 * Default field mapping values
 */
export const defaultSelectFields: Required<Omit<SelectFields, 'fields'>> = {
	text: 'text',
	value: 'value',
	icon: 'icon',
	description: 'description',
	shortcut: 'shortcut',
	label: 'label',
	disabled: 'disabled',
	active: 'active',
	type: 'type',
	children: 'children',
	snippet: 'snippet',
	href: 'href',
	badge: 'badge'
}

// =============================================================================
// Select Item Types
// =============================================================================

/**
 * Generic select item - can be any object with mapped fields
 */
export type SelectItem = Record<string, unknown>

// =============================================================================
// Snippet Types
// =============================================================================

/**
 * Handlers passed to custom item snippets
 */
export interface SelectItemHandlers {
	/** Call to trigger item selection */
	onclick: () => void
	/** Forward keyboard events for accessibility */
	onkeydown: (event: KeyboardEvent) => void
}

/**
 * Snippet type for rendering select options
 */
export type SelectItemSnippet = Snippet<[SelectItem, SelectFields, SelectItemHandlers, boolean]>

/**
 * Snippet type for rendering group labels
 */
export type SelectGroupLabelSnippet = Snippet<[SelectItem, SelectFields]>

/**
 * Snippet type for rendering the selected value display
 */
export type SelectValueSnippet = Snippet<[SelectItem | null, SelectFields]>

/**
 * Snippet type for rendering selected values in MultiSelect
 */
export type MultiSelectValueSnippet = Snippet<[SelectItem[], SelectFields]>

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Common props shared between Select and MultiSelect
 */
export interface SelectBaseProps {
	/** Array of select options or groups */
	options?: SelectItem[]

	/** Field mapping configuration */
	fields?: SelectFields

	/** Placeholder text when no selection */
	placeholder?: string

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** Dropdown alignment relative to trigger */
	align?: 'left' | 'right' | 'start' | 'end'

	/** Dropdown slide direction */
	direction?: 'up' | 'down'

	/** Maximum visible rows in dropdown (default: 5) */
	maxRows?: number

	/** Whether the select is disabled */
	disabled?: boolean

	/** Additional CSS classes */
	class?: string

	/** Custom snippet for rendering options */
	item?: SelectItemSnippet

	/** Custom snippet for rendering group labels */
	groupLabel?: SelectGroupLabelSnippet
}

/**
 * Props for the Select component (single selection)
 */
export interface SelectProps extends SelectBaseProps {
	/** Currently selected value (bindable) */
	value?: unknown

	/** Currently selected item reference (bindable) - the actual item from options */
	selected?: SelectItem | null

	/** Called when selection changes */
	onchange?: (value: unknown, item: SelectItem) => void

	/** Custom snippet for rendering the selected value */
	selectedValue?: SelectValueSnippet
}

/**
 * Props for the MultiSelect component (multiple selection)
 */
export interface MultiSelectProps extends SelectBaseProps {
	/** Currently selected items (bindable) - array of full item objects */
	value?: SelectItem[]

	/** Called when selection changes */
	onchange?: (items: SelectItem[]) => void

	/** Custom snippet for rendering selected values */
	selectedValues?: MultiSelectValueSnippet

	/** Maximum number of tags to show before collapsing to count */
	maxDisplay?: number
}

// =============================================================================
// Helper Functions
// =============================================================================

export { getSnippet } from './menu.js'
