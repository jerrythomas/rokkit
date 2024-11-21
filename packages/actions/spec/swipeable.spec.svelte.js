import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { toOnlyTrigger, simulateTouchSwipe, simulateMouseSwipe } from 'validators'
import { flushSync } from 'svelte'
import { swipeable } from '../src/swipeable.svelte'

expect.extend({ toOnlyTrigger })

describe('swipable', () => {
	const events = ['touchstart', 'touchend', 'mousedown', 'mouseup']
	let node = null
	let handlers = {}

	beforeEach(() => {
		node = document.createElement('div')
		handlers = {
			swipeLeft: vi.fn(),
			swipeRight: vi.fn(),
			swipeUp: vi.fn(),
			swipeDown: vi.fn()
		}

		global.Touch = vi.fn().mockImplementation((input) => input)
		Object.entries(handlers).forEach(([event, handler]) => node.addEventListener(event, handler))
		vi.useFakeTimers()
	})

	afterEach(() => {
		Object.entries(handlers).forEach(([event, handler]) => node.removeEventListener(event, handler))
		vi.useRealTimers()
	})

	it('should cleanup events on destroy', () => {
		const addEventSpy = vi.spyOn(node, 'addEventListener')
		const removeEventSpy = vi.spyOn(node, 'removeEventListener')
		const cleanup = $effect.root(() => swipeable(node))
		flushSync()
		events.forEach((event) => {
			expect(addEventSpy).toHaveBeenCalledWith(event, expect.any(Function), {})
		})
		cleanup()
		events.forEach((event) => {
			expect(removeEventSpy).toHaveBeenCalledWith(event, expect.any(Function), {})
		})
	})
	it('should not register events when disabled', () => {
		const addEventSpy = vi.spyOn(node, 'addEventListener')
		const removeEventSpy = vi.spyOn(node, 'removeEventListener')
		const cleanup = $effect.root(() => swipeable(node, { enabled: false }))
		flushSync()

		expect(addEventSpy).not.toHaveBeenCalled()

		cleanup()
		expect(removeEventSpy).not.toHaveBeenCalled()
	})

	it('should dispatch swipeRight event', () => {
		const cleanup = $effect.root(() => swipeable(node))
		flushSync()

		simulateTouchSwipe(node, { x: 100, y: 10 })
		expect(handlers).toOnlyTrigger('swipeRight')
		vi.resetAllMocks()

		simulateTouchSwipe(node, { x: 90, y: 10 })
		expect(handlers.swipeRight).not.toHaveBeenCalled()

		simulateMouseSwipe(node, { x: 100, y: 10 })
		expect(handlers).toOnlyTrigger('swipeRight')
		vi.resetAllMocks()

		simulateMouseSwipe(node, { x: 90, y: 10 })
		expect(handlers.swipeRight).not.toHaveBeenCalled()

		cleanup()
	})

	it('should dispatch swipeLeft event', () => {
		const cleanup = $effect.root(() => swipeable(node))
		flushSync()

		simulateTouchSwipe(node, { x: -100, y: 10 })
		expect(handlers).toOnlyTrigger('swipeLeft')
		vi.resetAllMocks()

		simulateMouseSwipe(node, { x: -100, y: 10 })
		expect(handlers).toOnlyTrigger('swipeLeft')
		vi.resetAllMocks()

		simulateTouchSwipe(node, { x: -90, y: 10 })
		expect(handlers.swipeLeft).not.toHaveBeenCalled()
		simulateMouseSwipe(node, { x: -90, y: 10 })
		expect(handlers.swipeLeft).not.toHaveBeenCalled()

		cleanup()
	})

	it('should dispatch swipeUp event', () => {
		const cleanup = $effect.root(() => swipeable(node, { vertical: true, threshold: 100 }))
		flushSync()

		simulateTouchSwipe(node, { x: 10, y: -100 })
		expect(handlers).toOnlyTrigger('swipeUp')
		vi.resetAllMocks()

		simulateMouseSwipe(node, { x: 10, y: -100 })
		expect(handlers).toOnlyTrigger('swipeUp')
		vi.resetAllMocks()

		simulateTouchSwipe(node, { x: 10, y: -90 })
		simulateMouseSwipe(node, { x: 10, y: -90 })
		expect(handlers.swipeUp).not.toHaveBeenCalled()

		cleanup()
	})

	it('should dispatch swipeDown event', () => {
		const cleanup = $effect.root(() => swipeable(node, { vertical: true, horizontal: false }))
		flushSync()

		simulateTouchSwipe(node, { x: 10, y: 100 })
		expect(handlers).toOnlyTrigger('swipeDown')
		expect(handlers.swipeDown).toHaveBeenCalledTimes(1)
		vi.resetAllMocks()

		simulateMouseSwipe(node, { x: 10, y: 100 })
		expect(handlers).toOnlyTrigger('swipeDown')
		expect(handlers.swipeDown).toHaveBeenCalledTimes(1)
		vi.resetAllMocks()

		simulateTouchSwipe(node, { x: 10, y: 90 })
		simulateMouseSwipe(node, { x: 10, y: 90 })
		expect(handlers.swipeDown).not.toHaveBeenCalled()

		cleanup()
	})

	it('should not dispatch events when speed is slow', () => {
		const cleanup = $effect.root(() => swipeable(node, { speed: 100 }))
		flushSync()

		simulateTouchSwipe(node, { x: 1, y: 1 }, 1000)
		Object.values(handlers).forEach((handler) => expect(handler).not.toHaveBeenCalled())
		// expect(handlers).toOnlyTrigger('swipeRight')
		// vi.resetAllMocks()
		cleanup()
	})

	it('should switch between enabled and disabled', () => {
		const props = $state({ enabled: true })
		// const mock = getMockNode(events)
		const addEventSpy = vi.spyOn(node, 'addEventListener')
		const removeEventSpy = vi.spyOn(node, 'removeEventListener')

		const cleanup = $effect.root(() => swipeable(node, props))
		flushSync()

		expect(addEventSpy).toHaveBeenCalledTimes(events.length)

		props.enabled = false
		flushSync()
		expect(removeEventSpy).toHaveBeenCalledTimes(events.length)
		expect(addEventSpy).toHaveBeenCalledTimes(events.length)

		props.enabled = true
		flushSync()
		expect(removeEventSpy).toHaveBeenCalledTimes(events.length)
		expect(addEventSpy).toHaveBeenCalledTimes(events.length * 2)

		cleanup()
		expect(removeEventSpy).toHaveBeenCalledTimes(events.length * 2)
	})
})
