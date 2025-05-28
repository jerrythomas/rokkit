import { describe, expect, it } from 'vitest'
import {
	deriveSchemaFromValue,
	deriveLayoutFromValue,
	getSchemaWithLayout,
	getFieldProperties
} from './schemaUtils'

describe('Schema Utilities', () => {
	describe('deriveSchemaFromValue', () => {
		it('should handle primitive values', () => {
			expect(deriveSchemaFromValue('test')).toEqual({ type: 'string' })
			expect(deriveSchemaFromValue(42)).toEqual({ type: 'integer' })
			expect(deriveSchemaFromValue(42.5)).toEqual({ type: 'number' })
			expect(deriveSchemaFromValue(true)).toEqual({ type: 'boolean' })
			expect(deriveSchemaFromValue(null)).toEqual({ type: 'string' })
			expect(deriveSchemaFromValue(undefined)).toEqual({ type: 'string' })
		})

		it('should handle date objects', () => {
			expect(deriveSchemaFromValue(new Date())).toEqual({ type: 'date' })
		})

		it('should handle simple objects', () => {
			const result = deriveSchemaFromValue({ name: 'John', age: 30 })
			expect(result).toEqual({
				type: 'object',
				properties: {
					name: { type: 'string' },
					age: { type: 'integer' }
				}
			})
		})

		it('should handle nested objects', () => {
			const result = deriveSchemaFromValue({
				user: {
					name: 'John',
					contact: {
						email: 'john@example.com'
					}
				}
			})

			expect(result).toEqual({
				type: 'object',
				properties: {
					user: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							contact: {
								type: 'object',
								properties: {
									email: { type: 'string' }
								}
							}
						}
					}
				}
			})
		})

		it('should handle arrays', () => {
			expect(deriveSchemaFromValue([])).toEqual({
				type: 'array'
			})

			expect(deriveSchemaFromValue(['test'])).toEqual({
				type: 'array',
				items: { type: 'string' }
			})

			expect(deriveSchemaFromValue([1, 2, 3])).toEqual({
				type: 'array',
				items: { type: 'integer' }
			})

			expect(deriveSchemaFromValue([{ id: 1 }, { id: 2 }])).toEqual({
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: { type: 'integer' }
					}
				}
			})
		})
	})

	describe('deriveLayoutFromValue', () => {
		it('should handle primitive values', () => {
			expect(deriveLayoutFromValue('test')).toEqual({
				type: 'vertical',
				elements: [{ scope: '#' }]
			})
		})

		it('should handle simple objects', () => {
			const result = deriveLayoutFromValue({ name: 'John', age: 30 })
			expect(result).toEqual({
				type: 'vertical',
				elements: [
					{
						key: 'name',
						label: 'name',
						scope: '#/name',
						props: {}
					},
					{
						key: 'age',
						label: 'age',
						scope: '#/age',
						props: {}
					}
				]
			})
		})

		it('should handle nested objects', () => {
			const value = {
				personal: {
					name: 'John',
					age: 30
				}
			}

			const result = deriveLayoutFromValue(value)
			expect(result.type).toBe('vertical')
			expect(result.elements.length).toBe(1)
			expect(result.elements[0].key).toBe('personal')
			expect(result.elements[0].title).toBe('personal')
			expect(result.elements[0].type).toBe('vertical')
			expect(result.elements[0].elements.length).toBe(2)
		})

		it('should handle arrays', () => {
			const value = [{ id: 1, name: 'Item 1' }]
			const result = deriveLayoutFromValue(value)
			expect(result.scope).toBe('#')
			expect(result.schema.type).toBe('vertical')
			expect(result.schema.elements.length).toBe(2)
		})
	})

	describe('getSchemaWithLayout', () => {
		it('should combine schema and layout', () => {
			const schema = {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						minLength: 3
					},
					age: {
						type: 'number',
						min: 18
					}
				},
				required: ['name']
			}

			const layout = {
				type: 'vertical',
				elements: [
					{
						key: 'name',
						label: 'Full Name',
						props: {
							placeholder: 'Enter your name'
						}
					},
					{
						key: 'age',
						label: 'Your Age'
					}
				]
			}

			const result = getSchemaWithLayout(schema, layout)
			expect(result.type).toBe('vertical')
			expect(result.elements.length).toBe(2)
			expect(result.elements[0].key).toBe('name')
			expect(result.elements[0].label).toBe('Full Name')
			expect(result.elements[0].props.placeholder).toBe('Enter your name')
			expect(result.elements[0].props.minLength).toBe(3)
			expect(result.elements[0].props.type).toBe('string')
			expect(result.elements[0].props.required).toBe(true)

			expect(result.elements[1].key).toBe('age')
			expect(result.elements[1].label).toBe('Your Age')
			expect(result.elements[1].props.min).toBe(18)
		})

		it('should handle nested elements', () => {
			const schema = {
				type: 'object',
				properties: {
					personal: {
						type: 'object',
						properties: {
							name: { type: 'string' }
						}
					}
				}
			}

			const layout = {
				type: 'vertical',
				elements: [
					{
						key: 'personal',
						type: 'vertical',
						elements: [
							{
								key: 'name',
								label: 'Name'
							}
						]
					}
				]
			}

			const result = getSchemaWithLayout(schema, layout)
			expect(result.elements[0].elements[0].key).toBe('name')
			expect(result.elements[0].elements[0].label).toBe('Name')
			expect(result.elements[0].elements[0].props.type).toBe('string')
		})

		it('should handle missing schema or layout', () => {
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' }
				}
			}

			const layout = {
				type: 'vertical',
				elements: [
					{
						key: 'name',
						label: 'Name'
					}
				]
			}

			expect(getSchemaWithLayout(null, layout)).toEqual(layout)
			expect(getSchemaWithLayout(schema, null)).toEqual(schema)
			expect(getSchemaWithLayout(null, null)).toEqual({})
		})
	})

	describe('getFieldProperties', () => {
		it('should combine schema and layout properties for a field', () => {
			const schema = {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						minLength: 3,
						maxLength: 50
					}
				}
			}

			const layout = {
				elements: [
					{
						key: 'name',
						label: 'Full Name',
						props: {
							placeholder: 'Enter your name'
						}
					}
				]
			}

			const props = getFieldProperties(schema, layout, ['name'])
			expect(props.type).toBe('string')
			expect(props.minLength).toBe(3)
			expect(props.maxLength).toBe(50)
			expect(props.label).toBe('Full Name')
			expect(props.placeholder).toBe('Enter your name')
		})

		it('should handle nested paths', () => {
			const schema = {
				type: 'object',
				properties: {
					address: {
						type: 'object',
						properties: {
							street: { type: 'string' }
						}
					}
				}
			}

			const layout = {
				elements: [
					{
						key: 'address',
						elements: [
							{
								key: 'street',
								label: 'Street Address'
							}
						]
					}
				]
			}

			const props = getFieldProperties(schema, layout, ['address', 'street'])
			expect(props.type).toBe('string')
			expect(props.label).toBe('Street Address')
		})

		it('should return partial results for missing schema or layout', () => {
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' }
				}
			}

			const layout = {
				elements: [
					{
						key: 'name',
						label: 'Name'
					}
				]
			}

			const propsNoSchema = getFieldProperties(null, layout, ['name'])
			expect(propsNoSchema.label).toBe('Name')
			expect(propsNoSchema.type).toBeUndefined()

			const propsNoLayout = getFieldProperties(schema, null, ['name'])
			expect(propsNoLayout.label).toBeUndefined()
			expect(propsNoLayout.type).toBe('string')
		})
	})
})
