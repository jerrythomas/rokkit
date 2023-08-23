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
 * Handles the click event.
 * @param {HTMLElement} element - The root element.
 * @param {CurrentItem} current - A reference to the current Item
 * @returns {CurrentItem} The updated current item.
 */
export function handleItemClick(element, current) {
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

/**
 * Caclulates sum of array values between the given bounds.
 * If a value is null, the default size is used.
 * @param {Array<number|null>} sizes
 * @param {number} lower
 * @param {number} upper
 * @param {number} [defaultSize]
 * @returns {number}
 */
export function calculateSum(sizes, lower, upper, defaultSize = 40, gap = 0) {
	return (
		sizes
			.slice(lower, upper)
			.map((size) => size ?? defaultSize)
			.reduce((acc, size) => acc + size + gap, 0) - gap
	)
}

/**
 * Updates the sizes array with the given values.
 *
 * @param {Array<number|null>} sizes
 * @param {Array<number>} values
 * @param {number} [offset]
 * @returns {Array<number|null>}
 */
export function updateSizes(sizes, values, offset = 0) {
	let result = [
		...sizes.slice(0, offset),
		...values,
		...sizes.slice(offset + values.length)
	]

	return result
}

/**
 * Adjusts the viewport to ensure that the bounds contain the given number of items.
 *
 * @param {import('../types').Bounds} current
 * @param {number} count
 * @param {number} visibleCount
 * @returns {import('../types').Bounds}
 */
export function fixViewportForVisibileCount(current, count, visibleCount) {
	let { lower, upper } = current
	if (lower < 0) lower = 0
	if (lower + visibleCount > count) {
		upper = count
		lower = Math.max(0, upper - visibleCount)
	} else if (lower + visibleCount !== upper) {
		upper = lower + visibleCount
	}
	return { lower, upper }
}

/**
 * Adjusts the viewport to ensure the given index is visible.
 *
 * @param {number} index
 * @param {import('../types').Bounds} current
 * @param {number} visibleCount
 * @returns {import('../types').Bounds}
 */
export function fitIndexInViewport(index, current, visibleCount) {
	let { lower, upper } = current
	if (index >= upper) {
		upper = index + 1
		lower = upper - visibleCount
	} else if (index < lower) {
		lower = index
		upper = lower + visibleCount
	}
	return { lower, upper }
}
