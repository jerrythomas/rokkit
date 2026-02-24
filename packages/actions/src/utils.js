import { find, toPairs } from 'ramda'

// const defaultNavigationOptions = {
// 	orientation: 'vertical',
// 	dir: 'ltr',
// 	nested: false,
// 	enabled: true
// }
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
	 
	const matchEvent = ([_eventName, keys]) =>
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

// /**
//  *  Maps keys to actions based on the configuration.
//  *
//  * @param {import('./types').NavigableOptions} options
//  * @param {import('./types').NavigableHandlers} handlers
//  */
// export function getKeyboardActions(options, handlers) {
// 	const { horizontal, nested } = options
// 	if (!options.enabled) return {}

// 	const common = {
// 		Enter: handlers.select,
// 		' ': handlers.select
// 	}
// 	const movement = horizontal
// 		? { ArrowLeft: handlers.previous, ArrowRight: handlers.next }
// 		: { ArrowUp: handlers.previous, ArrowDown: handlers.next }
// 	const change = horizontal
// 		? { ArrowUp: handlers.collapse, ArrowDown: handlers.expand }
// 		: { ArrowLeft: handlers.collapse, ArrowRight: handlers.expand }

// 	if (nested) return { ...common, ...movement, ...change }
// 	return { ...common, ...movement }
// }
// Keyboard related functions moved to kbd.js

/**
 * Finds and returns an index path based on data-path attribute
 *
 * @param {MouseEvent} event
 * @returns {number[]|null} null or index path array
 */
export function getPathFromEvent(event) {
	const node = getClosestAncestorWithAttribute(event.target, 'data-path')
	return node?.getAttribute('data-path')
	// return node ? getPathFromKey(node.getAttribute('data-path')) : null
}

// createKeyboardActionMap moved to kbd.js

// createModifierKeyboardActionMap moved to kbd.js
/**
 * Identifies if an element is a collapsible icon
 * @param {HTMLElement} target
 * @returns {boolean}
 */
function isNodeToggle(target) {
	return (
		target &&
		target.hasAttribute('data-tag-icon') &&
		['closed', 'opened'].includes(target.getAttribute('data-state'))
	)
}

/**
 * Finds the closest ancestor (or self) that has the given attribute
 * @param {HTMLElement} element
 * @param {string} attribute
 * @returns {HTMLElement|null}
 */
function findClosestWithAttribute(element, attribute) {
	if (!element) return null
	if (element.hasAttribute && element.hasAttribute(attribute)) return element
	return findClosestWithAttribute(element.parentElement, attribute)
}

/**
 * Identifies if an element or its ancestors is an accordion/tree trigger
 * @param {HTMLElement} target
 * @returns {boolean}
 */
function isAccordionTrigger(target) {
	if (!target) return false
	const trigger = findClosestWithAttribute(target, 'data-accordion-trigger')
	return trigger !== null
}
// getKeyboardAction moved to kbd.js

/**
 * Determines an action based on a click event
 *
 * @param {MouseEvent} event - The click event
 * @returns {string} The determined action
 */
export const getClickAction = (event) => {
	const { ctrlKey, metaKey, shiftKey, target } = event

	// Check for shift key first (range selection)
	if (shiftKey && !ctrlKey && !metaKey) {
		return 'range'
	}

	// Check for modifier keys (toggle selection)
	if (ctrlKey || metaKey) {
		return 'extend'
	}

	// Check if clicked on icon with collapsed/expanded state
	if (isNodeToggle(target) || isNodeToggle(target.parentElement)) {
		return 'toggle'
	}

	// Check if clicked on accordion trigger (header area)
	if (isAccordionTrigger(target)) {
		return 'toggle'
	}

	// Default action
	return 'select'
}
