import { EventManager } from './lib'

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

/**
 * A switchable action that allows the user to cycle through a list of options
 *
 * @param {HTMLElement} node
 * @param {Object}      data
 */
export function switchable(node, data) {
	const manager = EventManager(node)
	let options = data.options
	let index = 0
	let value

	const toggle = (increment = 1) => {
		index = (index + increment) % options.length
		value = options[index]
		node.dispatchEvent(new CustomEvent('change', { detail: value }))
	}

	$effect(() => {
		value = data.value === null || data.value === undefined ? data.options[0] : data.value
		options = data.options
		index = options.indexOf(value)

		const listeners = getEventHandlers(options, toggle)
		manager.update(listeners, !data.disabled)

		return () => manager.reset()
	})
}
