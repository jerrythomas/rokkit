/**
 * EventManager class to manage event listeners on an element.
 *
 * @param {HTMLElement} element  - The element to listen for events on.
 * @param {Object}      handlers - An object with event names as keys and event handlers as values.
 * @returns {Object} - An object with methods to activate, reset, and update the event listeners.
 */
export function EventManager(element, handlers = {}) {
	let listening = false

	/**
	 * Activate the event listeners.
	 */
	function activate() {
		if (!listening) {
			Object.entries(handlers).forEach(([event, handler]) =>
				element.addEventListener(event, handler)
			)
			listening = true
		}
	}

	/**
	 * Reset the event listeners.
	 */
	function reset() {
		if (listening) {
			Object.entries(handlers).forEach(([event, handler]) =>
				element.removeEventListener(event, handler)
			)
			listening = false
		}
	}

	/**
	 * Update the event listeners.
	 *
	 * @param {Object} newHandlers - An object with event names as keys and event handlers as values.
	 * @param {boolean} enabled - Whether to enable or disable the event listeners.
	 */
	function update(newHandlers = handlers, enabled = true) {
		if (listening !== enabled || handlers !== newHandlers) {
			reset()
			handlers = newHandlers
			if (enabled) activate()
		}
	}

	return { activate, reset, update }
}
