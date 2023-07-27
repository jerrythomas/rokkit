/**
 * A svelte action function that captures keyboard evvents and emits event for corresponding movements.
 *
 * @param {HTMLElement} node
 * @param {import('./types').NavigableOptions} options
 * @returns {import('./types').SvelteActionReturn}
 */
export function navigable(
	node,
	{ horizontal = true, nested = false, enabled = true } = {}
) {
	let listening = false

	const previous = () => node.dispatchEvent(new CustomEvent('previous'))
	const next = () => node.dispatchEvent(new CustomEvent('next'))
	const collapse = () => node.dispatchEvent(new CustomEvent('collapse'))
	const expand = () => node.dispatchEvent(new CustomEvent('expand'))
	const select = () => node.dispatchEvent(new CustomEvent('select'))

	const movement = horizontal
		? { ArrowLeft: previous, ArrowRight: next }
		: { ArrowUp: previous, ArrowDown: next }
	const change = nested
		? horizontal
			? { ArrowUp: collapse, ArrowDown: expand }
			: { ArrowLeft: collapse, ArrowRight: expand }
		: {}
	const actions = {
		Enter: select,
		' ': select,
		...movement,
		...change
	}

	function handleKeydown(event) {
		if (actions[event.key]) {
			event.preventDefault()
			event.stopPropagation()
			actions[event.key]()
		}
	}

	function updateListeners(enabled) {
		if (enabled && !listening) node.addEventListener('keydown', handleKeydown)
		else if (!enabled && listening)
			node.removeEventListener('keydown', handleKeydown)
		listening = enabled
	}

	updateListeners(enabled)

	return {
		update: (options) => {
			enabled = options.enabled
			horizontal = options.horizontal
			nested = options.nested

			updateListeners(enabled)
		},
		destroy: () => {
			updateListeners(false)
		}
	}
}
