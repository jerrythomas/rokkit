/**
 * Pill Component Types
 */

import type { Snippet } from 'svelte'
import type { ProxyItem } from '@rokkit/states'

/**
 * Icon overrides for the Pill component.
 */
export interface PillIcons {
	/** Icon class for the remove button. */
	remove?: string
}

/**
 * Props for the Pill component.
 */
export interface PillProps {
	/** Item data — primitive (string / number) or an object. */
	value: unknown

	/** Custom field mappings used by the internal `ProxyItem`. */
	fields?: Record<string, string>

	/** Show the remove button (and enable Delete / Backspace shortcuts). */
	removable?: boolean

	/** Disabled state. */
	disabled?: boolean

	/** Custom icon overrides. */
	icons?: PillIcons

	/** Called when remove is triggered — via click or Delete / Backspace. */
	onremove?: (value: unknown) => void

	/** Custom content snippet — receives the pill's `ProxyItem`. */
	content?: Snippet<[ProxyItem]>

	/** Additional CSS class. */
	class?: string
}
