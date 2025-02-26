import { vi } from 'vitest'

global.Touch = vi.fn().mockImplementation((input) => input)

/**
 * Simulates a mouse event on a given node.
 * @param {number} x
 * @param {number} y
 * @returns
 */
export function simulateMouseEvent(x, y) {
	return {
		clientX: x,
		clientY: y,
		stopPropagation: vi.fn(),
		preventDefault: vi.fn()
	}
}

/**
 * Simulates a touch event on a given node.
 * @param {number} clientX
 * @param {number} clientY
 * @returns
 */
export function simulateTouchEvent(clientX, clientY) {
	return {
		touches: [{ clientX, clientY }],
		preventDefault: vi.fn(),
		stopPropagation: vi.fn()
	}
}

/**
 * Simulates a touch swipe on a given node.
 * @param {HTMLElement} node
 * @param {number} distance
 * @param {number} [delay=0]
 */
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

/**
 * Simulates a mouse swipe on a given node.
 * @param {HTMLElement} node
 * @param {number} distance
 * @param {number} [delay=0]
 */
export function simulateMouseSwipe(node, distance, delay = 0) {
	node.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }))
	node.dispatchEvent(
		new MouseEvent('mousemove', {
			clientX: distance.x / 2,
			clientY: distance.y / 2
		})
	)
	vi.advanceTimersByTime(delay)
	node.dispatchEvent(new MouseEvent('mouseup', { clientX: distance.x, clientY: distance.y }))
}
