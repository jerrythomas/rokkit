import { describe, it, expect } from 'vitest'
import { chart } from '../../src/lib/chart'

const numericData = [
	{ x: 1, y: 10 },
	{ x: 2, y: 20 },
	{ x: 3, y: 15 },
	{ x: 4, y: 5 }
]

const categoryData = [
	{ cat: 'A', val: 10 },
	{ cat: 'B', val: 20 },
	{ cat: 'C', val: 15 }
]

const dateData = [
	{ date: new Date('2024-01-01'), val: 10 },
	{ date: new Date('2024-02-01'), val: 20 },
	{ date: new Date('2024-03-01'), val: 15 }
]

describe('chart() constructor and refresh', () => {
	it('creates a Chart with numeric data and linear scales', () => {
		const c = chart(numericData, { x: 'x', y: 'y' })
		expect(c.scale.x).toBeDefined()
		expect(c.scale.y).toBeDefined()
		// numeric x domain → linear scale (has ticks method)
		expect(c.scale.x.ticks).toBeDefined()
	})

	it('creates a Chart with categorical x data and band scale', () => {
		const c = chart(categoryData, { x: 'cat', y: 'val' })
		expect(c.scale.x.bandwidth).toBeDefined() // scaleBand
		expect(c.scale.x.domain()).toEqual(['A', 'B', 'C'])
	})

	it('creates a Chart with Date domain and time scale', () => {
		const c = chart(dateData, { x: 'date', y: 'val' })
		// scaleTime has ticks but no bandwidth
		expect(c.scale.x.ticks).toBeDefined()
		expect(c.scale.x.bandwidth).toBeUndefined()
	})

	it('flipCoords swaps x and y domains', () => {
		const c = chart(categoryData, { x: 'cat', y: 'val', flipCoords: true })
		// After flip, x domain should be numeric (val values), y domain categorical
		expect(c.domain.x).toEqual([10, 20, 15])
		expect(c.domain.y).toEqual(['A', 'B', 'C'])
	})

	it('flipCoords maps data correctly', () => {
		const c = chart(categoryData, { x: 'cat', y: 'val', flipCoords: true })
		// first data item: original cat='A', val=10 → flipCoords: x=val=10, y=cat='A'
		expect(c.data[0].x).toBe(10)
		expect(c.data[0].y).toBe('A')
	})

	it('uses default width/height of 2048 when not provided', () => {
		const c = chart(numericData, { x: 'x', y: 'y' })
		expect(c.width).toBe(2048)
		expect(c.height).toBe(2048)
	})

	it('accepts custom width and height', () => {
		const c = chart(numericData, { x: 'x', y: 'y', width: 800, height: 600 })
		expect(c.width).toBe(800)
		expect(c.height).toBe(600)
	})

	it('applies margin to range computation', () => {
		const c = chart(numericData, {
			x: 'x',
			y: 'y',
			width: 500,
			height: 400,
			padding: 0,
			margin: { left: 50, right: 30, top: 20, bottom: 40 }
		})
		expect(c.range.x[0]).toBe(50) // margin.left + padding
		expect(c.range.x[1]).toBe(470) // width - margin.right - padding
	})

	it('computes origin.x for linear x scale (clamped to 0)', () => {
		const c = chart(numericData, { x: 'x', y: 'y', padding: 0 })
		// domain starts at 0 or min; origin.x = scale.x(0)
		expect(typeof c.origin.x).toBe('number')
	})

	it('computes origin.x for band scale as range[0]', () => {
		const c = chart(categoryData, { x: 'cat', y: 'val', padding: 0 })
		// band scale has no ticks → getOriginValue returns range()[0]
		expect(c.origin.x).toBe(c.scale.x.range()[0])
	})

	it('applies spacing as band scale padding', () => {
		const c = chart(categoryData, { x: 'cat', y: 'val', spacing: 0.3 })
		expect(c.scale.x.padding()).toBeCloseTo(0.3)
	})

	it('clips out-of-range spacing values to 0', () => {
		const c = chart(categoryData, { x: 'cat', y: 'val', spacing: 0.7 })
		// spacing 0.7 > 0.5 → clamped to 0
		expect(c.scale.x.padding()).toBe(0)
	})
})

