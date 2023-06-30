import { describe, it, expect } from 'vitest'
import {
	hasChildren,
	isExpanded,
	isNested,
	navigateToLastVisibleChild,
	moveNext,
	movePrevious,
	pathFromIndices,
	findItem
} from '../../src/actions/hierarchy'

describe('Hierarchy', () => {
	const fields = {
		isOpen: 'isOpen',
		children: 'children'
	}
	const items = [
		{
			name: 'item1',
			isOpen: true,
			children: [
				{ name: 'item2-1' },
				{
					name: 'item2-2',
					isOpen: true,
					children: [{ name: 'item2-2-1' }, { name: 'item2-2-2' }]
				}
			]
		},
		{
			name: 'item2',
			isOpen: true,
			children: [
				{ name: 'item2-1' },
				{ name: 'item2-2' },
				{
					name: 'item2-3',
					isOpen: true,
					children: [{ name: 'item2-3-1' }, { name: 'item2-3-2' }]
				}
			]
		},
		{ name: 'item3' }
	]
	describe('hasChildren', () => {
		it('should return false if item is not an object', () => {
			expect(hasChildren(undefined, fields)).toBe(false)
		})
		it('should return false if it does not have the children attribute', () => {
			expect(hasChildren({}, fields)).toBe(false)
		})
		it('should return false if children is not an array', () => {
			expect(hasChildren({ children: null }, fields)).toBe(false)
		})
		it('should return true if children is an array', () => {
			expect(hasChildren({ children: [] }, fields)).toBe(true)
		})
	})

	describe('isExpanded', () => {
		it('returns true if the item is expanded', () => {
			const item = {
				isOpen: true,
				children: []
			}

			expect(isExpanded(item, fields)).toBe(true)
		})

		it('returns false if the item is not expanded', () => {
			const item = {
				isOpen: false,
				children: []
			}

			expect(isExpanded(item, fields)).toBe(false)
		})

		it('returns false if the item does not have the isOpen field', () => {
			expect(isExpanded({ children: [] }, fields)).toBe(false)
		})
		it('returns false if the item does not have the children field', () => {
			expect(isExpanded({}, fields)).toBe(false)
		})
		it('returns false if the children field is not an array', () => {
			expect(isExpanded({ children: '' }, fields)).toBe(false)
		})
		it('returns false if the item is not an object', () => {
			expect(isExpanded('', fields)).toBe(false)
			expect(isExpanded(null, fields)).toBe(false)
		})
	})

	describe('isNested', () => {
		it('returns true if the item is nested', () => {
			expect(isNested([{ children: [] }], fields)).toBe(true)
			expect(isNested(['?', { children: [] }], fields)).toBe(true)
		})

		it('returns false if the item is not nested', () => {
			expect(isNested([], fields)).toBe(false)
		})
	})
	describe('findItem', () => {
		const items = [
			{
				id: 1,
				isOpen: true,
				children: [
					{
						id: 11,
						isOpen: true,
						children: [{ id: 111, isOpen: false, children: [] }]
					}
				]
			},
			{ id: 2, isOpen: false, children: [] }
		]
		it('find item in items using indices', () => {
			let result = findItem(items, [0, 0], fields)
			expect(result).toEqual(items[0].children[0])
			result = findItem(items, [0, 0, 0], fields)
			expect(result).toEqual(items[0].children[0].children[0])
			result = findItem(items, [1], fields)
			expect(result).toEqual(items[1])
		})
	})
	describe('navigateToLastVisibleChild', () => {
		it('should navigate to last visible child node', () => {
			const items = [
				{
					id: 1,
					isOpen: true,
					children: [
						{
							id: 11,
							isOpen: true,
							children: [{ id: 111, isOpen: false, children: [] }]
						}
					]
				},
				{ id: 2, isOpen: false, children: [] }
			]
			let path = [{ index: 0, items, fields }]
			const expectedPath = [
				{ index: 0, items, fields },
				{ index: 0, items: items[0].children, fields },
				{ index: 0, items: items[0].children[0].children, fields }
			]

			path = navigateToLastVisibleChild(path)
			expect(path.length).toEqual(3)
			expect(path).toEqual(expectedPath)
		})

		it('handles case where node has no children', () => {
			const items = [
				{ id: 1, isOpen: false, children: [] },
				{ id: 2, isOpen: false, children: [] }
			]
			const path = navigateToLastVisibleChild([{ index: 0, items, fields }])

			expect(path).toEqual([{ index: 0, items, fields }])
		})

		it('handles case where node is not expanded', () => {
			const items = [
				{
					id: 1,
					isOpen: false,
					children: [{ id: 11, isOpen: false, children: [] }]
				},
				{ id: 2, isOpen: false, children: [] }
			]
			const path = navigateToLastVisibleChild([{ index: 0, items, fields }])

			expect(path).toEqual([{ index: 0, items, fields }])
		})
	})

	describe('moveDown', () => {
		const items = [
			{ name: 'item1' },
			{
				name: 'item2',
				isOpen: true,
				children: [
					{ name: 'item2-1' },
					{ name: 'item2-2' },
					{
						name: 'item2-3',
						isOpen: true,
						children: [{ name: 'item2-3-1' }, { name: 'item2-3-2' }]
					}
				]
			},
			{ name: 'item3' }
		]

		it('should move to first node when path is empty', () => {
			const path = moveNext([], items, fields)
			expect(path).toEqual([{ index: 0, items, fields }])
		})
		it('should move to the first child when the current node is expanded', () => {
			const path = [
				{ index: 1, items, fields },
				{ index: 2, items: items[1].children, fields }
			]
			expect(moveNext(path)).toEqual([
				{ index: 1, items, fields },
				{ index: 2, items: items[1].children, fields },
				{ index: 0, items: items[1].children[2].children, fields }
			])
		})

		it('should move to the next sibling when the current node is not expanded and not the last node', () => {
			const path = [
				{ index: 1, items, fields },
				{ index: 1, items: items[1].children, fields }
			]
			expect(moveNext(path)).toEqual([
				{ index: 1, items, fields },
				{ index: 2, items: items[1].children, fields }
			])
		})

		it('should move to the parent of next sibling when the current node is the last child', () => {
			const path = [
				{ index: 1, items, fields },
				{ index: 2, items: items[1].children, fields },
				{ index: 1, items: items[1].children[2].children, fields }
			]
			expect(moveNext(path)).toEqual([{ index: 2, items, fields }])
		})
	})

	describe('moveUp', () => {
		it('should navigate to the previous sibling if the current item is not the first item and its previous sibling is not expanded', () => {
			const path = movePrevious([
				{ index: 1, items, fields },
				{ index: 1, items: items[1].children, fields }
			])

			expect(path.length).toEqual(2)
			expect(path[0]).toEqual({ index: 1, items, fields })
			expect(path[1]).toEqual({ index: 0, items: items[1].children, fields })
		})

		it('should navigate to the last visible child of the previous sibling if the current item is not the first item and its previous sibling is expanded', () => {
			const path = movePrevious([{ index: 1, items, fields }])
			// path.map((f) => console.log(f))

			expect(path.length).toEqual(3)
			expect(path[0]).toEqual({ index: 0, items, fields })
			expect(path[1]).toEqual({ index: 1, items: items[0].children, fields })
			expect(path[2]).toEqual({
				index: 1,
				items: items[0].children[1].children,
				fields
			})
		})

		it('should navigate to the parent node, if the current item is the first item', () => {
			let path = movePrevious([
				{ index: 0, items, fields },
				{ index: 0, items: items[0].children, fields }
			])
			expect(path.length).toEqual(1)
			expect(path[0]).toEqual({ index: 0, items, fields })

			path = movePrevious([
				{ index: 1, items, fields },
				{ index: 0, items: items[1].children, fields }
			])
			expect(path.length).toEqual(1)
			expect(path[0]).toEqual({ index: 1, items, fields })

			path = movePrevious([
				{ index: 1, items, fields },
				{ index: 2, items: items[1].children, fields },
				{ index: 0, items: items[1].children[2].children, fields }
			])
			expect(path.length).toEqual(2)
			expect(path[0]).toEqual({ index: 1, items, fields })
			expect(path[1]).toEqual({ index: 2, items: items[1].children, fields })
		})

		it('should return empty array at topmost node', () => {
			const path = movePrevious([{ index: 0, items, fields }])
			expect(path).toEqual([{ index: 0, items, fields }])
			expect(movePrevious([])).toEqual([])
		})
	})

	describe('pathFromIndices', () => {
		it('should convert an array of indices to path array', () => {
			let path = pathFromIndices([0], items, fields)
			expect(path.length).toEqual(1)
			expect(path).toEqual([{ index: 0, items, fields }])

			path = pathFromIndices([0, 1], items, fields)
			expect(path.length).toEqual(2)
			expect(path).toEqual([
				{ index: 0, items, fields },
				{ index: 1, items: items[0].children, fields }
			])
		})
	})
})
