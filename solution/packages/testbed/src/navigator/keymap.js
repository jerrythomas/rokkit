/**
 * List Keymap
 *
 * Maps keyboard inputs to semantic actions.
 *
 * Design principle: orientation is just a rotation of arrow key assignments.
 *
 *   vertical ltr  up/down  = prev/next    left/right = collapse/expand  (when collapsible)
 *   vertical rtl  up/down  = prev/next    right/left = collapse/expand  (expand/collapse reversed)
 *   horizontal    left/right = prev/next  up/down    = collapse/expand  (dir ignored — use CSS flex-reverse for RTL)
 *
 * ─── Actions ────────────────────────────────────────────────────────────────
 *
 *   next       focus next visible item, skip disabled
 *   prev       focus previous visible item, skip disabled
 *   first      jump to first visible item
 *   last       jump to last visible item
 *   expand     when collapsible: expand collapsed group
 *              if already expanded: move focus to first child
 *              on leaf: no-op
 *   collapse   when collapsible: collapse expanded group
 *              if already collapsed or leaf: move focus to parent
 *              at root level: no-op
 *   select     activate the focused item
 *              for link items the browser handles navigation; state is still updated
 *              for button items: fires onselect callback
 *              for group headers: same as expand (groups are not selectable)
 *   extend     toggle individual selection (multiselect ctrl/cmd + space)
 *   range      select contiguous range (multiselect shift + space)
 *
 * ─── Key table: vertical ────────────────────────────────────────────────────
 *
 *   Key          Modifier    Action
 *   ArrowDown    —           next
 *   ArrowUp      —           prev
 *   ArrowRight   —           expand     (collapsible only)
 *   ArrowLeft    —           collapse   (collapsible only)
 *   Enter        —           select
 *   Space        —           select
 *   Space        Shift       range
 *   Space        Ctrl/Cmd    extend
 *   Home         —           first
 *   End          —           last
 *   Escape       —           cancel
 *
 * ─── Key table: horizontal ltr ───────────────────────────────────────────────
 *
 *   ArrowRight   —           next
 *   ArrowLeft    —           prev
 *   ArrowDown    —           expand     (collapsible only)
 *   ArrowUp      —           collapse   (collapsible only)
 *   (rest same as vertical)
 *
 * ─── Key table: horizontal rtl ───────────────────────────────────────────────
 *
 *   ArrowLeft    —           next       (reversed)
 *   ArrowRight   —           prev       (reversed)
 *   ArrowDown    —           expand     (collapsible only)
 *   ArrowUp      —           collapse   (collapsible only)
 *   (rest same as vertical)
 */

import { ACTIONS, PLAIN_FIXED, CTRL_FIXED, SHIFT_FIXED, ARROWS } from '../constants.js'
export { ACTIONS }

function getArrows(orientation, dir) {
	if (orientation === 'horizontal') return ARROWS.horizontal
	return ARROWS[`vertical-${dir}`]
}

// ─── buildKeymap ──────────────────────────────────────────────────────────────

/**
 * Build a complete keymap for the given options.
 *
 * Returns three layers — plain, shift, ctrl — each mapping key name → action name.
 * Call resolveAction(event, keymap) to look up the action for a keyboard event.
 *
 * @param {Object} [options]
 * @param {'vertical'|'horizontal'} [options.orientation='vertical']
 * @param {'ltr'|'rtl'} [options.dir='ltr']
 * @param {boolean} [options.collapsible=false]
 * @returns {{ plain: Record<string, string>, shift: Record<string, string>, ctrl: Record<string, string> }}
 */
export function buildKeymap({ orientation = 'vertical', dir = 'ltr', collapsible = false } = {}) {
	const arrows = getArrows(orientation, dir)

	return {
		plain: {
			...PLAIN_FIXED,
			...arrows.move,
			...(collapsible ? arrows.nested : {})
		},
		shift: { ...SHIFT_FIXED },
		ctrl: { ...CTRL_FIXED }
	}
}

// ─── resolveAction ────────────────────────────────────────────────────────────

/**
 * Resolve the action for a keyboard event given a pre-built keymap.
 * Returns null if the key has no binding.
 *
 * @param {KeyboardEvent} event
 * @param {{ plain: Record<string, string>, shift: Record<string, string>, ctrl: Record<string, string> }} keymap
 * @returns {string|null}
 */
export function resolveAction(event, keymap) {
	const { key, ctrlKey, metaKey, shiftKey } = event

	if (shiftKey && !ctrlKey && !metaKey) return keymap.shift[key] ?? null
	if (ctrlKey || metaKey) return keymap.ctrl[key] ?? null
	return keymap.plain[key] ?? null
}
