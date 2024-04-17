import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { toUseHandlersFor, toOnlyTrigger, toHaveBeenDispatchedWith } from 'validators'
import { createNestedElement } from 'validators/mocks'
import { navigator, findParentWithDataPath } from '../src/navigator.js'

expect.extend({
	toUseHandlersFor,
	toOnlyTrigger,
	toHaveBeenDispatchedWith
})

describe('navigator', () => {
	const events = ['move', 'select', 'collapse', 'expand']
	const fields = {
		id: 'id',
		text: 'name',
		children: 'children',
		isOpen: 'isOpen'
	}

	const handlers = {}
	let node = null
	let options = {}
	let navigatorInstance = null
	let items = []

	beforeEach(() => {
		items = ['A', 'B']
		node = document.createElement('div')

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

	it('should use handlers and cleanup on destroy', () => {
		expect(navigator).toUseHandlersFor({ items: [] }, ['keydown', 'click'])
		expect(navigator).toUseHandlersFor({ items: [], vertical: false }, ['keydown', 'click'])
	})
	it('should not use handlers when disabled', () => {
		expect(navigator).not.toUseHandlersFor({ enabled: false }, 'keydown')
		expect(navigator).not.toUseHandlersFor({ enabled: false }, 'click')
	})
	it('should find the parent with data path', () => {
		const tree = {
			name: 'div',
			children: [
				{
					name: 'item',
					dataPath: '1,1',
					children: [
						{ name: 'span', children: [{ name: 'i' }] },
						{ name: 'p' },
						{ name: 'x', dataPath: '1' }
					]
				},
				{
					name: 'span'
				}
			]
		}

		const node = createNestedElement(tree)
		let result = findParentWithDataPath(node.children[0].children[0].children[0], node)
		expect(result).toEqual(node.children[0])
		result = findParentWithDataPath(node.children[0].children[0], node)
		expect(result).toEqual(node.children[0])
		result = findParentWithDataPath(node.children[0].children[1], node)
		expect(result).toEqual(node.children[0])
		result = findParentWithDataPath(node.children[0].children[2], node)
		expect(result).toEqual(node.children[0].children[2])
		result = findParentWithDataPath(node.children[1], node)
		expect(result).toEqual(null)
	})

	it('should dispatch select when an item is clicked.', () => {
		options = { items, fields }
		navigatorInstance = navigator(node, options)
		items.forEach((_, index) => {
			const child = document.createElement('span')
			child.dataset.path = index
			node.appendChild(child)
		})

		node.dispatchEvent(new MouseEvent('click'))
		expect(handlers.select).not.toHaveBeenCalled()
		expect(handlers.move).not.toHaveBeenCalled()

		node.children[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(handlers.select).toHaveBeenCalled()
		expect(handlers.select).toHaveBeenDispatchedWith({
			path: [0],
			node: 'A'
			// id: 'A'
		})
		expect(handlers.move).toHaveBeenCalled()
		expect(handlers.move).toHaveBeenDispatchedWith({
			path: [0],
			node: 'A'
			// id: 'A'
		})

		node.children[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(handlers.select).toHaveBeenCalled()
		expect(handlers.select).toHaveBeenDispatchedWith({
			path: [1],
			node: 'B'
			// id: 'B'
		})
		expect(handlers.move).toHaveBeenCalled()
		expect(handlers.move).toHaveBeenDispatchedWith({
			path: [1],
			node: 'B'
			// id: 'B'
		})
	})

	describe('Vertical List', () => {
		it('should dispatch move event on ArrowDown', () => {
			options = { items, fields }
			navigatorInstance = navigator(node, options)

			const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [0],
				node: 'A'
				// id: 'A'
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [1],
				node: 'B'
				// id: 'B'
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
				node: 'A'
				// id: 'A'
			})
			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
		})

		it('should dispatch select event on Enter Key', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [0]
			})

			const event = new KeyboardEvent('keydown', { key: 'Enter' })
			node.dispatchEvent(event)
			expect(handlers.select).toHaveBeenCalledTimes(1)
			expect(handlers.select).toHaveBeenDispatchedWith({
				path: [0],
				node: 'A'
				// id: 'A'
			})
		})

		it('should not dispatch any event on ArrowLeft', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
			node.dispatchEvent(event)
			expect(handlers.move).not.toHaveBeenCalled()
			expect(handlers.expand).not.toHaveBeenCalled()
			expect(handlers.collapse).not.toHaveBeenCalled()
		})

		it('should not dispatch any event on ArrowRight', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
			node.dispatchEvent(event)
			expect(handlers.move).not.toHaveBeenCalled()
			expect(handlers.expand).not.toHaveBeenCalled()
			expect(handlers.collapse).not.toHaveBeenCalled()
		})
	})

	describe('Horizontal List', () => {
		it('should dispatch move event on ArrowRight', () => {
			options = { items, fields, vertical: false }
			navigatorInstance = navigator(node, options)

			const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [0],
				node: 'A'
				// id: 'A'
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [1],
				node: 'B'
				// id: 'B'
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
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
				node: 'A'
				// id: 'A'
			})
			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
		})

		it('should dispatch select event on Enter Key', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				vertical: false,
				indices: [0]
			})

			const event = new KeyboardEvent('keydown', { key: 'Enter' })
			node.dispatchEvent(event)
			expect(handlers.select).toHaveBeenCalledTimes(1)
			expect(handlers.select).toHaveBeenDispatchedWith({
				path: [0],
				node: 'A'
				// id: 'A'
			})
		})

		it('should not dispatch any event on ArrowUp', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				vertical: false,
				indices: [0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
			node.dispatchEvent(event)

			expect(handlers.move).not.toHaveBeenCalled()
			expect(handlers.expand).not.toHaveBeenCalled()
			expect(handlers.collapse).not.toHaveBeenCalled()
		})

		it('should not dispatch any event on ArrowDown', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				vertical: false,
				indices: [0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
			node.dispatchEvent(event)
			expect(handlers.move).not.toHaveBeenCalled()
			expect(handlers.expand).not.toHaveBeenCalled()
			expect(handlers.collapse).not.toHaveBeenCalled()
		})
	})
})