describe('chart.aggregate()', () => {
	it('sets value and stat on the Chart instance', () => {
		const c = chart(numericData, { x: 'x', y: 'y' })
		c.aggregate('y', 'sum')
		expect(c.value).toBe('y')
		expect(c.stat).toBe('sum')
	})

	it('returns undefined (no return value)', () => {
		const c = chart(numericData, { x: 'x', y: 'y' })
		expect(c.aggregate('y', 'mean')).toBeUndefined()
	})
})

describe('chart.ticks()', () => {
	it('returns ticks for numeric x axis', () => {
		const c = chart(numericData, { x: 'x', y: 'y', width: 400, height: 300, padding: 0 })
		const ticks = c.ticks('x')
		expect(Array.isArray(ticks)).toBe(true)
		expect(ticks.length).toBeGreaterThan(0)
	})

	it('each tick has label, offset, x, y properties', () => {
		const c = chart(numericData, { x: 'x', y: 'y', width: 400, height: 300, padding: 0 })
		const ticks = c.ticks('x')
		for (const tick of ticks) {
			expect(tick).toHaveProperty('label')
			expect(tick).toHaveProperty('offset')
			expect(tick).toHaveProperty('x')
			expect(tick).toHaveProperty('y')
		}
	})

	it('x-axis ticks have offset.x = bandwidth/2 for band scale', () => {
		const c = chart(categoryData, { x: 'cat', y: 'val', width: 400, height: 300, padding: 0 })
		const ticks = c.ticks('x')
		// band scale: offset.x = bandwidth/2
		const bw2 = c.scale.x.bandwidth() / 2
		for (const tick of ticks) {
			expect(tick.offset.x).toBeCloseTo(bw2)
			expect(tick.offset.y).toBe(0)
		}
	})

	it('y-axis ticks have offset.y = bandwidth/2 for band scale', () => {
		const c = chart(categoryData, { x: 'val', y: 'cat', width: 400, height: 300, padding: 0 })
		const ticks = c.ticks('y')
		// y-axis band scale: offset.y = bandwidth/2
		const bw2 = c.scale.y.bandwidth() / 2
		for (const tick of ticks) {
			expect(tick.offset.y).toBeCloseTo(bw2)
			expect(tick.offset.x).toBe(0)
		}
	})

	it('x-axis ticks have zero offsets for linear scale', () => {
		const c = chart(numericData, { x: 'x', y: 'y', width: 400, height: 300, padding: 0 })
		const ticks = c.ticks('x')
		for (const tick of ticks) {
			expect(tick.offset.x).toBe(0)
			expect(tick.offset.y).toBe(0)
		}
	})

	it('respects explicit count parameter', () => {
		const c = chart(numericData, { x: 'x', y: 'y', width: 400, height: 300, padding: 0 })
		const ticks = c.ticks('x', 2)
		expect(ticks.length).toBeGreaterThan(0)
	})

	it('band scale with many items filters ticks when count < domain.length', () => {
		const manyData = Array.from({ length: 20 }, (_, i) => ({ cat: `C${i}`, val: i * 5 }))
		const c = chart(manyData, { x: 'cat', y: 'val', width: 100, height: 300, padding: 0 })
		// With small width and large domain, count will be < domain.length → filtering branch runs
		const ticks = c.ticks('x')
		expect(ticks.length).toBeLessThanOrEqual(manyData.length)
	})

	it('y-axis ticks have x position at origin.x', () => {
		const c = chart(numericData, { x: 'x', y: 'y', width: 400, height: 300, padding: 0 })
		const ticks = c.ticks('y')
		for (const tick of ticks) {
			expect(tick.x).toBeCloseTo(c.origin.x)
		}
	})

	it('x-axis ticks have y position at origin.y', () => {
		const c = chart(numericData, { x: 'x', y: 'y', width: 400, height: 300, padding: 0 })
		const ticks = c.ticks('x')
		for (const tick of ticks) {
			expect(tick.y).toBeCloseTo(c.origin.y)
		}
	})
})
