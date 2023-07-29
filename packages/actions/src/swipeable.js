/**
 * A svelte action function that captures swipe actions and emits event for corresponding movements.
 *
 * @param {HTMLElement} node
 * @param {import(./types).SwipeableOptions} options
 * @returns {import('./types').SvelteActionReturn}
 */

import { removeListeners, setupListeners } from './lib'
const defaultOptions = {
	horizontal: true,
	vertical: false,
	threshold: 100,
	enabled: true,
	minSpeed: 300
}
export function swipeable(node, options = defaultOptions) {
	let track = {}
	let listeners = {}

	const updateListeners = (options) => {
		removeListeners(node, listeners)
		listeners = getListeners(node, options, track)
		setupListeners(node, listeners, options)
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

function touchStart(event, track) {
	const touch = event.touches ? event.touches[0] : event
	track.startX = touch.clientX
	track.startY = touch.clientY
	track.startTime = new Date().getTime()
}

function touchEnd(event, node, options, track) {
	const { horizontal, vertical, threshold, minSpeed } = options
	const touch = event.changedTouches ? event.changedTouches[0] : event
	const distX = touch.clientX - track.startX
	const distY = touch.clientY - track.startY
	const duration = (new Date().getTime() - track.startTime) / 1000
	const speed = Math.max(Math.abs(distX), Math.abs(distY)) / duration

	if (horizontal && speed > minSpeed) {
		if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) >= threshold) {
			if (distX > 0 && distX / duration > minSpeed) {
				node.dispatchEvent(new CustomEvent('swipeRight'))
			} else {
				node.dispatchEvent(new CustomEvent('swipeLeft'))
			}
		}
	}

	if (vertical && speed > minSpeed) {
		if (Math.abs(distY) > Math.abs(distX) && Math.abs(distY) >= threshold) {
			if (distY > 0) {
				node.dispatchEvent(new CustomEvent('swipeDown'))
			} else {
				node.dispatchEvent(new CustomEvent('swipeUp'))
			}
		}
	}
}
