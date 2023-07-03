import { describe, expect, it } from 'vitest'
import { getComponent, getIcon } from '../src/mapping.js'

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
})
