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

	it('should return a component', () => {
		const fieldMapping = new FieldMapper()
		fieldMapping.componentMap = { default: 'defaultComponent', abc: 'Component' }

		expect(fieldMapping.getComponent(null)).toEqual('defaultComponent')
		expect(fieldMapping.getComponent({})).toEqual('defaultComponent')
		expect(fieldMapping.getComponent({ component: 'abc' })).toEqual('Component')
		expect(fieldMapping.getComponent({ component: null })).toEqual('defaultComponent')

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

	it('should return an image', () => {
		const fieldMapping = new FieldMapper()
		expect(fieldMapping.getImage(null)).toEqual(null)
		expect(fieldMapping.getImage('x')).toEqual(null)
		expect(fieldMapping.getImage({})).toEqual(null)
		expect(fieldMapping.getImage({ image: null })).toEqual(null)
		expect(fieldMapping.getImage({ image: 'x' })).toEqual('x')
	})

	it('should return the text', () => {
		const fieldMapping = new FieldMapper()
		expect(fieldMapping.getText('hello')).toEqual('hello')
		expect(fieldMapping.getText(1)).toEqual(1)
		expect(fieldMapping.getText(data)).toEqual('Item 1')
		expect(fieldMapping.getText(data.children[0])).toEqual('Item 2')
		expect(fieldMapping.getText(data.children[0].children[0])).toEqual('Item 3')
	})

	it('should return the value', () => {
		const fieldMapping = new FieldMapper()
		expect(fieldMapping.getValue(data)).toEqual('Item 1')
		expect(fieldMapping.getValue(null)).toEqual(null)
		expect(fieldMapping.getValue('hello')).toEqual('hello')
		expect(fieldMapping.getValue({ k: 'hello' })).toEqual({ k: 'hello' })
	})

	it('should return the label', () => {
		const fieldMapping = new FieldMapper()
		expect(fieldMapping.getLabel(null)).toEqual(null)
		expect(fieldMapping.getLabel('hello')).toEqual(null)
		expect(fieldMapping.getLabel({ k: 'hello' })).toEqual(null)
		expect(fieldMapping.getLabel({ label: 'hello' })).toEqual('hello')
	})

	it('should return an attribute', () => {
		const fieldMapping = new FieldMapper()
		expect(fieldMapping.getAttribute(data, 'id')).toEqual(1)
		expect(fieldMapping.getAttribute(data.children[0], 'id')).toEqual(2)
		expect(fieldMapping.getAttribute(data.children[0].children[0], 'id')).toEqual(3)

		expect(fieldMapping.getAttribute(null, 'id')).toEqual(null)
		expect(fieldMapping.getAttribute('hello', 'id')).toEqual(null)
		expect(fieldMapping.getAttribute({ k: 'hello' }, 'id')).toEqual(null)
	})

	it('should return a formatted text', () => {
		const fieldMapping = new FieldMapper()
		const formatter = (text) => text && text.toUpperCase()
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
