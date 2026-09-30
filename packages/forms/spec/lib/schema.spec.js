import { describe, it, expect } from 'vitest'
import { deriveSchemaFromValue } from '../../src/lib/schema'

describe('schema', () => {
	describe('deriveSchemaFromValue', () => {
		it('should derive schema for string', () => {
			const schema = deriveSchemaFromValue('hello')
			expect(schema).toEqual({ type: 'string' })
		})

		it('should derive schema for number', () => {
			const schema = deriveSchemaFromValue(1)
			expect(schema).toEqual({ type: 'integer' })
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
			expect(schema).toEqual({ type: 'array', items: { type: 'integer' } })
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
					age: { type: 'integer' },
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
					age: { type: 'integer' },
					verified: { type: 'boolean' },
					createdAt: { type: 'date' },
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
			})
		})
	})
})

describe('schemaAt — a field’s schema by slash path', () => {
	const jsonSchema = {
		type: 'object',
		properties: {
			name: { type: 'string' },
			addr: { type: 'object', properties: { city: { type: 'string', required: true } } }
		}
	}
	it('finds top-level fields', async () => {
		const { schemaAt } = await import('../../src/lib/schema.js')
		expect(schemaAt(jsonSchema, 'name')).toEqual({ type: 'string' })
	})
	it('descends into a nested object’s properties, as JSON Schema nests them', async () => {
		const { schemaAt } = await import('../../src/lib/schema.js')
		expect(schemaAt(jsonSchema, 'addr/city')).toEqual({ type: 'string', required: true })
	})
	it('still reads the flat form, where a nested field sits directly on its parent', async () => {
		const { schemaAt } = await import('../../src/lib/schema.js')
		const flat = { type: 'object', properties: { a: { b: { type: 'string' } } } }
		expect(schemaAt(flat, 'a/b')).toEqual({ type: 'string' })
	})
	it('prefers properties over a same-named schema keyword', async () => {
		// A nested field called `type` must not resolve to the parent's `type: 'object'`.
		const { schemaAt } = await import('../../src/lib/schema.js')
		const s = {
			type: 'object',
			properties: { o: { type: 'object', properties: { type: { type: 'number' } } } }
		}
		expect(schemaAt(s, 'o/type')).toEqual({ type: 'number' })
	})
	it('is null for a missing field or a schema without properties', async () => {
		const { schemaAt } = await import('../../src/lib/schema.js')
		expect(schemaAt(jsonSchema, 'addr/zip')).toBeNull()
		expect(schemaAt(jsonSchema, 'nope')).toBeNull()
		expect(schemaAt(jsonSchema, 'nope/deeper/still')).toBeNull()
		expect(schemaAt({ type: 'object' }, 'x')).toBeNull()
		expect(schemaAt(null, 'x')).toBeNull()
	})
})
