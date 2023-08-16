import { describe, expect, it } from 'vitest'
import items from './fixtures/nested-items.json'
import {
	findItemByValue,
	findLastVisibleChild,
	findNearestItemBefore,
	findNearestItemAfter,
	findItemByIndexArray,
	mappedList
} from '../src/mapped-list'

describe('mapped-list', () => {
	const fields = { children: 'nodes', isOpen: 'is_open' }

	describe('findItemByValue', () => {
		const fields = { children: 'children' }
		const items = [
			{
				value: 'a',
				children: [{ value: 'b' }, { value: 'c', children: [{ value: 'd' }] }]
			},
			{ value: 'e' }
		]

		it('should find an item by value in a nested tree', () => {
			const value = items[0].children[1].children[0]
			const result = findItemByValue(value, items, fields)

			expect(result).toEqual({
				fields,
				item: { value: 'd' },
				position: [0, 1, 0]
			})
		})

		it('should return null item if the item is not found', () => {
			const result = findItemByValue('f', items, fields)
			expect(result).toBeNull()
		})

		it('should find a value by text in a nested tree', () => {
			const result = findItemByValue('d', items, fields, 'value')
			expect(result).toEqual({
				fields,
				item: { value: 'd' },
				position: [0, 1, 0]
			})
		})
	})

	describe('findItemByIndexArray', () => {
		it('should return the correct item', () => {
			const items = [
				{ id: 1, nodes: [{ id: 2, nodes: [{ id: 3 }] }] },
				{ id: 4, nodes: [{ id: 5 }] }
			]
			const indexArray = [0, 0, 0]
			const item = findItemByIndexArray(indexArray, items, fields)
			expect(item).toEqual({ fields, item: { id: 3 }, position: [0, 0, 0] })
		})

		it('should return null if the index array is out of bounds', () => {
			const items = [
				{ id: 1, nodes: [{ id: 2, nodes: [{ id: 3 }] }] },
				{ id: 4, nodes: [{ id: 5 }] }
			]
			const indexArray = [0, 0, 0, 0]
			const item = findItemByIndexArray(indexArray, items, fields)
			expect(item).toBeNull()
		})
	})

	describe('findLastVisibleChild', () => {
		it('should return the item itself if it is a leaf', () => {
			const item = items[2]
			const position = [2]
			const result = findLastVisibleChild(item, position, fields)
			expect(result).toEqual({ item, position, fields })
		})

		it('should return the last child if the item is not a leaf and is open', () => {
			const item = items[0]
			const result = findLastVisibleChild(item, [0], fields)
			expect(result).toEqual({ item: item.nodes[1], position: [0, 2], fields })
		})

		it('should return the last visible grandchild intermediate nodes are open', () => {
			const item = items[0].nodes[0]
			const result = findLastVisibleChild(item, [0, 0], fields)
			expect(result).toEqual({
				item: item.nodes[1].nodes[0],
				position: [0, 0, 1, 0],
				fields
			})
		})

		it('should return the item itself if it is not a leaf and is not open', () => {
			const item = items[1]
			const result = findLastVisibleChild(item, [1], fields)
			expect(result).toEqual({ item, position: [1], fields })
		})
	})

	describe('findNearestItemBefore', () => {
		it('should return null if there are no items', () => {
			const current = { item: null, fields, position: [] }
			const result = findNearestItemBefore(current.position, [], fields)
			expect(result).toBeNull()
		})

		it('should return first item', () => {
			const current = { item: null, fields, position: [] }
			const result = findNearestItemBefore(current.position, items, fields)
			expect(result).toEqual({ item: items[0], fields, position: [0] })
		})

		it('should return the previous sibling if it is a leaf', () => {
			const current = {
				item: items[0].nodes[0].nodes[1],
				fields,
				position: [0, 0, 1]
			}
			const result = findNearestItemBefore(current.position, items, fields)
			expect(result).toEqual({
				item: items[0].nodes[0].nodes[0],
				fields,
				position: [0, 0, 0]
			})
		})

		it('should return the parent if the previous sibling is not a leaf and is not open', () => {
			const current = {
				item: items[0].nodes[0].nodes[1].nodes[0],
				fields,
				position: [0, 0, 1, 0]
			}
			const result = findNearestItemBefore(current.position, items, fields)
			expect(result).toEqual({
				item: items[0].nodes[0].nodes[1],
				fields,
				position: [0, 0, 1]
			})
		})

		it('should return the last visible child if the previous sibling is not a leaf and is open', () => {
			const current = { item: items[0].nodes[1], fields, position: [0, 1] }
			const result = findNearestItemBefore(current.position, items, fields)
			expect(result).toEqual({
				item: items[0].nodes[0].nodes[1].nodes[0],
				fields,
				position: [0, 0, 1, 0]
			})
		})

		it('should return the previous sibling if it is not a leaf and is closed', () => {
			const current = { item: items[2], fields, position: [2] }
			const result = findNearestItemBefore(current.position, items, fields)
			expect(result).toEqual({
				item: items[1],
				fields,
				position: [1]
			})
		})
	})

	describe('findNearestItemAfter', () => {
		it('should return null if there are no items', () => {
			const current = { item: null, fields, position: [] }
			const result = findNearestItemAfter(current.position, [], fields)
			expect(result).toBeNull()
		})

		it('should return first item', () => {
			const current = { item: null, fields, position: [] }
			const result = findNearestItemAfter(current.position, items, fields)
			expect(result).toEqual({ item: items[0], fields, position: [0] })
		})

		it('should return first child if it is open', () => {
			const current = {
				item: items[0],
				fields,
				position: [0]
			}
			const result = findNearestItemAfter(current.position, items, fields)
			expect(result).toEqual({
				item: items[0].nodes[0],
				fields,
				position: [0, 0]
			})
		})

		it('should return the next sibling if current is a leaf', () => {
			const current = {
				item: items[0].nodes[1],
				fields,
				position: [0, 1]
			}
			const result = findNearestItemAfter(current.position, items, fields)
			expect(result).toEqual({
				item: items[0].nodes[2],
				fields,
				position: [0, 2]
			})
		})

		it('should return the next sibling if current is closed', () => {
			const current = {
				item: items[1],
				fields,
				position: [1]
			}
			const result = findNearestItemAfter(current.position, items, fields)
			expect(result).toEqual({
				item: items[2],
				fields,
				position: [2]
			})
		})

		it('should return null if current is last', () => {
			const current = { item: items[2], fields, position: [2] }
			let result = findNearestItemAfter(current.position, items, fields)
			expect(result).toBeNull()

			const nodes = [items[0].nodes[0]]
			result = findNearestItemAfter([0, 1, 0], nodes, fields)
			expect(result).toBeNull()
		})

		it('should return the nearest visible parent', () => {
			const current = {
				item: items[0].nodes[0].nodes[1].nodes[0],
				fields,
				position: [0, 0, 1, 0]
			}
			const result = findNearestItemAfter(current.position, items, fields)
			expect(result).toEqual({
				item: items[0].nodes[1],
				fields,
				position: [0, 1]
			})
		})
	})

	describe('mappedList', () => {
		const value = items[0].nodes[1]
		const ml = mappedList(items, fields)

		it('should find by value', () => {
			let item = ml.findByValue(value)
			expect(item).toEqual({
				item: items[0].nodes[1],
				fields,
				position: [0, 1]
			})
		})

		it('should find by value of attribute', () => {
			let item = ml.findByAttribute(value.text, 'text')
			expect(item).toEqual({
				item: items[0].nodes[1],
				fields,
				position: [0, 1]
			})
		})

		it('should find by index array', () => {
			let item = ml.findByIndexArray([0, 1])
			expect(item).toEqual({ item: value, fields, position: [0, 1] })
		})

		it('should find previous visible child', () => {
			let item = ml.previous([0, 1])
			expect(item).toEqual({
				item: items[0].nodes[0].nodes[1].nodes[0],
				fields,
				position: [0, 0, 1, 0]
			})
		})

		it('should find next visible child', () => {
			let item = ml.next([0, 1])
			expect(item).toEqual({
				item: items[0].nodes[2],
				fields,
				position: [0, 2]
			})
		})

		it('should update items', () => {
			const newItems = [{ value: 'foo' }]
			const newFields = { children: 'children' }
			ml.update(newItems, newFields)
			expect(ml.findByValue({ value: 'foo' })).toEqual({
				item: { value: 'foo' },
				fields: newFields,
				position: [0]
			})
		})
	})
})
