import { describe, expect, it } from 'vitest'
import { getAttribute, getNestedFields } from '../src/mapping'

describe('mapping', () => {
	describe('getAttribute', () => {
		it('should return null if node is not an object', () => {
			const result = getAttribute('A', 'text')
			expect(result).toEqual(null)
		})
		it('should return null if node is null', () => {
			const result = getAttribute(null, 'text')
			expect(result).toEqual(null)
		})
		it('should return null if attribute is not available', () => {
			const result = getAttribute({ text: 'Alpha' }, 'value')
			expect(result).toBeFalsy()
		})
		it('should return attribute if available', () => {
			const result = getAttribute({ value: 'X', name: 'Alpha' }, 'value')
			expect(result).toEqual('X')
		})
	})

	describe('getNestedFields', () => {
		it('should return merged fields with defaults', () => {
			const result = getNestedFields({ children: 'sub' })
			expect(result.children).toEqual('sub')
			expect(result.text).toEqual('text')
		})

		it('should use nested fields property if present', () => {
			const result = getNestedFields({ fields: { children: 'items' } })
			expect(result.children).toEqual('items')
		})
	})
})
