import { describe, it, expect, beforeEach } from 'vitest'
import { pick } from 'ramda'
import {
	removeChildren,
	flattenNestedChildren,
	hierarchicalFilter,
	deriveHierarchy
} from '../src/hierarchy'

describe('hierarchy', () => {
	describe('removeChildren', () => {
		it('should remove objects with parent attribute not null', () => {
			const arr = [
				{ name: 'Object 1' },
				{ name: 'Object 2', parent: { name: 'Parent Object' } },
				{ name: 'Object 3' }
			]

			removeChildren(arr)

			expect(arr.length).toBe(2)
			expect(arr).toEqual([{ name: 'Object 1' }, { name: 'Object 3' }])
		})

		it('should not modify the array if all objects have parent attribute as null', () => {
			const arr = [
				{ name: 'Object 1', parent: null },
				{ name: 'Object 2', parent: null },
				{ name: 'Object 3', parent: null }
			]

			removeChildren(arr)

			expect(arr.length).toBe(3)
			expect(arr).toEqual([
				{ name: 'Object 1', parent: null },
				{ name: 'Object 2', parent: null },
				{ name: 'Object 3', parent: null }
			])
		})
	})

	describe('flattenNestedChildren', () => {
		it('should flatten nested children arrays', () => {
			const arr = [
				{
					name: 'Parent 1',
					children: [
						{ name: 'Child 1', children: [{ name: 'Grand Child 1' }] },
						{ name: 'Child 2' }
					]
				},
				{ name: 'Parent 2', children: [{ name: 'Child 3' }, { name: 'Child 4' }] },
				{ name: 'Parent 3', children: [{ name: 'Child 5' }, { name: 'Child 6' }] }
			]

			flattenNestedChildren(arr)

			expect(arr.length).toBe(10)
			expect(arr).toEqual([
				{
					name: 'Parent 1',
					children: [
						{ name: 'Child 1', children: [{ name: 'Grand Child 1' }] },
						{ name: 'Child 2' }
					]
				},
				{ name: 'Child 1', children: [{ name: 'Grand Child 1' }] },
				{ name: 'Grand Child 1' },
				{ name: 'Child 2' },
				{ name: 'Parent 2', children: [{ name: 'Child 3' }, { name: 'Child 4' }] },
				{ name: 'Child 3' },
				{ name: 'Child 4' },
				{ name: 'Parent 3', children: [{ name: 'Child 5' }, { name: 'Child 6' }] },
				{ name: 'Child 5' },
				{ name: 'Child 6' }
			])
		})

		it('should handle arrays with no children', () => {
			const arr = [{ name: 'Parent 1' }, { name: 'Parent 2' }, { name: 'Parent 3' }]

			flattenNestedChildren(arr)

			expect(arr.length).toBe(3)
			expect(arr).toEqual([{ name: 'Parent 1' }, { name: 'Parent 2' }, { name: 'Parent 3' }])
		})
	})

	describe('hierarchicalFilter', () => {
		let nestedArray = null

		beforeEach(() => {
			nestedArray = [
				{ name: 'Parent 1' },
				{ name: 'Child 1' },
				{ name: 'Child 2' },
				{ name: 'Grand Child 2.1' },
				{ name: 'Parent 2' },
				{ name: 'Child 3' },
				{ name: 'Child 4' }
			]
			nestedArray[1].parent = nestedArray[0]
			nestedArray[2].parent = nestedArray[0]
			nestedArray[3].parent = nestedArray[2]
			nestedArray[5].parent = nestedArray[4]
			nestedArray[6].parent = nestedArray[4]
		})

		it('should update parent flags correctly', () => {
			const filterFn = (item) => item.name === 'Child 3'

			hierarchicalFilter(nestedArray, filterFn)

			expect(
				nestedArray.map((item) => pick(['name', 'excluded', 'retainedByChild'], item))
			).toEqual([
				{ name: 'Parent 1', excluded: true },
				{ name: 'Child 1', excluded: true },
				{ name: 'Child 2', excluded: true },
				{ name: 'Grand Child 2.1', excluded: true },
				{ name: 'Parent 2', excluded: false, retainedByChild: true },
				{ name: 'Child 3', excluded: false },
				{ name: 'Child 4', excluded: true }
			])
		})

		it('should update parent flags correctly', () => {
			const filterFn = (item) => item.name === 'Grand Child 2.1'

			hierarchicalFilter(nestedArray, filterFn)

			expect(
				nestedArray.map((item) => pick(['name', 'excluded', 'retainedByChild'], item))
			).toEqual([
				{ name: 'Parent 1', excluded: false, retainedByChild: true },
				{ name: 'Child 1', excluded: true },
				{ name: 'Child 2', excluded: false, retainedByChild: true },
				{ name: 'Grand Child 2.1', excluded: false },
				{ name: 'Parent 2', excluded: true },
				{ name: 'Child 3', excluded: true },
				{ name: 'Child 4', excluded: true }
			])
		})

		it('should handle arrays with no parent', () => {
			const arr = [
				{ name: 'Object 1', parent: null },
				{ name: 'Object 2', parent: null },
				{ name: 'Object 3', parent: null }
			]

			// Mock filter function
			const filterFn = (item) => item.name !== 'Object 1'

			hierarchicalFilter(arr, filterFn)

			expect(arr[0].excluded).toBe(true)
			expect(arr[1].excluded).toBe(false)
			expect(arr[2].excluded).toBe(false)

			expect(arr[0].retainedByChild).toBeUndefined()
			expect(arr[1].retainedByChild).toBeUndefined()
			expect(arr[2].retainedByChild).toBeUndefined()
		})
	})

	describe('deriveHierarchy', () => {
		const data = [
			{ id: 1, route: '/fruits' },
			{ id: 2, route: '/fruits/apple' },
			{ id: 3, route: '/fruits/banana' }
		]

		it('should derive hierarchy from data', () => {
			const result = deriveHierarchy(data)
			expect(result).toEqual([
				{ depth: 0, row: data[0] },
				{ depth: 0, row: data[1] },
				{ depth: 0, row: data[2] }
			])
		})

		it('should derive hierarchy from data with a custom path', () => {
			const expected = [
				{
					depth: 1,
					isExpanded: false,
					isParent: true,
					isHidden: false,
					path: '/fruits',
					value: 'fruits',
					row: data[0]
				},
				{
					depth: 2,
					children: [],
					isParent: false,
					isHidden: true,
					path: '/fruits/apple',
					value: 'apple',
					row: data[1]
				},
				{
					depth: 2,
					children: [],
					isParent: false,
					isHidden: true,
					path: '/fruits/banana',
					value: 'banana',
					row: data[2]
				}
			]
			expected[0].children = [expected[1], expected[2]]
			expected[1].parent = expected[0]
			expected[2].parent = expected[0]

			const result = deriveHierarchy(data, { path: 'route' })
			expect(result).toEqual(expected)
		})

		it('should derive hierarchy where root is empty', () => {
			const data = [
				{ id: 1, route: '/' },
				{ id: 2, route: '/apple' },
				{ id: 3, route: '/banana' }
			]
			const expected = [
				{
					depth: 0,
					isExpanded: false,
					isParent: true,
					isHidden: false,
					path: '/',
					value: '',
					row: data[0]
				},
				{
					depth: 1,
					children: [],
					isParent: false,
					isHidden: true,
					path: '/apple',
					value: 'apple',
					row: data[1]
				},
				{
					depth: 1,
					children: [],
					isParent: false,
					isHidden: true,
					path: '/banana',
					value: 'banana',
					row: data[2]
				}
			]
			expected[0].children = [expected[1], expected[2]]
			expected[1].parent = expected[0]
			expected[2].parent = expected[0]

			const result = deriveHierarchy(data, { path: 'route' })
			expect(result).toEqual(expected)
		})

		it('should derive hierarchy from data with a custom path and separator', () => {
			const input = data.map((x) => ({ ...x, route: x.route.replace(/\//g, '-').slice(1) }))

			const expected = [
				{
					depth: 1,
					isExpanded: false,
					isParent: true,
					isHidden: false,
					path: 'fruits',
					value: 'fruits',
					row: input[0]
				},
				{
					depth: 2,
					children: [],
					isParent: false,
					isHidden: true,
					path: 'fruits-apple',
					value: 'apple',
					row: input[1]
				},
				{
					depth: 2,
					children: [],
					isParent: false,
					isHidden: true,
					path: 'fruits-banana',
					value: 'banana',
					row: input[2]
				}
			]
			expected[0].children = [expected[1], expected[2]]
			expected[1].parent = expected[0]
			expected[2].parent = expected[0]

			const result = deriveHierarchy(input, { path: 'route', separator: '-' })
			expect(result).toEqual(expected)
		})

		it('should mark all parents as expanded', () => {
			const expected = [
				{
					depth: 1,
					row: data[0],
					isExpanded: true,
					isParent: true,
					isHidden: false,
					path: '/fruits',
					value: 'fruits'
				},
				{
					depth: 2,
					row: data[1],
					children: [],
					isParent: false,
					isHidden: false,
					path: '/fruits/apple',
					value: 'apple'
				},
				{
					depth: 2,
					row: data[2],
					children: [],
					isParent: false,
					isHidden: false,
					path: '/fruits/banana',
					value: 'banana'
				}
			]
			expected[0].children = [expected[1], expected[2]]
			expected[1].parent = expected[0]
			expected[2].parent = expected[0]

			const result = deriveHierarchy(data, { path: 'route', expanded: true })
			expect(result).toEqual(expected)
		})
	})
})
