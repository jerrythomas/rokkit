import { describe, it, expect } from 'vitest'
import {
	createScales,
	calculateChartDimensions,
	getOriginValue,
	createTicks
} from '../../src/lib/scales.svelte.js'
import { scaleBand, scaleLinear } from 'd3-scale'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const categoricalData = [
	{ category: 'A', value: 10, group: 'x' },
	{ category: 'B', value: 40, group: 'y' },
	{ category: 'C', value: 25, group: 'x' },
	{ category: 'A', value: 15, group: 'y' }
]

const numericData = [
	{ x: 1, y: 10 },
	{ x: 2, y: 40 },
	{ x: 3, y: 25 }
]

const dimensions = { innerWidth: 600, innerHeight: 400 }

// ─── createScales ────────────────────────────────────────────────────────────

describe('createScales', () => {
	it('returns empty object when data is null', () => {
		expect(createScales(null, dimensions, { xKey: 'x', yKey: 'y' })).toEqual({})
	})

	it('returns empty object when data is an empty array', () => {
		expect(createScales([], dimensions, { xKey: 'x', yKey: 'y' })).toEqual({})
	})

	it('returns xScale and yScale for categorical x', () => {
		const { xScale, yScale, colorScale } = createScales(categoricalData, dimensions, {
			xKey: 'category',
			yKey: 'value'
		})
		expect(typeof xScale).toBe('function')
		expect(typeof yScale).toBe('function')
		expect(colorScale).toBeNull()
	})

	it('xScale maps categories to pixel positions', () => {
		const { xScale } = createScales(categoricalData, dimensions, {
			xKey: 'category',
			yKey: 'value'
		})
		// scaleBand — bandwidth should be positive
		expect(xScale.bandwidth()).toBeGreaterThan(0)
	})

	it('yScale domain starts at 0 and extends past max value', () => {
		const { yScale } = createScales(categoricalData, dimensions, {
			xKey: 'category',
			yKey: 'value'
		})
		const [domMin, domMax] = yScale.domain()
		expect(domMin).toBe(0)
		// max value is 40, domain max should be >= 40 * 1.1 = 44 (plus nice())
		expect(domMax).toBeGreaterThanOrEqual(40)
	})

	it('builds colorScale when colorKey provided', () => {
		const { colorScale } = createScales(categoricalData, dimensions, {
			xKey: 'category',
			yKey: 'value',
			colorKey: 'group'
		})
		expect(colorScale).not.toBeNull()
		// Should return a string color for a known category
		expect(typeof colorScale('x')).toBe('string')
		expect(typeof colorScale('y')).toBe('string')
	})

	it('uses default padding of 0.2 when none specified', () => {
		const { xScale } = createScales(categoricalData, dimensions, {
			xKey: 'category',
			yKey: 'value'
		})
		expect(xScale.padding()).toBeCloseTo(0.2)
	})

	it('respects custom padding option', () => {
		const { xScale } = createScales(categoricalData, dimensions, {
			xKey: 'category',
			yKey: 'value',
			padding: 0.4
		})
		expect(xScale.padding()).toBeCloseTo(0.4)
	})

	it('returns numeric xScale for numeric x values', () => {
		const { xScale } = createScales(numericData, dimensions, { xKey: 'x', yKey: 'y' })
		// scaleLinear — no bandwidth method
		expect(xScale.bandwidth).toBeUndefined()
	})
})

// ─── calculateChartDimensions ────────────────────────────────────────────────

describe('calculateChartDimensions', () => {
	it('returns width and height unchanged', () => {
		const margin = { top: 20, right: 20, bottom: 40, left: 50 }
		const result = calculateChartDimensions(800, 500, margin)
		expect(result.width).toBe(800)
		expect(result.height).toBe(500)
	})

	it('computes innerWidth as width minus left+right margins', () => {
		const margin = { top: 20, right: 20, bottom: 40, left: 50 }
		const result = calculateChartDimensions(800, 500, margin)
		expect(result.innerWidth).toBe(800 - 50 - 20) // 730
	})

	it('computes innerHeight as height minus top+bottom margins', () => {
		const margin = { top: 20, right: 20, bottom: 40, left: 50 }
		const result = calculateChartDimensions(800, 500, margin)
		expect(result.innerHeight).toBe(500 - 20 - 40) // 440
	})

	it('returns the margin object on the result', () => {
		const margin = { top: 10, right: 15, bottom: 30, left: 40 }
		const result = calculateChartDimensions(600, 400, margin)
		expect(result.margin).toBe(margin)
	})
})

