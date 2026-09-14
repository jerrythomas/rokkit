/**
 * Grid Component Types
 *
 * Data-driven grid of selectable cards. Same field-mapping and snippet
 * contract as List — items are wrapped in a `ProxyItem` and rendered through
 * `itemContent`, with the grid supplying only the track sizing.
 */

import type { ProxyItem } from '@rokkit/states'
import type { ItemSnippets } from './snippets.js'

/**
 * Props for the Grid component.
 *
 * `Grid.svelte` annotates its own `$props()` with this interface, so the two
 * cannot drift.
 */
export interface GridProps extends ItemSnippets {
	/** Array of items to render as cells */
	items?: unknown[]

	/** Field mapping configuration */
	fields?: Record<string, string>

	/** Selected value (bindable) */
	value?: unknown

	/** Size variant */
	size?: string

	/** Whether the entire grid is disabled */
	disabled?: boolean

	/** Minimum track width, fed to `repeat(auto-fill, minmax(…))` */
	minSize?: string

	/** Gap between cells */
	gap?: string

	/** Accessible name for the grid */
	label?: string

	/** Called when a cell is selected, with the item's `ProxyItem` */
	onselect?: (value: unknown, proxy: ProxyItem) => void

	/** Additional CSS classes */
	class?: string
}
