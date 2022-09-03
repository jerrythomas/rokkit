export function arrowKeys(node, options = {}) {
	const keyup = (event) => {
		const next = options.horizontal
			? event.key === 'ArrowRight'
			: event.key === 'ArrowDown'
		const prev = options.horizontal
			? event.key === 'ArrowLeft'
			: event.key === 'ArrowUp'

		if (next || prev || event.key === 'Enter') {
			event.stopPropagation()
			event.preventDefault()
		}
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

	node.addEventListener('keyup', keyup, true)
	document.addEventListener('keyup', keyup, true)

	return {
		destroy() {
			node.removeEventListener('keyup', keyup, true)
			document.removeEventListener('keyup', keyup, true)
		}
	}
}
