import { on } from 'svelte/events'
import { getKeyboardActions, defaultNavigationOptions } from './kbd'

// Handle keyboard events
function handleAction(actions, event) {
	if (event.key in actions) {
		event.preventDefault()
		event.stopPropagation()
		actions[event.key]()
	}
}
/**
 * A svelte action function that captures keyboard evvents and emits event for corresponding movements.
 *
 * @param {HTMLElement} node
 * @param {import('./types').NavigableOptions} options
 * @returns {import('./types').SvelteActionReturn}
 */
export function navigable(node, options) {
	const handlers = {
		previous: () => node.dispatchEvent(new CustomEvent('previous')),
		next: () => node.dispatchEvent(new CustomEvent('next')),
		collapse: () => node.dispatchEvent(new CustomEvent('collapse')),
		expand: () => node.dispatchEvent(new CustomEvent('expand')),
		select: () => node.dispatchEvent(new CustomEvent('select'))
	}

	let actions = {}
	const handleKeydown = (event) => handleAction(actions, event)

	$effect(() => {
		// Use defaultNavigationOptions from kbd.js
		const props = { ...defaultNavigationOptions, ...options }
		actions = getKeyboardActions(props, handlers)
		const cleanup = on(node, 'keyup', handleKeydown)

		return () => cleanup()
	})
}
