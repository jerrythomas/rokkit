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
	function destroy() {
		if (listening) {
			Object.entries(handlers).forEach(([event, handler]) =>
				element.removeEventListener(event, handler)
			)
			listening = false
		}
	}
	function update(enabled, newHandlers = handlers) {
		if (listening !== enabled || handlers !== newHandlers) {
			destroy()
			handlers = newHandlers
			if (enabled) activate()
		}
	}

	return { activate, destroy, update }
}
