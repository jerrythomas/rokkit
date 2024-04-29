import { describe, it, expect } from 'vitest'
import { createView } from '../../src/view'
import { getList } from '../../src/view/primitives'
import { get } from 'svelte/store'
import { clone } from 'ramda'

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
			'moveByOffset',
			'moveFirst',
			'moveLast',
			'moveTo',
			'select',
			'unselect',
			'toggleSelection',
			'selectAll',
			'unselectAll',
			'expand',
			'collapse',
			'toggleExpansion',
			'expandAll',
			'collapseAll'
		])
	})

	it('should move by offset', () => {
		const items = ['a', 'b', 'c']
		const view = createView(items)
		view.moveByOffset(1)
		expect(get(view)).toEqual({
			data: getList(items),
			fields: undefined,
			value: 'b',
			currentIndex: 1,
			selectedItems: []
		})
	})

	it('should move to first', () => {
		const items = ['a', 'b', 'c']
		const view = createView(items)

		view.moveByOffset(1)
		view.moveFirst()
		expect(get(view)).toEqual({
			data: getList(items),
			fields: undefined,
			value: 'a',
			currentIndex: 0,
			selectedItems: []
		})
	})

	it('should move to last', () => {
		const items = ['a', 'b', 'c']

		const view = createView(items)

		view.moveLast()
		expect(get(view)).toEqual({
			data: getList(items),
			fields: undefined,
			value: 'c',
			currentIndex: 2,
			selectedItems: []
		})
	})

	it('should move to an index', () => {
		const items = ['a', 'b', 'c']
		const view = createView(items)
		view.moveTo(2)
		const expected = {
			data: getList(items),
			fields: undefined,
			value: 'c',
			currentIndex: 2,
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

	it('should select an item', () => {
		const items = ['a', 'b', 'c']
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
		const items = ['a', 'b', 'c']
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
		const items = ['a', 'b', 'c']
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
		const items = ['a', 'b', 'c']
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
		const items = ['a', 'b', 'c']
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

	it('should not change state on expand', () => {
		const items = ['a', 'b', 'c']
		const view = createView(items)

		view.expand(1)
		// const expected = clone(getList(items))
		// expected[1].isExpanded = true
		expect(get(view)).toEqual({
			data: getList(items),
			fields: undefined,
			value: 'a',
			currentIndex: 0,
			selectedItems: []
		})
	})

	it('should not change state on collapse', () => {
		const items = ['a', 'b', 'c']
		const view = createView(items)

		view.expand(1)
		view.collapse(1)
		// const expected = clone(getList(items))
		// expected[1].isExpanded = false
		expect(get(view)).toEqual({
			data: getList(items),
			fields: undefined,
			value: 'a',
			currentIndex: 0,
			selectedItems: []
		})
	})

	it('should not change state on toggle expansion', () => {
		const items = ['a', 'b', 'c']
		const view = createView(items)

		view.toggleExpansion(1)
		const expected = clone(getList(items))
		// expected[1].isExpanded = true
		expect(get(view)).toEqual({
			data: expected,
			fields: undefined,
			value: 'a',
			currentIndex: 0,
			selectedItems: []
		})
		view.toggleExpansion(1)
		// expected[1].isExpanded = false
		expect(get(view)).toEqual({
			data: expected,
			fields: undefined,
			value: 'a',
			currentIndex: 0,
			selectedItems: []
		})
	})

	it('should not change state on expandAll', () => {
		const items = ['a', 'b', 'c']
		const view = createView(items)

		view.expandAll()
		expect(get(view)).toEqual({
			data: getList(items), //.map((item) => ({ ...item, isExpanded: true })),
			fields: undefined,
			value: 'a',
			currentIndex: 0,
			selectedItems: []
		})
	})

	it('should not change state on collapseAll', () => {
		const items = ['a', 'b', 'c']
		const view = createView(items)

		view.expandAll()
		view.collapseAll()
		expect(get(view)).toEqual({
			data: getList(items), ///.map((item) => ({ ...item, isExpanded: false })),
			fields: undefined,
			value: 'a',
			currentIndex: 0,
			selectedItems: []
		})
	})
})
