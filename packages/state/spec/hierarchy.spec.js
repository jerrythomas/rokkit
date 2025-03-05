import { describe, it, expect } from 'vitest'
import { flatHierarchy } from '../src/hierarchy'
import { FieldMapper } from '@rokkit/core'

describe('hierarchy', () => {
	describe('flatHierarchy', () => {
		const defaultMapping = new FieldMapper()
		it('should convert a hierarchy of items into a flat array of objects', () => {
			const items = [
				{ id: 1, name: 'Item 1', children: [{ id: 2, name: 'Item 2' }] },
				{ id: 3, name: 'Item 3' }
			]

			const actual = flatHierarchy(items, defaultMapping)
			const expected = [
				{ depth: 0, path: [0], parent: null, item: items[0] },
				{ depth: 1, path: [0, 0], item: items[0].children[0] },
				{ depth: 0, path: [1], parent: null, item: items[1] }
			]
			expected[1].parent = expected[0]
			expect(actual).toEqual(expected)
		})

		it('should handle empty input', () => {
			const items = []
			const actual = flatHierarchy(items, defaultMapping)
			expect(actual).toEqual([])
		})

		it('should handle items with no children', () => {
			const items = [{ id: 1, name: 'Item 1' }]
			const actual = flatHierarchy(items, defaultMapping)
			expect(actual).toEqual([{ depth: 0, path: [0], parent: null, item: items[0] }])
		})

		it('should handle custom children field', () => {
			const items = [{ id: 1, name: 'Item 1', customChildren: [{ id: 2, name: 'Item 2' }] }]
			const mapping = new FieldMapper()
			mapping.fields = {
				children: 'customChildren'
			}
			const actual = flatHierarchy(items, mapping)
			const expected = [
				{ depth: 0, path: [0], parent: null, item: items[0] },
				{ depth: 1, path: [0, 0], item: items[0].customChildren[0] }
			]
			expected[1].parent = expected[0]
			expect(actual).toEqual(expected)
		})
	})
})
