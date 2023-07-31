/**
 * EventManager class to manage event listeners on an element.
 */
export function EventManager(element, handlers = {}) {
	let listening = false

	function activate() {
		if (!listening) {
			for (const event in handlers) {
				element.addEventListener(event, handlers[event])
			}
			listening = true
		}
	}
	function destroy() {
		if (listening) {
			for (const event in handlers) {
				element.removeEventListener(event, handlers[event])
			}
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
