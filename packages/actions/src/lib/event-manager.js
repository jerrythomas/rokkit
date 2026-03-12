import { on } from 'svelte/events'

/**
 * Reset an event listener.
 * @param {string} event - The event name.
 * @param {Object} registry - The object containing the event listeners.
 */
function resetEvent(event, registry) {
	if (typeof registry[event] === 'function') {
		registry[event]()
		delete registry[event]
	}
}

/**
 * EventManager class to manage event listeners on an element.
 *
 * @param {HTMLElement} element  - The element to listen for events on.
 * @param {Object}      handlers - An object with event names as keys and event handlers as values.
 * @returns {Object} - An object with methods to activate, reset, and update the event listeners.
 */
export function EventManager(element, handlers = {}, enabled = true) {
	const registeredEvents = {}
	const options = { handlers, enabled }

	/**
	 * Activate the event listeners.
	 */
	function activate() {
		if (options.enabled) {
			Object.entries(options.handlers).forEach(([event, handler]) => {
				resetEvent(event, registeredEvents)
				registeredEvents[event] = on(element, event, handler)
			})
		}
	}

	/**
	 * Reset the event listeners.
	 */
	function reset() {
		Object.keys(registeredEvents).forEach((event) => {
			resetEvent(event, registeredEvents)
		})
	}

	/**
	 * Update the event listeners.
	 *
	 * @param {Object} newHandlers - An object with event names as keys and event handlers as values.
	 * @param {boolean} enabled - Whether to enable or disable the event listeners.
	 */
	function update(newHandlers = handlers, enabled = true) {
		const hasChanged = handlers !== newHandlers

		if (!enabled) reset()

		if (hasChanged) {
			options.handlers = newHandlers
			options.enabled = enabled
			activate()
		}
	}

	activate()
	return { reset, update }
}
