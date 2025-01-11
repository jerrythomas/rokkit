import { describe, it, expect } from 'vitest'
import { FieldMapper } from '../src/field-mapper'
import { defaultFields } from '../src/constants'

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

	it('should return a field mapping object', () => {
		const fieldMapping = new FieldMapper()

		expect(fieldMapping).toBeDefined()
		expect(fieldMapping.fields).toEqual(defaultFields)
		expect(fieldMapping.using).toEqual({})

		fieldMapping.fields = { text: 'name' }
		expect(fieldMapping.fields.text).toEqual('name')
		expect(fieldMapping.fields).toEqual({ ...defaultFields, text: 'name' })

		fieldMapping.using = { default: 'default' }
		expect(fieldMapping.using).toEqual({ default: 'default' })
	})

	it('should return a component', () => {
		const fieldMapping = new FieldMapper()
		fieldMapping.using = { default: 'defaultComponent', abc: 'Component' }

		expect(fieldMapping.getComponent(null)).toEqual('defaultComponent')
		expect(fieldMapping.getComponent({})).toEqual('defaultComponent')
		expect(fieldMapping.getComponent({ component: 'abc' })).toEqual('Component')

		fieldMapping.fields = { component: null }
		expect(fieldMapping.getComponent({ component: 'abc' })).toEqual('defaultComponent')
	})

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

	it('should return the text', () => {
		const fieldMapping = new FieldMapper()
		expect(fieldMapping.getText('hello')).toEqual('hello')
		expect(fieldMapping.getText(data)).toEqual('Item 1')
		expect(fieldMapping.getText(data.children[0])).toEqual('Item 2')
		expect(fieldMapping.getText(data.children[0].children[0])).toEqual('Item 3')
	})

	it('should return the value', () => {
		const fieldMapping = new FieldMapper()
		expect(fieldMapping.getValue(data)).toEqual('Item 1')
		expect(fieldMapping.getValue(data.children[0])).toEqual('Item 2')
		expect(fieldMapping.getValue(data.children[0].children[0])).toEqual('Item 3')
	})

	it('should return an attribute', () => {
		const fieldMapping = new FieldMapper()
		expect(fieldMapping.getAttribute(data, 'id')).toEqual(1)
		expect(fieldMapping.getAttribute(data.children[0], 'id')).toEqual(2)
		expect(fieldMapping.getAttribute(data.children[0].children[0], 'id')).toEqual(3)
	})

	it('should return a formatted text', () => {
		const fieldMapping = new FieldMapper()
		const formatter = (text) => text.toUpperCase()
		expect(fieldMapping.getFormattedText(data, formatter)).toEqual('ITEM 1')
		expect(fieldMapping.getFormattedText(data.children[0], formatter)).toEqual('ITEM 2')
		expect(fieldMapping.getFormattedText(data.children[0].children[0], formatter)).toEqual('ITEM 3')
	})

	it('should return the using object', () => {
		const fieldMapping = new FieldMapper()
		fieldMapping.using = { default: 'default' }
		expect(fieldMapping.using).toEqual({ default: 'default' })
		fieldMapping.using = null
		expect(fieldMapping.using).toEqual({})
	})

	it('should idenitify if node has children', () => {
		const fieldMapping = new FieldMapper()
		expect(fieldMapping.hasChildren(data)).toBeTruthy()
		expect(fieldMapping.hasChildren(data.children[0])).toBeTruthy()
		expect(fieldMapping.hasChildren(data.children[0].children[0])).toBeFalsy()
	})

	it('should identify if node is expanded', () => {
		const fieldMapping = new FieldMapper()
		expect(fieldMapping.isExpanded(data)).toBeTruthy()
		expect(fieldMapping.isExpanded(data.children[0])).toBeFalsy()
		expect(fieldMapping.isExpanded(data.children[0].children[0])).toBeFalsy()
	})

	it('should identify if node is nested', () => {
		const fieldMapping = new FieldMapper()
		expect(fieldMapping.isNested(data)).toBeFalsy()
		expect(fieldMapping.isNested(data.children)).toBeTruthy()
		expect(fieldMapping.isNested(data.children[0].children)).toBeFalsy()
	})
})
