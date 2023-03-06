import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
// import { fireEvent } from '@testing-library/svelte'
import {
	toUseHandlersFor,
	toOnlyTrigger,
	getCustomEventMock,
	toHaveBeenCalledWithDetail,
	createNestedElement
} from 'validators'
import { navigator, findParentWithDataPath } from './navigator.js'

expect.extend({
	toUseHandlersFor,
	toOnlyTrigger,
	toHaveBeenCalledWithDetail
})

describe('navigator', () => {
	const events = ['move', 'select', 'collapse', 'expand']
	const fields = { children: 'children', isOpen: 'isOpen' }

	let handlers = {},
		nestedHandlers = {}
	let node, hierarchy
	let options
	let navigatorInstance

	beforeEach(() => {
		global.CustomEvent = getCustomEventMock()
		node = document.createElement('div')
		hierarchy = createNestedElement({
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
			nestedHandlers[event] = vi.fn()
			node.addEventListener(event, handlers[event])
			hierarchy.addEventListener(event, nestedHandlers[event])
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

	// todo: add click toggle test
	it('Should dispatch select when an item is clicked.', () => {
		let items = ['A', 'B']
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
		expect(handlers.select).toHaveBeenCalledWithDetail({
			path: [0],
			node: 'A'
		})

		node.children[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(handlers.select).toHaveBeenCalled()
		expect(handlers.select).toHaveBeenCalledWithDetail({
			path: [1],
			node: 'B'
		})
	})

	describe('Vertical List', () => {
		let items = ['A', 'B']

		it('Should dispatch move event on ArrowDown', () => {
			options = { items, fields }
			navigatorInstance = navigator(node, options)

			const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
			expect(handlers.move).toHaveBeenCalledWithDetail({
				path: [0],
				node: 'A'
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
			expect(handlers.move).toHaveBeenCalledWithDetail({
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
			expect(handlers.move).toHaveBeenCalledWithDetail({
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
			expect(handlers.select).toHaveBeenCalledWithDetail({
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

	describe('Vertical Nested List', () => {
		let items = [
			{ name: 'A', children: ['A1'] },
			{ name: 'B', children: ['B1'] }
		]

		it('dispatches move event on next', () => {
			options = { items, fields: [] }
			navigatorInstance = navigator(node, options)

			const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
			expect(handlers.move).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
			expect(handlers.move).toHaveBeenCalledWithDetail({
				path: [1],
				node: items[1]
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
			// expect(handlers.move).toHaveBeenCalledWithDetail({ node: 'A' })
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
			expect(handlers.move).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})
			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
		})

		it('Should trigger scrollIntoView on move', () => {
			navigatorInstance = navigator(hierarchy, {
				items,
				fields,
				indices: [1]
			})

			const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
			hierarchy.dispatchEvent(event)
			expect(nestedHandlers.move).toHaveBeenCalled()
			expect(nestedHandlers.move).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})
			expect(hierarchy.children[0].scrollIntoView).toHaveBeenCalled()
		})

		it('Should dispatch select event on Enter key', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [0, 0]
			})

			let event = new KeyboardEvent('keydown', { key: 'Enter' })
			node.dispatchEvent(event)
			expect(handlers.select).toHaveBeenCalledTimes(1)
			expect(handlers.select).toHaveBeenCalledWithDetail({
				path: [0, 0],
				node: items[0].children[0]
			})
		})

		it('Should not dispatch collapse/expand event with empty selection', () => {
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
		it('Should dispatch collapse event on ArrowLeft', () => {
			items[0][fields.isOpen] = true
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
			node.dispatchEvent(event)

			expect(handlers.collapse).toHaveBeenCalledTimes(1)
			expect(handlers.collapse).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})
		})

		it('Should select parent on ArrowLeft', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [0, 0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
			node.dispatchEvent(event)

			expect(handlers.collapse).not.toHaveBeenCalled()
			expect(handlers.select).toHaveBeenCalled()
			expect(handlers.select).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})
		})

		it('Should dispatch expand event on ArrowRight', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				indices: [0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
			node.dispatchEvent(event)
			expect(handlers.expand).toHaveBeenCalledTimes(1)
			expect(handlers.expand).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})
		})

		it('Should dispatch collapse/expand when parent is clicked.', () => {
			navigatorInstance = navigator(hierarchy, {
				items,
				fields,
				indices: [1]
			})

			expect(items[0][fields.isOpen]).toBeTruthy()
			hierarchy.children[0].dispatchEvent(
				new MouseEvent('click', { bubbles: true })
			)
			expect(items[0][fields.isOpen]).toBeFalsy()
			expect(nestedHandlers.collapse).toHaveBeenCalled()
			expect(nestedHandlers.collapse).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})
			hierarchy.children[0].dispatchEvent(
				new MouseEvent('click', { bubbles: true })
			)
			expect(items[0][fields.isOpen]).toBeTruthy()
			expect(nestedHandlers.expand).toHaveBeenCalled()
			expect(nestedHandlers.expand).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})
		})
	})

	describe('Horizontal List', () => {
		let items = ['A', 'B']

		it('Should dispatch move event on ArrowRight', () => {
			options = { items, fields, vertical: false }
			navigatorInstance = navigator(node, options)

			const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
			expect(handlers.move).toHaveBeenCalledWithDetail({
				path: [0],
				node: 'A'
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
			expect(handlers.move).toHaveBeenCalledWithDetail({
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
			expect(handlers.move).toHaveBeenCalledWithDetail({
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
			expect(handlers.select).toHaveBeenCalledWithDetail({
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

	describe('Horizontal Nested List', () => {
		let items = [
			{ name: 'A', children: ['A1'] },
			{ name: 'B', children: ['B1'] }
		]
		it('Should dispatch move event on ArrowRight', () => {
			options = { items, fields, vertical: false }
			navigatorInstance = navigator(node, options)

			const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
			expect(handlers.move).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
			expect(handlers.move).toHaveBeenCalledWithDetail({
				path: [1],
				node: items[1]
			})
			expect(handlers.move).toHaveBeenCalledWithDetail({
				path: [1],
				node: items[1]
			})

			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(2)
			// expect(handlers.move).toHaveBeenCalledWithDetail({ node: 'A' })
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
			expect(handlers.move).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})
			node.dispatchEvent(event)
			expect(handlers.move).toHaveBeenCalledTimes(1)
		})

		it('Should dispatch select event on Enter key', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				vertical: false,
				indices: [0, 0]
			})

			let event = new KeyboardEvent('keydown', { key: 'Enter' })
			node.dispatchEvent(event)
			expect(handlers.select).toHaveBeenCalledTimes(1)
			expect(handlers.select).toHaveBeenCalledWithDetail({
				path: [0, 0],
				node: items[0].children[0]
			})
		})

		it('Should not dispatch collapse/expand event with empty selection', () => {
			navigatorInstance = navigator(node, {
				items,
				fields
			})
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
			expect(handlers.collapse).not.toHaveBeenCalled()
			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
			expect(handlers.collapse).not.toHaveBeenCalled()
		})

		it('Should dispatch collapse event on ArrowUp', () => {
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
			expect(handlers.collapse).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})
		})

		it('Should select parent on ArrowUp', () => {
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
			expect(handlers.select).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})
		})

		it('Should dispatch expand event on ArrowDown', () => {
			navigatorInstance = navigator(node, {
				items,
				fields,
				vertical: false,
				indices: [0]
			})
			const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
			node.dispatchEvent(event)
			expect(handlers.expand).toHaveBeenCalledTimes(1)
			expect(handlers.expand).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})
		})
		it('Should dispatch collapse/expand when parent is clicked.', () => {
			navigatorInstance = navigator(hierarchy, {
				items,
				fields,
				indices: [1],
				vertical: false
			})

			expect(items[0][fields.isOpen]).toBeTruthy()
			hierarchy.children[0].dispatchEvent(
				new MouseEvent('click', { bubbles: true })
			)
			expect(items[0][fields.isOpen]).toBeFalsy()
			expect(nestedHandlers.collapse).toHaveBeenCalled()
			expect(nestedHandlers.collapse).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})
			hierarchy.children[0].dispatchEvent(
				new MouseEvent('click', { bubbles: true })
			)
			expect(items[0][fields.isOpen]).toBeTruthy()
			expect(nestedHandlers.expand).toHaveBeenCalled()
			expect(nestedHandlers.expand).toHaveBeenCalledWithDetail({
				path: [0],
				node: items[0]
			})
		})
	})
})
