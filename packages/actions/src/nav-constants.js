/**
 * Navigator constants — keyboard actions, key bindings, and typeahead config.
 * These are used by the Navigator class and keymap builder.
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

// ─── Typeahead ────────────────────────────────────────────────────────────────

/** Milliseconds of inactivity before the typeahead buffer resets. */
export const TYPEAHEAD_RESET_MS = 500
