import { describe, it, expect } from 'vitest'
import { addRootNode } from '../../src/lib'

describe('addRootNode', () => {
	it('should return empty array if items is empty', () => {
		expect(addRootNode([])).toEqual([])
	})
	it('should return items if items.length === 1', () => {
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
	it('should return items wrapped in root node with custom root and custom fields', () => {
		const items = [{ label: 'a' }, { label: 'b' }]
		expect(
			addRootNode(items, 'root', {
				text: 'label',
				isOpen: 'open',
				children: 'nodes'
			})
		).toEqual([
			{
				label: 'root',
				open: true,
				nodes: items
			}
		])
	})
})
