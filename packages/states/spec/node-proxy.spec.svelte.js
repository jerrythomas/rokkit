import { describe, it, expect, beforeEach } from 'vitest'
import { NodeProxy } from '../src/node-proxy.svelte.js'
import { defaultFields } from '@rokkit/core'

describe('NodeProxy', () => {
	let data = $state([])

	beforeEach(() => {
		// Sample state array with data
		data = [
			{
				id: 1,
				text: 'Item 1',
				value: 'item-1',
				icon: 'folder'
			},
			{
				id: 2,
				text: 'Parent Item',
				children: [
					{ id: 3, text: 'Child 1' },
					{ id: 4, text: 'Child 2' }
				],
				isOpen: false
			}
		]
	})

	it('should create a node proxy with correct properties', () => {
		const node = new NodeProxy(data[0], [0])

		expect(node.path).toEqual([0])
		expect(node.depth).toBe(0)
		expect(node.id).toBe('1')
		expect(node.expanded).toBe(false)
		expect(node.selected).toBe(false)
		expect(node.focused).toBe(false)
		expect(node.parent).toBe(null)
	})

	it('should create a unique id from path when id field is not available', () => {
		const itemWithoutId = { text: 'No ID Item' }
		const node = new NodeProxy(itemWithoutId, [1, 2])

		expect(node.id).toBe('1-2')
	})
	it('should handle custom mapping', () => {
		const fields = { text: 'name', icon: 'type', id: 'key' }
		const data = $state([
			{ key: 'id-1', name: 'Item 1', type: 'folder', value: 'item-1' },
			{ key: 'id-2', name: 'Item 2', type: 'file', value: 'item-2' }
		])
		const node = new NodeProxy(data[0], [0], fields)
		expect(node.id).toBe('id-1')
		expect(node.text).toBe('Item 1')
		expect(node.icon).toBe('folder')
		expect(node.value).toBe(data[0])
		expect(node.fields.fields).toBeUndefined()

		node.addChild({ name: 'item 1.1' })
		expect(node.children.length).toBe(1)
		expect(node.children[0].fields).toEqual(node.fields)

		node.fields.fields = { text: 'proxy' }

		node.addChild({ proxy: 'item 1.2' })
		expect(node.children.length).toBe(2)
		expect(node.children[0].fields).toEqual({ ...defaultFields, text: 'proxy' })
		expect(node.children[1].fields).toEqual({ ...defaultFields, text: 'proxy' })

		expect(node.children[0].get('text')).toBeNull()
		expect(node.children[1].get('text')).toEqual('item 1.2')
	})

	it('should properly get mapped attributes', () => {
		const node = new NodeProxy(data[0], [0])

		expect(node.text).toBe('Item 1')
		expect(node.icon).toBe('folder')
		expect(node.value).toBe(data[0])
	})

	it('should properly get attributes via get method', () => {
		const node = new NodeProxy(data[0], [0])

		expect(node.get('text')).toBe('Item 1')
		expect(node.get('icon')).toBe('folder')
		expect(node.get('value')).toBe('item-1')
		expect(node.get('nonexistent')).toBe(null)
	})

	it('should modify original data in place when value is updated', () => {
		const node = new NodeProxy(data[0], [0])

		expect(data[0].text).toBe('Item 1')

		node.value.text = 'Updated Item 1'
		expect(data[0].text).toBe('Updated Item 1')

		expect(node.text).toBe('Updated Item 1')
	})

	it('should update original object when node.value is set', () => {
		const node = new NodeProxy(data[0], [0])
		const newItem = { id: 1, text: 'Replaced Item', value: 'replaced' }

		// Replace entire object
		node.value = newItem

		// Check if node reference is updated
		expect(node.value).toBe(data[0])
		expect(data[0]).toEqual(newItem)
	})

	it('should detect children correctly', () => {
		const parentNode = new NodeProxy(data[1], [1])
		expect(parentNode.hasChildren()).toBe(true)
		expect(parentNode.children[0].hasChildren()).toBe(false)
		expect(parentNode.isLeaf()).toBe(false)
		expect(parentNode.children[0].isLeaf()).toBe(true)
	})

	it('should toggle expanded state', () => {
		const node = new NodeProxy(data[1], [1])

		expect(node.expanded).toBe(false)

		node.toggle()
		expect(node.expanded).toBe(true)

		node.toggle()
		expect(node.expanded).toBe(false)
	})

	it('should get path and key', () => {
		const node = new NodeProxy({ text: 'hello', _selected: true }, [2, 3, 1])

		expect(node.getPath()).toEqual([2, 3, 1])
		expect(node.id).toBe('2-3-1')
		expect(node.selected).toBe(true)
	})

	it('should format text using default formatter', () => {
		const node = new NodeProxy({ text: 1 }, [0])
		expect(node.formattedText()).toBe('1')

		const nilNode = new NodeProxy(null, [])
		expect(nilNode.formattedText()).toBe('')
	})
	it('should format text using a formatter function', () => {
		const node = new NodeProxy(data[0], [0])
		const formatter = (text) => text.toUpperCase()

		expect(node.formattedText(formatter)).toBe('ITEM 1')

		const nilNode = new NodeProxy(null, [])
		expect(nilNode.formattedText(formatter)).toBe('')
	})

	it('should update children correctly', () => {
		const parentNode = new NodeProxy(data[1], [1])
		expect(parentNode.children.length).toEqual(2)
		expect(parentNode.children[0].value).toEqual(data[1].children[0])
		expect(parentNode.children[1].value).toEqual(data[1].children[1])

		parentNode.children[0].value = { children: [{ id: '3-0', text: 'Item 3.1' }] }
		expect(parentNode.children[0].children.length).toEqual(1)
		expect(parentNode.children[0].value).toEqual(data[1].children[0])
		expect(data[1].children[0].children).toEqual([{ id: '3-0', text: 'Item 3.1' }])
	})

	it('should remove a child data correctly', () => {
		const parentNode = new NodeProxy(data[1], [1])
		expect(parentNode.children.length).toEqual(2)
		let result = parentNode.removeChild(-1)
		expect(result).toBeNull()
		result = parentNode.removeChild(2)
		expect(result).toBeNull()
		result = parentNode.children[0].removeChild(0)
		expect(result).toBeNull()
		expect(parentNode.children.length).toEqual(2)
		result = parentNode.removeChild(0)
		expect(result).toEqual({ id: 3, text: 'Child 1' })
		expect(parentNode.children.length).toEqual(1)

		expect(data[1].children.length).toBe(1)
		expect(data[1].children).toEqual([{ id: 4, text: 'Child 2' }])
	})

	it('should add a child data correctly', () => {
		const parentNode = new NodeProxy(data[1], [1])
		expect(parentNode.children.length).toEqual(2)

		parentNode.addChild({ id: 5 }, 0)
		expect(parentNode.children.length).toEqual(3)
		expect(data[1].children.length).toBe(3)
		expect(data[1].children[0]).toEqual({ id: 5 })

		parentNode.addChild({ id: 6, text: 'Child 3' }, 1)
		expect(parentNode.children.length).toEqual(4)
		expect(data[1].children.length).toBe(4)
		expect(data[1].children[0]).toEqual({ id: 5 })
		expect(data[1].children[1]).toEqual({ id: 6, text: 'Child 3' })
	})

	it('should find a node matching a condition', () => {
		const parentNode = new NodeProxy(data[1], [1])
		expect(parentNode.find((node) => node.value.id === 3)).toBe(parentNode.children[0])
		expect(parentNode.find((node) => node.value.id === 7)).toBeNull()
	})
})
