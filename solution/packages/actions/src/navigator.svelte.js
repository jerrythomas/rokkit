import { on } from 'svelte/events'
import { omit } from 'ramda'
import { getKeyboardAction, defaultNavigationOptions } from './kbd'
import { getClickAction, getPathFromEvent } from './utils'

/**
 * Scrolls the focused element into view if it exists
 * @param {HTMLElement} container - The container element with the navigator action
 * @param {*} wrapper - The controller/wrapper with focusedKey
 */
function scrollFocusedIntoView(container, wrapper) {
	let focusedElement = null

	// Use focusedKey if available (most reliable)
	if (wrapper.focusedKey) {
		focusedElement = container.querySelector(`[data-path="${wrapper.focusedKey}"]`)
	}

	// Fallback: find by aria-current
	if (!focusedElement) {
		focusedElement = container.querySelector('[aria-current="true"]')
	}

	// Scroll into view if element found and method exists (may not exist in test env)
	if (focusedElement?.scrollIntoView) {
		focusedElement.scrollIntoView({
			behavior: 'smooth',
			block: 'nearest',
			inline: 'nearest'
		})
	}
}

const EVENT_MAP = {
	first: ['move'],
	last: ['move'],
	previous: ['move'],
	next: ['move'],
	select: ['move', 'select'],
	extend: ['move', 'select'],
	range: ['move', 'select'],
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
		range: (path) => wrapper.selectRange(path),
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
	const config = { ...defaultNavigationOptions, ...omit(['wrapper'], options) }
	const handlers = getHandlers(wrapper)

	const handleKeydown = (event) => {
		const action = getKeyboardAction(event, config)
		const prevKey = wrapper.focusedKey
		const handled = handleAction(event, handlers[action])
		if (handled) {
			emitAction(node, wrapper, action, true)
			// If expand/collapse moved focus, also emit move so components update DOM focus
			const focusMoved =
				['expand', 'collapse'].includes(action) && wrapper.focusedKey !== prevKey
			if (focusMoved) {
				node.dispatchEvent(
					new CustomEvent('action', {
						detail: {
							name: 'move',
							data: { value: wrapper.focused, selected: wrapper.selected }
						}
					})
				)
			}
			// Scroll focused element into view for navigation and focus-moving expand/collapse
			if (focusMoved || ['first', 'last', 'previous', 'next'].includes(action)) {
				setTimeout(() => scrollFocusedIntoView(node, wrapper), 0)
			}
		}
	}

	const handleClick = (event) => {
		const action = getClickAction(event)
		const path = getPathFromEvent(event)
		const handled = handleAction(event, handlers[action], path)

		if (handled) emitAction(node, options.wrapper, action)
	}

	$effect(() => {
		const cleanup = [on(node, 'keydown', handleKeydown), on(node, 'click', handleClick)]

		return () => {
			cleanup.forEach((fn) => fn())
		}
	})
}
