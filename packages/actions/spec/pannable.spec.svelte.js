import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { simulateMouseEvent, simulateTouchEvent } from 'validators'
import { pannable } from '../src/pannable.svelte'
import { flushSync } from 'svelte'

describe('pannable', () => {
	let handlers = {}
	let node = null

	beforeEach(() => {
		global.CustomEvent = vi.fn().mockImplementation((name, params) => ({
			name,
			params
		}))
		handlers = {
			window: {},
			node: {}
		}
		window.removeEventListener = vi.fn()
		window.addEventListener = vi.fn().mockImplementation((name, callback) => {
			handlers.window[name] = callback
		})

		node = {
			dispatchEvent: vi.fn(),
			removeEventListener: vi.fn(),
			addEventListener: vi.fn().mockImplementation((name, callback) => {
				handlers.node[name] = callback
			})
		}
	})
	afterEach(() => {
		vi.resetAllMocks()
	})

	it('should create a pannable node', () => {
		const cleanup = $effect.root(() => pannable(node))
		flushSync()
		expect(node.addEventListener).toHaveBeenCalledWith('mousedown', handlers.node.mousedown)
		cleanup()
		expect(node.removeEventListener).toBeCalledWith('mousedown', handlers.node.mousedown)
	})

	it('should emit the panstart event', () => {
		const cleanup = $effect.root(() => pannable(node))
		flushSync()
		const event = simulateMouseEvent(10, 10)

		handlers.node.mousedown(event)
		expect(event.stopPropagation).toHaveBeenCalled()
		expect(event.preventDefault).toHaveBeenCalled()
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panstart',
			params: { detail: { x: 10, y: 10 } }
		})
		expect(window.addEventListener).toHaveBeenCalledWith('mousemove', handlers.window.mousemove)
		expect(window.addEventListener).toHaveBeenCalledWith('mouseup', handlers.window.mouseup)
		cleanup()
	})
	it('should emit the panmove event', () => {
		const cleanup = $effect.root(() => pannable(node))
		flushSync()
		let event = simulateMouseEvent(10, 10)
		handlers.node.mousedown(event)
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panstart',
			params: { detail: { x: 10, y: 10 } }
		})
		event = simulateMouseEvent(15, 15)

		handlers.window.mousemove(event)
		expect(event.stopPropagation).toHaveBeenCalled()
		expect(event.preventDefault).toHaveBeenCalled()
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panmove',
			params: { detail: { dx: 5, dy: 5, x: 15, y: 15 } }
		})

		// )
		cleanup()
	})

	it('should emit the panend event', () => {
		const cleanup = $effect.root(() => pannable(node))
		flushSync()
		let event = simulateMouseEvent(10, 10)
		handlers.node.mousedown(event)
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panstart',
			params: { detail: { x: 10, y: 10 } }
		})
		event = simulateMouseEvent(15, 15)
		handlers.window.mouseup(event)
		expect(event.stopPropagation).toHaveBeenCalled()
		expect(event.preventDefault).toHaveBeenCalled()
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panend',
			params: { detail: { x: 15, y: 15 } }
		})
		const mouseMoveHandler = handlers.window.mousemove
		const mouseUpHandler = handlers.window.mouseup
		expect(window.removeEventListener).toHaveBeenCalledWith('mousemove', mouseMoveHandler)
		expect(window.removeEventListener).toHaveBeenCalledWith('mouseup', mouseUpHandler)
		cleanup()
	})
	it('should create a pannable node with touch event listeners', () => {
		const cleanup = $effect.root(() => pannable(node))
		flushSync()
		expect(node.addEventListener).toHaveBeenCalledWith(
			'touchstart',
			handlers.node.touchstart
			// { passive: false }
		)
		cleanup()
		expect(node.removeEventListener).toBeCalledWith('touchstart', handlers.node.touchstart)
	})

	it('should emit the panstart event on touchstart', () => {
		const cleanup = $effect.root(() => pannable(node))
		flushSync()
		const event = simulateTouchEvent(10, 10)

		handlers.node.touchstart(event)
		expect(event.stopPropagation).toHaveBeenCalled()
		expect(event.preventDefault).toHaveBeenCalled()
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panstart',
			params: { detail: { x: 10, y: 10 } }
		})
		expect(window.addEventListener).toHaveBeenCalledWith(
			'touchmove',
			handlers.window.touchmove
			// { passive: false }
		)
		expect(window.addEventListener).toHaveBeenCalledWith('touchend', handlers.window.touchend)
		cleanup()
	})

	it('should emit the panmove event on touchmove', () => {
		const cleanup = $effect.root(() => pannable(node))
		flushSync()
		let event = simulateTouchEvent(10, 10)
		handlers.node.touchstart(event)
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panstart',
			params: { detail: { x: 10, y: 10 } }
		})
		event = simulateTouchEvent(15, 15)

		handlers.window.touchmove(event)
		expect(event.stopPropagation).toHaveBeenCalled()
		expect(event.preventDefault).toHaveBeenCalled()
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panmove',
			params: { detail: { dx: 5, dy: 5, x: 15, y: 15 } }
		})

		cleanup()
	})

	it('should emit the panend event on touchend', () => {
		const cleanup = $effect.root(() => pannable(node))
		flushSync()
		let event = simulateTouchEvent(10, 10)
		handlers.node.touchstart(event)
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panstart',
			params: { detail: { x: 10, y: 10 } }
		})
		event = simulateTouchEvent(15, 15)
		handlers.window.touchend(event)
		expect(event.stopPropagation).toHaveBeenCalled()
		expect(event.preventDefault).toHaveBeenCalled()
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panend',
			params: { detail: { x: 15, y: 15 } }
		})
		const touchMoveHandler = handlers.window.touchmove
		const touchEndHandler = handlers.window.touchend
		expect(window.removeEventListener).toHaveBeenCalledWith('touchmove', touchMoveHandler)
		expect(window.removeEventListener).toHaveBeenCalledWith('touchend', touchEndHandler)
		cleanup()
	})
})
