import { describe, it, expect } from 'vitest'
import { SparkState } from '../src/SparkState.svelte.js'
import { defaultPreset } from '../src/lib/preset.js'

const rows = [
	{ day: 0, sales: 10 },
	{ day: 1, sales: 30 },
	{ day: 2, sales: 20 }
]
const make = (over = {}) =>
	new SparkState({ data: rows, channels: { x: 'day', y: 'sales' }, width: 80, height: 24, ...over })
// A realistic trailing-N-day spark: day 0..n-1, value = day (values don't matter for x tests).
const daySeries = (n) => Array.from({ length: n }, (_, i) => ({ day: i, sales: i }))

describe('SparkState — dimensions and data', () => {
	it('exposes width/height as the inner box (sparks have no margin)', () => {
		const s = make()
		expect(s.innerWidth).toBe(80)
		expect(s.innerHeight).toBe(24)
	})

	it('defaults to 80x24', () => {
		const s = new SparkState({ data: rows, channels: { x: 'day', y: 'sales' } })
		expect(s.innerWidth).toBe(80)
		expect(s.innerHeight).toBe(24)
	})

	it('returns the same array identity it was given', () => {
		const s = make()
		expect(s.data).toBe(rows)
	})

	it('exposes the channels it was configured with', () => {
		expect(make().channels).toEqual({ x: 'day', y: 'sales' })
	})

	it('survives empty data without throwing, degrading to a zero-extent domain', () => {
		const s = new SparkState({ data: [], channels: { x: 'day', y: 'sales' } })
		expect(s.data).toEqual([])
		expect(s.xScale.domain()).toEqual([0, 0])
		expect(s.yScale.domain()).toEqual([0, 0])
	})

	it('exposes the shared default chart preset (single-series, no color channel)', () => {
		expect(make().chartPreset).toBe(defaultPreset)
	})
})

describe('SparkState — scales', () => {
	it('builds an x scale spanning the full width, with an exact (un-niced) domain', () => {
		const s = make()
		expect(s.xScale.range()).toEqual([0, 80])
		// day 0..2 — assert the DOMAIN too: a niced scale would still report range [0, 80]
		// while quietly stopping short of it for the actual data extent.
		expect(s.xScale.domain()).toEqual([0, 2])
	})

	it('does not nice the x domain for a realistic 30-day trailing window', () => {
		const s = make({ data: daySeries(30) })
		// day 0..29 — a niced scale would round this out to e.g. [0, 30]
		expect(s.xScale.domain()).toEqual([0, 29])
	})

	it('maps the last point of a 30-day window to the full width, not short of the edge', () => {
		const s = make({ data: daySeries(30) })
		expect(s.xScale(29)).toBe(80)
	})

	it('builds an inverted y scale spanning the full height', () => {
		expect(make().yScale.range()).toEqual([24, 0])
	})

	it('maps a larger value nearer the top of the box', () => {
		const s = make()
		expect(s.yScale(30)).toBeLessThan(s.yScale(10))
	})

	it('honours an explicit min/max domain', () => {
		expect(make({ min: 0, max: 100 }).yScale.domain()).toEqual([0, 100])
	})

	it('extends the domain downward to include a baseline below the data', () => {
		const s = make({ baseline: 0, data: [{ day: 0, sales: 5 }, { day: 1, sales: 9 }] })
		expect(s.yScale.domain()[0]).toBeLessThanOrEqual(0)
	})

	it('extends the domain upward to include a baseline above the data', () => {
		const s = make({ baseline: 50, data: [{ day: 0, sales: 5 }, { day: 1, sales: 9 }] })
		expect(s.yScale.domain()[1]).toBeGreaterThanOrEqual(50)
	})

	it('does not nice a non-round domain (a spark uses its full box, not padded tick labels)', () => {
		const s = make({ data: [{ day: 0, sales: 1 }, { day: 1, sales: 9.5 }] })
		expect(s.yScale.domain()).toEqual([1, 9.5])
	})

	it('filters out a non-numeric y value instead of poisoning the domain to NaN', () => {
		const s = make({ data: [{ day: 0, sales: 'abc' }, { day: 1, sales: 5 }] })
		expect(s.yScale.domain()).toEqual([5, 5])
		expect(s.yScale.domain().every(Number.isFinite)).toBe(true)
	})

	it('filters out a row missing the y field instead of poisoning the domain to NaN', () => {
		const s = make({ data: [{ day: 0 }, { day: 1, sales: 8 }] })
		expect(s.yScale.domain()).toEqual([8, 8])
		expect(s.yScale.domain().every(Number.isFinite)).toBe(true)
	})

	it('degrades to a zero-extent domain (not NaN) when every y value is non-numeric', () => {
		const s = make({ data: [{ day: 0, sales: 'a' }, { day: 1, sales: 'b' }] })
		expect(s.yScale.domain()).toEqual([0, 0])
		expect(s.yScale.domain().every(Number.isFinite)).toBe(true)
	})
})

describe('SparkState — update', () => {
	it('re-applies config so props stay live', () => {
		const s = make()
		s.update({ data: rows, channels: { x: 'day', y: 'sales' }, width: 200, height: 50 })
		expect(s.innerWidth).toBe(200)
		expect(s.xScale.range()).toEqual([0, 200])
	})
})
