import { describe, it, expect } from 'vitest'
import { createView } from '../../src/view'
import { getList } from '../../src/view/primitives'
import { get } from 'svelte/store'

describe('view for lists', () => {
	describe('basics', () => {
		const items = ['a', 'b', 'c']
		it('should create a view store', () => {
			const view = createView(items)

			expect(view).toBeDefined()
			expect(get(view)).toEqual({
				data: getList(items),
				fields: undefined,
				// events: [],
				value: 'a',
				currentIndex: 0,
				selectedItems: []
			})
			expect(Object.keys(view)).toEqual([
				'subscribe',
				'getEvents',
				'currentItem',
				'moveByOffset',
				'moveFirst',
				'moveLast',
				'moveTo',
				'select',
				'unselect',
				'toggleSelection',
				'selectAll',
				'unselectAll',
				'selectNone',
				'selectRange',
				'invertSelection',
				'expand',
				'collapse',
				'toggleExpansion',
				'expandAll',
				'collapseAll',
				'events'
			])
			expect(get(view.events)).toEqual([])
		})

		it('should fetch the current item', () => {
			const view = createView(items)
			expect(view.currentItem()).toEqual({
				indexPath: [0],
				value: 'a',
				isSelected: false
			})

			view.moveByOffset(1)
			expect(view.currentItem()).toEqual({
				indexPath: [1],
				value: 'b',
				isSelected: false
			})
		})

		it('should return null when items is empty', () => {
			const view = createView([])
			expect(view.currentItem()).toEqual(null)
		})
		it('should return null when currentIndex is not set', () => {
			const view = createView(items, { currentIndex: -1 })
			expect(view.currentItem()).toEqual(null)
		})

		it('should get all events', () => {
			const view = createView(items)
			view.moveByOffset(1)
			expect(get(view.events)).toEqual([{ type: 'move', detail: { path: [1], value: items[1] } }])
			// expect(view.getEvents()).toEqual([])
		})
	})

	describe('movement', () => {
		const items = ['a', 'b', 'c']

		it('should move by offset', () => {
			const view = createView(items)
			view.moveByOffset(1)
			expect(get(view)).toEqual({
				data: getList(items),
				fields: undefined,
				value: 'b',
				currentIndex: 1,
				rangeStart: 1,
				selectedItems: []
			})
			expect(get(view.events)).toEqual([{ type: 'move', detail: { path: [1], value: items[1] } }])
		})

		it('should move to first', () => {
			const view = createView(items)

			view.moveByOffset(1)
			view.moveFirst()
			expect(get(view)).toEqual({
				data: getList(items),
				fields: undefined,
				value: 'a',
				currentIndex: 0,
				rangeStart: 0,
				selectedItems: []
			})
			expect(get(view.events)).toEqual([
				{ type: 'move', detail: { path: [1], value: items[1] } },
				{ type: 'move', detail: { path: [0], value: items[0] } }
			])
		})

		it('should move to last', () => {
			const view = createView(items)

			view.moveLast()
			expect(get(view)).toEqual({
				data: getList(items),
				fields: undefined,
				value: 'c',
				currentIndex: 2,
				rangeStart: 2,
				selectedItems: []
			})
			expect(get(view.events)).toEqual([{ type: 'move', detail: { path: [2], value: items[2] } }])
		})

		it('should move to an index', () => {
			const view = createView(items)
			view.moveTo(2)
			const expected = {
				data: getList(items),
				fields: undefined,
				value: 'c',
				currentIndex: 2,
				rangeStart: 2,
				selectedItems: []
				// events: [{ event: 'move', detail: { path: [2], value: items[2] } }]
			}
			expect(get(view)).toEqual(expected)
			expect(get(view.events)).toEqual([{ type: 'move', detail: { path: [2], value: items[2] } }])
			view.moveTo(-1)
			expect(get(view)).toEqual(expected)
			expect(get(view.events)).toEqual([{ type: 'move', detail: { path: [2], value: items[2] } }])
			view.moveTo(3)
			expect(get(view)).toEqual(expected)
			expect(get(view.events)).toEqual([{ type: 'move', detail: { path: [2], value: items[2] } }])
			view.moveTo([3])
			expect(get(view)).toEqual(expected)
			expect(get(view.events)).toEqual([{ type: 'move', detail: { path: [2], value: items[2] } }])
		})
	})

	describe('select/unselect', () => {
		const items = ['a', 'b', 'c']

		it('should select an item', () => {
			const view = createView(items)

			view.select(1)
			expect(get(view)).toEqual({
				data: getList(items).map((item, index) => ({ ...item, isSelected: index === 1 })),
				fields: undefined,
				value: 'a',
				currentIndex: 0,
				selectedItems: [1]
			})
			expect(get(view.events)).toEqual([{ type: 'select', detail: [items[1]] }])
		})

		it('should unselect an item', () => {
			const view = createView(items)

			view.select(1)
			view.unselect(1)
			expect(get(view)).toEqual({
				data: getList(items),
				fields: undefined,
				value: 'a',
				currentIndex: 0,
				selectedItems: []
			})

			expect(get(view.events)).toEqual([
				{ type: 'select', detail: [items[1]] },
				{ type: 'select', detail: [] }
			])
		})

		it('should toggle selection', () => {
			const view = createView(items)

			view.toggleSelection(1)
			expect(get(view)).toEqual({
				data: getList(items).map((item, index) => ({ ...item, isSelected: index === 1 })),
				fields: undefined,
				value: 'a',
				currentIndex: 0,
				selectedItems: [1]
			})

			expect(get(view.events)).toEqual([{ type: 'select', detail: [items[1]] }])
			view.toggleSelection(1)
			expect(get(view)).toEqual({
				data: getList(items),
				fields: undefined,
				value: 'a',
				currentIndex: 0,
				selectedItems: []
			})

			expect(get(view.events)).toEqual([
				{ type: 'select', detail: [items[1]] },
				{ type: 'select', detail: [] }
			])
		})

		it('should select all items', () => {
			const view = createView(items)

			view.selectAll()
			expect(get(view)).toEqual({
				data: getList(items).map((item) => ({ ...item, isSelected: true })),
				fields: undefined,
				value: 'a',
				currentIndex: 0,
				selectedItems: [0, 1, 2]
			})
			expect(get(view.events)).toEqual([{ type: 'select', detail: items }])
		})

		it('should unselect all items', () => {
			const view = createView(items)

			view.selectAll()
			view.unselectAll()
			expect(get(view)).toEqual({
				data: getList(items),
				fields: undefined,
				value: 'a',
				currentIndex: 0,
				selectedItems: []
			})

			expect(get(view.events)).toEqual([
				{ type: 'select', detail: items },
				{ type: 'select', detail: [] }
			])
		})

		it('should not select a range', () => {
			const view = createView(items)
			view.selectRange(1)
			expect(get(view)).toEqual({
				data: getList(items),
				fields: undefined,
				value: 'a',
				currentIndex: 0,
				selectedItems: []
			})
			expect(get(view.events)).toEqual([])
		})
		it('should select a range', () => {
			const view = createView(items)
			view.moveTo(1)
			view.selectRange(1)
			expect(get(view)).toEqual({
				data: getList(items).map((item, index) => ({ ...item, isSelected: index !== 0 })),
				fields: undefined,
				value: 'b',
				currentIndex: 1,
				rangeStart: 1,
				rangeEnd: 2,
				selectedItems: [1, 2]
			})

			expect(get(view.events)).toEqual([
				{ type: 'move', detail: { path: [1], value: items[1] } },
				{ type: 'select', detail: [items[1], items[2]] }
			])
		})

		it('should invert selection', () => {
			const view = createView(items)
			view.select(1)
			view.invertSelection()
			expect(get(view)).toEqual({
				data: getList(items).map((item, index) => ({ ...item, isSelected: index !== 1 })),
				fields: undefined,
				value: 'a',
				currentIndex: 0,
				selectedItems: [0, 2]
			})

			expect(get(view.events)).toEqual([
				{ type: 'select', detail: [items[1]] },
				{ type: 'select', detail: [items[0], items[2]] }
			])
		})
	})

	describe('expand/collapse', () => {
		const items = ['a', 'b', 'c']
		const initialState = {
			data: getList(items),
			// events: [],
			fields: undefined,
			value: 'a',
			currentIndex: 0,
			selectedItems: []
		}

		it('should not change state on expand', () => {
			const view = createView(items)
			view.expand(1)
			expect(get(view)).toEqual(initialState)
			view.expand([3])
			expect(get(view)).toEqual(initialState)
			view.expand(-2)
			expect(get(view)).toEqual(initialState)
			view.expand(3)
			expect(get(view)).toEqual(initialState)
		})

		it('should not change state on collapse', () => {
			const view = createView(items)
			view.collapse(1)
			expect(get(view)).toEqual(initialState)
			view.collapse([3])
			expect(get(view)).toEqual(initialState)
			view.collapse(-2)
			expect(get(view)).toEqual(initialState)
			view.collapse(3)
			expect(get(view)).toEqual(initialState)
		})

		it('should not change state on toggle expansion', () => {
			const view = createView(items)

			view.toggleExpansion(1)
			expect(get(view)).toEqual(initialState)
			view.toggleExpansion([3])
			expect(get(view)).toEqual(initialState)
			view.toggleExpansion(-2)
			expect(get(view)).toEqual(initialState)
			view.toggleExpansion(3)
			expect(get(view)).toEqual(initialState)
		})

		it('should not change state on expandAll', () => {
			const view = createView(items)

			view.expandAll()
			expect(get(view)).toEqual(initialState)
		})

		it('should not change state on collapseAll', () => {
			const view = createView(items)

			view.expandAll()
			view.collapseAll()
			expect(get(view)).toEqual(initialState)
		})
	})
})
