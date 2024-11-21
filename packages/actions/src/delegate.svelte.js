import { EventManager } from './lib'

/**
 * Svelte action function for forwarding keyboard events from a parent element to a child.
 * The child is selected using a CSS selector passed in the options object.
 * Optionally, you can specify which keyboard events you want to forward: "keydown", "keyup", and/or "keypress".
 * By default, all three events are forwarded.
 * The action returns an object with a destroy method.
 * The destroy method removes all event listeners from the parent.
 *
 * @param {HTMLElement} element - The parent element from which keyboard events will be forwarded.
 * @param {import('./types').PushDownOptions} options - The options object.
 * @returns {{destroy: Function}}
 */
export function delegateKeyboardEvents(
	element,
	{ selector, events = ['keydown', 'keyup', 'keypress'] }
) {
	const child = element.querySelector(selector)
	const handlers = {}
	const manager = EventManager(element)

	function forwardEvent(event) {
		child.dispatchEvent(new KeyboardEvent(event.type, event))
	}

	$effect(() => {
		if (child) {
			events.forEach((event) => {
				handlers[event] = forwardEvent
			})
			manager.update(handlers)
		}
		return () => manager.reset()
	})
}
