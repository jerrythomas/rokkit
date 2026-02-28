/**
 * Menu Component Types
 *
 * Provides types for the data-driven Menu component.
 * Field mapping and data access is handled by ProxyItem from @rokkit/states.
 */

import type { Snippet } from 'svelte'
import type { ProxyItem } from '@rokkit/states'
import { DEFAULT_STATE_ICONS } from '@rokkit/core'

// =============================================================================
// Menu Item Types
// =============================================================================

/**
 * Generic menu item - can be any object with mapped fields
 */
export type MenuItem = Record<string, unknown>

// =============================================================================
// Legacy types — kept for backward compat until usages are updated
// =============================================================================

/** @deprecated No longer needed — Navigator handles clicks via data-path */
export interface MenuItemHandlers {
	onclick: () => void
	onkeydown: (event: KeyboardEvent) => void
}

/** @deprecated Use MenuItemSnippet (new ProxyItem API) */
export type LegacyMenuItemSnippet = Snippet<[MenuItem, Record<string, string>, MenuItemHandlers]>

/** @deprecated Use MenuGroupLabelSnippet (new ProxyItem API) */
export type LegacyMenuGroupLabelSnippet = Snippet<[MenuItem, Record<string, string>]>

// =============================================================================
// Snippet Types — ProxyItem-based API
// =============================================================================

/**
 * Snippet type for rendering menu items.
 * The component renders the focusable wrapper + data-path; snippet renders inner content.
 * Navigator handles click selection via data-path — no handlers needed.
 */
export type MenuItemSnippet = Snippet<[ProxyItem]>

/**
 * Snippet type for rendering group header labels.
 */
export type MenuGroupLabelSnippet = Snippet<[ProxyItem]>

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the Menu component
 */
export interface MenuProps {
	/** Array of menu items or groups */
	options?: MenuItem[]

	/** Field mapping — overrides PROXY_ITEM_FIELDS defaults (text → 'label', value → 'value', …) */
	fields?: Record<string, string>

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

	/** Custom snippet for rendering menu items */
	item?: MenuItemSnippet

	/** Custom snippet for rendering group labels */
	groupLabel?: MenuGroupLabelSnippet
}

// =============================================================================
// State Icons
// =============================================================================

/**
 * Icons configuration for menu expand/collapse states.
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
	opened: DEFAULT_STATE_ICONS.menu.opened,
	closed: DEFAULT_STATE_ICONS.menu.closed
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
	if (name === null) return null
	const snippet = snippets[name]
	if (snippet !== undefined && typeof snippet === 'function') return snippet
	return null
}
