/**
 * EventManager class to manage event listeners on an element.
 */
export function EventManager(element, handlers = {}) {
	let listening = false

	function activate() {
		if (!listening) {
			Object.entries(handlers).forEach(([event, handler]) =>
				element.addEventListener(event, handler)
			)
			listening = true
		}
	}
	function reset() {
		if (listening) {
			Object.entries(handlers).forEach(([event, handler]) =>
				element.removeEventListener(event, handler)
			)
			listening = false
		}
	}
	function update(newHandlers = handlers, enabled = true) {
		if (listening !== enabled || handlers !== newHandlers) {
			reset()
			handlers = newHandlers
			// console.log(listening, enabled, handlers)
			if (enabled) activate()
		}
	}

	return { activate, reset, update }
}
