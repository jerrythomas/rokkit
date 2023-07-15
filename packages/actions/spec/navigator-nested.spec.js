import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
	toUseHandlersFor,
	toOnlyTrigger,
	toHaveBeenDispatchedWith
} from 'validators'
import { createNestedElement } from 'validators/mocks'
import { navigator } from '../src/navigator.js'

expect.extend({
	toUseHandlersFor,
	toOnlyTrigger,
	toHaveBeenDispatchedWith
})

describe('navigator', () => {
	const events = ['move', 'select', 'collapse', 'expand']
	const fields = { children: 'children', isOpen: 'isOpen' }

	let handlers = {}
	let node
	let options
	let navigatorInstance
	let items

	beforeEach(() => {
		items = [
			{ name: 'A', children: ['A1'] },
			{ name: 'B', children: ['B1'] }
		]
		// global.CustomEvent = getCustomEventMock()
		node = createNestedElement({
			name: 'node',
			children: [
				{
					name: 'node',
					id: 'id-0',
					dataPath: '0',
					children: [
						{ name: 'node', id: 'id-0-0', dataPath: '0,0' },
						{ name: 'node', id: 'id-0-1', dataPath: '0,1' }
					]
				},
				{
					name: 'node',
					id: 'id-1',
					dataPath: '1',
					children: [
						{ name: 'node', id: 'id-1-0', dataPath: '1,0' },
						{ name: 'node', id: 'id-1-1', dataPath: '1,1' }
					]
				}
			]
		})
		events.forEach((event) => {
			handlers[event] = vi.fn()
			node.addEventListener(event, handlers[event])
		})
	})

	afterEach(() => {
		events.forEach((event) => {
			node.removeEventListener(event, handlers[event])
		})
		if (navigatorInstance) navigatorInstance.destroy()
		vi.resetAllMocks()
	})

	describe('Vertical Nested List', () => {
		it('dispatches move event on next', () => {
			options = { items, fields: [] }
			navigatorInstance = navigator(node, options)

			const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [1],
				node: items[1]
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
		})

		it('should dispatch move event on ArrowUp', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [1]
			})

			const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})
			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
		})

		it('should trigger scrollIntoView on move', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [1]
			})

			const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalled()
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})
			expect(node.children[0].scrollIntoView).toHaveBeenCalled()
		})

		it('should dispatch select event on Enter key', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [0, 0]
			})

			let event = new KeyboardEvent('keydown', { key: 'Enter' })
			node.dispatchEvent(event)
			expect(handlers.select).toHaveBeenCalledTimes(1)
			expect(handlers.select).toHaveBeenDispatchedWith({
				path: [0, 0],
				node: items[0].children[0]
			})
		})

		it('should not dispatch collapse/expand event with empty selection', () => {
			navigatorInstance = navigator(node, {
				items,
				fields
			})
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
			expect(handlers.collapse).not.toHaveBeenCalled()
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
			expect(handlers.collapse).not.toHaveBeenCalled()
		})

		//todo: test move to parent instead of collapse
		it('should dispatch collapse event on ArrowLeft', () => {
			items[0][fields.isOpen] = true
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
			node.dispatchEvent(event)

			expect(handlers.collapse).toHaveBeenCalledTimes(1)
			expect(handlers.collapse).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})
		})

		it('should select parent on ArrowLeft', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [0, 0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
			node.dispatchEvent(event)

			expect(handlers.collapse).not.toHaveBeenCalled()
			expect(handlers.select).toHaveBeenCalled()
			expect(handlers.select).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})
		})

		it('should dispatch expand event on ArrowRight', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
			node.dispatchEvent(event)
			expect(handlers.expand).toHaveBeenCalledTimes(1)
			expect(handlers.expand).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})
		})

		it('should dispatch collapse/expand when parent is clicked.', () => {
			items[0][fields.isOpen] = true
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [1]
			})

			// expect(items[0][fields.isOpen]).toBeTruthy()
			node.children[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
			expect(items[0][fields.isOpen]).toBeFalsy()
			expect(handlers.collapse).toHaveBeenCalled()
			expect(handlers.collapse).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})
			node.children[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
			expect(items[0][fields.isOpen]).toBeTruthy()
			expect(handlers.expand).toHaveBeenCalled()
			expect(handlers.expand).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})
		})
	})

	describe('Horizontal Nested List', () => {
		it('should dispatch move event on ArrowRight', () => {
			options = { items, fields, vertical: false }
			navigatorInstance = navigator(node, options)

			const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [1],
				node: items[1]
			})
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [1],
				node: items[1]
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
			// expect(handlers.move).toHaveBeenDispatchedWith({ node: 'A' })
		})

		it('should dispatch move event on ArrowLeft', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				vertical: false,
				indices: [1]
			})

			const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})
			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
		})

		it('should dispatch select event on Enter key', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				vertical: false,
				indices: [0, 0]
			})

			let event = new KeyboardEvent('keydown', { key: 'Enter' })
			node.dispatchEvent(event)
			expect(handlers.select).toHaveBeenCalledTimes(1)
			expect(handlers.select).toHaveBeenDispatchedWith({
				path: [0, 0],
				node: items[0].children[0]
			})
		})

		it('should not dispatch collapse/expand event with empty selection', () => {
			navigatorInstance = navigator(node, {
				items,
				fields
			})
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
			expect(handlers.collapse).not.toHaveBeenCalled()
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			expect(handlers.collapse).not.toHaveBeenCalled()
		})

		it('should dispatch collapse event on ArrowUp', () => {
			items[0][fields.isOpen] = true
			navigatorInstance = navigator(node, {
				items,
				fields,
				vertical: false,
				indices: [0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
			node.dispatchEvent(event)

			expect(handlers.collapse).toHaveBeenCalledTimes(1)
			expect(handlers.collapse).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})
		})

		it('should select parent on ArrowUp', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				vertical: false,
				indices: [0, 0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
			node.dispatchEvent(event)

			expect(handlers.collapse).not.toHaveBeenCalled()
			expect(handlers.select).toHaveBeenCalled()
			expect(handlers.select).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})
		})

		it('should dispatch expand event on ArrowDown', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				vertical: false,
				indices: [0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
			node.dispatchEvent(event)
			expect(handlers.expand).toHaveBeenCalledTimes(1)
			expect(handlers.expand).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})
		})
		it('should dispatch collapse/expand when parent is clicked.', () => {
			items[0][fields.isOpen] = true
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [1],
				vertical: false
			})

			// expect(items[0][fields.isOpen]).toBeTruthy()
			node.children[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
			expect(items[0][fields.isOpen]).toBeFalsy()
			expect(handlers.collapse).toHaveBeenCalled()
			expect(handlers.collapse).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})
			node.children[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
			expect(items[0][fields.isOpen]).toBeTruthy()
			expect(handlers.expand).toHaveBeenCalled()
			expect(handlers.expand).toHaveBeenDispatchedWith({
				path: [0],
				node: items[0]
			})
		})
	})
})
