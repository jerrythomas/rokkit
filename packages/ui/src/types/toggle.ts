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
 * Generic toggle item — data-driven, so it accepts primitives
 * (string/number) as well as objects with mapped fields.
 */
export type ToggleItem = string | number | Record<string, unknown>

// =============================================================================
// Snippet Types
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
 * Visual variant of the Toggle.
 * - `'group'` (default) — segmented radio-group rendering, one button per option.
 * - `'button'` — single button that cycles through the options on each click.
 *   The rendered content represents the *next* option (the one you'd switch to),
 *   so users can read the click destination at a glance.
 */
export type ToggleVariant = 'group' | 'button'

/**
 * Props for the Toggle component
 */
export interface ToggleProps {
	/** Visual variant. Default: 'group'. */
	variant?: ToggleVariant

	/** Array of toggle options (strings, numbers, or objects) */
	options?: ToggleItem[]

	/** Field mapping — overrides BASE_FIELDS defaults (text → 'label', value → 'value', …) */
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

	/** Accessible label for the radiogroup. Default: messages.toggle.label */
	label?: string

	/** Additional CSS classes */
	class?: string

	/** Custom snippet for rendering toggle options */
	item?: ToggleItemSnippet
}
