import { describe, it, expect } from 'vitest'
import { getType } from '../src/utils'

describe('utils', () => {
	describe('getType', () => {
		it('should derive the type of a value', () => {
			expect(getType('John')).toBe('string')
			expect(getType(25)).toBe('integer')
			expect(getType(25.5)).toBe('number')
			expect(getType([1, 2, 3])).toBe('array')
			expect(getType({ name: 'John' })).toBe('object')
			expect(getType(new Date())).toBe('date')
			expect(getType('2020-01-01')).toBe('date')
		})
	})
})
