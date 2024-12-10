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
 * @param {HTMLElement} root
 * @param {Object}      data
 */
export function switchable(root, data) {
	const manager = EventManager(root)

	const getToggle = (root, data) => {
		const toggle = (increment = 1) => {
			data.index = (data.index + increment) % data.options.length
			data.value = data.options[data.index]
			root.dispatchEvent(new CustomEvent('change', { detail: value }))
		}
		return toggle
	}

	$effect(() => {
		if (data.value === null || data.value === undefined) {
			data.value = data.options[0]
		}
		// options = data.options
		data.index = options.indexOf(value)

		const listeners = getEventHandlers(options, getToggle(root, data))
		manager.update(listeners, !data.disabled)

		return () => manager.reset()
	})
}
