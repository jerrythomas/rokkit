import { compact } from '@rokkit/core'

/**
 * @typedef {Object} ActionHandlers
 * @property {Function} [next]
 * @property {Function} [previous]
 * @property {Function} [select]
 * @property {Function} [escape]
 * @property {Function} [collapse]
 * @property {Function} [expand]
 */

/**
 * @typedef {Object} NavigationOptions
 * @property {Boolean} [horizontal]
 * @property {Boolean} [nested]
 * @property {Boolean} [enabled]
 */

/**
 * @typedef {Object} KeyboardActions
 * @property {Function} [ArrowDown]
 * @property {Function} [ArrowUp]
 * @property {Function} [ArrowRight]
 * @property {Function} [ArrowLeft]
 * @property {Function} [Enter]
 * @property {Function} [Escape]
 * @property {Function} [" "]
 */

/**
 * Maps keyboard events to actions based on the given handlers and options.
 *
 * @param {ActionHandlers} handlers
 * @param {NavigationOptions} options
 * @returns {KeyboardActions}
 */
export function mapKeyboardEventsToActions(handlers, options) {
	const { next, previous, select, escape } = handlers
	const { horizontal, nested } = {
		horizontal: false,
		nested: false,
		...options
	}
	let expand = nested ? handlers.expand : null
	let collapse = nested ? handlers.collapse : null

	return compact({
		ArrowDown: horizontal ? expand : next,
		ArrowUp: horizontal ? collapse : previous,
		ArrowRight: horizontal ? next : expand,
		ArrowLeft: horizontal ? previous : collapse,
		Enter: select,
		Escape: escape,
		' ': select
	})
}

export function getClosestAncestorWithAttribute(element, attribute) {
	if (!element) return null
	if (element.getAttribute(attribute)) return element
	return getClosestAncestorWithAttribute(element.parentElement, attribute)
}
