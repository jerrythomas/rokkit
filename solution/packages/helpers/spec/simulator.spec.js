import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { toHaveBeenDispatchedWith } from '../src/matchers/event'
import {
	simulateMouseEvent,
	simulateTouchEvent,
	simulateMouseSwipe,
	simulateTouchSwipe
} from '../src/simulators'

expect.extend({ toHaveBeenDispatchedWith })
describe('events', () => {
	const node = document.createElement('div')

	describe('simulateMouseEvent', () => {
		it('should simulate a mouse event', () => {
			const event = simulateMouseEvent(10, 10)
			expect(event).toEqual({
				clientX: 10,
				clientY: 10,
				stopPropagation: expect.any(Function),
				preventDefault: expect.any(Function)
			})
		})
	})
	describe('simulateTouchEvent', () => {
		it('should simulate a touch event', () => {
			const event = simulateTouchEvent(10, 10)

			expect(event).toEqual({
				touches: [{ clientX: 10, clientY: 10 }],
				stopPropagation: expect.any(Function),
				preventDefault: expect.any(Function)
			})
		})
	})

	describe('simulateMouseSwipe', () => {
		const events = ['mousedown', 'mouseup']

		const handlers = {}

		beforeEach(() => {
			vi.useFakeTimers()
			events.forEach((event) => {
				handlers[event] = vi.fn()
				node.addEventListener(event, handlers[event])
			})
		})
		afterEach(() => {
			vi.useRealTimers()
			events.forEach((event) => node.removeEventListener(event, handlers[event]))
		})
		it('should simulate a mouse swipe', () => {
			simulateMouseSwipe(node, { x: 10, y: 20 })
			expect(handlers.mousedown).toHaveBeenCalledOnce()
			expect(handlers.mouseup).toHaveBeenCalledOnce()

			let mouseEvent = handlers.mousedown.mock.calls[0][0]
			expect(mouseEvent.clientX).toEqual(0)
			expect(mouseEvent.clientY).toEqual(0)

			mouseEvent = handlers.mouseup.mock.calls[0][0]
			expect(mouseEvent.clientX).toEqual(10)
			expect(mouseEvent.clientY).toEqual(20)
		})
	})
	describe('simulateTouchSwipe', () => {
		const events = ['touchstart', 'touchend']

		const handlers = {}

		beforeEach(() => {
			vi.useFakeTimers()
			events.forEach((event) => {
				handlers[event] = vi.fn()
				node.addEventListener(event, handlers[event])
			})
		})
		afterEach(() => {
			events.forEach((event) => node.removeEventListener(event, handlers[event]))
			vi.useRealTimers()
		})

		it('should simulate a touch swipe', () => {
			simulateTouchSwipe(node, { x: 100, y: 50 })
			expect(handlers.touchstart).toHaveBeenCalledOnce()
			expect(handlers.touchend).toHaveBeenCalledOnce()
			expect(handlers.touchstart.mock.calls[0][0].touches).toEqual([
				{ clientX: 0, clientY: 0, identifier: 0, target: node }
			])
			expect(handlers.touchend.mock.calls[0][0].changedTouches).toEqual([
				{ clientX: 100, clientY: 50, identifier: 0, target: node }
			])
		})
	})
})
