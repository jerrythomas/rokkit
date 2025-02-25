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
