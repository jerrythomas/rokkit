import { describe, it, expect, vi, afterEach } from 'vitest'
import { toIncludeAll } from '../../src/validators/array'

describe('event', () => {
	describe('toIncludeAll', () => {
		expect.extend({ toIncludeAll })
		afterEach(() => {
			vi.resetAllMocks()
		})

		it('should pass if the array includes all the values', () => {
			let input = [1, 2, 3]
			let expected = [1, 2]
			const result = toIncludeAll(input, expected)
			expect(result.pass).toBe(true)
			expect(result.message()).toBe(
				`expected ${JSON.stringify(
					input
				)} to not include all of ${JSON.stringify(expected)}`
			)
			expect(input).toIncludeAll(expected)
		})

		it('should fail if the array does not include all the values', () => {
			let input = [1, 2, 3]
			let expected = [1, 2, 4]
			const result = toIncludeAll(input, expected)
			expect(result.pass).toBe(false)
			expect(result.message()).toBe(
				`expected ${JSON.stringify(input)} to include all of ${JSON.stringify(
					expected
				)}`
			)
			expect(input).not.toIncludeAll(expected)
		})
	})
})
