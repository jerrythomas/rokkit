export function navigable(
	node,
	{ horizontal = true, nested = false, enabled = true } = {}
) {
	// console.log(node, enabled)
	if (!enabled) return { destroy() {} }
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

	node.addEventListener('keydown', handleKeydown)

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown)
		}
	}
}
