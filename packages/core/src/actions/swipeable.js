export function swipeable(
	node,
	{ horizontal = true, vertical = false, threshold = 100, enabled = true } = {}
) {
	if (!enabled) return { destroy() {} }

	let startX
	let startY

	function touchStart(event) {
		const touch = event.touches ? event.touches[0] : event
		startX = touch.clientX
		startY = touch.clientY
	}

	function touchEnd(event) {
		const touch = event.changedTouches ? event.changedTouches[0] : event
		const distX = touch.clientX - startX
		const distY = touch.clientY - startY

		if (horizontal) {
			if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) >= threshold) {
				if (distX > 0) {
					node.dispatchEvent(new CustomEvent('swipeRight'))
				} else {
					node.dispatchEvent(new CustomEvent('swipeLeft'))
				}
			}
		}

		if (vertical) {
			if (Math.abs(distY) > Math.abs(distX) && Math.abs(distY) >= threshold) {
				if (distY > 0) {
					node.dispatchEvent(new CustomEvent('swipeDown'))
				} else {
					node.dispatchEvent(new CustomEvent('swipeUp'))
				}
			}
		}
	}

	node.addEventListener('touchstart', touchStart)
	node.addEventListener('touchend', touchEnd)
	node.addEventListener('mousedown', touchStart)
	node.addEventListener('mouseup', touchEnd)

	return {
		destroy() {
			node.removeEventListener('touchstart', touchStart)
			node.removeEventListener('touchend', touchEnd)
			node.removeEventListener('mousedown', touchStart)
			node.removeEventListener('mouseup', touchEnd)
		}
	}
}
