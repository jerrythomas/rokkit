/**
 * ItemToggle Component Types
 *
 * Renders a compact toggle-group visual inside a data-driven item snippet.
 * Options come from the item's data (via `optionsField`). Each option is a
 * span with `role="radio"` and its own click handler — Navigator defers to
 * these nested interactives via its isNestedInteractive guard.
 *
 * Consumers wire state via `onchange`. ItemToggle does not mutate the item
 * data directly.
 */

import type { ProxyItem } from '@rokkit/states'

export type ItemToggleOption = string | number | boolean | { label?: string; value?: unknown; icon?: string }

export interface ItemToggleProps {
	/** ProxyItem for the current row. */
	proxy: ProxyItem

	/**
	 * Field on the item that holds the currently selected value.
	 * @default 'value'
	 */
	field?: string

	/**
	 * Field on the item that holds the array of options.
	 * @default 'options'
	 */
	optionsField?: string

	/**
	 * Called when the user picks an option. Consumers update the item data.
	 */
	onchange?: (value: unknown, option: ItemToggleOption, proxy: ProxyItem) => void

	/** Size variant. */
	size?: 'sm' | 'md' | 'lg'

	/** Render the leading avatar / icon (via ItemContent). @default true */
	showIcon?: boolean

	/** Render subtext under the label (via ItemContent). @default true */
	showSubtext?: boolean

	/** Show textual labels beside the option (falls back to option value). @default true */
	showLabels?: boolean

	/** Optional class on the wrapper span. */
	class?: string
}
