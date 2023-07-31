import { describe, expect, it } from 'vitest'
import {
	getComponent,
	getIcon,
	getValue,
	getText,
	getAttribute,
	hasChildren,
	isExpanded,
	isNested
} from '../src/mapping'

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

	describe('getAttribute', () => {
		it('should return null if node is not an object', () => {
			const result = getAttribute('A', 'text')
			expect(result).toEqual(null)
		})
		it('should return null if node is null', () => {
			const result = getAttribute(null, 'text')
			expect(result).toEqual(null)
		})
		it('should return null if attribute is not available', () => {
			const result = getAttribute({ text: 'Alpha' }, 'value')
			expect(result).toBeFalsy()
		})
		it('should return attribute if available', () => {
			const result = getAttribute({ value: 'X', name: 'Alpha' }, 'value')
			expect(result).toEqual('X')
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
})
