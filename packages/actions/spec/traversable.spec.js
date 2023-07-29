import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent } from '@testing-library/svelte'
import {
	toUseHandlersFor,
	toOnlyTrigger,
	toHaveBeenDispatchedWith
} from 'validators'
import { traversable } from '../src/traversable'

expect.extend({ toHaveBeenDispatchedWith, toUseHandlersFor, toOnlyTrigger })

describe('traversable', () => {
	const events = ['move', 'select', 'collapse', 'expand', 'escape']
	let handlers = {}
	let root = document.createElement('div')
	let instance

	beforeEach(() => {
		root.setAttribute('data-index', '0')
		events.forEach((event) => {
			handlers[event] = vi.fn()
			root.addEventListener(event, handlers[event])
		})
	})

	afterEach(() => {
		vi.resetAllMocks()

		events.forEach((event) => {
			root.removeEventListener(event, handlers[event])
		})
		if (instance) instance.destroy()
	})

	// it('should use handlers and cleanup on destroy', () => {
	// 	expect(traversable).toUseHandlersFor({ items: [] }, ['keydown', 'click'])
	// 	expect(traversable).toUseHandlersFor({ items: [], horizontal: true }, [
	// 		'keydown',
	// 		'click'
	// 	])
	// })

	// it('should not use handlers when disabled', () => {
	// 	expect(traversable).not.toUseHandlersFor({ enabled: false }, 'keydown')
	// 	expect(traversable).not.toUseHandlersFor(
	// 		{ enabled: false, horizontal: true },
	// 		'click'
	// 	)
	// })

	describe('vertical', () => {
		beforeEach(() => {})

		afterEach(() => {
			vi.resetAllMocks()
			if (instance) instance.destroy()
		})

		it('should trigger next on ArrowDown', async () => {
			instance = traversable(root, { items: [] })

			await fireEvent.keyDown(root, { key: 'ArrowDown' })
			expect(handlers).toOnlyTrigger('move')
			expect(handlers.move).toHaveBeenDispatchedWith({})
		})

		it('should trigger previous on ArrowUp', async () => {
			instance = traversable(root, { items: [] })

			await fireEvent.keyDown(root, { key: 'ArrowUp' })
			expect(handlers).toOnlyTrigger('move')
			expect(handlers.move).toHaveBeenDispatchedWith({})
		})

		it('should trigger collapse on ArrowLeft', async () => {
			instance = traversable(root, { items: [] })

			await fireEvent.keyDown(root, { key: 'ArrowLeft' })
			expect(handlers.collapse).not.toHaveBeenCalled()

			instance.update({ nested: true })
			await fireEvent.keyDown(root, { key: 'ArrowLeft' })
			expect(handlers).toOnlyTrigger('collapse')
			expect(handlers.collapse).toHaveBeenDispatchedWith({})
		})

		it('should trigger expand on ArrowRight', async () => {
			instance = traversable(root, { items: [] })

			await fireEvent.keyDown(root, { key: 'ArrowRight' })
			expect(handlers.expand).not.toHaveBeenCalled()

			instance.update({ nested: true })
			await fireEvent.keyDown(root, { key: 'ArrowRight' })
			expect(handlers).toOnlyTrigger('expand')
			expect(handlers.expand).toHaveBeenDispatchedWith({})
		})

		it('should trigger select on Enter', async () => {
			instance = traversable(root, { items: [] })

			await fireEvent.keyDown(root, { key: 'Enter' })
			expect(handlers).toOnlyTrigger('select')
			expect(handlers.select).toHaveBeenDispatchedWith({})
		})

		it('should trigger select on Space', async () => {
			instance = traversable(root, { items: [] })

			await fireEvent.keyDown(root, { key: ' ' })
			expect(handlers).toOnlyTrigger('select')
			expect(handlers.select).toHaveBeenDispatchedWith({})
		})

		it('should trigger escape on Escape', async () => {
			instance = traversable(root, { items: [] })

			await fireEvent.keyDown(root, { key: 'Escape' })
			expect(handlers).toOnlyTrigger('escape')
			expect(handlers.escape).toHaveBeenDispatchedWith({})
		})
	})

	describe('horizontal', () => {
		beforeEach(() => {
			instance = traversable(root, { items: [], horizontal: true })
		})

		it('should trigger next on ArrowRight', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowRight' })
			expect(handlers).toOnlyTrigger('move')
			expect(handlers.move).toHaveBeenDispatchedWith({})
		})

		it('should trigger previous on ArrowLeft', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowLeft' })
			expect(handlers).toOnlyTrigger('move')
			expect(handlers.move).toHaveBeenDispatchedWith({})
		})

		it('should trigger collapse on ArrowUp', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowUp' })
			expect(handlers.collapse).not.toHaveBeenCalled()

			instance.update({ nested: true })
			await fireEvent.keyDown(root, { key: 'ArrowUp' })
			expect(handlers).toOnlyTrigger('collapse')
			expect(handlers.collapse).toHaveBeenDispatchedWith({})
		})

		it('should trigger expand on ArrowDown', async () => {
			await fireEvent.keyDown(root, { key: 'ArrowDown' })
			expect(handlers.expand).not.toHaveBeenCalled()

			instance.update({ nested: true })
			await fireEvent.keyDown(root, { key: 'ArrowDown' })
			expect(handlers).toOnlyTrigger('expand')
			expect(handlers.expand).toHaveBeenDispatchedWith({})
		})

		it('should trigger select on Enter', async () => {
			await fireEvent.keyDown(root, { key: 'Enter' })
			expect(handlers).toOnlyTrigger('select')
			expect(handlers.select).toHaveBeenDispatchedWith({})
		})

		it('should trigger select on Space', async () => {
			await fireEvent.keyDown(root, { key: ' ' })
			expect(handlers).toOnlyTrigger('select')
			expect(handlers.select).toHaveBeenDispatchedWith({})
		})

		it('should trigger escape on Escape', async () => {
			await fireEvent.keyDown(root, { key: 'Escape' })
			expect(handlers).toOnlyTrigger('escape')
			expect(handlers.escape).toHaveBeenDispatchedWith({})
		})

		it('should trigger select on click', async () => {
			await fireEvent.click(root)
			expect(handlers).toOnlyTrigger('select')
			expect(handlers.select).toHaveBeenDispatchedWith({ index: 0 })
		})
	})
})
