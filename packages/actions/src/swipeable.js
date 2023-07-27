/**
 * A svelte action function that captures swipe actions and emits event for corresponding movements.
 *
 * @param {HTMLElement} node
 * @param {import(./types).SwipeableOptions} options
 * @returns {import('./types').SvelteActionReturn}
 */

export function swipeable(
	node,
	{
		horizontal = true,
		vertical = false,
		threshold = 100,
		enabled = true,
		minSpeed = 300
	} = {}
) {
	let listening = false
	let startX
	let startY
	let startTime

	function touchStart(event) {
		const touch = event.touches ? event.touches[0] : event
		startX = touch.clientX
		startY = touch.clientY
		startTime = new Date().getTime()
	}

	function touchEnd(event) {
		const touch = event.changedTouches ? event.changedTouches[0] : event
		const distX = touch.clientX - startX
		const distY = touch.clientY - startY
		const duration = (new Date().getTime() - startTime) / 1000
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

	const updateListeners = (enabled) => {
		if (enabled && !listening) {
			node.addEventListener('touchstart', touchStart)
			node.addEventListener('touchend', touchEnd)
			node.addEventListener('mousedown', touchStart)
			node.addEventListener('mouseup', touchEnd)
			listening = true
		}
		if (!enabled && listening) {
			node.removeEventListener('touchstart', touchStart)
			node.removeEventListener('touchend', touchEnd)
			node.removeEventListener('mousedown', touchStart)
			node.removeEventListener('mouseup', touchEnd)
			listening = false
		}
	}

	updateListeners(enabled)

	return {
		update: (options) => {
			horizontal = options.horizontal
			vertical = options.vertical
			threshold = options.threshold
			enabled = options.enabled
			minSpeed = options.minSpeed

			updateListeners(enabled)
		},
		destroy() {
			updateListeners(false)
		}
	}
}
