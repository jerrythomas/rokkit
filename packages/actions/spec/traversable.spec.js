import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent } from '@testing-library/svelte'
import { getMockNode } from 'validators/mocks'
import { toUseHandlersFor, toOnlyTrigger, toHaveBeenDispatchedWith } from 'validators'
import { traversable } from '../src/traversable'
import { defaultFields } from '@rokkit/core'
import { createNestedElement } from 'validators/mocks'
import nested from './fixtures/nested.json'
expect.extend({ toHaveBeenDispatchedWith, toUseHandlersFor, toOnlyTrigger })

describe('traversable', () => {
	const events = ['move', 'select', 'collapse', 'expand', 'escape']
	const handlers = {}
	let root = document.createElement('div')
	let instance = null
	let items = null

	beforeEach(() => {
		items = [
			{ name: 'A', _open: true, children: [{ name: 'A1' }, { name: 'A2' }] },
			{ name: 'B', _open: true, children: [{ name: 'B1' }, { name: 'B2' }] }
		]
		root = createNestedElement(nested)
		// root.setAttribute('data-index', '0')
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
	// 	const events = ['keydown', 'click']
	// 	let data = { items, fields: defaultFields }
	// 	expect(traversable).toUseHandlersFor(data, events)
	// 	expect(traversable).toUseHandlersFor({ ...data, horizontal: true }, events)
	// })

	it('should not use handlers when disabled', () => {
		const data = { items: [], fields: defaultFields }
		expect(traversable).not.toUseHandlersFor({ ...data, enabled: false }, 'keydown')
		expect(traversable).not.toUseHandlersFor(
			{ ...data, enabled: false, horizontal: true },
			'keydown'
		)
		// expect(traversable).not.toUseHandlersFor(
		// 	{ ...data, enabled: false, horizontal: true },
		// 	'click'
		// )
	})
	it('should switch between enabled and disabled', () => {
		const events = ['keydown']
		const mock = getMockNode(events)
		const handle = traversable(mock.node, { items: [], fields: defaultFields })

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

	describe('vertical', () => {
		afterEach(() => {
			vi.resetAllMocks()
			if (instance) instance.destroy()
		})

		it('should trigger next on ArrowDown', async () => {
			instance = traversable(root, { items, fields: defaultFields })

			await fireEvent.keyDown(root, { key: 'ArrowDown' })
			// expect(handlers).toOnlyTrigger('move')
			expect(handlers.move).toHaveBeenDispatchedWith({
				item: items[0],
				position: [0]
			})
			vi.resetAllMocks()
			await fireEvent.keyDown(root, { key: 'ArrowDown' })
			expect(handlers).toOnlyTrigger('move')
			expect(handlers.move).toHaveBeenDispatchedWith({
				item: items[0].children[0],
				position: [0, 0]
			})
		})

		it('should trigger previous on ArrowUp', async () => {
			instance = traversable(root, { items, fields: defaultFields })

			await fireEvent.keyDown(root, { key: 'ArrowUp' })
			// console.log(handlers.move.mock.calls)
			// expect(handlers).toOnlyTrigger('move')
			expect(handlers.move).toHaveBeenDispatchedWith({
				item: items[0],
				position: [0]
			})
		})

		it('should trigger collapse on ArrowLeft', async () => {
			instance = traversable(root, { items, fields: defaultFields })

			await fireEvent.keyDown(root, { key: 'ArrowLeft' })
			expect(handlers.collapse).not.toHaveBeenCalled()

			instance.update({ nested: true, value: items[0] })
			await fireEvent.keyDown(root, { key: 'ArrowLeft' })
			expect(handlers).toOnlyTrigger('collapse')
			expect(handlers.collapse).toHaveBeenDispatchedWith({
				item: items[0],
				position: [0]
			})
		})

		it('should trigger expand on ArrowRight', async () => {
			instance = traversable(root, { items, fields: defaultFields })

			await fireEvent.keyDown(root, { key: 'ArrowRight' })
			expect(handlers.expand).not.toHaveBeenCalled()

			instance.update({ nested: true, value: items[0] })
			await fireEvent.keyDown(root, { key: 'ArrowRight' })
			expect(handlers).toOnlyTrigger('expand')
			expect(handlers.expand).toHaveBeenDispatchedWith({
				item: items[0],
				position: [0]
			})
		})

		it('should trigger select on Enter', async () => {
			instance = traversable(root, {
				items,
				fields: defaultFields,
				value: items[0]
			})

			await fireEvent.keyDown(root, { key: 'Enter' })
			expect(handlers).toOnlyTrigger('select')
			expect(handlers.select).toHaveBeenDispatchedWith({
				item: items[0],
				position: [0]
			})
		})

		it('should trigger select on Space', async () => {
			instance = traversable(root, {
				items,
				fields: defaultFields,
				value: items[0]
			})

			await fireEvent.keyDown(root, { key: ' ' })
			expect(handlers).toOnlyTrigger('select')
			expect(handlers.select).toHaveBeenDispatchedWith({
				item: items[0],
				position: [0]
			})
		})

		it('should trigger escape on Escape', async () => {
			instance = traversable(root, {
				items,
				fields: defaultFields,
				value: items[0]
			})

			await fireEvent.keyDown(root, { key: 'Escape' })
			expect(handlers).toOnlyTrigger('escape')
			expect(handlers.escape).toHaveBeenDispatchedWith({
				item: items[0],
				position: [0]
			})
		})
	})

	// describe('horizontal', () => {
	// 	beforeEach(() => {
	// 		instance = traversable(root, { items: [], horizontal: true })
	// 	})

	// 	it('should trigger next on ArrowRight', async () => {
	// 		await fireEvent.keyDown(root, { key: 'ArrowRight' })
	// 		expect(handlers).toOnlyTrigger('move')
	// 		expect(handlers.move).toHaveBeenDispatchedWith({})
	// 	})

	// 	it('should trigger previous on ArrowLeft', async () => {
	// 		await fireEvent.keyDown(root, { key: 'ArrowLeft' })
	// 		expect(handlers).toOnlyTrigger('move')
	// 		expect(handlers.move).toHaveBeenDispatchedWith({})
	// 	})

	// 	it('should trigger collapse on ArrowUp', async () => {
	// 		await fireEvent.keyDown(root, { key: 'ArrowUp' })
	// 		expect(handlers.collapse).not.toHaveBeenCalled()

	// 		instance.update({ nested: true })
	// 		await fireEvent.keyDown(root, { key: 'ArrowUp' })
	// 		expect(handlers).toOnlyTrigger('collapse')
	// 		expect(handlers.collapse).toHaveBeenDispatchedWith({})
	// 	})

	// 	it('should trigger expand on ArrowDown', async () => {
	// 		await fireEvent.keyDown(root, { key: 'ArrowDown' })
	// 		expect(handlers.expand).not.toHaveBeenCalled()

	// 		instance.update({ nested: true })
	// 		await fireEvent.keyDown(root, { key: 'ArrowDown' })
	// 		expect(handlers).toOnlyTrigger('expand')
	// 		expect(handlers.expand).toHaveBeenDispatchedWith({})
	// 	})

	// 	it('should trigger select on Enter', async () => {
	// 		await fireEvent.keyDown(root, { key: 'Enter' })
	// 		expect(handlers).toOnlyTrigger('select')
	// 		expect(handlers.select).toHaveBeenDispatchedWith({})
	// 	})

	// 	it('should trigger select on Space', async () => {
	// 		await fireEvent.keyDown(root, { key: ' ' })
	// 		expect(handlers).toOnlyTrigger('select')
	// 		expect(handlers.select).toHaveBeenDispatchedWith({})
	// 	})

	// 	it('should trigger escape on Escape', async () => {
	// 		await fireEvent.keyDown(root, { key: 'Escape' })
	// 		expect(handlers).toOnlyTrigger('escape')
	// 		expect(handlers.escape).toHaveBeenDispatchedWith({})
	// 	})

	// 	it('should trigger select on click', async () => {
	// 		await fireEvent.click(root)
	// 		expect(handlers).toOnlyTrigger('select')
	// 		expect(handlers.select).toHaveBeenDispatchedWith({ index: 0 })
	// 	})
	// })
})
