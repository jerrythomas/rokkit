import { describe, it, expect, beforeEach } from 'vitest'
import { FormBuilder } from '../../src/lib/builder.svelte.js'

describe('FormBuilder', () => {
	let formBuilder

	beforeEach(() => {
		formBuilder = null
	})

	describe('constructor', () => {
		it('should initialize with basic data', () => {
			const data = { count: 25, distance: 150 }
			formBuilder = new FormBuilder(data)

			expect(formBuilder.data).toEqual(data)
			expect(formBuilder.schema).toBeDefined()
			expect(formBuilder.layout).toBeDefined()
			expect(formBuilder.elements).toBeDefined()
		})

		it('should initialize with custom schema', () => {
			const data = { count: 25 }
			const schema = {
				type: 'object',
				properties: {
					count: { type: 'integer', min: 10, max: 100 }
				}
			}
			formBuilder = new FormBuilder(data, schema)

			expect(formBuilder.data).toEqual(data)
			expect(formBuilder.schema).toEqual(schema)
		})

		it('should initialize with custom layout', () => {
			const data = { count: 25 }
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Count', scope: '#/count' }]
			}
			formBuilder = new FormBuilder(data, null, layout)

			expect(formBuilder.data).toEqual(data)
			expect(formBuilder.layout).toEqual(layout)
		})

		it('should initialize with empty data by default', () => {
			formBuilder = new FormBuilder()

			expect(formBuilder.data).toEqual({})
			expect(formBuilder.schema).toBeDefined()
			expect(formBuilder.layout).toBeDefined()
		})
	})

	describe('getters and setters', () => {
		beforeEach(() => {
			formBuilder = new FormBuilder({ count: 25 })
		})

		it('should get and set data', () => {
			const newData = { distance: 150, animate: true }
			formBuilder.data = newData

			expect(formBuilder.data).toEqual(newData)
		})

		it('should get and set schema', () => {
			const newSchema = {
				type: 'object',
				properties: {
					distance: { type: 'number', minimum: 50, maximum: 200 }
				}
			}
			formBuilder.schema = newSchema

			expect(formBuilder.schema).toEqual(newSchema)
		})

		it('should get and set layout', () => {
			const newLayout = {
				type: 'horizontal',
				elements: [{ label: 'Distance', scope: '#/distance' }]
			}
			formBuilder.layout = newLayout

			expect(formBuilder.layout).toEqual(newLayout)
		})
	})

	describe('updateField', () => {
		beforeEach(() => {
			formBuilder = new FormBuilder({ count: 25, distance: 150 })
		})

		it('should update simple field', () => {
			formBuilder.updateField('count', 50)

			expect(formBuilder.data.count).toBe(50)
			expect(formBuilder.data.distance).toBe(150) // Should remain unchanged
		})

		it('should update nested field', () => {
			formBuilder.data = { settings: { count: 25, distance: 150 } }
			formBuilder.updateField('settings/count', 50)

			expect(formBuilder.data.settings.count).toBe(50)
			expect(formBuilder.data.settings.distance).toBe(150)
		})

		it('should create immutable updates', () => {
			const originalData = formBuilder.data
			formBuilder.updateField('count', 50)

			expect(formBuilder.data).not.toBe(originalData)
			expect(formBuilder.data.count).toBe(50)
		})
	})

	describe('getValue', () => {
		beforeEach(() => {
			formBuilder = new FormBuilder({
				count: 25,
				settings: {
					distance: 150,
					color: '#22d3ee'
				}
			})
		})

		it('should get simple field value', () => {
			expect(formBuilder.getValue('count')).toBe(25)
		})

		it('should get nested field value', () => {
			expect(formBuilder.getValue('settings/distance')).toBe(150)
			expect(formBuilder.getValue('settings/color')).toBe('#22d3ee')
		})

		it('should return undefined for non-existent field', () => {
			expect(formBuilder.getValue('nonexistent')).toBeUndefined()
			expect(formBuilder.getValue('settings/nonexistent')).toBeUndefined()
		})
	})

	describe('elements derivation', () => {
		it('should create elements for number fields with range type', () => {
			const data = { count: 25 }
			const schema = {
				type: 'object',
				properties: {
					count: { type: 'integer', min: 10, max: 100 }
				}
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Count', scope: '#/count' }]
			}

			formBuilder = new FormBuilder(data, schema, layout)
			const elements = formBuilder.elements

			expect(elements).toHaveLength(1)
			expect(elements[0]).toMatchObject({
				// label: 'Count',
				scope: '#/count',
				type: 'range',
				value: 25
				// constraints: {
				// 	min: 10,
				// 	max: 100,
				// 	step: 1
				// }
			})
		})

		it('should create elements for boolean fields with checkbox type', () => {
			const data = { animate: true }
			const schema = {
				type: 'object',
				properties: {
					animate: { type: 'boolean' }
				}
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Animate', scope: '#/animate' }]
			}

			formBuilder = new FormBuilder(data, schema, layout)
			const elements = formBuilder.elements

			expect(elements).toHaveLength(1)
			expect(elements[0]).toMatchObject({
				// label: 'Animate',
				scope: '#/animate',
				type: 'checkbox',
				value: true
			})
		})

		it('should create elements for string enum fields with select type', () => {
			const data = { color: '#22d3ee' }
			const schema = {
				type: 'object',
				properties: {
					color: {
						type: 'string',
						enum: ['#22d3ee', '#ef4444', '#10b981']
					}
				}
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Color', scope: '#/color' }]
			}

			formBuilder = new FormBuilder(data, schema, layout)
			const elements = formBuilder.elements

			expect(elements).toHaveLength(1)
			expect(elements[0]).toMatchObject({
				// label: 'Color',
				scope: '#/color',
				type: 'select',
				value: '#22d3ee'
				// constraints: {
				// 	options: ['#22d3ee', '#ef4444', '#10b981']
				// }
			})
		})

		it('should create number input for numbers without min/max', () => {
			const data = { value: 42 }
			const schema = {
				type: 'object',
				properties: {
					value: { type: 'number' }
				}
			}
			const layout = {
				type: 'vertical',
				elements: [{ label: 'Value', scope: '#/value' }]
			}

			formBuilder = new FormBuilder(data, schema, layout)
			const elements = formBuilder.elements

			expect(elements).toHaveLength(1)
			expect(elements[0]).toMatchObject({
				// label: 'Value',
				scope: '#/value',
				type: 'number',
				value: 42
			})
		})

		it('should handle multiple elements', () => {
			const data = { count: 25, animate: true, color: 'blue' }
			const layout = {
				type: 'vertical',
				elements: [
					{ label: 'Count', scope: '#/count' },
					{ label: 'Animate', scope: '#/animate' },
					{ label: 'Color', scope: '#/color' }
				]
			}

			formBuilder = new FormBuilder(data, null, layout)
			const elements = formBuilder.elements

			expect(elements).toHaveLength(3)
			expect(elements.map((e) => e.scope)).toEqual(['#/count', '#/animate', '#/color'])
		})
	})

	describe('reset', () => {
		it('should reset all properties to empty', () => {
			formBuilder = new FormBuilder({ count: 25 }, { type: 'object' }, { type: 'vertical' })

			formBuilder.reset()

			expect(formBuilder.data).toEqual({})
			expect(formBuilder.schema).toEqual({})
			expect(formBuilder.layout).toEqual({})
		})
	})

	describe('edge cases', () => {
		it('should handle empty layout elements', () => {
			formBuilder = new FormBuilder({ count: 25 }, null, { type: 'vertical', elements: [] })

			expect(formBuilder.elements).toEqual([])
		})

		it('should handle layout without elements', () => {
			formBuilder = new FormBuilder({ count: 25 }, null, { type: 'vertical' })

			expect(formBuilder.elements).toEqual([])
		})

		it('should handle element without scope', () => {
			formBuilder = new FormBuilder({ count: 25 }, null, {
				type: 'vertical',
				elements: [{ label: 'Invalid' }] // No scope
			})

			expect(formBuilder.elements).toEqual([])
		})

		it('should handle schema without properties', () => {
			formBuilder = new FormBuilder(
				{ count: 25 },
				{ type: 'object' }, // No properties
				{
					type: 'vertical',
					elements: [{ label: 'Count', scope: '#/count' }]
				}
			)

			const elements = formBuilder.elements
			expect(elements).toHaveLength(1)
			expect(elements[0].type).toBe('text') // Default type
		})
	})
})
