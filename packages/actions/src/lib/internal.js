import { compact } from '@rokkit/core'
import { hasChildren, isExpanded } from '@rokkit/core'

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
 * @param {import('../types').EventHandlers} listeners
 * @param {import('../types').TraversableOptions} options
 * @returns {void}
 */
export function setupListeners(element, listeners, options) {
	const { enabled } = { enabled: true, ...options }

	if (enabled) {
		Object.entries(listeners).forEach(([event, listener]) =>
			element.addEventListener(event, listener)
		)
	}
}

/**
 * Removes event handlers based on the given options.
 * Returns whether or not the event handlers are listening.
 *
 * @param {HTMLElement} element
 * @param {import('../types').EventHandlers} listeners
 * @returns {void}
 */
export function removeListeners(element, listeners) {
	if (listeners) {
		Object.entries(listeners).forEach(([event, listener]) => {
			element.removeEventListener(event, listener)
		})
	}
}

/**
 * @typedef {Object} CurrentItem
 * @property {*} item - The current item.
 * @property {import('@rokkit/core').FieldMapping} fields - The fields mapping.
 * @property {Array<integer>} position - Indices providing path to the item position in the tree.
 */
/**
 * Handles the click event.
 * @param {HTMLElement} element - The root element.
 * @param {CurrentItem} current - A reference to the current Item
 * @returns {CurrentItem} The updated current item.
 */
export function onNodeClick(element, current) {
	const { item, fields, position } = current
	const detail = { item, position }

	if (hasChildren(item, fields)) {
		if (isExpanded(item, fields)) {
			item[fields.isOpen] = false
			emit(element, 'collapse', detail)
		} else {
			item[fields.isOpen] = true
			emit(element, 'expand', detail)
		}
	} else {
		emit(element, 'select', detail)
	}
	return current
}
