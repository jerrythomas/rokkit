/**
 * Swatch Component Types
 *
 * A group of selectable colour swatches. Options may be primitives (hex or
 * colour-name strings) or objects whose fill/stroke/value are read through the
 * usual field mapping.
 */

import type { Snippet } from 'svelte'
import type { ProxyItem } from '@rokkit/states'

/**
 * Props for the Swatch component.
 *
 * `Swatch.svelte` annotates its own `$props()` with this interface, so the two
 * cannot drift.
 */
export interface SwatchProps {
	/** Color options — primitives (hex/name strings) or objects with mapped fields */
	options?: Array<string | number | Record<string, unknown>>

	/** Field mapping for object options (value, fill, stroke, …) */
	fields?: Record<string, string>

	/** Selected value (bindable). Array when `multiple`. */
	value?: unknown

	/** Allow multiple selection */
	multiple?: boolean

	/** Swatch shape */
	shape?: 'square' | 'circle'

	/** Size variant */
	size?: 'sm' | 'md' | 'lg'

	/** Disable the whole group */
	disabled?: boolean

	/** Accessible group label */
	label?: string

	/** Additional CSS classes */
	class?: string

	/** Called when selection changes */
	onchange?: (value: unknown, item: unknown) => void

	/** Custom snippet for rendering a swatch (receives proxy + selected) */
	item?: Snippet<[ProxyItem, boolean]>
}
