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
	const mock = getMockNode(events)
	const actionHandler = action(mock.node, options)
	let result = events.map((event) => ({
		event,
		created: mock.listeners[event] === 1
	}))

	actionHandler.destroy()
	result = result
		.map((r) => ({ ...r, destroyed: mock.listeners[r.event] === 0 }))
		.map((r) => ({ ...r, pass: r.created && r.destroyed }))

	const pass = result.every((r) => r.pass)
	const message = [
		'Expected action',
		pass ? 'not to' : 'to',
		'manage handlers for',
		`[${events.join(',')}]`,
		'but result is',
		JSON.stringify(result)
	].join(' ')

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
	events = Array.isArray(events) ? events : [events]
	const handlerKeys = Object.keys(handler)

	const isEventValid = (event) => handlerKeys.includes(event)
	const isCallCountCorrect = (key) => {
		const callCount = handler[key].mock.calls.length
		return events.includes(key) ? callCount === 1 : callCount === 0
	}

	const validEvents = events.every(isEventValid)
	const pass = validEvents && handlerKeys.every(isCallCountCorrect)

	return {
		message: () => getMessage(events, handlerKeys, pass, validEvents),
		pass
	}
}

/**
 * Generates a message based on the validation state
 * @param {Array<string>} events
 * @param {Array<string>} handlerKeys
 * @param {boolean} pass
 * @param {boolean} validEvents
 * @returns {string}
 */
function getMessage(events, handlerKeys, pass, validEvents) {
	let message = ''
	const names = events.join(', ')
	const keys = handlerKeys.join(', ')

	if (pass) {
		message = `Expected other handlers besides [${names}] to be called, but none were`
	} else if (validEvents) {
		message = `Expected only [${names}] to be called once and the other handlers to not be called`
	} else {
		message = `Expected events from [${keys}] but got unexpected events [${names}]`
	}

	return message
}
