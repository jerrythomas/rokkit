/**
 * Testbed Constants
 *
 * All shared constants for the Navigator + Wrapper + Proxy design.
 */

// ─── Navigator actions ────────────────────────────────────────────────────────

export const ACTIONS = Object.freeze({
	next: 'next',
	prev: 'prev',
	first: 'first',
	last: 'last',
	expand: 'expand',
	collapse: 'collapse',
	select: 'select',
	extend: 'extend',
	range: 'range',
	cancel: 'cancel' // Escape — close dropdown, deselect, or dismiss
})

// ─── Keymap: fixed key bindings (orientation-independent) ────────────────────

export const PLAIN_FIXED = {
	Enter: ACTIONS.select,
	' ': ACTIONS.select,
	Home: ACTIONS.first,
	End: ACTIONS.last,
	Escape: ACTIONS.cancel
}

export const CTRL_FIXED = {
	' ': ACTIONS.extend,
	Home: ACTIONS.first,
	End: ACTIONS.last
}

export const SHIFT_FIXED = {
	' ': ACTIONS.range
}

// ─── Keymap: arrow key assignments per orientation/direction ──────────────────

export const ARROWS = {
	'vertical-ltr': {
		move: { ArrowUp: ACTIONS.prev, ArrowDown: ACTIONS.next },
		nested: { ArrowLeft: ACTIONS.collapse, ArrowRight: ACTIONS.expand }
	},
	'vertical-rtl': {
		move: { ArrowUp: ACTIONS.prev, ArrowDown: ACTIONS.next },
		nested: { ArrowRight: ACTIONS.collapse, ArrowLeft: ACTIONS.expand }
	},
	horizontal: {
		move: { ArrowLeft: ACTIONS.prev, ArrowRight: ACTIONS.next },
		nested: { ArrowUp: ACTIONS.collapse, ArrowDown: ACTIONS.expand }
	}
}

// ─── Navigator: typeahead ─────────────────────────────────────────────────────

/** Milliseconds of inactivity before the typeahead buffer resets. */
export const TYPEAHEAD_RESET_MS = 500

// ─── List: default state icons (semantic names, resolved via UnoCSS shortcuts) ─

/**
 * Default icons for the List component's expand/collapse chevrons.
 * Uses semantic names from @rokkit/core's icon naming convention so the
 * icons can be overridden globally via UnoCSS shortcuts without touching
 * component props.
 */
export const DEFAULT_LIST_ICONS = {
	opened: 'accordion-opened',
	closed: 'accordion-closed'
}

// ─── Proxy: default field mapping ────────────────────────────────────────────

/**
 * Maps semantic field names to the actual keys in the raw item object.
 * ProxyItem merges user-supplied overrides on top of these defaults.
 */
export const DEFAULT_FIELDS = {
	label: 'label',
	value: 'value',
	icon: 'icon',
	href: 'href',
	description: 'description',
	children: 'children',
	type: 'type',
	disabled: 'disabled',
	expanded: 'expanded',
	selected: 'selected',
	snippet: 'snippet'
}
