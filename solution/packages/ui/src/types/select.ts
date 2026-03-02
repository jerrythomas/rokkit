/**
 * Select Component Types
 *
 * Provides types for the data-driven Select and MultiSelect components.
 * Field mapping and data access is handled by ProxyItem from @rokkit/states.
 */

import type { Snippet } from 'svelte'
import type { ProxyItem } from '@rokkit/states'
import { DEFAULT_STATE_ICONS } from '@rokkit/core'

// =============================================================================
// Select Item Types
// =============================================================================

/**
 * Generic select item - can be any object with mapped fields
 */
export type SelectItem = Record<string, unknown>

// =============================================================================
// Legacy types — kept for MultiSelect backward compat until it is migrated
// =============================================================================

/** @deprecated Use Record<string, string> directly */
export type SelectFields = Record<string, string>

/** @deprecated Legacy handlers no longer needed with Navigator stack */
export interface SelectItemHandlers {
	onclick: () => void
	onkeydown: (event: KeyboardEvent) => void
}

/** @deprecated Use SelectOptionSnippet instead */
export type SelectItemSnippet = Snippet<[SelectItem, SelectFields, SelectItemHandlers, boolean]>

/** @deprecated Use SelectGroupLabelSnippet (new API) */
export type LegacyGroupLabelSnippet = Snippet<[SelectItem, SelectFields]>

/** @deprecated Use SelectValueSnippet (new API) */
export type LegacySelectValueSnippet = Snippet<[SelectItem | null, SelectFields]>

/** @deprecated Use MultiSelectValueSnippet (new API) */
export type LegacyMultiSelectValueSnippet = Snippet<[SelectItem[], SelectFields]>

// =============================================================================
// Snippet Types — new ProxyItem-based API
// =============================================================================

/**
 * Snippet type for rendering a single option in the dropdown.
 * The component renders the focusable wrapper; the snippet renders the inner content.
 * Navigator handles click selection via data-path — no handlers needed in snippet.
 */
export type SelectOptionSnippet = Snippet<[ProxyItem]>

/**
 * Snippet type for rendering a group header label.
 */
export type SelectGroupLabelSnippet = Snippet<[ProxyItem]>

/**
 * Snippet type for rendering the selected value display in the trigger button.
 */
export type SelectValueSnippet = Snippet<[ProxyItem]>

/**
 * Snippet type for rendering selected values in MultiSelect trigger.
 * Receives the array of selected ProxyItems.
 */
export type MultiSelectValueSnippet = Snippet<[ProxyItem[]]>

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Common props shared between Select and MultiSelect
 */
export interface SelectBaseProps {
	/** Array of select options or groups */
	options?: SelectItem[]

	/** Field mapping — overrides BASE_FIELDS defaults (text → 'label', value → 'value', …) */
	fields?: Record<string, string>

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

	/** Additional CSS classes on root element */
	class?: string

	/** Icons for select states (dropdown arrow, check, remove) */
	icons?: SelectStateIcons

	/** Custom snippet for rendering options in dropdown */
	option?: SelectOptionSnippet

	/** Custom snippet for rendering group labels */
	groupLabel?: SelectGroupLabelSnippet

	/** Enable typeahead filter input in dropdown header */
	filterable?: boolean

	/** Placeholder text for the filter input */
	filterPlaceholder?: string
}

/**
 * Props for the Select component (single selection)
 */
export interface SelectProps extends SelectBaseProps {
	/** Currently selected value (bindable) — extracted via item[fields.value] */
	value?: unknown

	/** Currently selected raw item (bindable) — full object from options array */
	selected?: SelectItem | null

	/** Called when selection changes */
	onchange?: (value: unknown, item: SelectItem) => void

	/** Custom snippet for rendering the selected value in the trigger */
	selectedValue?: SelectValueSnippet
}

/**
 * Props for the MultiSelect component (multiple selection)
 */
export interface MultiSelectProps extends SelectBaseProps {
	/** Currently selected values (bindable) - extracted primitives */
	value?: unknown[]

	/** Currently selected items (bindable) - full item objects for convenience */
	selected?: SelectItem[]

	/** Called when selection changes */
	onchange?: (values: unknown[], items: SelectItem[]) => void

	/** Custom snippet for rendering selected values in trigger
	 * @deprecated Will be updated to MultiSelectValueSnippet when MultiSelect is migrated */
	selectedValues?: LegacyMultiSelectValueSnippet

	/** Maximum number of tags to show before collapsing to count */
	maxDisplay?: number
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
