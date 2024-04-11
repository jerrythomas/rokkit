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
	options = { ...defaultOptions, ...options }

	let listening = false
	const handlers = {
		previous: () => node.dispatchEvent(new CustomEvent('previous')),
		next: () => node.dispatchEvent(new CustomEvent('next')),
		collapse: () => node.dispatchEvent(new CustomEvent('collapse')),
		expand: () => node.dispatchEvent(new CustomEvent('expand')),
		select: () => node.dispatchEvent(new CustomEvent('select'))
	}

	let actions = {} //getKeyboardActions(node, { horizontal, nested })
	const handleKeydown = (event) => handleAction(actions, event)

	function updateListeners(input) {
		if (input.enabled) actions = getKeyboardActions(node, input, handlers)

		if (input.enabled && !listening) node.addEventListener('keydown', handleKeydown)
		else if (!input.enabled && listening) node.removeEventListener('keydown', handleKeydown)
		listening = input.enabled
	}

	updateListeners(options)

	return {
		update: (config) => {
			options = { ...options, ...config }
			updateListeners(options)
		},
		destroy: () => {
			updateListeners({ enabled: false })
		}
	}
}
