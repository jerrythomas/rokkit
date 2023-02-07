import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { swipeable } from './swipeable'
import { toUseHandlersFor } from 'validators'

expect.extend({ toUseHandlersFor })

describe('swipable', () => {
	let node
	let swipeLeft, swipeRight, swipeUp, swipeDown

	beforeEach(() => {
		node = document.createElement('div')
		swipeLeft = vi.fn()
		swipeRight = vi.fn()
		swipeUp = vi.fn()
		swipeDown = vi.fn()
		global.Touch = vi.fn().mockImplementation((input) => input)
		node.addEventListener('swipeLeft', swipeLeft)
		node.addEventListener('swipeRight', swipeRight)
		node.addEventListener('swipeUp', swipeUp)
		node.addEventListener('swipeDown', swipeDown)
	})

	afterEach(() => {
		node.removeEventListener('swipeLeft', swipeLeft)
		node.removeEventListener('swipeRight', swipeRight)
		node.removeEventListener('swipeUp', swipeUp)
		node.removeEventListener('swipeDown', swipeDown)
	})

	it('should cleanup events on destroy', () => {
		const events = ['touchstart', 'touchend']
		expect(swipeable).toUseHandlersFor({}, events)
		expect(swipeable).toUseHandlersFor(
			{ horizontal: false, vertical: true },
			events
		)
		expect(swipeable).not.toUseHandlersFor({ enabled: false }, 'touchstart')
		expect(swipeable).not.toUseHandlersFor({ enabled: false }, 'touchend')
	})
	it('should setup and cleanup touch events on node', () => {
		let listeners = {}
		let node = {
			addEventListener: vi
				.fn()
				.mockImplementation(
					(name) => (listeners[name] = (listeners[name] ?? 0) + 1)
				),
			removeEventListener: vi
				.fn()
				.mockImplementation((name) => --listeners[name])
		}
		const handle = swipeable(node)
		expect(listeners['touchstart']).toEqual(1)
		expect(listeners['touchend']).toEqual(1)
		handle.destroy()
		expect(listeners['touchstart']).toEqual(0)
		expect(listeners['touchend']).toEqual(0)
	})
	it('should dispatch swipeRight event', () => {
		const handle = swipeable(node)

		simulateSwipe(node, { x: 100, y: 10 })

		expect(swipeLeft).not.toHaveBeenCalled()
		expect(swipeRight).toHaveBeenCalled()
		expect(swipeDown).not.toHaveBeenCalled()
		expect(swipeUp).not.toHaveBeenCalled()
		handle.destroy()
	})
	it('should dispatch swipeLeft event', () => {
		const handle = swipeable(node)

		simulateSwipe(node, { x: -100, y: 10 })

		expect(swipeLeft).toHaveBeenCalled()
		expect(swipeRight).not.toHaveBeenCalled()
		expect(swipeDown).not.toHaveBeenCalled()
		expect(swipeUp).not.toHaveBeenCalled()
		handle.destroy()
	})

	it('should dispatch swipeUp event', () => {
		const handle = swipeable(node, { vertical: true, threshold: 100 })

		simulateSwipe(node, { x: 10, y: -100 })

		expect(swipeLeft).not.toHaveBeenCalled()
		expect(swipeRight).not.toHaveBeenCalled()
		expect(swipeDown).not.toHaveBeenCalled()
		expect(swipeUp).toHaveBeenCalled()
		handle.destroy()
	})

	it('should dispatch swipeDown event', () => {
		const handle = swipeable(node, { vertical: true })

		simulateSwipe(node, { x: 10, y: 100 })

		expect(swipeLeft).not.toHaveBeenCalled()
		expect(swipeRight).not.toHaveBeenCalled()
		expect(swipeDown).toHaveBeenCalled()
		expect(swipeUp).not.toHaveBeenCalled()

		handle.destroy()
	})
})

function simulateSwipe(node, distance) {
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
