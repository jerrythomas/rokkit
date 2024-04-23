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
	const track = {}
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

	const listeners = {
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
 * Handles the touch end event and triggers a swipe event if the criteria are met.
 *
 * @param {Event}       event   - The event object representing the touch or mouse event.
 * @param {HTMLElement} node    - The HTML element on which the swipe event will be dispatched.
 * @param {object}      options - Configuration options for determining swipe behavior.
 * @param {object}      track   - An object tracking the start point and time of the touch or swipe action.
 */
function touchEnd(event, node, options, track) {
	const { distance, duration } = getTouchMetrics(event, track)
	if (!isSwipeFastEnough(distance, duration, options.minSpeed)) return

	const swipeDetails = getSwipeDetails(distance, options)
	if (!swipeDetails.isValid) return
	node.dispatchEvent(new CustomEvent(`swipe${swipeDetails.direction}`))
}

/**
 * Calculates and returns the distance and duration of the swipe.
 *
 * @param {Event} event - The event object that initiated the touchEnd.
 * @param {object} track - The tracking object holding the start of the touch action.
 * @returns {{distance: {x: number, y: number}, duration: number}} The distance swiped (x and y) and the duration of the swipe.
 */
function getTouchMetrics(event, track) {
	const touch = event.changedTouches ? event.changedTouches[0] : event
	const distX = touch.clientX - track.startX
	const distY = touch.clientY - track.startY
	const duration = (new Date().getTime() - track.startTime) / 1000
	return { distance: { x: distX, y: distY }, duration }
}

/**
 * Checks if the swipe was fast enough according to the minimum speed requirement.
 *
 * @param {{x: number, y: number}} distance - The distance of the swipe action.
 * @param {number}                 duration - The duration of the swipe action in seconds.
 * @param {number}                 minSpeed - The minimum speed threshold for the swipe action.
 * @returns {boolean}              True if the swipe is fast enough, otherwise false.
 */
function isSwipeFastEnough(distance, duration, minSpeed) {
	const speed = Math.max(Math.abs(distance.x), Math.abs(distance.y)) / duration
	return speed > minSpeed
}

/**
 * Determines swipe validity and direction based on horizontal/vertical preferences and thresholds.
 *
 * @param {{x: number, y: number}} distance - The distance of the swipe.
 * @param {object} options - Configuration options such as direction preferences and thresholds.
 * @returns {{isValid: boolean, direction?: string}} Object indicating whether the swipe is valid, and if so, its direction.
 */
function getSwipeDetails(distance, options) {
	const isHorizontalSwipe = options.horizontal && Math.abs(distance.x) >= options.threshold
	const isVerticalSwipe = options.vertical && Math.abs(distance.y) >= options.threshold
	if (isHorizontalSwipe || isVerticalSwipe) {
		return {
			isValid: true,
			direction: getSwipeDirection(distance.x, distance.y)
		}
	}
	return { isValid: false }
}
/**
 * Returns the swipe direction based on the distance in the x and y axis.
 *
 * @param {number} distX - The distance in the x axis.
 * @param {number} distY - The distance in the y axis.
 * @returns {string} The swipe direction.
 */
function getSwipeDirection(distX, distY) {
	if (Math.abs(distX) > Math.abs(distY)) {
		return distX > 0 ? 'Right' : 'Left'
	} else {
		return distY > 0 ? 'Down' : 'Up'
	}
}
