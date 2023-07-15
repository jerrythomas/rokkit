import { describe, expect, it } from 'vitest'
import '../src'
import Custom from './Custom.svelte'

describe('types', () => {
	it('should export LayoutElement', () => {
		const element: LayoutElement = { type: 'a' }
		expect(element).toBeDefined()
	})
	it('should export FieldLayout', () => {
		const element: FieldLayout = { description: 'a', elements: [] }
		expect(element).toBeDefined()
	})

	it('should export FieldMapping', () => {
		const element: FieldMapping = { id: 'key' }
		expect(element).toBeDefined()
	})

	it('should export ComponentMap', () => {
		const element: ComponentMap = { custom: Custom }
		expect(element).toBeDefined()
	})

	it('should export Properties', () => {
		const element: Properties = {
			description: 'content',
			custom: { type: 'string' }
		}
		expect(element).toBeDefined()
	})
})
