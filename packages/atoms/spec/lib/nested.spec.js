import { describe, expect, it } from 'vitest'
import { flattenNestedList, findValueFromPath } from '../../src/lib/nested'
import { defaultFields } from '../../src/lib/constants'

describe('flattenNestedList', () => {
	it('should flatten nested items', () => {
		const items = [
			{
				id: 1,
				children: [
					{
						id: 2,
						children: [
							{
								id: 3,
								children: []
							}
						]
					}
				]
			},
			{
				id: 4
			}
		]

		const result = flattenNestedList(items)

		expect(result).toEqual([
			{
				id: 1,
				level: 0,
				parent: true
			},
			{
				id: 2,
				level: 1,
				parent: true
			},
			{
				id: 3,
				level: 2,
				parent: false
			},
			{
				id: 4,
				level: 0,
				parent: false
			}
		])
	})

	it('should flatten nested items with custom fields', () => {
		const items = [
			{
				id: 1,
				sub: [
					{
						id: 2,
						sub: [
							{
								id: 3,
								sub: []
							}
						]
					}
				]
			}
		]

		const fields = {
			children: 'sub',
			level: 'depth',
			parent: 'isParent'
		}

		const result = flattenNestedList(items, fields)

		expect(result).toEqual([
			{
				id: 1,
				depth: 0,
				isParent: true
			},
			{
				id: 2,
				depth: 1,
				isParent: true
			},
			{
				id: 3,
				depth: 2,
				isParent: false
			}
		])
	})
})

describe('findValueFromPath', () => {
	it('should find and return the correct value from the provided path', () => {
		const slug = 'category/subcategory/item'
		const data = [
			{
				key: 'category',
				isOpen: false,
				children: [
					{
						key: 'subcategory',
						isOpen: false,
						children: [
							{
								key: 'item',
								value: 'Item Value'
							}
						]
					}
				]
			}
		]

		const expectedResult = {
			key: 'item',
			value: 'Item Value'
		}

		const result = findValueFromPath(slug, data, { key: 'key' })
		expect(result).toEqual(expectedResult)
	})

	it('should return null if the path does not exist in the data', () => {
		const slug = 'nonexistent/path'
		const data = [
			{
				key: 'category',
				isOpen: false,
				children: [
					{
						key: 'subcategory',
						isOpen: false,
						children: [
							{
								key: 'item',
								value: 'Item Value'
							}
						]
					}
				]
			}
		]

		const result = findValueFromPath(slug, data, defaultFields)
		expect(result).toBeNull()
	})
})
