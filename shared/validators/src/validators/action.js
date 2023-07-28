import { getMockNode } from '../mocks'

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
	let message = ''
	if (pass)
		message = `Expected action not to use handlers for [${names}] but it did`
	else message = `Expected action to use handlers for [${names}] but it didn't`

	return { message: () => message, pass }
}

/**
 * Verifies that only the specified events are triggered. Expects an object of spies with key as event names.
 *
 * @param {Object<string,any>} handler : Object with keys as event names and values as spies
 * @param {string|Array<string>} events : An event name or an array of event names
 * @returns
 */
export function toOnlyTrigger(handler, events) {
	events = typeof events === 'string' ? [events] : events
	const handlerKeys = Object.keys(handler)
	const validEvents = events.every((event) => handlerKeys.includes(event))
	const pass =
		validEvents &&
		Object.keys(handler).every((key) => {
			const callCount = handler[key].mock.calls.length
			return events.includes(key) ? callCount === 1 : callCount === 0
		})

	const names = events.join(', ')
	const keys = handlerKeys.join(', ')
	let message = ''

	if (pass)
		message = `Expected other handlers besides [${names}] to be called, but none were`
	else if (validEvents) {
		message = `Expected only [${names}] to be called once and the other handlers to not be called`
	} else {
		message = `Expected events from [${keys}] but got unexpected events [${names}]`
	}
	return { message: () => message, pass }
}
