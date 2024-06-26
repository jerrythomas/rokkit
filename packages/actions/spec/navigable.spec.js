import { navigable } from '../src/navigable'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { toUseHandlersFor, toOnlyTrigger } from 'validators'
import { getMockNode } from 'validators/mocks'

expect.extend({ toUseHandlersFor, toOnlyTrigger })

describe('Navigable Action', () => {
	let node = null
	let handler = {}

	beforeEach(() => {
		node = document.createElement('div')
		handler = {
			select: vi.fn(),
			previous: vi.fn(),
			next: vi.fn(),
			expand: vi.fn(),
			collapse: vi.fn()
		}

		Object.entries(handler).forEach(([event, handler]) => node.addEventListener(event, handler))
	})

	afterEach(() => {
		Object.entries(handler).forEach(([event, handler]) => node.removeEventListener(event, handler))
	})

	it('should use handlers and cleanup on destroy', () => {
		expect(navigable).toUseHandlersFor({}, 'keydown')
		expect(navigable).toUseHandlersFor({ horizontal: false }, 'keydown')
		expect(navigable).not.toUseHandlersFor({ enabled: false }, 'keydown')
	})

	it('should switch between enabled and disabled', () => {
		const events = ['keydown']
		const mock = getMockNode(events)
		const handle = navigable(mock.node)

		events.forEach((event) => expect(mock.listeners[event]).toBe(1))

		// repeat calls should not call addEventListener again
		handle.update({ enabled: true })
		events.forEach((event) => expect(mock.listeners[event]).toBe(1))

		// disabling should remove all event listeners
		handle.update({ enabled: false })
		events.forEach((event) => expect(mock.listeners[event]).toBe(0))

		// repeat calls should not call removeEventListener again
		handle.update({ enabled: false })
		events.forEach((event) => expect(mock.listeners[event]).toBe(0))
	})

	describe('Horizontal Navigation', () => {
		it('should trigger "select" event on Enter key', () => {
			const action = navigable(node, { horizontal: true })
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
			expect(handler).toOnlyTrigger('select')
			action.destroy()
		})

		it('should trigger "previous" event on left arrow key', () => {
			const action = navigable(node, { horizontal: true })
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
			expect(handler).toOnlyTrigger('previous')
			action.destroy()
		})

		it('should trigger "next" event on right arrow key', () => {
			const action = navigable(node, { horizontal: true })
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
			expect(handler).toOnlyTrigger('next')

			action.destroy()
		})

		it('should not trigger any event on up or down arrow key', () => {
			const action = navigable(node, { horizontal: true })
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
			expect(handler.select).not.toHaveBeenCalled()
			expect(handler.previous).not.toHaveBeenCalled()
			expect(handler.next).not.toHaveBeenCalled()
			expect(handler.collapse).not.toHaveBeenCalled()
			expect(handler.expand).not.toHaveBeenCalled()

			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			expect(handler.select).not.toHaveBeenCalled()
			expect(handler.previous).not.toHaveBeenCalled()
			expect(handler.next).not.toHaveBeenCalled()
			expect(handler.collapse).not.toHaveBeenCalled()
			expect(handler.expand).not.toHaveBeenCalled()
			action.destroy()
		})
	})

	describe('Nested Horizontal Navigation', () => {
		it('should trigger "expand" event on down arrow key', () => {
			const action = navigable(node, { horizontal: true, nested: true })
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			expect(handler).toOnlyTrigger('expand')
			action.destroy()
		})
		it('should trigger "collapse" event on down arrow key', () => {
			const action = navigable(node, { horizontal: true, nested: true })
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
			expect(handler).toOnlyTrigger('collapse')
			action.destroy()
		})
	})
	describe('Vertical Navigation', () => {
		it('should trigger "previous" event on ArrowUp key', () => {
			const action = navigable(node, { horizontal: false })
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
			expect(handler).toOnlyTrigger('previous')
			action.destroy()
		})

		it('should trigger "next" event on ArrowDown key', () => {
			const action = navigable(node, { horizontal: false })
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			expect(handler).toOnlyTrigger('next')
			action.destroy()
		})

		it('should not trigger any event on left or right arrow keys', () => {
			const action = navigable(node, { horizontal: false })
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
			expect(handler.select).not.toHaveBeenCalled()
			expect(handler.previous).not.toHaveBeenCalled()
			expect(handler.next).not.toHaveBeenCalled()
			expect(handler.collapse).not.toHaveBeenCalled()
			expect(handler.expand).not.toHaveBeenCalled()

			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
			expect(handler.select).not.toHaveBeenCalled()
			expect(handler.previous).not.toHaveBeenCalled()
			expect(handler.next).not.toHaveBeenCalled()
			expect(handler.collapse).not.toHaveBeenCalled()
			expect(handler.expand).not.toHaveBeenCalled()
			action.destroy()
		})
	})

	describe('Nested Vertical Navigation', () => {
		it('should trigger "expand" event on right arrow key', () => {
			const action = navigable(node, { horizontal: false, nested: true })
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
			expect(handler).toOnlyTrigger('expand')
			action.destroy()
		})
		it('should trigger "collapse" event on left arrow key', () => {
			const action = navigable(node, { horizontal: false, nested: true })
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
			expect(handler).toOnlyTrigger('collapse')
			action.destroy()
		})
	})
})
