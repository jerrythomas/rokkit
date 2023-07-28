import { compact } from '@rokkit/core'

/**
 * Emits a custom event with the given data.
 *
 * @param {HTMLElement} element
 * @param {string} event
 * @param {*} data
 * @returns {void}
 */
export function emit(element, event, data) {
	element.dispatchEvent(new CustomEvent(event, { detail: data }))
}

/**
 * Maps keyboard events to actions based on the given handlers and options.
 *
 * @param {import('../types').ActionHandlers} handlers
 * @param {import('../types').NavigationOptions} options
 * @returns {import('../types').KeyboardActions}
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

/**
 * Finds the closest ancestor of the given element that has the given attribute.
 *
 * @param {HTMLElement} element
 * @param {string} attribute
 * @returns {HTMLElement|null}
 */
export function getClosestAncestorWithAttribute(element, attribute) {
	if (!element) return null
	if (element.getAttribute(attribute)) return element
	return getClosestAncestorWithAttribute(element.parentElement, attribute)
}

/**
 * Sets up event handlers based on the given options.
 * Returns whether or not the event handlers are listening.
 *
 * @param {HTMLElement} element
 * @param {import('../types').EventHandlers} handlers
 * @param {import('../types').TraversableOptions} options
 * @returns {void}
 */
export function setupEventHandlers(element, handlers, options) {
	const { enabled } = options

	if (enabled) {
		Object.entries(handlers).forEach(([event, handler]) =>
			element.addEventListener(event, handler)
		)
	}
}

/**
 * Removes event handlers based on the given options.
 * Returns whether or not the event handlers are listening.
 *
 * @param {HTMLElement} element
 * @param {import('../types').EventHandlers} handlers
 * @returns {void}
 */
export function removeEventHandlers(element, handlers) {
	if (handlers) {
		Object.entries(handlers).forEach(([event, handler]) => {
			element.removeEventListener(event, handler)
		})
	}
}
