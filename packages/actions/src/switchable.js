import { removeListeners, setupListeners } from './lib'

/**
 * A switchable action that allows the user to cycle through a list of options
 *
 * @param {HTMLElement} node
 * @param {Object}      data
 */
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

	const listeners = getEventHandlers(options, toggle)

	update(data)
	setupListeners(node, listeners, { enabled: !disabled })

	return {
		update,
		destroy: () => removeListeners(node, listeners)
	}
}
/**
 * Returns a keydown handler for the switchable component
 *
 * @param {Object} options
 */
function getEventHandlers(options, toggle) {
	const keydown = (e) => {
		if ([' ', 'Enter', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
			e.preventDefault()
			e.stopPropagation()

			toggle(e.key === 'ArrowLeft' ? options.length - 1 : 1)
		}
	}

	return { keydown, click: () => toggle(1) }
}
