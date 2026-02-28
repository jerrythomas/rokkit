/**
 * Menu Component Types
 *
 * The new Menu uses the same Wrapper + Navigator stack as List.
 * Trigger action manages open/close. Dropdown content is identical to List.
 */

import type { Snippet } from 'svelte'
import type { ProxyItem } from '@rokkit/states'
import { DEFAULT_STATE_ICONS } from '@rokkit/core'

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the Menu component.
 * Content props (items, fields, value, size, disabled, collapsible, icons, onselect, class, snippets)
 * are identical to List. Additional props: label, icon, showArrow, align, direction.
 */
export interface MenuProps {
	/** Array of items (same as List: supports groups, separators, nested children) */
	items?: unknown[]

	/** Field mapping — overrides PROXY_ITEM_FIELDS defaults (text → 'text', value → 'value', …) */
	fields?: Record<string, string>

	/** Current active value (highlights matching item) */
	value?: unknown

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** Whether the entire menu is disabled */
	disabled?: boolean

	/** Whether groups are collapsible (same as List) */
	collapsible?: boolean

	/** Trigger button label text */
	label?: string

	/** Trigger button icon class */
	icon?: string

	/** Whether to show dropdown arrow indicator on trigger */
	showArrow?: boolean

	/** Dropdown alignment relative to trigger */
	align?: 'start' | 'end'

	/** Dropdown direction */
	direction?: 'up' | 'down'

	/** Icons for expand/collapse states */
	icons?: MenuStateIcons

	/** Called when a leaf item is selected */
	onselect?: (value: unknown, proxy: ProxyItem) => void

	/** Additional CSS classes */
	class?: string
}

// =============================================================================
// State Icons
// =============================================================================

export interface MenuStateIcons {
	/** Icon class for open state */
	opened?: string
	/** Icon class for closed state */
	closed?: string
}

export const defaultMenuStateIcons: MenuStateIcons = {
	opened: DEFAULT_STATE_ICONS.selector.opened,
	closed: DEFAULT_STATE_ICONS.selector.closed
}
