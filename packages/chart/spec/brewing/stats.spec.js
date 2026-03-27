import { describe, it, expect } from 'vitest'
import { STAT_FNS, applyAggregate, applyBoxStat } from '../../src/lib/brewing/stats.js'

const data = [
	{ cat: 'A', val: 10, group: 'x' },
	{ cat: 'A', val: 20, group: 'x' },
	{ cat: 'B', val: 30, group: 'y' },
	{ cat: 'B', val: 40, group: 'y' }
]

describe('STAT_FNS', () => {
	it('sum adds values', () => expect(STAT_FNS.sum([1, 2, 3])).toBe(6))
	it('mean averages values', () => expect(STAT_FNS.mean([10, 20, 30])).toBe(20))
	it('min returns smallest', () => expect(STAT_FNS.min([5, 1, 9])).toBe(1))
	it('max returns largest', () => expect(STAT_FNS.max([5, 1, 9])).toBe(9))
	it('count returns length', () => expect(STAT_FNS.count([1, 2, 3])).toBe(3))
})

describe('applyAggregate', () => {
	it('identity returns data unchanged', () => {
		const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: 'identity' })
		expect(result).toBe(data)
	})

	it('sum groups and sums', () => {
		const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: 'sum' })
		expect(result).toHaveLength(2)
		const a = result.find((r) => r.cat === 'A')
		expect(a.val).toBe(30)
	})

	it('mean groups and averages', () => {
		const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: 'mean' })
		const a = result.find((r) => r.cat === 'A')
		expect(a.val).toBe(15)
	})

	it('count groups and counts rows', () => {
		const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: 'count' })
		const a = result.find((r) => r.cat === 'A')
		expect(a.val).toBe(2)
	})

	it('accepts a custom function', () => {
		const customFn = (values) => values.reduce((a, b) => a + b, 0) * 2
		const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: customFn })
		const a = result.find((r) => r.cat === 'A')
		expect(a.val).toBe(60)
	})

	it('groups by multiple fields', () => {
		const result = applyAggregate(data, { by: ['cat', 'group'], value: 'val', stat: 'sum' })
		expect(result).toHaveLength(2)
	})

	it('returns data unchanged when by is empty', () => {
		const result = applyAggregate(data, { by: [], value: 'val', stat: 'sum' })
		expect(result).toBe(data)
	})
})

// Sorted [10,20,30,40]: q1=15, median=25, q3=35, IQR=20, iqr_min=15-30=-15, iqr_max=35+30=65
const boxData = [
	{ class: 'A', hwy: 10 },
	{ class: 'A', hwy: 20 },
	{ class: 'A', hwy: 30 },
	{ class: 'A', hwy: 40 },
	{ class: 'B', hwy: 5 },
	{ class: 'B', hwy: 15 },
	{ class: 'B', hwy: 25 },
	{ class: 'B', hwy: 35 }
]

describe('applyBoxStat', () => {
	it('produces one row per unique x value', () => {
		const result = applyBoxStat(boxData, { x: 'class', y: 'hwy' })
		expect(result).toHaveLength(2)
		expect(result.map((r) => r.class).sort()).toEqual(['A', 'B'])
	})

	it('computes correct q1, median, q3 for class A', () => {
		// d3.quantile uses linear interpolation:
		// [10,20,30,40]: q1 = 17.5, median = 25, q3 = 32.5
		const result = applyBoxStat(boxData, { x: 'class', y: 'hwy' })
		const a = result.find((r) => r.class === 'A')
		expect(a.q1).toBeCloseTo(17.5)
		expect(a.median).toBeCloseTo(25)
		expect(a.q3).toBeCloseTo(32.5)
	})

	it('computes iqr_min = q1 - 1.5 * IQR', () => {
		const result = applyBoxStat(boxData, { x: 'class', y: 'hwy' })
		const a = result.find((r) => r.class === 'A')
		// IQR = 32.5 - 17.5 = 15, iqr_min = 17.5 - 1.5*15 = -5
		expect(a.iqr_min).toBeCloseTo(-5)
	})

	it('computes iqr_max = q3 + 1.5 * IQR', () => {
		const result = applyBoxStat(boxData, { x: 'class', y: 'hwy' })
		const a = result.find((r) => r.class === 'A')
		// IQR = 32.5 - 17.5 = 15, iqr_max = 32.5 + 1.5*15 = 55
		expect(a.iqr_max).toBeCloseTo(55)
	})

	it('groups by x + color when color channel provided', () => {
		const colored = [
			{ class: 'A', drv: 'f', hwy: 10 },
			{ class: 'A', drv: 'f', hwy: 20 },
			{ class: 'A', drv: '4', hwy: 30 },
			{ class: 'A', drv: '4', hwy: 40 }
		]
		const result = applyBoxStat(colored, { x: 'class', y: 'hwy', color: 'drv' })
		expect(result).toHaveLength(2)
		const f = result.find((r) => r.drv === 'f')
		expect(f.class).toBe('A')
		expect(f.q1).toBeDefined()
	})

	it('returns data unchanged when x or y channel missing', () => {
		expect(applyBoxStat(boxData, { y: 'hwy' })).toBe(boxData)
		expect(applyBoxStat(boxData, { x: 'class' })).toBe(boxData)
	})
})
