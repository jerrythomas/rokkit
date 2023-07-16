import { describe, it, expect } from 'vitest'
import {
	deriveSchemaFromValue,
	deriveLayoutFromValue
} from '../../src/lib/fields'

describe('fields', () => {
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
			let schema = deriveSchemaFromValue(undefined)
			expect(schema).toEqual({ type: 'undefined' })
			schema = deriveSchemaFromValue(null)
			expect(schema).toEqual({ type: 'undefined' })
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
					},
					{
						scope: '#/address',
						label: 'address',
						type: 'vertical',
						elements: [
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
					}
				]
			})
		})
	})
})
