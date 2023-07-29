import { describe, expect, it } from 'vitest'
import {
	getComponent,
	getIcon,
	getValue,
	getText,
	hasChildren,
	isExpanded,
	isNested,
	findItemByValue,
	getItemByIndexArray
} from '../src/mapping.js'

describe('mapping', () => {
	const fields = {
		isOpen: 'isOpen',
		children: 'children'
	}
	describe('getComponent', () => {
		it('should return the default component', () => {
			const item = {}
			const fields = {}
			const using = { default: 'default' }
			const result = getComponent(item, fields, using)
			expect(result).toEqual('default')
		})

		it('should return the default component if attribute is missing', () => {
			const item = { text: 'item' }
			const fields = { component: 'component' }
			const using = { default: 'default' }
			const result = getComponent(item, fields, using)
			expect(result).toEqual('default')
		})

		it('should return the component from the item', () => {
			const item = { component: 'item' }
			const fields = { component: 'component' }
			const using = { default: 'default', item: 'custom' }
			const result = getComponent(item, fields, using)
			expect(result).toEqual('custom')
		})

		it('should return the component from the fields', () => {
			const item = { fields: 'another' }
			const fields = { component: 'fields' }
			const using = { default: 'default', another: 'custom' }
			const result = getComponent(item, fields, using)
			expect(result).toEqual('custom')
		})
	})

	describe('getIcon', () => {
		it('should return null if icon is not defined', () => {
			const result = getIcon(null)
			expect(result).toEqual(null)
		})

		it('should return icon if value is present', () => {
			const result = getIcon({ icon: 'info' })
			expect(result).toEqual('info')
		})

		it('should return state icon if icon is object', () => {
			const result = getIcon({
				icon: { info: 'info', warn: 'warn' },
				state: 'warn'
			})
			expect(result).toEqual('warn')
		})
	})

	describe('getValue', () => {
		const fields = { value: 'value', text: 'text' }
		it('should return value if node is not an object', () => {
			const result = getValue('A', fields)
			expect(result).toEqual('A')
		})
		it('should return value if node is null', () => {
			const result = getValue(null, fields)
			expect(result).toEqual(null)
		})

		it('should return value if available', () => {
			const result = getValue({ value: 'X', name: 'Alpha' }, fields)
			expect(result).toEqual('X')
		})
		it('should return text if value is not available', () => {
			const result = getValue({ text: 'Alpha' }, fields)
			expect(result).toEqual('Alpha')
		})
	})

	describe('getText', () => {
		it('should return value if node is not an object', () => {
			const result = getText('A')
			expect(result).toEqual('A')
		})
		it('should return value if node is null', () => {
			const result = getText(null)
			expect(result).toEqual(null)
		})
		it('should return text for default mapping', () => {
			const result = getText({ text: 'Alpha' })
			expect(result).toEqual('Alpha')
		})
		it('should return text for custom fields', () => {
			const result = getText({ name: 'Alpha' }, { text: 'name' })
			expect(result).toEqual('Alpha')
		})
	})

	describe('hasChildren', () => {
		it('should return false if item is not an object', () => {
			expect(hasChildren(undefined, fields)).toBe(false)
		})
		it('should return false if it does not have the children attribute', () => {
			expect(hasChildren({}, fields)).toBe(false)
		})
		it('should return false if children is not an array', () => {
			expect(hasChildren({ children: null }, fields)).toBe(false)
		})
		it('should return true if children is an array', () => {
			expect(hasChildren({ children: [] }, fields)).toBe(true)
		})
	})

	describe('isExpanded', () => {
		it('returns true if the item is expanded', () => {
			const item = {
				isOpen: true,
				children: []
			}

			expect(isExpanded(item, fields)).toBe(true)
		})

		it('returns false if the item is not expanded', () => {
			const item = {
				isOpen: false,
				children: []
			}

			expect(isExpanded(item, fields)).toBe(false)
		})

		it('returns false if the item does not have the isOpen field', () => {
			expect(isExpanded({ children: [] }, fields)).toBe(false)
		})
		it('returns false if the item does not have the children field', () => {
			expect(isExpanded({}, fields)).toBe(false)
		})
		it('returns false if the children field is not an array', () => {
			expect(isExpanded({ children: '' }, fields)).toBe(false)
		})
		it('returns false if the item is not an object', () => {
			expect(isExpanded('', fields)).toBe(false)
			expect(isExpanded(null, fields)).toBe(false)
		})
	})

	describe('isNested', () => {
		it('returns true if the item is nested', () => {
			expect(isNested([{ children: [] }], fields)).toBe(true)
			expect(isNested(['?', { children: [] }], fields)).toBe(true)
		})

		it('returns false if the item is not nested', () => {
			expect(isNested([], fields)).toBe(false)
		})
	})

	describe('findItemByValue', () => {
		it('should find an item by value in a nested tree', () => {
			const items = [
				{
					value: 'a',
					children: [{ value: 'b' }, { value: 'c', children: [{ value: 'd' }] }]
				},
				{ value: 'e' }
			]
			const fields = { children: 'children' }
			const value = 'd'

			const result = findItemByValue(items, fields, value)

			expect(result).toEqual({
				fields,
				item: { value: 'd' },
				position: [0, 1, 0]
			})
		})

		it('should return null if the item is not found', () => {
			const items = [
				{
					value: 'a',
					children: [{ value: 'b' }, { value: 'c', children: [{ value: 'd' }] }]
				},
				{ value: 'e' }
			]
			const fields = { children: 'children' }
			const value = 'f'

			const result = findItemByValue(items, fields, value)

			expect(result).toBeNull()
		})
	})
	describe('getItemByIndexArray', () => {
		const fields = { children: 'children' }
		it('should return the correct item', () => {
			const items = [
				{ id: 1, children: [{ id: 2, children: [{ id: 3 }] }] },
				{ id: 4, children: [{ id: 5 }] }
			]
			const indexArray = [0, 0, 0]
			const item = getItemByIndexArray(indexArray, items, fields)
			expect(item).toEqual({ fields, item: { id: 3 }, position: [0, 0, 0] })
		})

		it('should return undefined if the index array is out of bounds', () => {
			const items = [
				{ id: 1, children: [{ id: 2, children: [{ id: 3 }] }] },
				{ id: 4, children: [{ id: 5 }] }
			]
			const indexArray = [0, 0, 0, 0]
			const item = getItemByIndexArray(indexArray, items, fields)
			expect(item).toBeFalsy()
		})
	})
})
