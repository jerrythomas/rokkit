/**
 * StatusList Component Types
 *
 * Renders a vertical list of status rows — each with a label and a status
 * keyword that maps to a badge icon (e.g. `pass`, `fail`, `warn`).
 */

import { DEFAULT_STATE_ICONS } from '@rokkit/core'

/**
 * Built-in badge status keys provided by `@rokkit/core`. Consumers may also
 * pass any other string and supply a matching entry via the `icons` prop.
 */
export type StatusListStatus = keyof typeof DEFAULT_STATE_ICONS.badge | (string & {})

/**
 * One row in a StatusList — a label paired with a status keyword.
 */
export interface StatusListItem {
	/** Text rendered for this row. */
	text: string

	/** Status keyword used to look up the badge icon. */
	status: StatusListStatus
}

/**
 * Props for the StatusList component.
 */
export interface StatusListProps {
	/** Additional CSS class applied to the root element. */
	class?: string

	/** Rows to render. */
	items: StatusListItem[]

	/**
	 * Override the default badge icon map (`pass` / `fail` / `warn` / `unknown`).
	 * Merged on top of `DEFAULT_STATE_ICONS.badge` from `@rokkit/core`.
	 */
	icons?: Partial<Record<string, string>>
}
