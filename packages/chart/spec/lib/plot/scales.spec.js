import { describe, it, expect } from 'vitest'
import {
	inferFieldType,
	inferOrientation,
	buildUnifiedXScale,
	buildUnifiedYScale,
	inferColorScaleType
} from '../../../src/lib/plot/scales'

// ---------------------------------------------------------------------------
// inferFieldType
// ---------------------------------------------------------------------------
describe('inferFieldType', () => {
	it('returns "band" for an empty dataset', () => {
		expect(inferFieldType([], 'x')).toBe('band')
	})

	it('returns "band" for null/undefined values only', () => {
		expect(inferFieldType([{ x: null }, { x: undefined }], 'x')).toBe('band')
	})

	it('returns "continuous" for numeric values', () => {
		expect(inferFieldType([{ x: 1 }, { x: 2 }, { x: 3 }], 'x')).toBe('continuous')
	})

	it('returns "continuous" for numeric strings', () => {
		expect(inferFieldType([{ x: '1' }, { x: '2' }], 'x')).toBe('continuous')
	})

	it('returns "band" for string categories', () => {
		expect(inferFieldType([{ x: 'A' }, { x: 'B' }], 'x')).toBe('band')
	})
})

// ---------------------------------------------------------------------------
// inferOrientation
// ---------------------------------------------------------------------------
describe('inferOrientation', () => {
	it('returns "vertical" for band-x + continuous-y', () => {
		expect(inferOrientation('band', 'continuous')).toBe('vertical')
	})

	it('returns "horizontal" for continuous-x + band-y', () => {
		expect(inferOrientation('continuous', 'band')).toBe('horizontal')
	})

	it('returns "none" for other combinations', () => {
		expect(inferOrientation('continuous', 'continuous')).toBe('none')
		expect(inferOrientation('band', 'band')).toBe('none')
	})
})

// ---------------------------------------------------------------------------
// buildUnifiedXScale
// ---------------------------------------------------------------------------
describe('buildUnifiedXScale', () => {
	const numDatasets = [[{ x: 1 }, { x: 2 }, { x: 3 }]]
	const catDatasets = [[{ x: 'A' }, { x: 'B' }, { x: 'C' }]]

	it('returns a linear scale for numeric data', () => {
		const scale = buildUnifiedXScale(numDatasets, 'x', 400)
		expect(scale.ticks).toBeDefined()
		expect(scale.bandwidth).toBeUndefined()
	})

	it('returns a band scale for categorical data', () => {
		const scale = buildUnifiedXScale(catDatasets, 'x', 400)
		expect(scale.bandwidth).toBeDefined()
	})

	it('forces band scale when opts.band is true even for numeric data', () => {
		const scale = buildUnifiedXScale(numDatasets, 'x', 400, { band: true })
		expect(scale.bandwidth).toBeDefined()
	})

	it('uses opts.domain when provided with numeric values (linear scale)', () => {
		const scale = buildUnifiedXScale(numDatasets, 'x', 400, { domain: [0, 100] })
		expect(scale.domain()).toEqual([0, 100])
		expect(scale.ticks).toBeDefined()
	})

	it('uses opts.domain with band scale when opts.band is true', () => {
		// opts.domain provided + domainIsNumeric but opts.band=true → band scale
		const scale = buildUnifiedXScale(numDatasets, 'x', 400, {
			domain: [2020, 2021, 2022],
			band: true
		})
		expect(scale.bandwidth).toBeDefined()
		expect(scale.domain()).toEqual([2020, 2021, 2022])
	})

	it('uses opts.domain with band scale for non-numeric domain', () => {
		const scale = buildUnifiedXScale(catDatasets, 'x', 400, { domain: ['X', 'Y'] })
		expect(scale.bandwidth).toBeDefined()
		expect(scale.domain()).toEqual(['X', 'Y'])
	})

	it('respects opts.padding for band scale', () => {
		const scale = buildUnifiedXScale(catDatasets, 'x', 400, { padding: 0.4 })
		expect(scale.padding()).toBeCloseTo(0.4)
	})

	it('includeZero=false uses min value as domain start for linear', () => {
		const scale = buildUnifiedXScale([[{ x: 5 }, { x: 10 }]], 'x', 400, { includeZero: false })
		const [min] = scale.domain()
		expect(min).toBeGreaterThanOrEqual(5)
	})

	it('defaults includeZero to false for x scale', () => {
		const scale = buildUnifiedXScale([[{ x: 5 }, { x: 10 }]], 'x', 400)
		// default includeZero is false for x scale
		const [min] = scale.domain()
		// After nice(), might be slightly below 5 but domain min <= 5
		expect(min).toBeLessThanOrEqual(5)
	})
})

