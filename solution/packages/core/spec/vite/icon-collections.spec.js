import { describe, it, expect } from 'vitest'
import { iconCollections } from '../../src/vite/icon-collections.js'

describe('iconCollections', () => {
	it('should return empty object for null/undefined config', () => {
		expect(iconCollections(null)).toEqual({})
		expect(iconCollections(undefined)).toEqual({})
	})

	it('should return empty object for non-object config', () => {
		expect(iconCollections('invalid')).toEqual({})
	})

	it('should create loader functions for each collection', () => {
		const result = iconCollections({
			rokkit: '@rokkit/icons/ui.json',
			solar: '@iconify-json/solar/icons.json'
		})

		expect(result).toHaveProperty('rokkit')
		expect(result).toHaveProperty('solar')
		expect(typeof result.rokkit).toBe('function')
		expect(typeof result.solar).toBe('function')
	})

	it('should handle aliases with hyphens', () => {
		const result = iconCollections({
			'my-icons': '@rokkit/icons/ui.json'
		})

		expect(result).toHaveProperty('my-icons')
		expect(typeof result['my-icons']).toBe('function')
	})

	it('should load JSON when loader function is called', () => {
		const result = iconCollections({
			rokkit: '@rokkit/icons/ui.json'
		})

		const icons = result.rokkit()

		expect(icons).toHaveProperty('prefix')
		expect(icons).toHaveProperty('icons')
	})
})
