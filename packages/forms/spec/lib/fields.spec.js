import { describe, it, expect } from 'vitest'
import { deriveSchemaFromValue } from '../../src/lib/schema'
import { deriveLayoutFromValue } from '../../src/lib/layout'

import { findAttributeByPath, getSchemaWithLayout } from '../../src/lib/fields'

import inputLayout from './fixtures/input-layout.json'
import inputSchema from './fixtures/input-schema.json'
import resultWithGeneratedSchema from './fixtures/result-with-generated-schema.json'
import resultWithGeneratedLayout from './fixtures/result-with-generated-layout.json'
import combinedSchemaLayout from './fixtures/combined-schema-layout.json'
import resultWithOnlyData from './fixtures/result-with-only-data.json'
describe('fields', () => {
	describe('findAttributeByPath', () => {
		it('should find attribute from path', () => {
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' },
					age: { type: 'integer', min: 0, max: 100 }
				}
			}
			let attribute = findAttributeByPath('#/name', schema)
			expect(attribute).toEqual({
				key: 'name',
				props: {
					type: 'string'
				}
			})

			attribute = findAttributeByPath('#/age', schema)
			expect(attribute).toEqual({
				key: 'age',
				props: {
					type: 'integer',
					min: 0,
					max: 100
				}
			})
		})

		it('should find attribute from nested path', () => {
			const schema = {
				type: 'object',
				properties: {
					address: {
						type: 'object',
						properties: {
							street: { type: 'string' },
							city: { type: 'string' },
							state: { type: 'string' },
							zip: { type: 'integer' }
						}
					}
				}
			}
			let attribute = findAttributeByPath('#/address/street', schema)
			expect(attribute).toEqual({
				key: 'street',
				props: {
					type: 'string'
				}
			})

			attribute = findAttributeByPath('#/address/city', schema)
			expect(attribute).toEqual({
				key: 'city',
				props: {
					type: 'string'
				}
			})

			attribute = findAttributeByPath('#/address/state', schema)
			expect(attribute).toEqual({
				key: 'state',
				props: {
					type: 'string'
				}
			})

			attribute = findAttributeByPath('#/address/zip', schema)
			expect(attribute).toEqual({
				key: 'zip',
				props: {
					type: 'integer'
				}
			})
		})

		it('should throw error if path is invalid', () => {
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' },
					age: { type: 'integer', min: 0, max: 100 }
				}
			}
			expect(() => {
				findAttributeByPath('#/invalid', schema)
			}).toThrowError('Invalid scope: #/invalid')
		})

		it('should return props if scope is missing', () => {
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' },
					age: { type: 'integer', min: 0, max: 100 }
				}
			}
			const attribute = findAttributeByPath(null, schema)
			expect(attribute).toEqual({
				props: schema
			})
		})
	})

	describe('getSchemaWithLayout', () => {
		const value = {
			name: 'John',
			age: 30,
			address: {
				street: '123 Main St',
				city: 'New York',
				state: 'NY',
				zip: 10001
			}
		}
		const schema = inputSchema
		const layout = inputLayout

		it('should combine generated schema and layout', () => {
			const value = {
				name: 'John',
				age: 30
			}
			const schema = getSchemaWithLayout(deriveSchemaFromValue(value), deriveLayoutFromValue(value))
			expect(schema).toEqual({
				type: 'vertical',
				elements: [
					{
						key: 'name',

						props: {
							label: 'name',
							type: 'string'
						}
					},
					{
						key: 'age',

						props: {
							label: 'age',
							type: 'integer'
						}
					}
				]
			})
		})

		it('should combine generated schema & layout for nested data', () => {
			const schema = getSchemaWithLayout(deriveSchemaFromValue(value), deriveLayoutFromValue(value))
			expect(schema).toEqual(resultWithOnlyData)
		})

		it('should combine schema with generated layout', () => {
			const combined = getSchemaWithLayout(schema, deriveLayoutFromValue(value))
			expect(combined).toEqual(resultWithGeneratedLayout)
		})

		it('should combine layout with generated schema', () => {
			const combined = getSchemaWithLayout(deriveSchemaFromValue(value), layout)
			expect(combined).toEqual(resultWithGeneratedSchema)
		})

		it('should combine the schema and layout', () => {
			const combined = getSchemaWithLayout(schema, layout)
			expect(combined).toEqual(combinedSchemaLayout)
		})

		it('should combine the schema and layout for nested array', () => {
			const schema = {
				type: 'object',
				properties: {
					users: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								name: { type: 'string' },
								age: { type: 'integer' }
							}
						}
					}
				}
			}
			const layout = {
				type: 'vertical',
				elements: [
					{
						scope: '#/users',
						schema: {
							type: 'vertical',

							elements: [
								{
									scope: '#/name',
									label: 'name'
								},
								{
									scope: '#/age',
									label: 'age'
								}
							]
						}
					}
				]
			}

			const combined = getSchemaWithLayout(schema, layout)
			expect(combined).toEqual({
				type: 'vertical',
				elements: [
					{
						key: 'users',
						props: {
							type: 'array',
							schema: {
								type: 'vertical',
								elements: [
									{
										key: 'name',
										props: {
											label: 'name',
											type: 'string'
										}
									},
									{
										key: 'age',
										props: { label: 'age', type: 'integer' }
									}
								]
							}
						}
					}
				]
			})
		})
	})
})
