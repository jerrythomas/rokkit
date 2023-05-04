import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import {
	toUseHandlersFor,
	toOnlyTrigger,
	toHaveBeenDispatchedWith,
	createNestedElement
} from 'validators'
import { navigator, findParentWithDataPath } from './navigator.js'

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
		items = ['A', 'B']
		// global.CustomEvent = getCustomEventMock()
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

	it('Should use handlers and cleanup on destroy', () => {
		expect(navigator).toUseHandlersFor({ items: [] }, ['keydown', 'click'])
		expect(navigator).toUseHandlersFor({ items: [], vertical: false }, [
			'keydown',
			'click'
		])
	})
	it('Should not use handlers when disabled', () => {
		expect(navigator).not.toUseHandlersFor({ enabled: false }, 'keydown')
		expect(navigator).not.toUseHandlersFor({ enabled: false }, 'click')
	})
	it('Should find the parent with data path', () => {
		let tree = {
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

		let node = createNestedElement(tree)
		let result = findParentWithDataPath(
			node.children[0].children[0].children[0]
		)
		expect(result).toEqual(node.children[0])
		result = findParentWithDataPath(node.children[0].children[0])
		expect(result).toEqual(node.children[0])
		result = findParentWithDataPath(node.children[0].children[1])
		expect(result).toEqual(node.children[0])
		result = findParentWithDataPath(node.children[0].children[2])
		expect(result).toEqual(node.children[0].children[2])
		result = findParentWithDataPath(node.children[1])
		expect(result).toEqual(null)
	})

	it('Should dispatch select when an item is clicked.', () => {
		options = { items, fields }
		navigatorInstance = navigator(node, options)
		items.map((_, index) => {
			const child = document.createElement('span')
			child.dataset.path = index
			node.appendChild(child)
		})

		node.dispatchEvent(new MouseEvent('click'))
		expect(handlers.select).not.toHaveBeenCalled()

		node.children[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(handlers.select).toHaveBeenCalled()
		expect(handlers.select).toHaveBeenDispatchedWith({
			path: [0],
			node: 'A'
		})

		node.children[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(handlers.select).toHaveBeenCalled()
		expect(handlers.select).toHaveBeenDispatchedWith({
			path: [1],
			node: 'B'
		})
	})

	describe('Vertical List', () => {
		it('Should dispatch move event on ArrowDown', () => {
			options = { items, fields }
			navigatorInstance = navigator(node, options)

			const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [0],
				node: 'A'
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [1],
				node: 'B'
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
		})

		it('Should dispatch move event on ArrowUp', () => {
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
			})
			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
		})

		it('Should dispatch select event on Enter Key', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [0]
			})

			let event = new KeyboardEvent('keydown', { key: 'Enter' })
			node.dispatchEvent(event)
			expect(handlers.select).toHaveBeenCalledTimes(1)
			expect(handlers.select).toHaveBeenDispatchedWith({
				path: [0],
				node: 'A'
			})
		})

		it('Should not dispatch any event on ArrowLeft', () => {
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

		it('Should not dispatch any event on ArrowRight', () => {
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
		it('Should dispatch move event on ArrowRight', () => {
			options = { items, fields, vertical: false }
			navigatorInstance = navigator(node, options)

			const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [0],
				node: 'A'
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
			expect(handlers.move).toHaveBeenDispatchedWith({
				path: [1],
				node: 'B'
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
		})

		it('Should dispatch move event on ArrowLeft', () => {
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
			})
			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
		})

		it('Should dispatch select event on Enter Key', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				vertical: false,
				indices: [0]
			})

			let event = new KeyboardEvent('keydown', { key: 'Enter' })
			node.dispatchEvent(event)
			expect(handlers.select).toHaveBeenCalledTimes(1)
			expect(handlers.select).toHaveBeenDispatchedWith({
				path: [0],
				node: 'A'
			})
		})

		it('Should not dispatch any event on ArrowUp', () => {
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

		it('Should not dispatch any event on ArrowDown', () => {
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