// ---------------------------------------------------------------------------
// buildUnifiedYScale
// ---------------------------------------------------------------------------
describe('buildUnifiedYScale', () => {
	const numDatasets = [[{ y: 10 }, { y: 20 }, { y: 30 }]]
	const catDatasets = [[{ y: 'A' }, { y: 'B' }, { y: 'C' }]]

	it('returns a linear scale for numeric data', () => {
		const scale = buildUnifiedYScale(numDatasets, 'y', 300)
		expect(scale.ticks).toBeDefined()
		expect(scale.bandwidth).toBeUndefined()
	})

	it('returns a band scale for categorical data (horizontal bar chart)', () => {
		const scale = buildUnifiedYScale(catDatasets, 'y', 300)
		expect(scale.bandwidth).toBeDefined()
		expect(scale.domain()).toEqual(['A', 'B', 'C'])
	})

	it('uses opts.domain when provided', () => {
		const scale = buildUnifiedYScale(numDatasets, 'y', 300, { domain: [0, 50] })
		expect(scale.domain()).toEqual([0, 50])
	})

	it('includeZero=true forces domain min to 0', () => {
		const scale = buildUnifiedYScale([[{ y: 5 }, { y: 10 }]], 'y', 300, { includeZero: true })
		const [min] = scale.domain()
		expect(min).toBe(0)
	})

	it('includeZero=false uses actual min value as domain start', () => {
		const scale = buildUnifiedYScale([[{ y: 5 }, { y: 10 }]], 'y', 300, { includeZero: false })
		const [min] = scale.domain()
		// After nice(), min <= 5
		expect(min).toBeLessThanOrEqual(5)
	})

	it('handles null/undefined values gracefully', () => {
		const data = [[{ y: null }, { y: 10 }, { y: undefined }, { y: 20 }]]
		const scale = buildUnifiedYScale(data, 'y', 300)
		const [, max] = scale.domain()
		expect(max).toBeGreaterThanOrEqual(20)
	})

	it('returns a band scale with empty domain when all values are null', () => {
		const data = [[{ y: null }, { y: undefined }]]
		const scale = buildUnifiedYScale(data, 'y', 300)
		// No numeric values → isNumeric=false → band scale with empty string domain
		expect(scale.bandwidth).toBeDefined()
	})
})

// ---------------------------------------------------------------------------
// inferColorScaleType
// ---------------------------------------------------------------------------
describe('inferColorScaleType', () => {
	const numData = [{ v: 1 }, { v: 2 }]
	const catData = [{ v: 'A' }, { v: 'B' }]

	it('returns spec.colorScale if explicitly set', () => {
		expect(inferColorScaleType(catData, 'v', { colorScale: 'sequential' })).toBe('sequential')
	})

	it('returns "diverging" when colorMidpoint is specified', () => {
		expect(inferColorScaleType(catData, 'v', { colorMidpoint: 0 })).toBe('diverging')
	})

	it('returns "sequential" for continuous field', () => {
		expect(inferColorScaleType(numData, 'v')).toBe('sequential')
	})

	it('returns "categorical" for band field', () => {
		expect(inferColorScaleType(catData, 'v')).toBe('categorical')
	})
})
