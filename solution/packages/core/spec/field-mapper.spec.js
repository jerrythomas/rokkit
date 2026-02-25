import { describe, it, expect } from 'vitest'
import { FieldMapper } from '../src/field-mapper'

describe('FieldMapper', () => {
	const data = {
		id: 1,
		text: 'Item 1',
		value: 'Item 1',
		_open: true,
		children: [
			{
				id: 2,
				text: 'Item 2',
				value: 'Item 2',
				children: [
					{
						id: 3,
						text: 'Item 3',
						value: 'Item 3'
					}
				]
			}
		]
	}

	describe('attributes', () => {
		it('should return an icon', () => {
			const fieldMapping = new FieldMapper()

			const data = { icon: { opened: 'folder-opened', closed: 'folder-closed' }, state: 'opened' }
			expect(fieldMapping.getIcon(data)).toEqual('folder-opened')
			data.state = 'closed'
			expect(fieldMapping.getIcon(data)).toEqual('folder-closed')
			data.icon = 'bunny'
			expect(fieldMapping.getIcon(data)).toEqual('bunny')
			fieldMapping.fields = { iconPrefix: 'fa' }
			expect(fieldMapping.getIcon(data)).toEqual('fa-bunny')

			expect(fieldMapping.getIcon(null)).toEqual(null)
		})

		it('should return an image', () => {
			const fieldMapping = new FieldMapper()
			expect(fieldMapping.get('image', null)).toEqual(null)
			expect(fieldMapping.get('image', 'x')).toEqual(null)
			expect(fieldMapping.get('image', {})).toEqual(null)
			expect(fieldMapping.get('image', { image: null })).toEqual(null)
			expect(fieldMapping.get('image', { image: 'x' })).toEqual('x')
		})

		it('should return the text', () => {
			const fieldMapping = new FieldMapper()
			expect(fieldMapping.get('text', 'hello')).toEqual('hello')
			expect(fieldMapping.get('text', 1)).toEqual(1)
			expect(fieldMapping.get('text', data)).toEqual('Item 1')
			expect(fieldMapping.get('text', data.children[0])).toEqual('Item 2')
			expect(fieldMapping.get('text', data.children[0].children[0])).toEqual('Item 3')
			expect(fieldMapping.get('text', data.children[0].children[0])).toEqual('Item 3')
		})

		it('should return the value', () => {
			const fieldMapping = new FieldMapper()
			expect(fieldMapping.getValue(data)).toEqual('Item 1')
			expect(fieldMapping.getValue(null)).toEqual(null)
			expect(fieldMapping.getValue('hello')).toEqual('hello')
			expect(fieldMapping.getValue({ k: 'hello' })).toEqual({ k: 'hello' })
			expect(fieldMapping.get('value', 'hello')).toBeNull()
			expect(fieldMapping.get('value', { k: 'hello' })).toBeNull()
		})

		it('should return the label', () => {
			const fieldMapping = new FieldMapper()
			expect(fieldMapping.get('label', null)).toEqual(null)
			expect(fieldMapping.get('label', 'hello')).toEqual(null)
			expect(fieldMapping.get('label', { k: 'hello' })).toEqual(null)
			expect(fieldMapping.get('label', { label: 'hello' })).toEqual('hello')
		})

		it('should return an attribute', () => {
			const fieldMapping = new FieldMapper()
			expect(fieldMapping.get('xx', data)).toBeNull()
			expect(fieldMapping.get('summary', data)).toBeNull()
			expect(fieldMapping.get('id', data)).toEqual(1)
			expect(fieldMapping.get('id', data.children[0], 'id')).toEqual(2)
			expect(fieldMapping.get('id', data.children[0].children[0], 'id')).toEqual(3)
			expect(fieldMapping.get('id', data.children[0].children[0])).toEqual(3)

			expect(fieldMapping.get('id', null)).toEqual(null)
			expect(fieldMapping.get('id', 'hello')).toEqual(null)
			expect(fieldMapping.get('id', { k: 'hello' })).toEqual(null)
		})

		it('should return a formatted text', () => {
			const fieldMapping = new FieldMapper()
			const formatter = (text) => String(text).toUpperCase()
			expect(fieldMapping.getFormattedText(data, formatter)).toEqual('ITEM 1')
			expect(fieldMapping.getFormattedText(data.children[0], formatter)).toEqual('ITEM 2')

			expect(fieldMapping.getFormattedText(null)).toEqual('')
			expect(fieldMapping.getFormattedText(null, formatter)).toEqual('')
			expect(fieldMapping.getFormattedText('hello', formatter)).toEqual('HELLO')
			expect(fieldMapping.getFormattedText(1)).toEqual('1')
			expect(fieldMapping.getFormattedText(false)).toEqual('false')
			expect(fieldMapping.getFormattedText({ x: false }, formatter)).toEqual('')
		})

		it('should get formatted currency', () => {
			const fieldMapping = new FieldMapper({ text: 'value' })
			const formatter = (value, currency) =>
				value.toLocaleString('en-US', {
					style: 'currency',
					currency,
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				})

			const result = fieldMapping.getFormattedText({ value: 1000, currency: 'USD' }, formatter)
			expect(result).toEqual('$1,000.00')
		})
	})
	describe('inspect', () => {
		it('should identify if the value has icon', () => {
			const fieldMapping = new FieldMapper()
			expect(fieldMapping.hasIcon(null)).toBeFalsy()
			expect(fieldMapping.hasIcon('x')).toBeFalsy()
			expect(fieldMapping.hasIcon({})).toBeFalsy()
			expect(fieldMapping.hasIcon({ icon: null })).toBeTruthy()
			expect(fieldMapping.hasIcon({ icon: 'x' })).toBeTruthy()
		})

		it('should identify if the value has image', () => {
			const fieldMapping = new FieldMapper()
			expect(fieldMapping.hasImage(null)).toBeFalsy()
			expect(fieldMapping.hasImage('x')).toBeFalsy()
			expect(fieldMapping.hasImage({})).toBeFalsy()
			expect(fieldMapping.hasImage({ image: null })).toBeTruthy()
			expect(fieldMapping.hasImage({ image: 'x' })).toBeTruthy()
		})
	})

	describe('children', () => {
		const fieldMapping = new FieldMapper()
		const items = [data]

		it('should idenitify if node has children', () => {
			expect(fieldMapping.hasChildren(data)).toBeTruthy()
			expect(fieldMapping.hasChildren(data.children[0])).toBeTruthy()
			expect(fieldMapping.hasChildren(data.children[0].children[0])).toBeFalsy()

			const altData = { sub: [{ sub: [] }] }
			const customMapping = new FieldMapper()
			customMapping.fields = { children: 'sub' }
			expect(customMapping.hasChildren(altData)).toBeTruthy()
			expect(customMapping.hasChildren(altData.sub[0])).toBeFalsy()
		})

		it('should fetch children', () => {
			expect(fieldMapping.getChildren(data)).toEqual(data.children)
			expect(fieldMapping.getChildren(data.children[0])).toEqual(data.children[0].children)
			expect(fieldMapping.getChildren(data.children[0].children[0])).toEqual([])
		})

		it('should identify if node is nested', () => {
			expect(fieldMapping.isNested(data)).toBeFalsy()
			expect(fieldMapping.isNested(data.children)).toBeTruthy()
			expect(fieldMapping.isNested(data.children[0].children)).toBeFalsy()
		})

		it('should return children by path', () => {
			expect(fieldMapping.getChildrenByPath(items)).toEqual(items)
			expect(fieldMapping.getChildrenByPath(items, [0])).toEqual(items[0].children)
			expect(fieldMapping.getChildrenByPath(items, [0, 0])).toEqual(items[0].children[0].children)
		})

		it('should return an item by path', () => {
			expect(fieldMapping.getItemByPath(items, [0])).toEqual(items[0])
			expect(fieldMapping.getItemByPath(items, [0, 0])).toEqual(items[0].children[0])
			expect(fieldMapping.getItemByPath(items, [0, 0, 0])).toEqual(items[0].children[0].children[0])
		})

		it('should throw error if path is invalid', () => {
			const noChildren = [{ id: 'alt' }]

			expect(() => fieldMapping.getItemByPath(items, [2])).toThrowError('Invalid path')
			expect(() => fieldMapping.getItemByPath(items, [])).toThrowError('Invalid path')
			expect(() => fieldMapping.getItemByPath(items, [0, 2])).toThrowError('Invalid path')
			expect(() => fieldMapping.getItemByPath(noChildren, [0, 2])).toThrowError('Invalid path')

			expect(() => fieldMapping.getChildrenByPath(items, [2])).toThrowError('Invalid path')
			expect(() => fieldMapping.getChildrenByPath(items, [0, 2])).toThrowError('Invalid path')
			expect(() => fieldMapping.getChildrenByPath(noChildren, [0, 2])).toThrowError('Invalid path')
		})
	})
})
