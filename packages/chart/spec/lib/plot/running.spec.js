import { describe, it, expect } from 'vitest'
import { runningSpans } from '../../../src/lib/plot/running.js'

describe('runningSpans', () => {
	it('runs each step from the previous total to the next', () => {
		expect(runningSpans([{ d: 5 }, { d: -8 }], 'd').map(({ lo, hi, total }) => [lo, hi, total])).toEqual([
			[0, 5, 5],
			[-3, 5, -3]
		])
	})

	it('runs a total row from 0 to the running total, either direction, and adds nothing', () => {
		const [, t] = runningSpans([{ d: -6 }, { d: 99, t: 1 }], 'd', 't')
		expect(t).toEqual({ lo: -6, hi: 0, total: -6, isTotal: true, delta: 0 })
	})

	it('treats a missing or non-numeric value as a step of 0', () => {
		expect(runningSpans([{ d: 2 }, {}, { d: 'x' }], 'd').map((s) => s.total)).toEqual([2, 2, 2])
	})
})
