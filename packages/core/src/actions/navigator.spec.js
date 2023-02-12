import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { toUseHandlersFor, toOnlyTrigger, getCustomEventMock } from 'validators'
import { navigator } from './navigator.js'

expect.extend({ toUseHandlersFor, toOnlyTrigger })

describe('navigator', () => {
	const events = ['move', 'select', 'collapse', 'expand']
	const fields = { children: 'children', isOpen: 'isOpen' }
	let handlers = {}
	let node
	let options
	let navigatorInstance

	beforeEach(() => {
		global.CustomEvent = getCustomEventMock()
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

	it('dispatches move event on next', () => {
		options = { items: ['A', 'B'], fields: [] }
		navigatorInstance = navigator(node, options)

		const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })

		node.dispatchEvent(event)
		expect(handlers.move).toHaveBeenCalledTimes(1)
		expect(handlers.move.mock.lastCall[0].detail).toEqual({ node: 'A' })

		node.dispatchEvent(event)
		expect(handlers.move).toHaveBeenCalledTimes(2)
		expect(handlers.move.mock.lastCall[0].detail).toEqual({ node: 'B' })

		node.dispatchEvent(event)
		expect(handlers.move).toHaveBeenCalledTimes(2)
		// expect(handlers.move.mock.lastCall[0].detail).toEqual({ node: 'A' })
	})

	it('dispatches move event on previous', () => {
		navigatorInstance = navigator(node, {
			items: ['A', 'B'],
			fields,
			indices: [1]
		})

		const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
		node.dispatchEvent(event)
		expect(handlers.move).toHaveBeenCalledTimes(1)
		expect(handlers.move.mock.lastCall[0].detail).toEqual({ node: 'A' })
		node.dispatchEvent(event)
		expect(handlers.move).toHaveBeenCalledTimes(1)
	})

	it('dispatches select event on select', () => {
		navigatorInstance = navigator(node, {
			items: ['A', 'B'],
			fields,
			indices: [0]
		})

		let event = new KeyboardEvent('keydown', { key: 'Enter' })
		node.dispatchEvent(event)
		expect(handlers.select).toHaveBeenCalledTimes(1)
		expect(handlers.select.mock.lastCall[0].detail).toEqual({ node: 'A' })
	})

	it('dispatches collapse event on ArrowLeft', () => {
		navigatorInstance = navigator(node, {
			items: [
				{ name: 'A', children: ['A1'] },
				{ name: 'B', children: ['B1'] }
			],
			fields,
			indices: [0]
		})
		const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
		node.dispatchEvent(event)
		expect(handlers.collapse).toHaveBeenCalledTimes(1)
	})

	it('dispatches expand event on ArrowRight', () => {
		navigatorInstance = navigator(node, {
			items: [
				{ name: 'A', children: ['A1'] },
				{ name: 'B', children: ['B1'] }
			],
			fields,
			indices: [0]
		})
		const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
		node.dispatchEvent(event)
		expect(handlers.expand).toHaveBeenCalledTimes(1)
	})
})

// describe('Navigator Action', () => {
// 	let node
// 	let handler = {}
// 	const events = ['move', 'expand', 'collapse']
// 	const fields = { children: 'children', isOpen: 'isOpen' }
// 	let items = ['Alpha', 'Beta', 'Charlie', 'Delta']
// 	let accordion = [
// 		{ name: 'A', children: ['A-1', 'A-2', 'A-3'] },
// 		{ name: 'B', children: ['B-1', 'B-2', 'B-3'] }
// 	]
// 	let nested = [
// 		{
// 			name: 'A',
// 			children: [
// 				{ name: 'A-1', children: [{ name: 'A-1.1' }] },
// 				{ name: 'A-2' },
// 				{ name: 'A-3' }
// 			]
// 		},
// 		{
// 			name: 'B',
// 			children: [
// 				{ name: 'B-1', children: [{ name: 'B-2.1' }, { name: 'B-2.2' }] },
// 				{ name: 'B-2' },
// 				{ name: 'B-3', children: [{ name: 'B-3.1' }, { name: 'B-3.2' }] }
// 			]
// 		}
// 	]

// 	beforeEach(() => {
// 		node = document.createElement('div')
// 		global.CustomEvent = vi.fn().mockImplementation((eventType, eventInit) => {
// 			class CustomEvent extends Event {
// 				constructor(type, init) {
// 					super(type, init)
// 					this.detail = init
// 				}
// 			}

