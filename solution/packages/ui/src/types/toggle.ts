/**
 * Toggle Component Types
 *
 * Provides types for the data-driven Toggle component.
 * Field mapping and data access is handled by ProxyItem from @rokkit/states.
 */

import type { Snippet } from 'svelte'
import type { ProxyItem } from '@rokkit/states'

// =============================================================================
// Toggle Item Types
// =============================================================================

/**
 * Generic toggle item - can be any object with mapped fields
 */
export type ToggleItem = Record<string, unknown>

// =============================================================================
// Legacy types — kept for backward compat
// =============================================================================

/** @deprecated No longer needed — Navigator handles clicks via data-path */
export interface ToggleItemHandlers {
	onclick: () => void
	onkeydown: (event: KeyboardEvent) => void
}

/** @deprecated Use ToggleItemSnippet (new ProxyItem API) */
export type LegacyToggleItemSnippet = Snippet<
	[ToggleItem, Record<string, string>, ToggleItemHandlers, boolean]
>

// =============================================================================
// Snippet Types — ProxyItem-based API
// =============================================================================

/**
 * Snippet for rendering a toggle option.
 * The component renders the button wrapper; the snippet renders inner content.
 * Receives the ProxyItem and whether this item is currently selected.
 */
export type ToggleItemSnippet = Snippet<[ProxyItem, boolean]>

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the Toggle component
 */
export interface ToggleProps {
	/** Array of toggle options (strings, numbers, or objects) */
	options?: ToggleItem[]

	/** Field mapping — overrides PROXY_ITEM_FIELDS defaults (text → 'label', value → 'value', …) */
	fields?: Record<string, string>

	/** Currently selected value (bindable) */
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

	/** Custom snippet for rendering toggle options */
	item?: ToggleItemSnippet
}
