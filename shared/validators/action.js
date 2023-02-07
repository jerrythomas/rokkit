import { vi } from 'vitest'

/**
 * Creates a mock node with functions to add and remove event handlers
 *
 * @param {Array<string} events
 * @returns
 */
export function getMockNode(events) {
	let listeners = events.reduce((acc, event) => ({ ...acc, [event]: 0 }), {})

	const node = {
		addEventListener: vi.fn().mockImplementation((name) => ++listeners[name]),
		removeEventListener: vi.fn().mockImplementation((name) => --listeners[name])
	}
	return { node, listeners }
}

/**
 * Checks if all the given events are registered by the action and cleaned up on destroy.
 *
 * @param {*} action
 * @param {Object<string,any>} options
 * @param {string|Array<string>} events
 * @returns
 */
export function toUseHandlersFor(action, options, events) {
	if (typeof events === 'string') {
		events = [events]
	}
	let mock = getMockNode(events)

	const actionHandler = action(mock.node, options)

	let pass = events.every((event) => mock.listeners[event] == 1)
	actionHandler.destroy()
	pass = pass && events.every((event) => mock.listeners[event] == 0)

	const names = events.join(',')
	if (pass) {
		return {
			message: () =>
				`Expected action not to use handlers for [${names}] but it did`,
			pass: true
		}
	} else {
		return {
			message: () =>
				`Expected action to use handlers for [${names}] but it didn't`,
			pass: false
		}
	}
}

/**
 * Verifies that only the specified events are triggered. Expects an object of spies with key as event names.
 *
 * @param {Object<string,any>} handler : Object with keys as event names and values as spies
 * @param {string|Array<string>} events : An event name or an array of event names
 * @returns
 */
export function toOnlyTrigger(handler, events) {
	if (typeof events === 'string') {
		events = [events]
	}

	const pass = Object.keys(handler).every((key) =>
		events.includes(key)
			? handler[key].mock.calls.length == 1
			: handler[key].mock.calls.length == 0
	)
	const names = events.join(', ')
	if (pass) {
		return {
			message: () =>
				`Expected other handlers besides ${names} to be called, but none were`,
			pass: true
		}
	} else {
		return {
			message: () =>
				`Expected only ${names} to be called once and the other handlers to not be called`,
			pass: false
		}
	}
}
