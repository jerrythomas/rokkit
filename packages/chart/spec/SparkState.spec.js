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

	it('survives empty data without throwing', () => {
		const s = new SparkState({ data: [], channels: { x: 'day', y: 'sales' } })
		expect(s.data).toEqual([])
		expect(() => s.xScale).not.toThrow()
		expect(() => s.yScale).not.toThrow()
	})

	it('exposes the shared default chart preset (single-series, no color channel)', () => {
		expect(make().chartPreset).toBe(defaultPreset)
	})
})

describe('SparkState — scales', () => {
	it('builds an x scale spanning the full width', () => {
		expect(make().xScale.range()).toEqual([0, 80])
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
})

describe('SparkState — update', () => {
	it('re-applies config so props stay live', () => {
		const s = make()
		s.update({ data: rows, channels: { x: 'day', y: 'sales' }, width: 200, height: 50 })
		expect(s.innerWidth).toBe(200)
		expect(s.xScale.range()).toEqual([0, 200])
	})
})
