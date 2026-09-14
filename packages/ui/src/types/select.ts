/**
 * Select Component Types
 *
 * Provides types for the data-driven Select and MultiSelect components.
 * Field mapping and data access is handled by ProxyItem from @rokkit/states.
 */

import type { ItemSnippets } from './snippets.js'
import { DEFAULT_STATE_ICONS } from '@rokkit/core'

// =============================================================================
// Select Item Types
// =============================================================================

/**
 * Generic select item - can be any object with mapped fields
 */
export type SelectItem = Record<string, unknown>

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Common props shared between Select, MultiSelect and Dropdown.
 *
 * Each component annotates its own `$props()` with the derived interface, so
 * they cannot drift — which is how the previous version came to name the data
 * prop `options` when every component takes `items`, and to declare
 * `option` / `groupLabel` snippets the components never read.
 */
export interface SelectBaseProps {
	/** Array of options or groups */
	items?: unknown[]

	/** Field mapping — overrides BASE_FIELDS defaults */
	fields?: Record<string, string>

	/** Placeholder text when no selection */
	placeholder?: string

	/** Size variant */
	size?: string

	/** Whether the control is disabled */
	disabled?: boolean

	/** Dropdown alignment relative to trigger */
	align?: 'start' | 'end'

	/** Dropdown slide direction */
	direction?: 'up' | 'down'

	/** Icons for dropdown arrow, check and remove */
	icons?: SelectStateIcons

	/** Additional CSS classes on root element */
	class?: string
}

/**
 * Props for the Select component (single selection).
 */
export interface SelectProps extends SelectBaseProps, ItemSnippets {
	/** Selected value (bindable) — extracted via item[fields.value] */
	value?: unknown

	/** Selected raw item (bindable) */
	selected?: unknown

	/** Enable the typeahead filter input in the dropdown header */
	filterable?: boolean

	/** Placeholder for the filter input */
	filterPlaceholder?: string

	/** Maximum visible rows in the dropdown */
	maxRows?: number

	/** Called when selection changes */
	onchange?: (value: unknown, item: unknown) => void
}

/**
 * Props for the MultiSelect component (multiple selection).
 */
export interface MultiSelectProps extends SelectBaseProps, ItemSnippets {
	/** Selected values (bindable) */
	value?: unknown[]

	/** Selected items (bindable) */
	selected?: unknown[]

	/** Maximum tags shown before collapsing to a count */
	maxDisplay?: number

	/** Called when selection changes */
	onchange?: (values: unknown[], items: unknown[]) => void
}

/**
 * Props for the Dropdown component.
 *
 * Unlike Select and MultiSelect it does not spread snippets, so it takes the
 * base props only.
 */
export interface DropdownProps extends SelectBaseProps {
	/** Selected value (bindable) */
	value?: unknown

	/** Trigger icon class */
	icon?: string

	/** Whether to show the dropdown arrow indicator on the trigger */
	showArrow?: boolean

	/** Called when selection changes */
	onchange?: (value: unknown, item: unknown) => void
}

// =============================================================================
// State Icons
// =============================================================================

/**
 * Icons configuration for select expand/collapse and selection states.
 */
export interface SelectStateIcons {
	/** Icon class for dropdown arrow (open state) */
	opened?: string
	/** Icon class for dropdown arrow (closed state) */
	closed?: string
	/** Icon class for selected item indicator */
	checked?: string
	/** Icon class for tag remove button (MultiSelect) */
	remove?: string
}

/**
 * Default state icons — uses semantic names from @rokkit/core
 * that get resolved to actual icon classes via UnoCSS shortcuts.
 */
export const defaultSelectStateIcons: SelectStateIcons = {
	opened: DEFAULT_STATE_ICONS.selector.opened,
	closed: DEFAULT_STATE_ICONS.selector.closed,
	checked: DEFAULT_STATE_ICONS.checkbox.checked,
	remove: DEFAULT_STATE_ICONS.action.remove
}

// =============================================================================
// Helper Functions
// =============================================================================

export { getSnippet } from './menu.js'
