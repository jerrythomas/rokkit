import {
	getClosestAncestorWithAttribute,
	mapKeyboardEventsToActions,
	setupEventHandlers,
	removeEventHandlers,
	emit
} from './lib'

const defaultOptions = {
	horizontal: false,
	nested: false,
	enabled: true
}

/**
 * An action that can be used to traverse a nested list of items using keyboard and mouse.
 *
 * @param {HTMLElement} element
 * @param {import('./types').TraversableOptions} data
 * @returns
 */
export function traversable(element, data) {
	let listening = false
	let options = {}
	let tracker = {}
	let handlers = {}
	let actions
	let listeners

	const configure = (data) => {
		options = { ...options, ...data }

		listening = removeEventHandlers(element, listening, listeners)
		actions = getActions(element, tracker)
		handlers = mapKeyboardEventsToActions(actions, options)
		listeners = getListeners(handlers, actions, tracker)
		listening = setupEventHandlers(element, options, listening, listeners)
	}

	configure({ ...defaultOptions, ...data })

	return {
		update: configure,
		destroy: () => removeEventHandlers(element, listening, listeners)
	}
}

/**
 * Returns the listeners for the given handlers and actions.
 *
 * @param {import('./types').KeyboardActions} handlers
 * @param {import('./types').ActionHandlers} actions
 * @param {import('./types').PositionTracker} tracker
 */
function getListeners(handlers, actions, tracker) {
	return {
		keydown: (event) => {
			const action = handlers[event.key]
			if (action) action(event)
		},
		click: (event) => {
			const target = getClosestAncestorWithAttribute(event.target, 'data-index')

			if (target) {
				const index = parseInt(target.getAttribute('data-index'))
				tracker.index = index
				actions.select()
			}
		}
	}
}

/**
 *
 * @param {HTMLElement} element
 * @param {import('./types').PositionTracker} tracker
 * @returns {import('./types').ActionHandlers}
 */
function getActions(element, tracker) {
	const actions = {
		next: () => emit(element, 'move', tracker),
		previous: () => emit(element, 'move', tracker),
		select: () => emit(element, 'select', tracker),
		escape: () => emit(element, 'escape', tracker),
		collapse: () => emit(element, 'collapse', tracker),
		expand: () => emit(element, 'expand', tracker)
	}
	return actions
}

// function handleValueChange(element, options) {}
