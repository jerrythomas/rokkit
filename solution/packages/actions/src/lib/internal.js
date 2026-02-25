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
