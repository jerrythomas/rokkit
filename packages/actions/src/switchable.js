export function switchable(node, data) {
	let index = 0
	let { value, options, disabled } = data

	const update = (data) => {
		value = data.value === null || data.value === undefined ? options[0] : data.value
		options = data.options
		disabled = data.disabled
		index = options.indexOf(value)
	}

	const toggle = (increment = 1) => {
		if (disabled) return
		index = (index + increment) % options.length
		value = options[index]
		node.dispatchEvent(new CustomEvent('change', { detail: value }))
	}

	const keydown = (e) => {
		if (disabled) return
		if ([' ', 'Enter', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
			e.preventDefault()
			e.stopPropagation()

			toggle(e.key === 'ArrowLeft' ? options.length - 1 : 1)
		}
	}
	const click = () => toggle(1)

	update(data)
	node.addEventListener('click', click)
	node.addEventListener('keydown', keydown)

	return {
		update,
		destroy() {
			node.removeEventListener('click', click)
			node.removeEventListener('keydown', keydown)
		}
	}
}
