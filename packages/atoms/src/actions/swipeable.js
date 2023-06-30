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
	if (!enabled) return { destroy() {} }

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
