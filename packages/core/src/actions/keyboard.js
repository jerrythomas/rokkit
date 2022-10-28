const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter']

export function navigable(node) {
	const handleKeyDown = (event) => {
		// 		console.log('action', event.key)
		if (keys.includes(event.key)) {
			event.stopPropagation()
			event.preventDefault()

			node.dispatchEvent(
				new CustomEvent('arrow', { detail: { key: event.key } })
			)
		}
	}
	node.addEventListener('keydown', handleKeyDown, true)
	return {
		destroy() {
			node.removeEventListener('keydown', handleKeyDown, true)
		}
	}
}

export function navigableItem(node) {
	const handleClick = (event) => {
		node.dispatchEvent(new CustomEvent('select'))
	}
	node.addEventListener('click', handleClick, true)
	return {
		destroy() {
			node.removeEventListener('click', handleClick, true)
		}
	}
}
function next(index, size, cycle = true) {
	return cycle ? (index + 1) % size : index + 1
}
function previous(index, size, cycle = true) {
	return cycle ? (index + size - 1) % size : index - 1
}