// 			return new CustomEvent(eventType, eventInit)
// 		})
// 		events.map((event) => {
// 			handler[event] = vi.fn()
// 			node.addEventListener(event, handler[event])
// 		})
// 	})

// 	afterEach(() => {
// 		events.map((event) => node.removeEventListener(event, handler[event]))
// 		vi.resetAllMocks()
// 	})

// 	it('should use handlers and cleanup on destroy', () => {
// 		expect(navigator).toUseHandlersFor({}, 'keydown')
// 		expect(navigator).toUseHandlersFor({ nested: false }, 'keydown')
// 		expect(navigator).toUseHandlersFor({ vertical: false }, 'keydown')
// 		expect(navigator).toUseHandlersFor(
// 			{ nested: false, vertical: false },
// 			'keydown'
// 		)
// 	})

// 	it('should find current node and parent using indices', () => {
// 		items.map((item, index) => {
// 			expect(findNodeInHierarchy([index], items, fields)).toEqual({
// 				node: item,
// 				fields,
// 				parent: items
// 			})
// 		})
// 		expect(findNodeInHierarchy([-1], items, fields)).toEqual({
// 			node: undefined,
// 			fields,
// 			parent: items
// 		})

// 		expect(accordion[0].isOpen).toBeFalsy()
// 		expect(accordion[1].isOpen).toBeFalsy()

// 		expect(findNodeInHierarchy([0, 0], accordion, fields)).toEqual({
// 			node: 'A-1',
// 			fields,
// 			parent: accordion[0].children
// 		})
// 		expect(accordion[0].isOpen).toBeTruthy()
// 		expect(findNodeInHierarchy([0, 1], accordion, fields)).toEqual({
// 			node: 'A-2',
// 			fields,
// 			parent: accordion[0].children
// 		})
// 		expect(accordion[0].isOpen).toBeTruthy()

// 		expect(findNodeInHierarchy([1, 1], accordion, fields)).toEqual({
// 			node: 'B-2',
// 			fields,
// 			parent: accordion[1].children
// 		})
// 		expect(accordion[1].isOpen).toBeTruthy()
// 		accordion[0].isOpen = false
// 		accordion[1].isOpen = false

// 		expect(nested[0].isOpen).toBeFalsy()
// 		expect(nested[0].children[0].isOpen).toBeFalsy()
// 		expect(findNodeInHierarchy([0, 0, 0], nested, fields)).toEqual({
// 			node: { name: 'A-1.1' },
// 			fields,
// 			parent: nested[0].children[0].children
// 		})
// 		expect(nested[0].isOpen).toBeTruthy()
// 		expect(nested[0].children[0].isOpen).toBeTruthy()

// 		expect(nested[1].isOpen).toBeFalsy()
// 		expect(nested[1].children[2].isOpen).toBeFalsy()
// 		expect(findNodeInHierarchy([1, 2, 0], nested, fields)).toEqual({
// 			node: { name: 'B-3.1' },
// 			fields,
// 			parent: nested[1].children[2].children
// 		})
// 		expect(findNodeInHierarchy([1, 2, 1], nested, fields)).toEqual({
// 			node: { name: 'B-3.2' },
// 			fields,
// 			parent: nested[1].children[2].children
// 		})
// 		expect(nested[1].isOpen).toBeTruthy()
// 		// expect(nested[1].children[2].isOpen).toBeTruthy()

// 		nested[0].isOpen = false
// 		nested[0].children[0].isOpen = false
// 		nested[1].isOpen = false
// 		nested[1].children[2].isOpen = false
// 		// console.log(nested)
// 	})

// 	it('should find previous node using indices', () => {
// 		expect(getPreviousNodeIndex([0])).toEqual(null)

// 		expect(getPreviousNodeIndex([0, 0])).toEqual(null)
// 		expect(getPreviousNodeIndex([0, 1])).toEqual([0, 0])
// 		expect(getPreviousNodeIndex([0, 2])).toEqual([0, 1])
// 		expect(getPreviousNodeIndex([1, 1])).toEqual([1, 0])

// 		expect(getPreviousNodeIndex([0, 0, 0])).toEqual(null)
// 		expect(getPreviousNodeIndex([1, 2, 0])).toEqual(null)
// 		expect(getPreviousNodeIndex([1, 2, 1])).toEqual([1, 2, 0])
// 		expect(getPreviousNodeIndex([1, 2, 2])).toEqual([1, 2, 1])
// 	})

