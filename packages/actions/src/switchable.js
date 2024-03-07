import { removeListeners, setupListeners } from './lib'

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
		index = (index + increment) % options.length
		value = options[index]
		node.dispatchEvent(new CustomEvent('change', { detail: value }))
	}

	const keydown = (e) => {
		if ([' ', 'Enter', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
			e.preventDefault()
			e.stopPropagation()

			toggle(e.key === 'ArrowLeft' ? options.length - 1 : 1)
		}
	}
	const listeners = {
		click: () => toggle(1),
		keydown
	}

	update(data)
	setupListeners(node, listeners, { enabled: !disabled })

	return {
		update,
		destroy: () => removeListeners(node, listeners)
	}
}
