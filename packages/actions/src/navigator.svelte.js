import { on } from 'svelte/events'
import { omit } from 'ramda'
import { getClickAction, getKeyboardAction, getPathFromEvent } from './utils'

const defaultOptions = { horizontal: false, nested: false, enabled: true }

const EVENT_MAP = {
	first: ['move'],
	last: ['move'],
	previous: ['move'],
	next: ['move'],
	select: ['move', 'select'],
	extend: ['move', 'select'],
	collapse: ['toggle'],
	expand: ['toggle'],
	toggle: ['toggle']
}

/**
 * The last only indicates that if there is an array only the last event is fired.
 * This is crucial because a click event needs to fire both move and select,
 * however the keyboard should only fire the select event because we are already
 * on the current item
 *
 * @param {HTMLElement} root
 * @param {*} controller
 * @param {*} name
 */
export function emitAction(root, controller, name, lastOnly = false) {
	const events = lastOnly ? EVENT_MAP[name].slice(-1) : EVENT_MAP[name]

	events.forEach((event) => {
		root.dispatchEvent(
			new CustomEvent('action', {
				detail: {
					name: event,
					data: { value: controller.focused, selected: controller.selected }
				}
			})
		)
	})
}

/*
 * Generic action handler for keyboard events.
 *
 * @param {Record<string, () => void>} actions
 * @param {KeyboardEvent} event
 */
export function handleAction(event, handler, path) {
	if (handler) {
		event.preventDefault()
		event.stopPropagation()
		return handler(path)
	}
	return false
}

function getHandlers(wrapper) {
	return {
		first: () => wrapper.moveFirst(),
		last: () => wrapper.moveLast(),
		previous: () => wrapper.movePrev(),
		next: () => wrapper.moveNext(),
		collapse: () => wrapper.collapse(),
		expand: () => wrapper.expand(),
		select: (path) => wrapper.select(path),
		extend: (path) => wrapper.extendSelection(path),
		toggle: (path) => wrapper.toggleExpansion(path)
	}
}
/**
 * A svelte action function that captures keyboard evvents and emits event for corresponding movements.
 *
 * @param {HTMLElement} node
 * @param {import('./types').NavigableOptions} options
 * @returns {import('./types').SvelteActionReturn}
 */
export function navigator(node, options) {
	const { wrapper } = options
	const config = { ...defaultOptions, ...omit(['wrapper'], options) }
	const handlers = getHandlers(wrapper)

	const handleKeydown = (event) => {
		const action = getKeyboardAction(event, config)
		const handled = handleAction(event, handlers[action])
		if (handled) emitAction(node, options.wrapper, action, true)
	}

	const handleClick = (event) => {
		const action = getClickAction(event)
		const path = getPathFromEvent(event)
		const handled = handleAction(event, handlers[action], path)

		if (handled) emitAction(node, options.wrapper, action)
	}

	$effect(() => {
		const cleanup = [on(node, 'keyup', handleKeydown), on(node, 'click', handleClick)]

		return () => {
			cleanup.forEach((fn) => fn())
		}
	})
}
