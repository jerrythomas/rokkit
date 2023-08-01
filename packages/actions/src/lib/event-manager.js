/**
 * EventManager class to manage event listeners on an element.
 */
export function EventManager(element, handlers = {}) {
	let listening = false

	function toggle() {
		const action = listening ? 'removeEventListener' : 'addEventListener'
		Object.entries(handlers).forEach(([event, handler]) =>
			element[action](event, handler)
		)
		listening = !listening
	}

	function activate() {
		if (!listening) toggle()
	}

	function destroy() {
		if (listening) toggle()
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
