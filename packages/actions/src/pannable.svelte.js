import { omit } from 'ramda'
import { removeListeners, setupListeners } from './lib'

/**
 * Handles the panning event.
 *
 * @param {HTMLElement}              node   - The node where the event is dispatched.
 * @param {Event}                    event  - The event object.
 * @param {string}                   name   - The name of the event.
 * @param {import('./types').Coords} coords - The previous coordinates of the event.
 */
function handleEvent(node, event, name, coords) {
	const x = event.clientX ?? event.touches[0].clientX
	const y = event.clientY ?? event.touches[0].clientY
	const detail = { x, y }

	if (name === 'panmove') {
		detail.dx = x - coords.x
		detail.dy = y - coords.y
	}

	event.stopPropagation()
	event.preventDefault()
	node.dispatchEvent(new CustomEvent(name, { detail }))
	return omit(['dx', 'dy'], detail)
}

/**
 * Makes an element pannable with mouse or touch events.
 *
 * @param {HTMLElement} node The DOM element to apply the panning action.
 */
export function pannable(node) {
	let coords = { x: 0, y: 0 }
	const listeners = { primary: {}, secondary: {} }

	function start(event) {
		coords = handleEvent(node, event, 'panstart', coords)
		setupListeners(window, listeners.secondary)
	}

	function move(event) {
		coords = handleEvent(node, event, 'panmove', coords)
	}

	function stop(event) {
		coords = handleEvent(node, event, 'panend', coords)
		removeListeners(window, listeners.secondary)
	}

	listeners.primary = {
		mousedown: start,
		touchstart: start
	}
	listeners.secondary = {
		mousemove: move,
		mouseup: stop,
		touchmove: move,
		touchend: stop
	}

	$effect(() => {
		setupListeners(node, listeners.primary)
		return () => removeListeners(node, listeners.primary)
	})
}