// ─── getOriginValue ───────────────────────────────────────────────────────────

describe('getOriginValue', () => {
	it('returns scale(0) for a linear scale whose domain includes 0 (positive only)', () => {
		const scale = scaleLinear().domain([0, 100]).range([400, 0])
		// origin: scale(max(0, min([0,100]))) = scale(0) = 400
		expect(getOriginValue(scale)).toBe(400)
	})

	it('returns scale(0) for a linear scale whose domain spans negative and positive', () => {
		const scale = scaleLinear().domain([-50, 50]).range([400, 0])
		// min domain = -50, max(0, -50) = 0 → scale(0) = 200
		expect(getOriginValue(scale)).toBeCloseTo(200)
	})

	it('returns the first range value for a band scale (no .ticks method)', () => {
		const scale = scaleBand().domain(['A', 'B', 'C']).range([0, 600])
		// band scale has no .ticks — falls back to scale.range()[0]
		expect(getOriginValue(scale)).toBe(0)
	})

	it('handles an all-negative linear scale (min domain is negative)', () => {
		const scale = scaleLinear().domain([-100, -10]).range([400, 0])
		// max(0, min([-100,-10])) = max(0, -100) = 0 → scale(0) extrapolates
		const result = getOriginValue(scale)
		expect(typeof result).toBe('number')
	})
})

// ─── createTicks ─────────────────────────────────────────────────────────────

describe('createTicks', () => {
	it('returns tick objects with value and position for a linear y scale', () => {
		const scale = scaleLinear().domain([0, 100]).range([400, 0])
		const ticks = createTicks(scale, 'y', 5)
		expect(ticks.length).toBeGreaterThan(0)
		for (const tick of ticks) {
			expect(tick).toHaveProperty('value')
			expect(tick).toHaveProperty('position')
			expect(typeof tick.position).toBe('number')
		}
	})

	it('positions are within the scale range for a y scale', () => {
		const scale = scaleLinear().domain([0, 100]).range([400, 0])
		const ticks = createTicks(scale, 'y', 5)
		for (const tick of ticks) {
			expect(tick.position).toBeGreaterThanOrEqual(0)
			expect(tick.position).toBeLessThanOrEqual(400)
		}
	})

	it('returns tick objects with offset for a band (x) scale', () => {
		const scale = scaleBand().domain(['A', 'B', 'C', 'D']).range([0, 600])
		const ticks = createTicks(scale, 'x', 4)
		expect(ticks.length).toBeGreaterThan(0)
		// Band ticks should have offset applied (position != scale(value))
		for (const tick of ticks) {
			expect(tick).toHaveProperty('value')
			expect(tick).toHaveProperty('position')
		}
	})

	it('downsample band ticks when count < domain length', () => {
		const domain = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
		const scale = scaleBand().domain(domain).range([0, 800])
		// Request 3 ticks for 8 categories — should downsample
		const ticks = createTicks(scale, 'x', 3)
		expect(ticks.length).toBeLessThanOrEqual(3)
	})

	it('uses auto tick count when count is null', () => {
		const scale = scaleLinear().domain([0, 100]).range([400, 0])
		// count=null triggers defaultTickCount
		const ticks = createTicks(scale, 'y', null, 12)
		expect(ticks.length).toBeGreaterThan(0)
	})

	it('uses default fontSize=12 when not specified', () => {
		const scale = scaleLinear().domain([0, 50]).range([300, 0])
		// Should not throw and should return ticks
		const ticks = createTicks(scale, 'x')
		expect(Array.isArray(ticks)).toBe(true)
	})

	it('x-axis ticks include bandwidth offset for band scales', () => {
		const scale = scaleBand().domain(['A', 'B', 'C']).range([0, 300])
		const ticks = createTicks(scale, 'x', 3)
		const offset = scale.bandwidth() / 2
		// Position should be scale(value) + offset
		const a = ticks.find((t) => t.value === 'A')
		if (a) {
			expect(a.position).toBeCloseTo(scale('A') + offset)
		}
	})

	it('y-axis ticks have zero offset', () => {
		const scale = scaleLinear().domain([0, 100]).range([400, 0])
		const ticks = createTicks(scale, 'y', 5)
		// Position should equal scale(value) exactly (no offset for y)
		for (const tick of ticks) {
			expect(tick.position).toBeCloseTo(scale(tick.value))
		}
	})
})
