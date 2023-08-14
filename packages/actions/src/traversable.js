import { mappedList, isNested } from '@rokkit/core'
import { pick } from 'ramda'
import {
	getClosestAncestorWithAttribute,
	mapKeyboardEventsToActions,
	emit,
	handleItemClick,
	EventManager
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
export function traversable(element, options) {
	const content = mappedList(options.items, options.fields)
	const manager = EventManager(element)

	let current = { position: [], item: null }
	let handlers = {}

	const moveCursor = (direction) => {
		const result = content[direction](current.position)
		if (result) {
			current = result

			checkAndEmit('move')
		}
	}

	const checkAndEmit = (event) => {
		if (current && current.item) {
			emit(element, event, pick(['item', 'position'], current))
		}
	}

	const actions = {
		next: () => moveCursor('next'),
		previous: () => moveCursor('previous'),
		select: () => checkAndEmit('select'),
		escape: () => checkAndEmit('escape'),
		collapse: () => checkAndEmit('collapse'),
		expand: () => checkAndEmit('expand')
	}

	const listeners = {
		keydown: (event) => {
			if (event.key in handlers) handlers[event.key](event)
		}
		// click: (event) => {
		// 	const target = getClosestAncestorWithAttribute(event.target, 'data-path')
		// 	if (target) {
		// 		const position = target
		// 			.getAttribute('data-path')
		// 			.split(',')
		// 			.map((i) => +i)
		// 		current = content.findByPosition(position)
		// 		current = handleItemClick(element, current)
		// 	}
		// }
	}

	const update = (data) => {
		options = { ...defaultOptions, ...options, ...data }
		options.nested = isNested(options.items, options.fields)
		content.update(options.items, options.fields)
		handlers = mapKeyboardEventsToActions(actions, options)
		manager.update(listeners, options.enabled)
		// current = handleValueChange(element, data, content, current)
	}

	update(options)

	return {
		update,
		destroy: () => manager.reset()
	}
}

// const handleValueChange = (element, data, content, current) => {
// 	if (data.value !== null && data.value !== current?.value) {
// 		current = content.findByValue(data.value)
// 		if (current) scrollIntoView(element, current.position)
// 	}
// 	return current
// }

// function scrollIntoView(element, position) {
// 	if (!Array.isArray(position) || position.length == 0) return
// 	const node = element.querySelector(`[data-index="${position.join(',')}"]`)
// 	if (node) node.scrollIntoView()
// }
