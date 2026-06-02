/**
 * ItemContent Component Types
 *
 * Default inner content for List / Menu / Tree / Toolbar items.
 * Renders avatar/icon, label + subtext, optional badge and shortcut from a
 * ProxyItem wrapper that exposes field access and reactive state.
 */

import type { ProxyItem } from '@rokkit/states'

/**
 * Props for the ItemContent component.
 */
export interface ItemContentProps {
	/**
	 * ProxyItem wrapper around the underlying data — exposes `label`,
	 * `get(field)`, and the item's reactive selection / expansion state.
	 */
	proxy: ProxyItem

	/** Render the avatar / icon slot. Default: `true`. */
	showIcon?: boolean

	/** Render the description / subtext line under the label. Default: `true`. */
	showSubtext?: boolean
}
