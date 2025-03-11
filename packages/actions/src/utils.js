import { find, toPairs } from 'ramda'

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
 * Get the event name for a given key.
 * @param {import('./types.js').KeyboardConfig} keyMapping
 * @param {string} key - The key to match.
 * @returns {string|null} - The event name or null if no match is found.
 */
export const getEventForKey = (keyMapping, key) => {
	// eslint-disable-next-line no-unused-vars
	const matchEvent = ([eventName, keys]) =>
		(Array.isArray(keys) && keys.includes(key)) || (keys instanceof RegExp && keys.test(key))

	const event = find(matchEvent, toPairs(keyMapping))
	return event ? event[0] : null
}

/*
 * Generic action handler for keyboard events.
 *
 * @param {Record<string, () => void>} actions
 * @param {KeyboardEvent} event
 */
export function handleAction(actions, event) {
	if (event.key in actions) {
		event.preventDefault()
		event.stopPropagation()
		actions[event.key]()
	}
}

/**
 *  Maps keys to actions based on the configuration.
 *
 * @param {import('./types').NavigableOptions} options
 * @param {import('./types').NavigableHandlers} handlers
 */
export function getKeyboardActions(options, handlers) {
	if (!options.enabled) return {}

	const movement = options.horizontal
		? { ArrowLeft: handlers.previous, ArrowRight: handlers.next }
		: { ArrowUp: handlers.previous, ArrowDown: handlers.next }
	const change = options.nested
		? options.horizontal
			? { ArrowUp: handlers.collapse, ArrowDown: handlers.expand }
			: { ArrowLeft: handlers.collapse, ArrowRight: handlers.expand }
		: {}
	return {
		Enter: handlers.select,
		' ': handlers.select,
		...movement,
		...change
	}
}
