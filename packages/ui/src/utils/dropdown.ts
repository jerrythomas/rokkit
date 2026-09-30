/**
 * The pure parts of a list dropdown (Select, MultiSelect): filtering, groups as labels, the
 * dividers between groups, finding a value's node, and fixed-position placement.
 */

type Row = Record<string, unknown>

export type ItemFields = { textField: string; childrenField: string }

/** A node of a Wrapper's flat view — only the members these helpers read. */
export type FlatNode = { key: string; hasChildren?: boolean; proxy?: { value: unknown; disabled?: boolean } }

const childrenOf = (item: Row, childrenField: string): unknown[] | null => {
	const children = item[childrenField]
	return Array.isArray(children) && children.length > 0 ? children : null
}

const textMatches = (item: unknown, textField: string, query: string): boolean =>
	String((item as Row)[textField] ?? '')
		.toLowerCase()
		.includes(query)

/**
 * The items a filter query keeps. A leaf stays when its text contains the query
 * (case-insensitive); a group stays with only its matching children, and goes when none match.
 * A group is an item with a non-empty children array.
 */
export function filterItems(items: unknown[], query: string, { textField, childrenField }: ItemFields): unknown[] {
	const q = query.toLowerCase()
	return items
		.map((item) => {
			const children = childrenOf(item as Row, childrenField)
			if (!children) return textMatches(item, textField, q) ? item : null
			const matching = children.filter((child) => textMatches(child, textField, q))
			return matching.length > 0 ? { ...(item as Row), [childrenField]: matching } : null
		})
		.filter(Boolean)
}

/**
 * Groups rendered as labels: always expanded (children always shown) and disabled, so the
 * Navigator skips them. Leaves pass through untouched.
 */
export function groupsAsLabels(items: unknown[], childrenField: string): unknown[] {
	return items.map((item) =>
		childrenOf(item as Row, childrenField) ? { ...(item as Row), expanded: true, disabled: true } : item
	)
}

/** The group keys that get a divider before them — every group after the first. */
export function groupDividerKeys(flatView: FlatNode[]): Set<string> {
	const groups = flatView.filter((node) => node.hasChildren).map((node) => node.key)
	return new Set(groups.slice(1))
}

/** The key of the first enabled node holding `value`, or null (also for a null/undefined value). */
export function valueKey(flatView: FlatNode[], value: unknown): string | null {
	if (value === undefined || value === null) return null
	const node = flatView.find((n) => !n.proxy?.disabled && n.proxy?.value === value)
	return node ? node.key : null
}

export type Placement = {
	position: 'fixed'
	minWidth: string
	top: string
	bottom: string
	left: string
	right: string
}

/**
 * Where a `position: fixed` dropdown sits against its trigger: `gap` px below it (or above for
 * `direction: 'up'`), its start edge on the trigger's (or its end edge for `align: 'end'`), and
 * at least as wide as the trigger. Fixed, so it escapes an ancestor's `overflow` clipping.
 */
export function dropdownPlacement(
	trigger: { top: number; bottom: number; left: number; right: number; width: number },
	viewport: { width: number; height: number },
	{ direction, align, gap = 4 }: { direction: string; align: string; gap?: number }
): Placement {
	const up = direction === 'up'
	const end = align === 'end'
	return {
		position: 'fixed',
		minWidth: `${trigger.width}px`,
		top: up ? 'auto' : `${trigger.bottom + gap}px`,
		bottom: up ? `${viewport.height - trigger.top + gap}px` : 'auto',
		left: end ? 'auto' : `${trigger.left}px`,
		right: end ? `${viewport.width - trigger.right}px` : 'auto'
	}
}
