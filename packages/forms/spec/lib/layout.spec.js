import { describe, it, expect } from 'vitest'
import { deriveLayoutFromValue, deriveLayoutFromSchema } from '../../src/lib/layout'
import derivedNestedLayout from './fixtures/derived-nested-layout.json'

describe('layout', () => {
	describe('deriveLayoutFromValue', () => {
		it('should derive layout for string', () => {
			const layout = deriveLayoutFromValue('hello')
			expect(layout).toEqual({
				type: 'vertical',
				elements: [{ scope: '#' }]
			})
		})
		it('should derive layout for array', () => {
			const layout = deriveLayoutFromValue([{ name: 'hello', age: 21 }])
			expect(layout).toEqual({
				scope: '#',
				schema: {
					type: 'vertical',
					elements: [
						{ label: 'name', scope: '#/name' },
						{ label: 'age', scope: '#/age' }
					]
				}
			})
		})
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

		it('should derive layout for object with nested arrays', () => {
			const layout = deriveLayoutFromValue({
				name: 'John',
				phoneNumbers: [{ type: 'home', number: '555-555-5555' }]
			})
			expect(layout).toEqual({
				type: 'vertical',
				elements: [
					{
						scope: '#/name',
						label: 'name'
					},
					{
						scope: '#/phoneNumbers',
						title: 'phoneNumbers',
						schema: {
							type: 'vertical',
							elements: [
								{
									scope: '#/type',
									label: 'type'
								},
								{
									scope: '#/number',
									label: 'number'
								}
							]
						}
					}
				]
			})
		})
	})

	describe('deriveLayoutFromSchema', () => {
		it('returns an empty vertical layout when the schema is null / empty', () => {
			expect(deriveLayoutFromSchema(null)).toEqual({ type: 'vertical', elements: [] })
			expect(deriveLayoutFromSchema({})).toEqual({ type: 'vertical', elements: [] })
			expect(deriveLayoutFromSchema({ type: 'object' })).toEqual({
				type: 'vertical',
				elements: []
			})
		})

		it('emits one element per top-level property in declaration order', () => {
			const schema = {
				type: 'object',
				properties: {
					priority: { type: 'string', enum: ['low', 'med', 'high'] },
					description: { type: 'string' }
				}
			}
			expect(deriveLayoutFromSchema(schema)).toEqual({
				type: 'vertical',
				elements: [
					{ label: 'priority', scope: '#/priority' },
					{ label: 'description', scope: '#/description' }
				]
			})
		})

		it('recurses into nested object schemas', () => {
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' },
					address: {
						type: 'object',
						properties: {
							street: { type: 'string' },
							city: { type: 'string' }
						}
					}
				}
			}
			expect(deriveLayoutFromSchema(schema)).toEqual({
				type: 'vertical',
				elements: [
					{ label: 'name', scope: '#/name' },
					{
						title: 'address',
						scope: '#/address',
						type: 'vertical',
						elements: [
							{ label: 'street', scope: '#/address/street' },
							{ label: 'city', scope: '#/address/city' }
						]
					}
				]
			})
		})
	})
})
