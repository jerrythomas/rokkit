export function getPropertyValue(component, property) {
	return component.$$.ctx[component.$$.props[property]]
}

export function getComponentProp(component, prop) {
	return component.$$.ctx[component.$$.props[prop]]
}

export function simulateTouchSwipe(node, distance) {
	const touchStart = new Touch({
		identifier: 0,
		target: node,
		clientX: 0,
		clientY: 0
	})
	const touchEnd = new Touch({
		identifier: 0,
		target: node,
		clientX: distance.x,
		clientY: distance.y
	})
	const touchStartEvent = new TouchEvent('touchstart', {
		touches: [touchStart]
	})
	node.dispatchEvent(touchStartEvent)
	const touchEndEvent = new TouchEvent('touchend', {
		changedTouches: [touchEnd]
	})
	node.dispatchEvent(touchEndEvent)
}

export function simulateMouseSwipe(node, distance) {
	node.dispatchEvent(new MouseEvent('mouseup', { clientX: 0, clientY: 0 }))
	node.dispatchEvent(
		new MouseEvent('mousedown', { clientX: distance.x, clientY: distance.y })
	)
}
