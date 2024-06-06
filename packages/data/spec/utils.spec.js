import { describe, it, expect } from 'vitest'
import { typeOf } from '../src/utils'

describe('utils', () => {
	describe('deriveTypeFromValue', () => {
		it('should derive the type of a value', () => {
			expect(typeOf('John')).toBe('string')
			expect(typeOf(25)).toBe('integer')
			expect(typeOf(25.5)).toBe('number')
			expect(typeOf([1, 2, 3])).toBe('array')
			expect(typeOf({ name: 'John' })).toBe('object')
			expect(typeOf(new Date())).toBe('date')
			expect(typeOf('2020-01-01')).toBe('date')
			expect(typeOf()).toBe('string')
			expect(typeOf(null)).toBe('string')
		})
	})
})
