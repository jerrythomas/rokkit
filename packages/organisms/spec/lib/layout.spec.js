import { describe, it, expect } from 'vitest'
import { deriveLayoutFromValue } from '../../src/lib/layout'
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
				type: 'array',
				elements: [
					{
						type: 'vertical',
						elements: [
							{ label: 'name', scope: '#/name' },
							{ label: 'age', scope: '#/age' }
						]
					}
				]
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
	})
})
