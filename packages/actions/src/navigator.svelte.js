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

	// Type-ahead state
	let typeaheadBuffer = ''
	let typeaheadTimer = null

	function resetTypeahead() {
		typeaheadBuffer = ''
		if (typeaheadTimer) {
			clearTimeout(typeaheadTimer)
			typeaheadTimer = null
		}
	}

	function handleTypeahead(event) {
		const { key, ctrlKey, metaKey, altKey } = event
		if (ctrlKey || metaKey || altKey) return false
		if (key.length !== 1 || key === ' ') return false

		// Single-char repeat: start after current to cycle through matches
		const startAfter = typeaheadBuffer.length === 0 ? wrapper.focusedKey : null

		typeaheadBuffer += key
		if (typeaheadTimer) clearTimeout(typeaheadTimer)
		typeaheadTimer = setTimeout(resetTypeahead, 500)

		const matchKey = wrapper.findByText(typeaheadBuffer, startAfter)
		if (matchKey !== null && wrapper.moveTo(matchKey)) {
			event.preventDefault()
			event.stopPropagation()
			emitAction(node, wrapper, 'first', true) // emit 'move'
			setTimeout(() => scrollFocusedIntoView(node, wrapper), 0)
			return true
		}
		return false
	}

	const handleKeydown = (event) => {
		const action = getKeyboardAction(event, config)
		const prevKey = wrapper.focusedKey

		// For activation keys (Enter/Space) on anchor elements, let the browser
		// navigate natively. The click handler will update controller state when
		// the browser fires the synthetic click.
		if (action === 'select' && event.target.closest('a[href]')) {
			return
		}

		const handled = handleAction(event, handlers[action])
		if (handled) {
			resetTypeahead()
			emitAction(node, wrapper, action, true)
			// If expand/collapse moved focus, also emit move so components update DOM focus
			const focusMoved = ['expand', 'collapse'].includes(action) && wrapper.focusedKey !== prevKey
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
			return
		}

		// Type-ahead: when no navigation action matched and typeahead is enabled
		if (config.typeahead && wrapper.findByText) {
			handleTypeahead(event)
		}
	}

	const handleClick = (event) => {
		const action = getClickAction(event)
		const path = getPathFromEvent(event)

		// Anchor elements with href handle navigation natively — don't preventDefault.
		// Still call the handler so focus/selection state stays in sync.
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
			resetTypeahead()
			cleanup.forEach((fn) => fn())
		}
	})
}
