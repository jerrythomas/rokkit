import { describe, expect, it } from 'vitest'
import { flattenNestedList } from './nested'

describe('flattenNestedList', () => {
	it('should flatten nested items', () => {
		const items = [
			{
				id: 1,
				data: [
					{
						id: 2,
						data: [
							{
								id: 3,
								data: []
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
