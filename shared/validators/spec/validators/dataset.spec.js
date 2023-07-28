import { describe, it, expect, vi, afterEach } from 'vitest'
import { toHaveValidData } from '../../src/validators/dataset'

describe('event', () => {
	describe('toHaveValidData', () => {
		expect.extend({ toHaveValidData })
		afterEach(() => {
			vi.resetAllMocks()
		})

		it('should pass if the element dataset matches expected', () => {
			let input = { dataset: { a: 1, b: 2 } }
			let expected = { a: 1, b: 2 }
			const result = toHaveValidData(input, expected)
			expect(result.pass).toBe(true)
			expect(result.message()).toBe(
				`expected ${JSON.stringify(
					input.dataset
				)} to not match ${JSON.stringify(expected)}`
			)
			expect(input).toHaveValidData(expected)
		})
		it('should fail if the element dataset does not matche expected', () => {
			let input = { dataset: { a: 1, b: 2 } }
			let expected = { a: 1, b: 3 }
			const result = toHaveValidData(input, expected)
			expect(result.pass).toBe(false)
			expect(result.message()).toBe(
				`expected ${JSON.stringify(input.dataset)} to match ${JSON.stringify(
					expected
				)}`
			)
			expect(input).not.toHaveValidData(expected)
		})
	})
})
