import { describe, it, expect, vi } from 'vitest'
import { importIcons } from '../src/utils.js'

describe('importIcons', () => {
	it('should transform an icons object into a collections object with import functions', async () => {
		// Mock icons dictionary
		const icons = {
			test: '@test/icons/test.json',
			another: '@test/icons/another.json'
		}

		// Mock dynamic imports
		vi.mock('@test/icons/test.json', () => {
			return {
				default: { icons: { icon1: { body: '<path>' } } }
			}
		})

		vi.mock('@test/icons/another.json', () => {
			return {
				default: { icons: { icon2: { body: '<rect>' } } }
			}
		})

		// Call the function to get collections
		const collections = importIcons(icons)

		// Assertions
		expect(collections).toBeTypeOf('object')
		expect(Object.keys(collections)).toEqual(['test', 'another'])
		expect(collections.test).toBeTypeOf('function')
		expect(collections.another).toBeTypeOf('function')

		// Test that the functions correctly import and return the icon data
		const testIcons = await collections.test()
		expect(testIcons).toEqual({ icons: { icon1: { body: '<path>' } } })

		const anotherIcons = await collections.another()
		expect(anotherIcons).toEqual({ icons: { icon2: { body: '<rect>' } } })
	})

	it('should return an empty object when given an empty icons object', () => {
		const collections = importIcons({})
		expect(collections).toEqual({})
	})

	it('should handle null or undefined input by returning an empty object', () => {
		expect(importIcons(null)).toEqual({})
		expect(importIcons()).toEqual({})
	})
})
