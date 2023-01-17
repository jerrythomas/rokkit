import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { pannable } from './pannable'
import { createEvent } from '../mocks'

describe('pannable', () => {
	let handlers = {}
	let node

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
		const action = pannable(node)
		expect(node.addEventListener).toHaveBeenCalledWith(
			'mousedown',
			handlers.node['mousedown']
		)
		action.destroy()
		expect(node.removeEventListener).toBeCalledWith(
			'mousedown',
			handlers.node['mousedown']
		)
	})
	it('should emit the panstart event', () => {
		const action = pannable(node)
		let event = createEvent(10, 10)

		handlers.node['mousedown'](event)
		expect(event.stopPropagation).toHaveBeenCalled()
		expect(event.preventDefault).toHaveBeenCalled()
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panstart',
			params: { detail: { x: 10, y: 10 } }
		})
		expect(window.addEventListener).toHaveBeenCalledWith(
			'mousemove',
			handlers.window['mousemove']
		)
		expect(window.addEventListener).toHaveBeenCalledWith(
			'mouseup',
			handlers.window['mouseup']
		)
		action.destroy()
	})
	it('should emit the panmove event', () => {
		const action = pannable(node)
		let event = createEvent(10, 10)
		handlers.node['mousedown'](event)
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panstart',
			params: { detail: { x: 10, y: 10 } }
		})
		event = createEvent(15, 15)

		handlers.window['mousemove'](event)
		expect(event.stopPropagation).toHaveBeenCalled()
		expect(event.preventDefault).toHaveBeenCalled()
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panmove',
			params: { detail: { dx: 5, dy: 5, x: 15, y: 15 } }
		})

		// )
		action.destroy()
	})

	it('should emit the panend event', () => {
		const action = pannable(node)
		let event = createEvent(10, 10)
		handlers.node['mousedown'](event)
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panstart',
			params: { detail: { x: 10, y: 10 } }
		})
		event = createEvent(15, 15)
		handlers.window['mouseup'](event)
		expect(event.stopPropagation).toHaveBeenCalled()
		expect(event.preventDefault).toHaveBeenCalled()
		expect(node.dispatchEvent).toHaveBeenCalledWith({
			name: 'panend',
			params: { detail: { x: 15, y: 15 } }
		})
		let mouseMoveHandler = handlers.window['mousemove']
		let mouseUpHandler = handlers.window['mouseup']
		expect(window.removeEventListener).toHaveBeenCalledWith(
			'mousemove',
			mouseMoveHandler
		)
		expect(window.removeEventListener).toHaveBeenCalledWith(
			'mouseup',
			mouseUpHandler
		)
		action.destroy()
	})
})