// 	it('should find last visible child when items are not expanded', () => {
// 		items.forEach((_, index) =>
// 			expect(getLastVisibleNodeIndex([index], items, fields, false)).toEqual([
// 				index
// 			])
// 		)
// 		accordion.forEach((_, index) =>
// 			expect(getLastVisibleNodeIndex([index], accordion, fields, true)).toEqual(
// 				[index]
// 			)
// 		)
// 		nested.forEach((_, index) =>
// 			expect(getLastVisibleNodeIndex([index], nested, fields, true)).toEqual([
// 				index
// 			])
// 		)
// 	})

// 	it('should find last visible child when items are expanded', () => {
// 		let items = accordion.map((item) => ({ ...item, [fields.isOpen]: true }))

// 		expect(getLastVisibleNodeIndex([0], items, fields, true)).toEqual([0, 2])
// 		expect(getLastVisibleNodeIndex([1], items, fields, true)).toEqual([1, 2])

// 		items = nested.map((item) => ({ ...item, [fields.isOpen]: true }))
// 		expect(getLastVisibleNodeIndex([0], items, fields, true)).toEqual([0, 2])
// 		expect(getLastVisibleNodeIndex([1], items, fields, true)).toEqual([1, 2])

// 		items[0].children[0][fields.isOpen] = true
// 		expect(getLastVisibleNodeIndex([0], items, fields, true)).toEqual([0, 2])
// 		items[1].children[2][fields.isOpen] = true
// 		expect(getLastVisibleNodeIndex([1], items, fields, true)).toEqual([1, 2, 1])
// 		expect(getLastVisibleNodeIndex([1, 2], items, fields, true)).toEqual([
// 			1, 2, 1
// 		])
// 		items[1].children[0][fields.isOpen] = true
// 		expect(getLastVisibleNodeIndex([1], items, fields, true)).toEqual([1, 2, 1])
// 		expect(getLastVisibleNodeIndex([1, 0], items, fields, true)).toEqual([
// 			1, 0, 1
// 		])
// 	})

// 	it('should find the next topmost node', () => {
// 		expect(findNextTopmostNodeIndex([0, 2], accordion, fields)).toEqual([1])
// 		expect(findNextTopmostNodeIndex([1, 2], accordion, fields)).toEqual(null)

// 		expect(findNextTopmostNodeIndex([0, 0, 0], nested, fields)).toEqual([0, 1])
// 		expect(findNextTopmostNodeIndex([0, 2], nested, fields)).toEqual([1])
// 		expect(findNextTopmostNodeIndex([1, 0, 1], nested, fields)).toEqual([1, 1])
// 		expect(findNextTopmostNodeIndex([1, 2, 1], nested, fields)).toEqual(null)
// 	})

// 	it('should identify if current node is expanded', () => {
// 		expect(isNodeExpanded(null, fields, false)).equals(false)
// 		expect(isNodeExpanded(undefined, fields, false)).equals(false)
// 		expect(isNodeExpanded(null, fields, true)).equals(false)
// 		expect(isNodeExpanded(undefined, fields, true)).equals(false)
// 		expect(isNodeExpanded({}, fields, false)).equals(false)
// 		expect(isNodeExpanded({}, fields, true)).equals(false)
// 		expect(isNodeExpanded({ children: [] }, fields, true)).equals(false)
// 		expect(
// 			isNodeExpanded({ children: [], isOpen: false }, fields, true)
// 		).equals(false)
// 		expect(isNodeExpanded({ children: [], isOpen: true }, fields, true)).equals(
// 			true
// 		)
// 	})

