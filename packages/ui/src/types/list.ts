/**
 * List Component Types
 *
 * Provides types for the data-driven List component.
 * Supports navigation links, button items, and grouped items with collapsible sections.
 * Field mapping and data access is handled by ItemProxy.
 */

import { defaultStateIcons } from '@rokkit/core'

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
	badge: 'badge'
}

// =============================================================================
// List Item Types
// =============================================================================

/**
 * Generic list item - can be any object with mapped fields
 */
export type ListItem = Record<string, unknown>

// =============================================================================
// Snippet Types
// =============================================================================

/**
 * Handlers passed to custom item snippets
 */
export interface ListItemHandlers {
	/** Call to trigger item selection (for button items) */
	onclick: () => void
	/** Forward keyboard events for accessibility */
	onkeydown: (event: KeyboardEvent) => void
}

/**
 * Snippet type for rendering list items.
 * Parameters: item, fields, handlers, isActive
 */
export type ListItemSnippet = import('svelte').Snippet<
	[ListItem, ListFields, ListItemHandlers, boolean]
>

/**
 * Snippet type for rendering group labels
 * Parameters: item (group), fields, toggleExpanded, isExpanded
 */
export type ListGroupLabelSnippet = import('svelte').Snippet<
	[ListItem, ListFields, () => void, boolean]
>

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the List component
 */
export interface ListProps {
	/** Array of list items or groups */
	items?: ListItem[]

	/** Field mapping configuration */
	fields?: ListFields

	/** Currently selected value (for highlighting button items) */
	value?: unknown

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** Whether the entire list is disabled */
	disabled?: boolean

	/** Whether groups can be collapsed */
	collapsible?: boolean

	/** Which groups are expanded (bindable) - keyed by group value/text */
	expanded?: Record<string, boolean>

	/** Active item value - List looks up item by this value to highlight it */
	active?: unknown

	/** Called when a button item is selected */
	onselect?: (value: unknown, item: ListItem) => void

	/** Called when expanded state changes (for bindable expanded) */
	onexpandedchange?: (expanded: Record<string, boolean>) => void

	/** Additional CSS classes */
	class?: string

	/** Icons for list group states (expand/collapse arrow) */
	icons?: ListStateIcons

	/** Custom snippet for rendering list items */
	item?: ListItemSnippet

	/** Custom snippet for rendering group labels/headers */
	groupLabel?: ListGroupLabelSnippet
}

// =============================================================================
// State Icons
// =============================================================================

/**
 * Icons configuration for list collapsible group states.
 * Keys match the naming convention in @rokkit/core defaultStateIcons.
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
	opened: defaultStateIcons.accordion.opened,
	closed: defaultStateIcons.accordion.closed
}

// =============================================================================
// Helper Functions
// =============================================================================

export { getSnippet } from './menu.js'
