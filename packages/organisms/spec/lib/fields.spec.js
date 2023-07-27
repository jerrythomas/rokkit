import { describe, it, expect } from 'vitest'
import { deriveSchemaFromValue } from '../../src/lib/schema'
import { deriveLayoutFromValue } from '../../src/lib/layout'

import {
	findAttributeByPath,
	combineElementsWithSchema,
	getSchemaWithLayout
} from '../../src/lib/fields'

import inputLayout from './fixtures/input-layout.json'
import inputSchema from './fixtures/input-schema.json'
import resultWithGeneratedSchema from './fixtures/result-with-generated-schema.json'
import resultWithGeneratedLayout from './fixtures/result-with-generated-layout.json'
import combinedSchemaLayout from './fixtures/combined-schema-layout.json'
import derivedNestedLayout from './fixtures/derived-nested-layout.json'
import resultWithOnlyData from './fixtures/result-with-only-data.json'
describe('fields', () => {
	describe('deriveLayoutFromValue', () => {
		it('should derive layout for object', () => {
			const layout = deriveLayoutFromValue({
				name: 'John',
				age: 21,
				verified: true,
				createdAt: new Date()
			})
			expect(layout).toEqual({
				type: 'vertical',
				elements: [
					{
						scope: '#/name',
						label: 'name'
					},
					{
						scope: '#/age',
						label: 'age'
					},
					{
						scope: '#/verified',
						label: 'verified'
					},
					{
						scope: '#/createdAt',
						label: 'createdAt'
					}
				]
			})
		})

		it('should derive layout for object with nested attributes', () => {
			const layout = deriveLayoutFromValue({
				name: 'John',
				age: 21,
				verified: true,
				createdAt: new Date(),
				address: {
					street: '123 Main St',
					city: 'New York',
					state: 'NY',
					zip: 10001
				}
			})
			expect(layout).toEqual(derivedNestedLayout)
		})
	})

	describe('findAttributeByPath', () => {
		it('should find attribute from path', () => {
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' },
					age: { type: 'number', min: 0, max: 100 }
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
					type: 'number',
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
							zip: { type: 'number' }
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
					type: 'number'
				}
			})
		})

		it('should throw error if path is invalid', () => {
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' },
					age: { type: 'number', min: 0, max: 100 }
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
					age: { type: 'number', min: 0, max: 100 }
				}
			}
			let attribute = findAttributeByPath(null, schema)
			expect(attribute).toEqual({
				props: schema
			})
		})
	})

	describe('combineElementsWithSchema', () => {
		it('should throw error if element scope is invalid', () => {
			const elements = [
				{
					scope: '#/name',
					label: 'name'
				},
				{
					scope: '#/age',
					label: 'age'
				},
				{
					scope: '#/invalid',
					label: 'invalid'
				}
			]
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' },
					age: { type: 'number', min: 0, max: 100 }
				}
			}
			expect(() => {
				combineElementsWithSchema(elements, schema)
			}).toThrowError('Invalid scope: #/invalid')
		})
		it('should combine elements with schema', () => {
			const elements = [
				{
					scope: '#/name',
					label: 'name'
				},
				{
					scope: '#/age',
					label: 'age'
				}
			]
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string', label: 'name' },
					age: { type: 'number', label: 'age', min: 0, max: 100 }
				}
			}
			const combined = combineElementsWithSchema(elements, schema)
			expect(combined).toEqual([
				{
					key: 'name',
					props: {
						type: 'string',
						label: 'name'
					}
				},
				{
					key: 'age',

					props: {
						type: 'number',
						label: 'age',
						min: 0,
						max: 100
					}
				}
			])
		})

		it('should combine elements with nested schema', () => {
			const elements = [
				{
					scope: '#/address/street',
					label: 'street'
				},
				{
					scope: '#/address/city',
					label: 'city'
				},
				{
					scope: '#/address/state',
					label: 'state'
				},
				{
					scope: '#/address/zip',
					label: 'zip'
				}
			]
			const schema = {
				type: 'object',
				properties: {
					address: {
						type: 'object',
						properties: {
							street: { type: 'string' },
							city: { type: 'string' },
							state: { type: 'string' },
							zip: { type: 'number' }
						}
					}
				}
			}
			const combined = combineElementsWithSchema(elements, schema)
			expect(combined).toEqual([
				{
					key: 'street',

					props: {
						label: 'street',
						type: 'string'
					}
				},
				{
					key: 'city',

					props: {
						label: 'city',
						type: 'string'
					}
				},
				{
					key: 'state',

					props: {
						label: 'state',
						type: 'string'
					}
				},
				{
					key: 'zip',

					props: {
						label: 'zip',
						type: 'number'
					}
				}
			])
		})
		it('should combine elements with schema when scope is missing', () => {
			const elements = [
				{
					type: 'horizontal',
					elements: [
						{
							scope: '#/first_name'
						},
						{
							scope: '#/last_name'
						}
					]
				}
			]
			const schema = {
				type: 'object',
				properties: {
					first_name: { type: 'string' },
					last_name: { type: 'string' }
				}
			}
			const combined = combineElementsWithSchema(elements, schema)
			expect(combined).toEqual([
				{
					elements: [
						{
							key: 'first_name',
							props: {
								type: 'string'
							}
						},
						{
							key: 'last_name',
							props: {
								type: 'string'
							}
						}
					],
					type: 'horizontal'
				}
			])
		})
	})

	describe('getSchemaWithLayout', () => {
		let value = {
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
			let value = {
				name: 'John',
				age: 30
			}
			const schema = getSchemaWithLayout(
				deriveSchemaFromValue(value),
				deriveLayoutFromValue(value)
			)
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
							type: 'number'
						}
					}
				]
			})
		})

		it('should combine generated schema & layout for nested data', () => {
			const schema = getSchemaWithLayout(
				deriveSchemaFromValue(value),
				deriveLayoutFromValue(value)
			)
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
	})
})
