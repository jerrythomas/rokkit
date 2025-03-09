import { describe, it, expect } from 'vitest'
import { filterTree } from '../src/tree-filter.svelte'
import { Node } from '../src/node'
import { FieldMapper } from '@rokkit/core'

describe('filterTree', () => {
	let mapper = null

	const testData = [
		{
			id: 1,
			text: 'Apple',
			children: [
				{
					id: 2,
					text: 'Banana',
					children: []
				},
				{
					id: 3,
					text: 'Cherry',
					children: [
						{
							id: 4,
							text: 'Dragon fruit'
						}
					]
				}
			]
		},
		{
			id: 5,
			text: 'Elderberry',
			children: [
				{
					id: 6,
					text: 'Fig'
				}
			]
		}
	]

	beforeEach(() => {
		mapper = new FieldMapper()
	})

	it('should filter nodes based on predicate', () => {
		const nodes = testData.map((item) => new Node(item, mapper))
		const filtered = filterTree(nodes, (node) => node.text === 'Apple', mapper)

		expect(filtered.length).toBe(1)
		expect(filtered[0].text).toBe('Apple')
		// Original children structure is maintained
		expect(filtered[0].children.length).toBe(2)
	})

	it('should include parent when child matches', () => {
		const nodes = testData.map((item) => new Node(item, mapper))
		const filtered = filterTree(nodes, (node) => node.text === 'Dragon fruit', mapper)

		expect(filtered.length).toBe(1)
		expect(filtered[0].text).toBe('Apple')
		expect(filtered[0].children[0].children[0].text).toBe('Dragon fruit')
	})

	it('should exclude non-matching branches', () => {
		const nodes = testData.map((item) => new Node(item, mapper))
		const filtered = filterTree(
			nodes,
			(node) => ['Apple', 'Cherry', 'Dragon fruit'].includes(node.text),
			mapper
		)

		expect(filtered.length).toBe(1)
		expect(filtered[0].children.length).toBe(2) // Only Cherry branch
		expect(filtered[0].children[1].text).toBe('Cherry')
	})

	it('should handle empty results', () => {
		const nodes = testData.map((item) => new Node(item, mapper))
		const filtered = filterTree(nodes, (node) => node.text === 'Not Found', mapper)

		expect(filtered.length).toBe(0)
	})

	it('should maintain node instances', () => {
		const nodes = testData.map((item) => new Node(item, mapper))
		const filtered = filterTree(nodes, (node) => node.text === 'Apple', mapper)

		expect(filtered[0]).toBeInstanceOf(Node)
		expect(filtered[0].children[0]).toBeInstanceOf(Node)
	})
})
