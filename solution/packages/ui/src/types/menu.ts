/**
 * Menu Component Types
 *
 * Provides types for the data-driven Menu component.
 * Field mapping and data access is handled by ItemProxy.
 */

import { defaultStateIcons } from '@rokkit/core'

// =============================================================================
// Field Mapping Types
// =============================================================================

/**
 * Field mapping configuration for menu data.
 * Maps custom data field names to the component's expected properties.
 */
export interface MenuFields {
	/** Field for display text - default: 'text' */
	text?: string

	/** Field for the value to emit on select - default: 'value' */
	value?: string

	/** Field for icon class name - default: 'icon' */
	icon?: string

	/** Field for secondary descriptive text - default: 'description' */
	description?: string

	/** Field for keyboard shortcut display - default: 'shortcut' */
	shortcut?: string

	/** Field for aria-label override - default: 'label' */
	label?: string

	/** Field for disabled state - default: 'disabled' */
	disabled?: string

	/** Field for children array (for grouping) - default: 'children' */
	children?: string

	/** Field for custom snippet name - default: 'snippet' */
	snippet?: string

	/** Nested field mapping for children - default: inherits parent */
	fields?: MenuFields
}

/**
 * Default field mapping values
 */
export const defaultMenuFields: Required<Omit<MenuFields, 'fields'>> = {
	text: 'text',
	value: 'value',
	icon: 'icon',
	description: 'description',
	shortcut: 'shortcut',
	label: 'label',
	disabled: 'disabled',
	children: 'children',
	snippet: 'snippet'
}

// =============================================================================
// Menu Item Types
// =============================================================================

/**
 * Generic menu item - can be any object with mapped fields
 */
export type MenuItem = Record<string, unknown>

// =============================================================================
// Snippet Types
// =============================================================================

/**
 * Handlers passed to custom item snippets
 */
export interface MenuItemHandlers {
	/** Call to trigger item selection */
	onclick: () => void
	/** Forward keyboard events for accessibility */
	onkeydown: (event: KeyboardEvent) => void
}

/**
 * Snippet type for rendering menu items
 */
export type MenuItemSnippet = import('svelte').Snippet<[MenuItem, MenuFields, MenuItemHandlers]>

/**
 * Snippet type for rendering group labels
 */
export type MenuGroupLabelSnippet = import('svelte').Snippet<[MenuItem, MenuFields]>

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the Menu component
 */
export interface MenuProps {
	/** Array of menu items or groups */
	options?: MenuItem[]

	/** Field mapping configuration */
	fields?: MenuFields

	/** Button label text */
	label?: string

	/** Button icon class */
	icon?: string

	/** Whether to show dropdown arrow indicator */
	showArrow?: boolean

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** Dropdown alignment relative to trigger */
	align?: 'left' | 'right' | 'start' | 'end'

	/** Dropdown slide direction */
	direction?: 'up' | 'down'

	/** Whether the entire menu is disabled */
	disabled?: boolean

	/** Called when an item is selected */
	onselect?: (value: unknown, item: MenuItem) => void

	/** Additional CSS classes */
	class?: string

	/** Icons for menu states (dropdown arrow) */
	icons?: MenuStateIcons

	/** Custom snippet for rendering menu items (both standalone and grouped children) */
	item?: MenuItemSnippet

	/** Custom snippet for rendering group labels/headers */
	groupLabel?: MenuGroupLabelSnippet
}

// =============================================================================
// State Icons
// =============================================================================

/**
 * Icons configuration for menu expand/collapse states.
 * Keys match the naming convention in @rokkit/core defaultStateIcons.
 */
export interface MenuStateIcons {
	/** Icon class for dropdown arrow (open state) */
	opened?: string
	/** Icon class for dropdown arrow (closed state) */
	closed?: string
}

/**
 * Default state icons — uses semantic names from @rokkit/core
 * that get resolved to actual icon classes via UnoCSS shortcuts.
 */
export const defaultMenuStateIcons: MenuStateIcons = {
	opened: defaultStateIcons.menu.opened,
	closed: defaultStateIcons.menu.closed
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get a snippet from a snippets object by name.
 * Returns null if the snippet doesn't exist or isn't a function.
 */
export function getSnippet<T>(
	snippets: Record<string, T | undefined>,
	name: string | null
): T | null {
	if (name === null) {
		return null
	}

	const snippet = snippets[name]
	if (snippet !== undefined && typeof snippet === 'function') {
		return snippet
	}

	return null
}
