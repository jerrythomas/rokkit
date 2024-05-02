import { describe, it, expect } from 'vitest'
import { createView } from '../../src/view'
import { getList } from '../../src/view/primitives'
import { get } from 'svelte/store'
// import { clone } from 'ramda'

describe('view for lists', () => {
	it('should create a view store', () => {
		const items = ['a', 'b', 'c']
		const view = createView(items)

		expect(view).toBeDefined()
		expect(get(view)).toEqual({
			data: getList(items),
			fields: undefined,
			value: 'a',
			currentIndex: 0,
			selectedItems: []
		})
		expect(Object.keys(view)).toEqual([
			'subscribe',
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
			'collapseAll'
		])
	})

	describe('movement', () => {
		const items = ['a', 'b', 'c']
		it('should move by offset', () => {
			// const items = ['a', 'b', 'c']
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
		})

		it('should move to last', () => {
			// const items = ['a', 'b', 'c']

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
		})

		it('should move to an index', () => {
			// const items = ['a', 'b', 'c']
			const view = createView(items)
			view.moveTo(2)
			const expected = {
				data: getList(items),
				fields: undefined,
				value: 'c',
				currentIndex: 2,
				rangeStart: 2,
				selectedItems: []
			}
			expect(get(view)).toEqual(expected)
			view.moveTo(-1)
			expect(get(view)).toEqual(expected)
			view.moveTo(3)
			expect(get(view)).toEqual(expected)
			view.moveTo([3])
			expect(get(view)).toEqual(expected)
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
			view.toggleSelection(1)
			expect(get(view)).toEqual({
				data: getList(items),
				fields: undefined,
				value: 'a',
				currentIndex: 0,
				selectedItems: []
			})
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
		})
	})

	describe('expand/collapse', () => {
		const items = ['a', 'b', 'c']
		const initialState = {
			data: getList(items),
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
