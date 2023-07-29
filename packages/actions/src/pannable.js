import { removeListeners, setupListeners } from './lib'

/**
 * Handle drag and move events
 *
 * @param {HTMLElement} node
 * @returns {import('./types').SvelteActionReturn}
 */
export function pannable(node) {
	let x
	let y
	let listeners = {
		primary: {
			mousedown: start,
			touchstart: start
		},
		secondary: {
			mousemove: move,
			mouseup: stop,
			touchmove: move,
			touchend: stop
		}
	}

	function track(event, name, delta = {}) {
		x = event.clientX || event.touches[0].clientX
		y = event.clientY || event.touches[0].clientY
		event.stopPropagation()
		event.preventDefault()
		node.dispatchEvent(
			new CustomEvent(name, {
				detail: { x, y, ...delta }
			})
		)
	}

	function start(event) {
		track(event, 'panstart')

		setupListeners(window, listeners.secondary)
		// window.addEventListener('mousemove', handleMousemove)
		// window.addEventListener('mouseup', handleMouseup)
		// window.addEventListener('touchmove', handleMousemove, { passive: false })
		// window.addEventListener('touchend', handleMouseup)
	}

	function move(event) {
		const dx = (event.clientX || event.touches[0].clientX) - x
		const dy = (event.clientY || event.touches[0].clientY) - y

		track(event, 'panmove', { dx, dy })
	}

	function stop(event) {
		track(event, 'panend')

		removeListeners(window, listeners.secondary)
		// window.removeEventListener('mousemove', handleMousemove)
		// window.removeEventListener('mouseup', handleMouseup)
		// window.removeEventListener('touchmove', handleMousemove)
		// window.removeEventListener('touchend', handleMouseup)
	}

	setupListeners(node, listeners.primary)
	// node.addEventListener('mousedown', handleMousedown)
	// node.addEventListener('touchstart', handleMousedown, { passive: false })

	return {
		destroy() {
			removeListeners(node, listeners.primary)
			// node.removeEventListener('mousedown', handleMousedown)
			// node.removeEventListener('touchstart', handleMousedown)
		}
	}
}
