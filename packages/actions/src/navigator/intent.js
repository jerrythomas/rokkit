/**
 * Which events the Navigator claims, and as what — pure decisions over an event and the root.
 * The Navigator acts on the answer; nothing here touches the wrapper.
 */
import { resolveAction } from '../keymap.js'
import { pathOf, clickAction, isNestedInteractive, isDisabledItem } from './dom.js'

const inLink = (target) => Boolean(target.closest('a[href]'))

/**
 * The wrapper action a key maps to, or null when the Navigator leaves the key alone: unmapped;
 * select on a link (the browser fires a click for Enter/Space); or a disabled item has focus
 * (div/span items opt out through attributes — they have no native `disabled`).
 *
 * @param {KeyboardEvent} event
 * @param {HTMLElement} root
 * @param {Record<string, unknown>} keymap
 * @param {Element | null} [active] - the focused element
 * @returns {string | null}
 */
export function keyAction(event, root, keymap, active = document.activeElement) {
	const action = resolveAction(event, keymap)
	if (!action) return null
	if (action === 'select' && inLink(event.target)) return null
	if (isDisabledItem(active, root)) return null
	return action
}

/**
 * The action and item path for a click, or null when it is not the Navigator's: off any item,
 * on a disabled one, or meant for a control nested inside the item. `native` marks a link, whose
 * default (navigating) must survive.
 *
 * @param {MouseEvent} event
 * @param {HTMLElement} root
 * @returns {{ action: string, path: string, native: boolean } | null}
 */
export function clickIntent(event, root) {
	if (isNestedInteractive(event.target, root)) return null
	const path = pathOf(event.target, root)
	if (path === null || isDisabledItem(event.target, root)) return null
	return { action: clickAction(event), path, native: inLink(event.target) }
}

/**
 * Whether focus moving to `next` (a focusout's relatedTarget) leaves the root.
 *
 * @param {HTMLElement} root
 * @param {Node | null} next
 */
export function focusLeft(root, next) {
	return !next || !root.contains(next)
}
