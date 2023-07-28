import {
	getClosestAncestorWithAttribute,
	mapKeyboardEventsToActions
} from './lib'

const defaultOptions = {
	horizontal: false,
	nested: false,
	enabled: true
}
export function traversable(element, data) {
	let listening = false
	let options = {}
	let tracker = {}
	let handlers = {}

	let actions = {
		next: () => emit(element, 'move', tracker),
		previous: () => emit(element, 'move', tracker),
		select: () => emit(element, 'select', tracker),
		escape: () => emit(element, 'escape', tracker),
		collapse: () => emit(element, 'collapse', tracker),
		expand: () => emit(element, 'expand', tracker)
	}

	let listeners = {
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

	const configure = (data) => {
		// const valueChanged = options.value !== data.value
		options = { ...options, ...data }

		listening = setupEventHandlers(element, options, listening, listeners)
		handlers = mapKeyboardEventsToActions(actions, options)
		// if (valueChanged) handleValueChange(element, options)
	}

	configure({ ...defaultOptions, ...data })

	return {
		update: configure,
		destroy: () => configure({ enabled: false })
	}
}

function setupEventHandlers(element, options, listening, handlers) {
	const { enabled } = options

	if (enabled && !listening) {
		Object.entries(handlers).forEach(([event, handler]) =>
			element.addEventListener(event, handler)
		)
	} else if (!enabled && listening) {
		Object.entries(handlers).forEach(([event, handler]) =>
			element.removeEventListener(event, handler)
		)
	}
	return enabled
}

function emit(element, event, tracker) {
	element.dispatchEvent(new CustomEvent(event, { detail: tracker }))
}
// function handleValueChange(element, options) {}
