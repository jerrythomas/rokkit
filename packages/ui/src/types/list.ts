/**
 * List Component Types
 *
 * Provides types for the data-driven List component.
 * Supports navigation links, button items, and grouped items with collapsible sections.
 * Field mapping and data access is handled by ProxyItem from @rokkit/states.
 */

import { DEFAULT_STATE_ICONS } from '@rokkit/core'
import type { ProxyItem } from '@rokkit/states'
import type { ItemSnippets } from './snippets.js'

// =============================================================================
// Field Mapping Types
// =============================================================================

/**
 * Field mapping configuration for list data.
 */
export interface ListFields {
	/** Field for display text - default: 'text' */
	text?: string

	/** Field for the value to use for selection matching - default: 'value' */
	value?: string

	/** Field for navigation URL (renders as <a>) - default: 'href' */
	href?: string

	/** Field for icon class name - default: 'icon' */
	icon?: string

	/** Field for secondary descriptive text - default: 'description' */
	description?: string

	/** Field for aria-label override - default: 'label' */
	label?: string

	/** Field for disabled state - default: 'disabled' */
	disabled?: string

	/** Field for children array (for grouping) - default: 'children' */
	children?: string

	/** Field for custom snippet name - default: 'snippet' */
	snippet?: string

	/** Field for badge/indicator content - default: 'badge' */
	badge?: string

	/** Field for tooltip text (HTML title attribute) - default: 'title' */
	title?: string

	/** Nested field mapping for children - default: inherits parent */
	fields?: ListFields
}

/**
 * Default field mapping values
 */
export const defaultListFields: Required<Omit<ListFields, 'fields'>> = {
	text: 'text',
	value: 'value',
	href: 'href',
	icon: 'icon',
	description: 'description',
	label: 'label',
	disabled: 'disabled',
	children: 'children',
	snippet: 'snippet',
	badge: 'badge',
	title: 'title'
}

// =============================================================================
// List Item Types
// =============================================================================

/**
 * Generic list item - can be any object with mapped fields
 */
export type ListItem = Record<string, unknown>

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the List component.
 *
 * `List.svelte` annotates its own `$props()` with this interface, so the two
 * cannot drift — which is how the previous version of this type came to
 * describe `item` / `groupLabel` snippets and `multiselect` / `expanded` /
 * `selected` props the component never read.
 *
 * Extends {@link ItemSnippets} for `itemContent` / `groupContent` plus the open
 * index signature that per-item named snippets (`item.snippet = 'name'`) need.
 */
export interface ListProps extends ItemSnippets {
	/** Array of list items or groups */
	items?: unknown[]

	/** Field mapping configuration */
	fields?: Record<string, string>

	/** Selected value (bindable) — matched against each item's value field */
	value?: unknown

	/** Size variant */
	size?: string

	/** Whether the entire list is disabled */
	disabled?: boolean

	/** Whether groups can be collapsed */
	collapsible?: boolean

	/** Accessible name for the list */
	label?: string

	/** Icons for list group states (expand/collapse arrow) */
	icons?: ListStateIcons

	/** Called when an item is selected, with the item's `ProxyItem` */
	onselect?: (value: unknown, proxy: ProxyItem) => void

	/** Additional CSS classes */
	class?: string
}

// =============================================================================
// State Icons
// =============================================================================

/**
 * Icons configuration for list collapsible group states.
 * Keys match the naming convention in @rokkit/core DEFAULT_STATE_ICONS.
 */
export interface ListStateIcons {
	/** Icon class for expanded group */
	opened?: string
	/** Icon class for collapsed group */
	closed?: string
}

/**
 * Default state icons — uses semantic names from @rokkit/core
 * that get resolved to actual icon classes via UnoCSS shortcuts.
 */
export const defaultListStateIcons: ListStateIcons = {
	opened: DEFAULT_STATE_ICONS.accordion.opened,
	closed: DEFAULT_STATE_ICONS.accordion.closed
}

// =============================================================================
// Helper Functions
// =============================================================================

export { getSnippet } from './menu.js'
