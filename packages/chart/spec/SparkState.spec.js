import { describe, it, expect } from 'vitest'
import { SparkState } from '../src/SparkState.svelte.js'
import { defaultPreset } from '../src/lib/preset.js'
import { distinct, assignColors } from '../src/lib/brewing/colors.js'

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

describe('SparkState — geom lifecycle', () => {
	const cfg = { type: 'line', channels: { x: 'day', y: 'sales' }, stat: 'identity' }

	it('returns a distinct id per registered geom', () => {
		const s = make()
		expect(s.registerGeom(cfg)).not.toBe(s.registerGeom(cfg))
	})

	it('geomData returns the SAME array identity for stat=identity', () => {
		const s = make()
		expect(s.geomData(s.registerGeom(cfg))).toBe(s.data)
	})

	it('geomData returns [] for an unknown id', () => {
		expect(make().geomData('no-such-geom')).toEqual([])
	})

	it('defaults to identity when a geom omits stat', () => {
		const s = make()
		const id = s.registerGeom({ type: 'line', channels: { x: 'day', y: 'sales' } })
		expect(s.geomData(id)).toBe(s.data)
	})

	it('aggregates when a stat is set', () => {
		const s = new SparkState({
			data: [
				{ k: 'a', v: 1 },
				{ k: 'a', v: 3 },
				{ k: 'b', v: 5 }
			],
			channels: { x: 'k', y: 'v' }
		})
		const id = s.registerGeom({ type: 'bar', channels: { x: 'k', y: 'v' }, stat: 'sum' })
		const out = s.geomData(id)
		expect(out).toHaveLength(2)
		expect(out.find((r) => r.k === 'a').v).toBe(4)
	})

	it('merges container channels with geom channels, geom winning', () => {
		const s = new SparkState({
			data: [
				{ k: 'a', v: 1 },
				{ k: 'a', v: 3 }
			],
			channels: { x: 'k', y: 'v' }
		})
		// The geom supplies only a stat; x/y must come from the container.
		const id = s.registerGeom({ type: 'bar', channels: {}, stat: 'sum' })
		const out = s.geomData(id)
		expect(out).toHaveLength(1)
		expect(out[0].v).toBe(4)
	})

	it('a geom channel value wins over the container value for the same key', () => {
		const s = new SparkState({
			data: [
				{ k: 'a', v: 1, other: 100 },
				{ k: 'a', v: 3, other: 200 }
			],
			channels: { x: 'k', y: 'v' }
		})
		// The geom overrides y with a DIFFERENT field than the container's. If the merge
		// order were reversed (container wins), this would aggregate `v` (sum 4) instead
		// of `other` (sum 300) — the two orders are only distinguishable when the values
		// for the same key actually differ, which the other merge test above deliberately
		// does not exercise.
		const id = s.registerGeom({ type: 'bar', channels: { y: 'other' }, stat: 'sum' })
		const out = s.geomData(id)
		expect(out).toHaveLength(1)
		expect(out[0].other).toBe(300)
		expect(out[0]).not.toHaveProperty('v')
	})

	it('an explicit undefined channel inherits from the container instead of clobbering it', () => {
		const s = new SparkState({
			data: [
				{ k: 'a', v: 1 },
				{ k: 'a', v: 3 },
				{ k: 'b', v: 5 }
			],
			channels: { x: 'k', y: 'v' }
		})
		// Mirrors a real geom component: Line.svelte always passes every channel key from
		// $props() (`channels: { x, y, color, fill, symbol }`), so a geom that omits x/y to
		// inherit them from the container sends `{ x: undefined, y: undefined }`, not `{}`.
		const id = s.registerGeom({
			type: 'bar',
			channels: { x: undefined, y: undefined },
			stat: 'sum'
		})
		const out = s.geomData(id)
		expect(out).toHaveLength(2)
		expect(out.find((r) => r.k === 'a').v).toBe(4)
		expect(out.find((r) => r.k === 'b').v).toBe(5)
	})

	it('updateGeom changes the stat applied', () => {
		const s = new SparkState({
			data: [
				{ k: 'a', v: 1 },
				{ k: 'a', v: 3 }
			],
			channels: { x: 'k', y: 'v' }
		})
		const id = s.registerGeom({ type: 'bar', channels: { x: 'k', y: 'v' }, stat: 'identity' })
		expect(s.geomData(id)).toHaveLength(2)
		s.updateGeom(id, { channels: { x: 'k', y: 'v' }, stat: 'sum' })
		expect(s.geomData(id)).toHaveLength(1)
	})

	it('updateGeom only updates the targeted geom, leaving others unchanged', () => {
		const s = new SparkState({
			data: [
				{ k: 'a', v: 1 },
				{ k: 'a', v: 3 }
			],
			channels: { x: 'k', y: 'v' }
		})
		const idA = s.registerGeom({ type: 'bar', channels: { x: 'k', y: 'v' }, stat: 'identity' })
		const idB = s.registerGeom({ type: 'line', channels: { x: 'k', y: 'v' }, stat: 'identity' })
		s.updateGeom(idA, { channels: { x: 'k', y: 'v' }, stat: 'sum' })
		expect(s.geomData(idA)).toHaveLength(1)
		// idB was never updated — it must still be the untouched identity data, not
		// picked up by idA's stat change.
		expect(s.geomData(idB)).toBe(s.data)
		expect(s.geomData(idB)).toEqual([
			{ k: 'a', v: 1 },
			{ k: 'a', v: 3 }
		])
	})

	it('updateGeom on an unknown id is a no-op, not a throw', () => {
		const s = make()
		const id = s.registerGeom(cfg)
		expect(() => s.updateGeom('no-such-geom', { stat: 'sum' })).not.toThrow()
		// The real geom must be unaffected...
		expect(s.geomData(id)).toBe(s.data)
		// ...and no spurious geom must have been registered under the unknown id.
		expect(s.geomData('no-such-geom')).toEqual([])
	})

	it('unregisterGeom removes it', () => {
		const s = make()
		const id = s.registerGeom(cfg)
		s.unregisterGeom(id)
		expect(s.geomData(id)).toEqual([])
	})

	it('unregisterGeom leaves other geoms intact', () => {
		const s = make()
		const a = s.registerGeom(cfg)
		const b = s.registerGeom(cfg)
		s.unregisterGeom(a)
		expect(s.geomData(b)).toBe(s.data)
	})

	it('unregisterGeom on an unknown id is a no-op, not a throw', () => {
		const s = make()
		const id = s.registerGeom(cfg)
		expect(() => s.unregisterGeom('no-such-geom')).not.toThrow()
		// The real geom must still be registered and unaffected — a sabotaged
		// unregisterGeom that wipes #geoms on any unknown id would empty this out.
		expect(s.geomData(id)).toBe(s.data)
	})
})

