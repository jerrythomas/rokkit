import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { toOnlyTrigger } from 'validators'
import { flushSync } from 'svelte'
import { navigable } from '../src/navigable.svelte'

expect.extend({ toOnlyTrigger })

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
		const addEventSpy = vi.spyOn(node, 'addEventListener')
		const removeEventSpy = vi.spyOn(node, 'removeEventListener')

		const data = $state({})
		const cleanup = $effect.root(() => navigable(node, data))
		flushSync()
		// expect(addEventSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
		expect(addEventSpy).toHaveBeenCalledTimes(1)
		expect(removeEventSpy).toHaveBeenCalledTimes(0)

		data.horizontal = false
		flushSync()

		expect(addEventSpy).toHaveBeenCalledTimes(2)
		expect(removeEventSpy).toHaveBeenCalledTimes(1)

		data.enabled = false
		flushSync()
		expect(addEventSpy).toHaveBeenCalledTimes(3)
		expect(removeEventSpy).toHaveBeenCalledTimes(2)

		cleanup()
		expect(removeEventSpy).toHaveBeenCalledTimes(3)
	})

	describe('Horizontal Navigation', () => {
		it('should trigger "select" event on Enter key', () => {
			const cleanup = $effect.root(() => navigable(node, { horizontal: true }))
			flushSync()
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
			expect(handler).toOnlyTrigger('select')
			cleanup()
		})

		it('should trigger "previous" event on left arrow key', () => {
			const cleanup = $effect.root(() => navigable(node, { horizontal: true }))
			flushSync()
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
			expect(handler).toOnlyTrigger('previous')
			cleanup()
		})

		it('should trigger "next" event on right arrow key', () => {
			const cleanup = $effect.root(() => navigable(node, { horizontal: true }))
			flushSync()
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
			expect(handler).toOnlyTrigger('next')

			cleanup()
		})

		it('should not trigger any event on up or down arrow key', () => {
			const cleanup = $effect.root(() => navigable(node, { horizontal: true }))
			flushSync()
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
			cleanup()
		})
	})

	describe('Nested Horizontal Navigation', () => {
		it('should trigger "expand" event on down arrow key', () => {
			const cleanup = $effect.root(() => navigable(node, { horizontal: true, nested: true }))
			flushSync()
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			expect(handler).toOnlyTrigger('expand')
			cleanup()
		})
		it('should trigger "collapse" event on down arrow key', () => {
			const cleanup = $effect.root(() => navigable(node, { horizontal: true, nested: true }))
			flushSync()
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
			expect(handler).toOnlyTrigger('collapse')
			cleanup()
		})
	})
	describe('Vertical Navigation', () => {
		it('should trigger "previous" event on ArrowUp key', () => {
			const cleanup = $effect.root(() => navigable(node, { horizontal: false }))
			flushSync()
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
			expect(handler).toOnlyTrigger('previous')
			cleanup()
		})

		it('should trigger "next" event on ArrowDown key', () => {
			const cleanup = $effect.root(() => navigable(node, { horizontal: false }))
			flushSync()
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			expect(handler).toOnlyTrigger('next')
			cleanup()
		})

		it('should not trigger any event on left or right arrow keys', () => {
			const cleanup = $effect.root(() => navigable(node, { horizontal: false }))
			flushSync()
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
			cleanup()
		})
	})

	describe('Nested Vertical Navigation', () => {
		it('should trigger "expand" event on right arrow key', () => {
			const cleanup = $effect.root(() => navigable(node, { horizontal: false, nested: true }))
			flushSync()
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
			expect(handler).toOnlyTrigger('expand')
			cleanup()
		})
		it('should trigger "collapse" event on left arrow key', () => {
			const cleanup = $effect.root(() => navigable(node, { horizontal: false, nested: true }))
			flushSync()
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
			expect(handler).toOnlyTrigger('collapse')
			cleanup()
		})
	})
})
