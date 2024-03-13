import { describe, it, expect } from 'vitest'
import { deriveTypeFromValue, deriveSchemaFromValue } from '../../src/lib/schema'

describe('schema', () => {
	describe('deriveTypeFromValue', () => {
		it('should derive type for string', () => {
			const type = deriveTypeFromValue('hello')
			expect(type).toEqual('string')
		})

		it('should derive type for number', () => {
			const type = deriveTypeFromValue(1)
			expect(type).toEqual('number')
		})

		it('should derive type for boolean', () => {
			const type = deriveTypeFromValue(true)
			expect(type).toEqual('boolean')
		})

		it('should derive type for array', () => {
			const type = deriveTypeFromValue([])
			expect(type).toEqual('array')
		})

		it('should derive type for object', () => {
			const type = deriveTypeFromValue({})
			expect(type).toEqual('object')
		})

		it('should derive type for null/undefined', () => {
			let type = deriveTypeFromValue()
			expect(type).toEqual('string')
			type = deriveTypeFromValue(null)
			expect(type).toEqual('string')
		})

		it('should derive type for date', () => {
			const type = deriveTypeFromValue(new Date())
			expect(type).toEqual('date')
		})

		it('should derive type for string array', () => {
			const type = deriveTypeFromValue(['hello'])
			expect(type).toEqual('array')
		})

		it('should derive type for number array', () => {
			const type = deriveTypeFromValue([1])
			expect(type).toEqual('array')
		})

		it('should derive type for null', () => {
			const type = deriveTypeFromValue(null)
			expect(type).toEqual('string')
		})
	})

	describe('deriveSchemaFromValue', () => {
		it('should derive schema for string', () => {
			const schema = deriveSchemaFromValue('hello')
			expect(schema).toEqual({ type: 'string' })
		})

		it('should derive schema for number', () => {
			const schema = deriveSchemaFromValue(1)
			expect(schema).toEqual({ type: 'number' })
		})

		it('should derive schema for boolean', () => {
			const schema = deriveSchemaFromValue(true)
			expect(schema).toEqual({ type: 'boolean' })
		})

		it('should derive schema for array', () => {
			const schema = deriveSchemaFromValue([])
			expect(schema).toEqual({
				type: 'array',
				items: { type: 'object', properties: {} }
			})
		})

		it('should derive schema for object', () => {
			const schema = deriveSchemaFromValue({})
			expect(schema).toEqual({ type: 'object', properties: {} })
		})

		it('should derive schema for null/undefined', () => {
			let schema = deriveSchemaFromValue()
			expect(schema).toEqual({ type: 'string' })
			schema = deriveSchemaFromValue(null)
			expect(schema).toEqual({ type: 'string' })
		})

		it('should derive schema for date', () => {
			const schema = deriveSchemaFromValue(new Date())
			expect(schema).toEqual({ type: 'date' })
		})

		it('should derive schema for string array', () => {
			const schema = deriveSchemaFromValue(['hello'])
			expect(schema).toEqual({ type: 'array', items: { type: 'string' } })
		})

		it('should derive schema for number array', () => {
			const schema = deriveSchemaFromValue([1])
			expect(schema).toEqual({ type: 'array', items: { type: 'number' } })
		})

		it('should derive schema for boolean array', () => {
			const schema = deriveSchemaFromValue([true])
			expect(schema).toEqual({ type: 'array', items: { type: 'boolean' } })
		})

		it('should derive schema for object array', () => {
			const schema = deriveSchemaFromValue([{}])
			expect(schema).toEqual({
				type: 'array',
				items: { type: 'object', properties: {} }
			})
		})

		it('should derive schema for object with attributes', () => {
			const schema = deriveSchemaFromValue({
				name: 'John',
				age: 21,
				verified: true,
				createdAt: new Date()
			})
			expect(schema).toEqual({
				type: 'object',
				properties: {
					name: { type: 'string' },
					age: { type: 'number' },
					verified: { type: 'boolean' },
					createdAt: { type: 'date' }
				}
			})
		})

		it('should derive schema for object with nested attributes', () => {
			const schema = deriveSchemaFromValue({
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
			expect(schema).toEqual({
				type: 'object',
				properties: {
					name: { type: 'string' },
					age: { type: 'number' },
					verified: { type: 'boolean' },
					createdAt: { type: 'date' },
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
			})
		})
	})
})
