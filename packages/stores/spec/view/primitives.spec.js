import { describe, it, expect } from 'vitest'
import { clone } from 'ramda'
import {
	getList,
	findIndex,
	findIndexByValue,
	moveByOffset,
	moveTo,
	select,
	selectAll,
	unselect,
	unselectAll,
	toggleSelection,
	expand,
	collapse,
	toggleExpansion,
	expandAll,
	collapseAll
} from '../../src/view/primitives'

describe('view -> primitives', () => {
	const items = ['a', 'b', 'c']
	const data = [
		{ value: 'a', isSelected: false, indexPath: [0] },
		{ value: 'b', isSelected: false, indexPath: [1] },
		{ value: 'c', isSelected: false, indexPath: [2] }
	]
	describe('getList', () => {
		it('should generate a view wrapper for items', () => {
			const result = getList(items)
			expect(result).toEqual(data)
		})
	})
	describe('findIndex', () => {
		it('should find the index of an item', () => {
			expect(findIndex(data, 1)).toBe(1)
			expect(findIndex(data, [1])).toBe(1)
			expect(findIndex(data, [2])).toBe(2)
			expect(findIndex(data, 3)).toBe(-1)
			expect(findIndex(data, [3])).toBe(-1)
			expect(findIndex(data, -3)).toBe(-1)
		})
	})

	describe('findIndexByValue', () => {
		it('should find the index of an item by value', () => {
			expect(findIndexByValue(data, 'b')).toBe(1)
			expect(findIndexByValue(data, 'c')).toBe(2)
			expect(findIndexByValue(data, 'd')).toBe(-1)
		})
	})
	describe('moveByOffset', () => {
		it('should move the current index by the given offset', () => {
			const state = { data, currentIndex: 0 }
			const result = moveByOffset(state, 1)
			expect(result).toEqual({ data, currentIndex: 1, value: 'b' })
		})
		it('should not move the current index if the offset is out of bounds', () => {
			const state = { data, currentIndex: 2 }
			const result = moveByOffset(state, 1)
			expect(result).toEqual(state)
		})
	})

	describe('moveTo', () => {
		it('should move to an index', () => {
			const state = { data, currentIndex: 0 }
			const result = moveTo(state, 2)
			expect(result).toEqual({ data, currentIndex: 2, value: 'c' })
		})
		it('should not move to an index if it is out of bounds', () => {
			const state = { data, currentIndex: 0 }
			const result = moveTo(state, 3)
			expect(result).toEqual(state)
		})
	})

	describe('select', () => {
		it('should select an item', () => {
			const state = { data, currentIndex: 0, selectedItems: [] }
			const result = select(state, 1)
			expect(result).toEqual({
				data: data.map((item, index) => ({ ...item, isSelected: index === 1 })),
				currentIndex: 0,
				selectedItems: [1]
			})
		})

		it('should not select when index is out of bounds', () => {
			const state = { data, currentIndex: 0, selectedItems: [] }
			const result = select(state, 3)
			expect(result).toEqual(state)
		})
	})

	describe('unselect', () => {
		it('should unselect an item', () => {
			const state = { data, currentIndex: 0, selectedItems: [1] }
			const result = unselect(state, 1)
			expect(result).toEqual({
				data: data.map((item, index) => ({ ...item, isSelected: false })),
				currentIndex: 0,
				selectedItems: []
			})
		})
		it('should not unselect when index is out of bounds', () => {
			const state = { data, currentIndex: 0, selectedItems: [] }
			const result = unselect(state, 3)
			expect(result).toEqual(state)
		})
	})

	describe('selectAll', () => {
		it('should select all items', () => {
			const state = { data, currentIndex: 0, selectedItems: [] }
			const result = selectAll(state)
			expect(result).toEqual({
				data: data.map((item) => ({ ...item, isSelected: true })),
				currentIndex: 0,
				selectedItems: [0, 1, 2]
			})
		})
	})

	describe('unselectAll', () => {
		it('should unselect all items', () => {
			const state = { data, currentIndex: 0, selectedItems: [0, 1, 2] }
			const result = unselectAll(state)
			expect(result).toEqual({
				data: data.map((item) => ({ ...item, isSelected: false })),
				currentIndex: 0,
				selectedItems: []
			})
		})
	})

	describe('toggleSelection', () => {
		it('should toggle the selection of an item', () => {
			const state = { data, currentIndex: 0, selectedItems: [] }
			const result = toggleSelection(state, 1)
			expect(result).toEqual({
				data: data.map((item, index) => ({ ...item, isSelected: index === 1 })),
				currentIndex: 0,
				selectedItems: [1]
			})
		})
		it('should unselect an item if it is already selected', () => {
			const state = { data, currentIndex: 0, selectedItems: [1] }
			const result = toggleSelection(state, 1)
			expect(result).toEqual({
				data: data.map((item) => ({ ...item, isSelected: false })),
				currentIndex: 0,
				selectedItems: []
			})
		})
		it('should not toggle the selection if index is out of bounds', () => {
			const state = { data, currentIndex: 0, selectedItems: [] }
			const result = toggleSelection(state, 3)
			expect(result).toEqual(state)
		})
	})

	describe('expand', () => {
		// it('should expand item at index', () => {
		// 	const state = { data, currentIndex: 0, selectedItems: [] }
		// 	const result = expand(state, 0)
		// 	const expected = clone(data)
		// 	expected[0].isExpanded = true
		// 	expect(result).toEqual({
		// 		data: expected,
		// 		currentIndex: 0,
		// 		selectedItems: []
		// 	})
		// })
		// it('should expand item using path index', () => {
		// 	const state = { data, currentIndex: 0, selectedItems: [] }
		// 	const result = expand(state, [1])
		// 	const expected = clone(data)
		// 	expected[1].isExpanded = true
		// 	expect(result).toEqual({
		// 		data: expected,
		// 		currentIndex: 0,
		// 		selectedItems: []
		// 	})
		// })

		it('should not expand when index is out of bounds', () => {
			const state = { data, currentIndex: 0, selectedItems: [] }
			const result = expand(state, [3])
			expect(result).toEqual(state)
		})
	})

	describe('collapse', () => {
		// it('should collapse item at index', () => {
		// 	const state = { data, currentIndex: 0, selectedItems: [] }
		// 	const result = collapse(state, 0)
		// 	const expected = clone(data)
		// 	expected[0].isExpanded = false
		// 	expect(result).toEqual({
		// 		data: expected,
		// 		currentIndex: 0,
		// 		selectedItems: []
		// 	})
		// })
		// it('should collapse item using path index', () => {
		// 	const state = { data, currentIndex: 0, selectedItems: [] }
		// 	const result = collapse(state, [1])
		// 	const expected = clone(data)
		// 	expected[1].isExpanded = false
		// 	expect(result).toEqual({
		// 		data: expected,
		// 		currentIndex: 0,
		// 		selectedItems: []
		// 	})
		// })
		it('should not collapse when index is out of bounds', () => {
			const state = { data, currentIndex: 0, selectedItems: [] }
			const result = collapse(state, [3])
			expect(result).toEqual(state)
		})
	})

	describe('toggleExpansion', () => {
		// it('should toggle the expansion of an item', () => {
		// 	const state = { data, currentIndex: 0, selectedItems: [] }
		// 	const result = toggleExpansion(state, 0)
		// 	const expected = clone(data)
		// 	expected[0].isExpanded = true
		// 	expect(result).toEqual({
		// 		data: expected,
		// 		currentIndex: 0,
		// 		selectedItems: []
		// 	})
		// })
		// it('should collapse item if it is already expanded', () => {
		// 	const items = clone(data)
		// 	items[1].isExpanded = true
		// 	const state = { data: items, currentIndex: 0, selectedItems: [] }
		// 	const result = toggleExpansion(state, 1)
		// 	const expected = clone(data)
		// 	expected[1].isExpanded = false
		// 	expect(result).toEqual({
		// 		data: expected,
		// 		currentIndex: 0,
		// 		selectedItems: []
		// 	})
		// })
		it('should not toggle the expansion if index is out of bounds', () => {
			const state = { data, currentIndex: 0, selectedItems: [] }
			const result = toggleExpansion(state, 3)
			expect(result).toEqual(state)
		})
	})

	// describe('expandAll', () => {
	// 	it('should expand all items', () => {
	// 		const state = { data, currentIndex: 0, selectedItems: [] }
	// 		const result = expandAll(state)

	// 		expect(result).toEqual({
	// 			data: data.map((item) => ({ ...item, isExpanded: true })),
	// 			currentIndex: 0,
	// 			selectedItems: []
	// 		})
	// 	})
	// })

	// describe('collapseAll', () => {
	// 	it('should collapse all items', () => {
	// 		const items = clone(data)
	// 		items[0].isExpanded = true
	// 		const state = { data: items, currentIndex: 0, selectedItems: [] }
	// 		const result = collapseAll(state)

	// 		expect(result).toEqual({
	// 			data: data.map((item) => ({ ...item, isExpanded: false })),
	// 			currentIndex: 0,
	// 			selectedItems: []
	// 		})
	// 	})
	// })
})
