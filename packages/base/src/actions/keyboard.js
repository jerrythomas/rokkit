export function arrowKeys(node, options) {
	const keyup = (event) => {
		const next = options.horizontal
			? event.key === 'ArrowRight'
			: event.key === 'ArrowDown'
		const prev = options.horizontal
			? event.key === 'ArrowLeft'
			: event.key === 'ArrowUp'

		if (next) {
			node.dispatchEvent(new CustomEvent('forward', node))
		}
		if (prev) {
			node.dispatchEvent(new CustomEvent('backward', node))
		}
		if (event.key === 'Enter') {
			node.dispatchEvent(new CustomEvent('select', node))
		}
	}

	document.addEventListener('keyup', keyup, true)

	return {
		destroy() {
			document.removeEventListener('keyup', keyup, true)
		}
	}
}
