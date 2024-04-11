import { removeListeners, setupListeners } from './lib'

export function switchable(node, data) {
	let index = 0
	let { value, options, disabled } = data

	const update = (input) => {
		value = input.value === null || input.value === undefined ? options[0] : input.value
		options = input.options
		disabled = input.disabled
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
