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

function isTypeaheadEvent(event) {
	if (event.ctrlKey) return false
	if (event.metaKey) return false
	if (event.altKey) return false
	if (event.key.length !== 1) return false
	return event.key !== ' '
}

function dispatchFocusMoveEvent(node, wrapper) {
	node.dispatchEvent(
		new CustomEvent('action', {
			detail: {
				name: 'move',
				data: { value: wrapper.focused, selected: wrapper.selected }
			}
		})
	)
}

const SCROLL_ACTIONS = new Set(['first', 'last', 'previous', 'next', 'expand', 'collapse'])

function isNativeLink(action, target) {
	return action === 'select' && Boolean(target.closest('a[href]'))
}

function notifyFocusMove(node, wrapper, action, prevKey) {
	if (action !== 'expand' && action !== 'collapse') return false
	if (wrapper.focusedKey === prevKey) return false
	dispatchFocusMoveEvent(node, wrapper)
	return true
}

function runTypeahead(config, wrapper, ta, event) {
	if (!config.typeahead) return
	if (!wrapper.findByText) return
	ta.handle(event)
}

function makeKeydownHandler(ctx, config, handlers, ta) {
	const { node, wrapper } = ctx
	return (event) => {
		const action = getKeyboardAction(event, config)
		if (isNativeLink(action, event.target)) return

		const prevKey = wrapper.focusedKey
		const handled = handleAction(event, handlers[action])
		if (!handled) {
			runTypeahead(config, wrapper, ta, event)
			return
		}

		ta.reset()
		emitAction(node, wrapper, action, true)
		notifyFocusMove(node, wrapper, action, prevKey)
		if (SCROLL_ACTIONS.has(action)) setTimeout(() => scrollFocusedIntoView(node, wrapper), 0)
	}
}

function getTypeaheadStart(buffer, wrapper) {
	if (buffer.length === 0) return wrapper.focusedKey
	return null
}

function makeTypeahead(node, wrapper) {
	let buffer = ''
	let timer = null

	function reset() {
		buffer = ''
		if (timer) {
			clearTimeout(timer)
			timer = null
		}
	}

	function handle(event) {
		if (!isTypeaheadEvent(event)) return false

		const startAfter = getTypeaheadStart(buffer, wrapper)
		buffer += event.key
		if (timer) clearTimeout(timer)
		timer = setTimeout(reset, 500)

		const matchKey = wrapper.findByText(buffer, startAfter)
		if (matchKey === null) return false
		if (!wrapper.moveTo(matchKey)) return false

		event.preventDefault()
		event.stopPropagation()
		emitAction(node, wrapper, 'first', true)
		setTimeout(() => scrollFocusedIntoView(node, wrapper), 0)
		return true
	}

	return { reset, handle }
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
	const ta = makeTypeahead(node, wrapper)
	const handleKeydown = makeKeydownHandler({ node, wrapper }, config, handlers, ta)

	const handleClick = (event) => {
		const action = getClickAction(event)
		const path = getPathFromEvent(event)

		if (event.target.closest('a[href]')) {
			const handler = handlers[action]
			if (handler?.(path)) emitAction(node, options.wrapper, action)
			return
		}

		const handled = handleAction(event, handlers[action], path)
		if (handled) emitAction(node, options.wrapper, action)
	}

	$effect(() => {
		const cleanup = [on(node, 'keydown', handleKeydown), on(node, 'click', handleClick)]
		return () => {
			ta.reset()
			cleanup.forEach((fn) => fn())
		}
	})
}
