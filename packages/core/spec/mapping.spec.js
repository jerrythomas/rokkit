import { describe, expect, it } from 'vitest'
import { getComponent, getIcon, getId, getText } from '../src/mapping.js'

describe('mapping', () => {
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

	describe('getId', () => {
		const fields = { id: 'id', text: 'text' }
		it('should return value if node is not an object', () => {
			const result = getId('A', fields)
			expect(result).toEqual('A')
		})
		it('should return value if node is null', () => {
			const result = getId(null, fields)
			expect(result).toEqual(null)
		})

		it('should return id if available', () => {
			const result = getId({ id: 'X', name: 'Alpha' }, fields)
			expect(result).toEqual('X')
		})
		it('should return text if id is not available', () => {
			const result = getId({ text: 'Alpha' }, fields)
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
})