// 	describe('Vertical', () => {
// 		it('Should move next on ArrowDown on list', () => {
// 			const action = navigator(node, { items, fields })
// 			items.forEach((item, index) => {
// 				node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 				expect(handler.move).toHaveBeenCalledTimes(index + 1)
// 				expect(handler.move.calls[index][0].detail).toEqual({
// 					indices: [index],
// 					node: item
// 				})
// 			})
// 			// console.log(handler.move.calls[2][0].detail)
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
// 			expect(handler.move).toHaveBeenCalledTimes(4)
// 			// console.log(handler.move.calls[3][0].detail)
// 			expect(handler.collapse).not.toHaveBeenCalled()
// 			expect(handler.expand).not.toHaveBeenCalled()
// 			action.destroy()
// 		})
// 		it('should move to next topmost node in accordion', () => {
// 			const action = navigator(node, {
// 				items: accordion,
// 				fields,
// 				nested: true,
// 				indices: [0, 2]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			expect(handler.move.calls[0][0].detail).toEqual({
// 				indices: [1],
// 				node: accordion[1]
// 			})
// 			action.destroy()
// 		})
// 		it('should move to next topmost node in nested list', () => {
// 			nested[1].isOpen = true
// 			let action = navigator(node, {
// 				items: nested,
// 				fields,
// 				nested: true,
// 				indices: [0, 0, 0]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			expect(handler.move.calls[0][0].detail).toEqual({
// 				indices: [0, 1],
// 				node: nested[0].children[1]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			expect(handler.move.calls[1][0].detail).toEqual({
// 				indices: [0, 2],
// 				node: nested[0].children[2]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			expect(handler.move.calls[2][0].detail).toEqual({
// 				indices: [1],
// 				node: nested[1]
// 			})
// 			// console.log(nested[1])
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			expect(handler.move.calls[3][0].detail).toEqual({
// 				indices: [1, 0],
// 				node: nested[1].children[0]
// 			})
// 			// console.log(nested[1].children[0])
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			// console.log(handler.move.calls[4][0].detail)
// 			expect(handler.move.calls[4][0].detail).toEqual({
// 				indices: [1, 0, 0],
// 				node: nested[1].children[0].children[0]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			expect(handler.move.calls[5][0].detail).toEqual({
// 				indices: [1, 0, 1],
// 				node: nested[1].children[0].children[1]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			expect(handler.move.calls[6][0].detail).toEqual({
// 				indices: [1, 1],
// 				node: nested[1].children[1]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			expect(handler.move.calls[7][0].detail).toEqual({
// 				indices: [1, 2],
// 				node: nested[1].children[2]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			expect(handler.move.calls[8][0].detail).toEqual({
// 				indices: [1, 2, 0],
// 				node: nested[1].children[2].children[0]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			expect(handler.move.calls[9][0].detail).toEqual({
// 				indices: [1, 2, 1],
// 				node: nested[1].children[2].children[1]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			expect(handler.move).toHaveBeenCalledTimes(10)
// 			expect(handler.collapse).not.toHaveBeenCalled()
// 			expect(handler.expand).not.toHaveBeenCalled()
// 			action.destroy()
// 		})
// 		it('Should move previous on ArrowUp in list', () => {
// 			const action = navigator(node, { items, fields, indices: [3] })
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
// 			expect(handler.move.calls[0][0].detail).toEqual({
// 				indices: [2],
// 				node: items[2]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
// 			expect(handler.move.calls[1][0].detail).toEqual({
// 				indices: [1],
// 				node: items[1]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
// 			expect(handler.move.calls[2][0].detail).toEqual({
// 				indices: [0],
// 				node: items[0]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
// 			expect(handler.move).toHaveBeenCalledTimes(3)
// 			expect(handler.collapse).not.toHaveBeenCalled()
// 			expect(handler.expand).not.toHaveBeenCalled()
// 			action.destroy()
// 		})
// 	})
// 	describe('Horizontal', () => {
// 		it('Should move next on ArrowRight in list', () => {
// 			const action = navigator(node, { items, fields, vertical: false })

// 			items.forEach((item, index) => {
// 				node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
// 				expect(handler.move).toHaveBeenCalledTimes(index + 1)
// 				expect(handler.move.calls[index][0].detail).toEqual({
// 					indices: [index],
// 					node: item
// 				})
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))

// 			expect(handler.move).toHaveBeenCalledTimes(4)
// 			expect(handler.collapse).not.toHaveBeenCalled()
// 			expect(handler.expand).not.toHaveBeenCalled()

// 			action.destroy()
// 		})

// 		it('Should move previous on ArrowLeft in list', () => {
// 			const action = navigator(node, {
// 				items,
// 				fields,
// 				vertical: false,
// 				indices: [3]
// 			})

// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
// 			expect(handler.move.calls[0][0].detail).toEqual({
// 				indices: [2],
// 				node: items[2]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
// 			expect(handler.move.calls[1][0].detail).toEqual({
// 				indices: [1],
// 				node: items[1]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
// 			expect(handler.move.calls[2][0].detail).toEqual({
// 				indices: [0],
// 				node: items[0]
// 			})
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
// 			node.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
// 			expect(handler.move).toHaveBeenCalledTimes(3)
// 			expect(handler.collapse).not.toHaveBeenCalled()
// 			expect(handler.expand).not.toHaveBeenCalled()

// 			action.destroy()
// 		})
// 	})
// })
