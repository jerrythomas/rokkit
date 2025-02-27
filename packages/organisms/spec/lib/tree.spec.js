import { describe, it, expect } from 'vitest'
import { addRootNode } from '../../src/lib'
import { FieldMapper } from '@rokkit/core'

describe('addRootNode', () => {
	it('should return empty array if items is empty', () => {
		expect(addRootNode([])).toEqual([])
	})
	it('should return items if items.length is 1', () => {
		expect(addRootNode(['a'])).toEqual(['a'])
	})
	it('should return items wrapped in root node if items.length > 1', () => {
		const items = [{ text: 'a' }, { text: 'b' }]
		expect(addRootNode(items)).toEqual([
			{
				text: '/',
				_open: true,
				children: items
			}
		])
	})
	it('should return items wrapped in root node with custom root', () => {
		const items = [{ text: 'a' }, { text: 'b' }]

		expect(addRootNode(items, 'root')).toEqual([
			{
				text: 'root',
				_open: true,
				children: items
			}
		])
	})

	it('should return items wrapped in root node with custom mapping', () => {
		const items = [{ label: 'a' }, { label: 'b' }]
		const mapping = new FieldMapper({
			text: 'label',
			isOpen: 'open',
			children: 'nodes'
		})
		expect(addRootNode(items, 'root', mapping)).toEqual([
			{
				label: 'root',
				open: true,
				nodes: items
			}
		])
	})
})
