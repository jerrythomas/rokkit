/**
 * BreadCrumbs Component Types
 */

import type { Snippet } from 'svelte'
import type { ProxyItem } from '@rokkit/states'

/**
 * Icon overrides for the BreadCrumbs component.
 */
export interface BreadCrumbsIcons {
	/** Icon class used for the separator between crumbs. */
	separator?: string
}

/**
 * Props for the BreadCrumbs component.
 */
export interface BreadCrumbsProps {
	/** Array of breadcrumb items. */
	items?: unknown[]

	/** Custom field mappings used by the internal `ProxyItem`. */
	fields?: Record<string, string>

	/** Accessible label for the surrounding `<nav>`. */
	label?: string

	/** Custom icon overrides. */
	icons?: BreadCrumbsIcons

	/** Called when a crumb is clicked. */
	onclick?: (value: unknown, item: unknown) => void

	/**
	 * Custom snippet for rendering each crumb. Receives the crumb's
	 * `ProxyItem` and a flag indicating whether it is the last (current) crumb.
	 */
	crumb?: Snippet<[ProxyItem, boolean]>

	/** Additional CSS class. */
	class?: string
}
