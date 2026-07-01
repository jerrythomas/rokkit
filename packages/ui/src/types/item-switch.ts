/**
 * ItemSwitch Component Types
 *
 * Renders a switch-shaped visual inside a data-driven item snippet
 * (List / Menu / Tree). The whole row is the interactive target — clicking it
 * toggles the underlying data through the parent's onselect flow. ItemSwitch
 * itself renders inert markup (spans + attributes), so it never introduces a
 * nested interactive element inside the item's `<button>` wrapper.
 */

import type { ProxyItem } from '@rokkit/states'

export interface ItemSwitchProps {
	/** ProxyItem for the current row. */
	proxy: ProxyItem

	/**
	 * Field on the item that holds the boolean checked state.
	 * @default 'checked'
	 */
	field?: string

	/** Size variant — feeds into `data-switch-size` for theming. */
	size?: 'sm' | 'md' | 'lg'

	/** Render the leading avatar / icon (via ItemContent). @default true */
	showIcon?: boolean

	/** Render subtext under the label (via ItemContent). @default true */
	showSubtext?: boolean

	/** Optional class on the wrapper span. */
	class?: string
}
