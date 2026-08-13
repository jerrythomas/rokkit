import { describe, it, expect } from 'vitest'
import {
	mean,
	median,
	linearRegression,
	movingAverage,
	ema,
	expRegression,
	computeTrend
} from '../../src/lib/trend.js'

const rows = [
	{ d: 0, v: 2 },
	{ d: 1, v: 4 },
	{ d: 2, v: 6 },
	{ d: 3, v: 8 }
]

describe('statistics', () => {
	it('mean / median', () => {
		expect(mean([2, 4, 6, 8])).toBe(5)
		expect(median([2, 4, 6, 8])).toBe(5) // avg of middle two
		expect(median([1, 2, 3])).toBe(2)
		expect(mean([])).toBeNull()
		expect(median([])).toBeNull()
	})
	it('linearRegression fits a perfect line', () => {
		expect(linearRegression([0, 1, 2, 3], [2, 4, 6, 8])).toEqual({ m: 2, b: 2 })
		expect(linearRegression([0], [1])).toBeNull() // < 2 points
		expect(linearRegression([1, 1, 1], [2, 4, 6])).toBeNull() // zero x-variance
	})
	it('movingAverage keeps length, partial window at head', () => {
		expect(movingAverage([2, 4, 6, 8], 2)).toEqual([2, 3, 5, 7])
		expect(movingAverage([2, 4, 6], 1)).toEqual([2, 4, 6])
	})
	it('ema derives alpha from span', () => {
		const out = ema([2, 4, 6, 8], { span: 1 }) // alpha = 2/(1+1) = 1 → follows series
		expect(out).toEqual([2, 4, 6, 8])
		expect(ema([2, 4], { alpha: 0.5 })).toEqual([2, 3])
		expect(ema([], {})).toEqual([]) // empty input
	})
	it('expRegression fits y = a·e^(bx); null on non-positive y', () => {
		const fit = expRegression([0, 1, 2], [1, Math.E, Math.E ** 2])
		expect(fit.a).toBeCloseTo(1, 6)
		expect(fit.b).toBeCloseTo(1, 6)
		expect(expRegression([0, 1], [1, 0])).toBeNull() // y ≤ 0
		expect(expRegression([0], [1])).toBeNull() // < 2 points
	})
})

describe('computeTrend', () => {
	it('constant methods → { kind:"constant", value }', () => {
		expect(computeTrend(rows, { x: 'd', y: 'v' }, 'avg')).toEqual({ kind: 'constant', value: 5 })
		expect(computeTrend(rows, { x: 'd', y: 'v' }, 'mean')).toEqual({ kind: 'constant', value: 5 })
		expect(computeTrend(rows, { x: 'd', y: 'v' }, 'min')).toEqual({ kind: 'constant', value: 2 })
		expect(computeTrend(rows, { x: 'd', y: 'v' }, 'max')).toEqual({ kind: 'constant', value: 8 })
		expect(computeTrend(rows, { x: 'd', y: 'v' }, 'median')).toEqual({ kind: 'constant', value: 5 })
		expect(computeTrend(rows, { x: 'd', y: 'v' }, 7)).toEqual({ kind: 'constant', value: 7 })
		expect(computeTrend(rows, { x: 'd', y: 'v' }, { type: 'value', value: 3 })).toEqual({
			kind: 'constant',
			value: 3
		})
	})
	it('linear → per-row fitted series', () => {
		const r = computeTrend(rows, { x: 'd', y: 'v' }, 'linear')
		expect(r).toEqual({ kind: 'series', values: [2, 4, 6, 8] })
	})
	it('ma / ema → series of row length', () => {
		expect(computeTrend(rows, { x: 'd', y: 'v' }, { type: 'ma', window: 2 })).toEqual({
			kind: 'series',
			values: [2, 3, 5, 7]
		})
		const e = computeTrend(rows, { x: 'd', y: 'v' }, 'ema')
		expect(e.kind).toBe('series')
		expect(e.values).toHaveLength(4)
	})
	it('exp → series; ma without window → null', () => {
		const e = computeTrend(rows, { x: 'd', y: 'v' }, 'exp')
		expect(e.kind).toBe('series')
		expect(e.values).toHaveLength(4)
		expect(computeTrend(rows, { x: 'd', y: 'v' }, { type: 'ma' })).toBeNull()
	})
	it('value type with non-number → null', () => {
		expect(computeTrend(rows, { x: 'd', y: 'v' }, { type: 'value', value: 'not a number' })).toBeNull()
	})
	it('exp with identical x values (zero variance) → null', () => {
		const identicalX = [{ x: 0, y: 2 }, { x: 0, y: 4 }, { x: 0, y: 8 }]
		expect(computeTrend(identicalX, { x: 'x', y: 'y' }, 'exp')).toBeNull()
	})
	it('degenerate inputs → null', () => {
		expect(computeTrend([], { x: 'd', y: 'v' }, 'avg')).toBeNull()
		expect(computeTrend([{ d: 0, v: 5 }], { x: 'd', y: 'v' }, 'linear')).toBeNull()
		expect(computeTrend(rows, { x: 'd', y: 'v' }, null)).toBeNull()
		expect(computeTrend(rows, { x: 'd', y: 'v' }, { type: 'bogus' })).toBeNull()
	})
	it('non-numeric x falls back to row index for fits', () => {
		const cat = [{ d: 'a', v: 2 }, { d: 'b', v: 4 }, { d: 'c', v: 6 }]
		expect(computeTrend(cat, { x: 'd', y: 'v' }, 'linear')).toEqual({
			kind: 'series',
			values: [2, 4, 6]
		})
	})
	it('normalize with object method containing non-mean type', () => {
		const r = computeTrend(rows, { x: 'd', y: 'v' }, { type: 'median' })
		expect(r).toEqual({ kind: 'constant', value: 5 })
	})
	it('normalize with object method containing mean type', () => {
		const r = computeTrend(rows, { x: 'd', y: 'v' }, { type: 'mean' })
		expect(r).toEqual({ kind: 'constant', value: 5 })
	})
})
