import { on } from 'svelte/events'
import { handleAction, getKeyboardActions } from './utils'

const defaultOptions = { horizontal: true, nested: false, enabled: true }
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
		const props = { ...defaultOptions, ...options }
		actions = getKeyboardActions(props, handlers)
		const cleanup = on(node, 'keyup', handleKeydown)

		return () => cleanup()
	})
}
