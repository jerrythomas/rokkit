import { removeListeners, setupListeners } from './lib'

const defaultOptions = {
	horizontal: true,
	vertical: false,
	threshold: 100,
	enabled: true,
	minSpeed: 300
}

/**
 * A svelte action function that captures swipe actions and emits event for corresponding movements.
 *
 * @param {HTMLElement} node
 * @param {import(./types).SwipeableOptions} options
 * @returns {import('./types').SvelteActionReturn}
 */
export function swipeable(node, options = defaultOptions) {
	let track = {}
	let listeners = {}

	const updateListeners = (props) => {
		removeListeners(node, listeners)
		listeners = getListeners(node, props, track)
		setupListeners(node, listeners, props)
	}

	options = { ...defaultOptions, ...options }
	updateListeners(options)

	return {
		update: (data) => {
			options = { ...options, ...data }
			updateListeners(options)
		},
		destroy() {
			removeListeners(node, listeners)
		}
	}
}

/**
 * Returns the listeners for the swipeable action.
 * @param {HTMLElement} node - The node where the event is dispatched.
 * @param {import(./types).SwipeableOptions} options - The options for the swipe.
 * @param {import(./types).TouchTracker} track - The tracking object.
 * @returns {import(./types).Listeners}
 */
function getListeners(node, options, track) {
	if (!options.enabled) return {}

	let listeners = {
		touchend: (e) => touchEnd(e, node, options, track),
		touchstart: (e) => touchStart(e, track),
		mousedown: (e) => touchStart(e, track),
		mouseup: (e) => touchEnd(e, node, options, track)
	}
	return listeners
}

/**
 * Handles the touch start event.
 *
 * @param {Event} event
 * @param {import(./types).TouchTracker} track
 */
function touchStart(event, track) {
	const touch = event.touches ? event.touches[0] : event
	track.startX = touch.clientX
	track.startY = touch.clientY
	track.startTime = new Date().getTime()
}

/**
 * Handles the touch end event.
 *
 * @param {Event} event - The touch event.
 * @param {HTMLElement} node - The node where the event is dispatched.
 * @param {import(./types).SwipeableOptions} options options - The options for the swipe.
 * @param {import(./types).TouchTracker} track - The tracking object.
 */
function touchEnd(event, node, options, track) {
	const touch = event.changedTouches ? event.changedTouches[0] : event
	const distX = touch.clientX - track.startX
	const distY = touch.clientY - track.startY
	const duration = (new Date().getTime() - track.startTime) / 1000
	const speed = Math.max(Math.abs(distX), Math.abs(distY)) / duration

	if (speed <= options.minSpeed) return

	const isHorizontalSwipe = options.horizontal && Math.abs(distX) >= options.threshold
	const isVerticalSwipe = options.vertical && Math.abs(distY) >= options.threshold

	if (!isHorizontalSwipe && !isVerticalSwipe) return

	const swipeDirection = getSwipeDirection(distX, distY)
	node.dispatchEvent(new CustomEvent(`swipe${swipeDirection}`))
}

function getSwipeDirection(distX, distY) {
	if (Math.abs(distX) > Math.abs(distY)) {
		return distX > 0 ? 'Right' : 'Left'
	} else {
		return distY > 0 ? 'Down' : 'Up'
	}
}
