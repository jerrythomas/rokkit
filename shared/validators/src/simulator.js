import { vi } from 'vitest'

global.Touch = vi.fn().mockImplementation((input) => input)

export function simulateMouseEvent(x, y) {
	return {
		clientX: x,
		clientY: y,
		stopPropagation: vi.fn(),
		preventDefault: vi.fn()
	}
}
export function simulateTouchEvent(clientX, clientY) {
	return {
		touches: [{ clientX, clientY }],
		preventDefault: vi.fn(),
		stopPropagation: vi.fn()
	}
}

export function simulateTouchSwipe(node, distance, delay = 0) {
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
	vi.advanceTimersByTime(delay)
	const touchEndEvent = new TouchEvent('touchend', {
		changedTouches: [touchEnd]
	})
	node.dispatchEvent(touchEndEvent)
}

export function simulateMouseSwipe(node, distance, delay = 0) {
	node.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }))
	node.dispatchEvent(
		new MouseEvent('mousemove', {
			clientX: distance.x / 2,
			clientY: distance.y / 2
		})
	)
	vi.advanceTimersByTime(delay)
	node.dispatchEvent(
		new MouseEvent('mouseup', { clientX: distance.x, clientY: distance.y })
	)
}

// export function getCustomEventMock() {
// 	return vi.fn().mockImplementation((eventType, eventInit) => {
// 		class CustomEvent extends Event {
// 			constructor(type, init) {
// 				super(type, init)
// 				this.detail = init
// 			}
// 		}
// 		return new CustomEvent(eventType, eventInit)
// 	})
// }
