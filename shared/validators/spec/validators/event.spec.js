import { describe, it, expect, vi, afterEach } from 'vitest'
import { toHaveBeenDispatchedWith } from '../../src/validators/event'

describe('event', () => {
	describe('toHaveBeenDispatchedWith', () => {
		const detail = { foo: 'bar' }
		const spy = vi.fn()

		expect.extend({ toHaveBeenDispatchedWith })
		afterEach(() => {
			vi.resetAllMocks()
		})

		it('should pass if the event was dispatched with the correct data', () => {
			spy({ detail })
			const result = toHaveBeenDispatchedWith(spy, detail)

			expect(result.pass).toBe(true)
			expect(result.message()).toBe(
				`expected ${JSON.stringify(
					detail
				)} to not deeply equal ${JSON.stringify(detail)}`
			)
			expect(spy).toHaveBeenDispatchedWith(detail)
		})

		it('should fail if the event was dispatched with the incorrect data', () => {
			spy({ detail: 'baz' })
			const result = toHaveBeenDispatchedWith(spy, detail)
			expect(result.pass).toBe(false)
			expect(result.message()).toBe(
				`expected ${JSON.stringify('baz')} to deeply equal ${JSON.stringify(
					detail
				)}`
			)
			expect(spy).not.toHaveBeenDispatchedWith(detail)
		})
	})
})