describe('SparkState — colors', () => {
	it('assigns one color entry per distinct series value, each with fill and stroke', () => {
		const data = [
			{ day: 0, sales: 10, region: 'east' },
			{ day: 1, sales: 20, region: 'west' },
			{ day: 2, sales: 30, region: 'east' }
		]
		const s = new SparkState({ data, channels: { x: 'day', y: 'sales', color: 'region' } })
		const expected = assignColors(distinct(data, 'region'), 'light', defaultPreset)
		expect(s.colors).toEqual(expected)
		expect(s.colors.size).toBe(2)
		expect(s.colors.get('east')).toEqual(expect.objectContaining({ fill: expect.any(String), stroke: expect.any(String) }))
	})

	it('falls back to a single-entry palette when there is no color or fill channel', () => {
		const s = make()
		const expected = assignColors([null], 'light', defaultPreset)
		expect(s.colors).toEqual(expected)
		expect(s.colors.size).toBe(1)
	})

	it('resolves the fill channel when color is absent', () => {
		const data = [
			{ day: 0, sales: 10, region: 'east' },
			{ day: 1, sales: 20, region: 'west' }
		]
		const s = new SparkState({ data, channels: { x: 'day', y: 'sales', fill: 'region' } })
		const expected = assignColors(distinct(data, 'region'), 'light', defaultPreset)
		expect(s.colors).toEqual(expected)
		expect([...s.colors.keys()].sort()).toEqual(['east', 'west'])
	})

	it('prefers the color channel over fill when both are set', () => {
		// region (color) has 3 distinct values; team (fill) has only 1 — the two fields
		// give different answers, so this only passes if `color` truly wins over `fill`.
		const data = [
			{ day: 0, sales: 10, region: 'east', team: 'alpha' },
			{ day: 1, sales: 20, region: 'west', team: 'alpha' },
			{ day: 2, sales: 30, region: 'north', team: 'alpha' }
		]
		const s = new SparkState({
			data,
			channels: { x: 'day', y: 'sales', color: 'region', fill: 'team' }
		})
		const expected = assignColors(distinct(data, 'region'), 'light', defaultPreset)
		expect(s.colors).toEqual(expected)
		expect(s.colors.size).toBe(3)
		expect([...s.colors.keys()].sort()).toEqual(['east', 'north', 'west'])
	})
})

describe('SparkState — inert members', () => {
	it('returns empty patterns and symbols maps', () => {
		const s = make()
		expect(s.patterns).toEqual(new Map())
		expect(s.symbols).toEqual(new Map())
	})

	it('is never flipped', () => {
		expect(make().isFlipped).toBe(false)
	})

	it('reports vertical orientation', () => {
		expect(make().orientation).toBe('vertical')
	})

	it('is never a continuous category axis', () => {
		expect(make().continuousCategory).toBe(false)
	})

	it('has no continuous color scale', () => {
		expect(make().continuousColorScale).toBe(null)
	})

	it('is never interactive', () => {
		expect(make().interactive).toBe(false)
	})

	it('place() is the identity mapping for several coordinate pairs', () => {
		const s = make()
		expect(s.place(12, 34)).toEqual({ x: 12, y: 34 })
		expect(s.place(0, 0)).toEqual({ x: 0, y: 0 })
		expect(s.place(-5, 100)).toEqual({ x: -5, y: 100 })
	})

	it('setHovered/clearHovered/handleSelect are no-ops: they do not throw and leave state unchanged', () => {
		const s = make()
		const before = {
			data: s.data,
			channels: s.channels,
			colors: s.colors,
			xScaleDomain: s.xScale.domain(),
			yScaleDomain: s.yScale.domain()
		}
		expect(() => s.setHovered({ day: 0, sales: 10 })).not.toThrow()
		expect(() => s.clearHovered()).not.toThrow()
		expect(() => s.handleSelect({ datum: { day: 0, sales: 10 } })).not.toThrow()
		expect(s.data).toBe(before.data)
		expect(s.channels).toEqual(before.channels)
		expect(s.colors).toEqual(before.colors)
		expect(s.xScale.domain()).toEqual(before.xScaleDomain)
		expect(s.yScale.domain()).toEqual(before.yScaleDomain)
	})
})
