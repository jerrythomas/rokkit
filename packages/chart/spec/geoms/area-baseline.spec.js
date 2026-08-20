import { describe, it, expect } from 'vitest'
import { scaleLinear } from 'd3-scale'
import { render } from '@testing-library/svelte'
import { buildAreas } from '../../src/geoms/lib/areas.js'
import { buildAreaMarks } from '../../src/geoms/lib/marks/area.js'
import { defaultPreset } from '../../src/lib/preset.js'
import TestArea from '../helpers/TestArea.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

const data = [
	{ x: 0, y: 5 },
	{ x: 1, y: -3 },
	{ x: 2, y: 4 }
]
const channels = { x: 'x', y: 'y' }
const xScale = scaleLinear().domain([0, 2]).range([0, 100])
const yScale = scaleLinear().domain([-5, 5]).range([50, 0])
const colors = new Map([[undefined, { fill: '#888', stroke: '#888' }]])

// Pulls every (x, y) pair out of an SVG path `d` string, in emission order. d3's area
// generator emits the top edge first (forward, in the order rows were given) and then the
// base edge (reversed) before closing — used below to isolate exactly which edge a given
// pixel belongs to, instead of substring-matching the whole path.
// Assumes the default linear curve (only `ML` commands, one point per row): the clamp in
// `toEdge` runs per-row, in value space, before the curve generator ever sees the points, so
// which curve interpolates between them doesn't change what's being asserted here. It's just
// that this regex can't parse the output of a non-linear curve — 'smooth' emits bezier `C`
// commands it won't match, and 'step' inserts extra interpolated points that would break the
// "first half is the top edge" split above. A baseline+curve test needs its own point-parser.
const parsePoints = (d) => [...d.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])])

describe('buildAreas — baseline split', () => {
	it('returns a single unsigned segment when no baseline is given', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors)
		expect(segs).toHaveLength(1)
		expect(segs[0].sign).toBeUndefined()
	})

	it('splits into above and below segments when a baseline is given', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		expect(segs.map((s) => s.sign)).toEqual(['above', 'below'])
	})

	it('gives both segments a drawable path', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		for (const s of segs) {
			expect(s.d).toBeTruthy()
			expect(s.d).not.toContain('NaN')
		}
	})

	it('anchors the base edge at the baseline pixel for every row, in both segments', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		const baselinePx = yScale(0)
		for (const s of segs) {
			const points = parsePoints(s.d)
			// Base edge is the second half of the point list (reversed x order).
			const baseYs = points.slice(data.length).map(([, y]) => y)
			for (const y of baseYs) expect(y).toBe(baselinePx)
		}
	})

	it('keeps the fill/stroke aesthetics it already resolved', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		expect(segs[0].fill).toBe('#888')
	})

	it('gives each emitted segment a distinct key', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		const keys = segs.map((s) => s.key)
		expect(new Set(keys).size).toBe(keys.length)
	})

	// Pins the actual clamp direction per point (not just "some pixel appears somewhere in the
	// string"), so disabling the clamp — e.g. reverting `toEdge` to always use the unclamped raw
	// value — fails these two tests. Values: y=5 -> pixel 0, y=-3 -> pixel 40, y=4 -> pixel 5;
	// baseline (y=0) -> pixel 25.
	it('the "above" segment keeps above-baseline points at their real pixel and clamps below-baseline points to the baseline', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		const above = segs.find((s) => s.sign === 'above')
		const topYs = parsePoints(above.d)
			.slice(0, data.length)
			.map(([, y]) => y)
		expect(topYs).toEqual([0, 25, 5])
	})

	it('the "below" segment keeps below-baseline points at their real pixel and clamps above-baseline points to the baseline', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		const below = segs.find((s) => s.sign === 'below')
		const topYs = parsePoints(below.d)
			.slice(0, data.length)
			.map(([, y]) => y)
		expect(topYs).toEqual([25, 40, 25])
	})

	it('falls back to the unsigned single-segment behaviour when the baseline is NaN', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, NaN)
		expect(segs).toHaveLength(1)
		expect(segs[0].sign).toBeUndefined()
		expect(segs[0].d).not.toContain('NaN')
	})

	it('does not corrupt the category axis when place() flips x/y (horizontal orientation)', () => {
		// place(u, v) normally maps u (category position) -> x, v (value position) -> y. This
		// flip sends the category position to y instead — exactly how a horizontal/flipped
		// orientation is implemented. The clamp must apply to the value (now on x), never to
		// the category coordinate that ends up on y.
		const flip = (u, v) => ({ x: v, y: u })
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, flip, 0)
		const categoryPixels = data.map((d) => xScale(d.x)) // [0, 50, 100]
		for (const s of segs) {
			for (const [, y] of parsePoints(s.d)) {
				expect(categoryPixels).toContain(y)
			}
		}
	})

	it('keeps signed keys distinct when a grouped color channel mixes a number and its string twin', () => {
		// Two groups whose color-field values are loosely equal (5 vs '5') but strictly
		// distinct. Svelte's keyed {#each} in Area.svelte keys on the raw group value directly
		// when there's no baseline, so 5 and '5' were always kept apart there — a signed key
		// built by string-templating the group value must preserve that, not collapse them.
		const mixedData = [
			{ x: 0, y: 5, cat: 5 },
			{ x: 1, y: -3, cat: 5 },
			{ x: 0, y: 4, cat: '5' },
			{ x: 1, y: 2, cat: '5' }
		]
		const mixedColors = new Map([
			[5, { fill: '#111', stroke: '#111' }],
			['5', { fill: '#222', stroke: '#222' }]
		])
		const segs = buildAreas(
			mixedData,
			{ x: 'x', y: 'y', color: 'cat' },
			xScale,
			yScale,
			mixedColors,
			undefined,
			undefined,
			undefined,
			0
		)
		expect(segs).toHaveLength(4)
		const keys = segs.map((s) => s.key)
		expect(new Set(keys).size).toBe(4)
	})

	it('keeps signed keys distinct when a grouped color channel mixes an absent value and an explicit null', () => {
		// Two groups that are both "no value" in different ways: one row set never has the
		// color field at all (d[cf] reads as `undefined`), the other sets it explicitly to
		// `null`. Both are real, distinct groups — not "there is no grouping" — so a grouped
		// segment must discriminate even here; a bare sign for "falsy-ish key" would collapse
		// these two onto the same "above"/"below" pair, which is the exact crash this guards.
		const nullishData = [
			{ x: 0, y: 5 },
			{ x: 1, y: -3 },
			{ x: 0, y: 4, cat: null },
			{ x: 1, y: 2, cat: null }
		]
		const nullishColors = new Map([
			[undefined, { fill: '#111', stroke: '#111' }],
			[null, { fill: '#222', stroke: '#222' }]
		])
		const segs = buildAreas(
			nullishData,
			{ x: 'x', y: 'y', color: 'cat' },
			xScale,
			yScale,
			nullishColors,
			undefined,
			undefined,
			undefined,
			0
		)
		expect(segs).toHaveLength(4)
		const keys = segs.map((s) => s.key)
		expect(new Set(keys).size).toBe(4)
	})
})

describe('buildAreaMarks — baseline preserves the border-stroke color lookup', () => {
	// A signed segment's `key` gets a sign suffix (see the split-key test above); the border
	// stroke lookup in buildAreaMarks must not use that suffixed key to look the group back up
	// in the colors Map, or every bordered+baseline+grouped area would silently lose its border.
	it('keeps the correct per-group border stroke for a grouped, bordered area when a baseline is set', () => {
		const groupedData = [
			{ t: 0, v: 5, region: 'North' },
			{ t: 1, v: -3, region: 'North' },
			{ t: 0, v: 4, region: 'South' },
			{ t: 1, v: 2, region: 'South' }
		]
		const groupColors = new Map([
			['North', { fill: 'lightblue', stroke: 'darkblue' }],
			['South', { fill: 'lightred', stroke: 'darkred' }]
		])
		const plot = {
			xScale: scaleLinear().domain([0, 1]).range([0, 100]),
			yScale: scaleLinear().domain([-5, 5]).range([50, 0]),
			colors: groupColors,
			patterns: new Map(),
			chartPreset: defaultPreset,
			place: (x, y) => ({ x, y })
		}
		const segs = buildAreaMarks({
			data: groupedData,
			plot,
			channels: { x: 't', y: 'v', fill: 'region', color: 'region' },
			options: { baseline: 0 },
			type: 'area'
		})
		expect(segs).toHaveLength(4)
		expect(segs.every((s) => s.stroke !== 'none')).toBe(true)
		expect(segs.map((s) => s.stroke).sort()).toEqual(['darkblue', 'darkblue', 'darkred', 'darkred'])
	})
})

describe('Area geom — baseline hooks', () => {
	const areaState = () =>
		createMockState({
			xScale: scaleLinear().domain([0, 2]).range([0, 100]),
			yScale: scaleLinear().domain([-5, 5]).range([50, 0]),
			geomData: () => data,
			colors: new Map([[undefined, { fill: '#888', stroke: '#888' }]])
		})

	it('keeps the pre-existing hooks untouched', () => {
		const { container } = render(TestArea, { state: areaState() })
		expect(container.querySelector('[data-plot-geom="area"]')).toBeTruthy()
		expect(container.querySelector('[data-plot-element="area"]')).toBeTruthy()
	})

	it('emits no sign attribute without a baseline', () => {
		const { container } = render(TestArea, { state: areaState() })
		expect(container.querySelector('[data-plot-area-sign]')).toBeNull()
	})

	it('adds data-plot-area to every segment path', () => {
		const { container } = render(TestArea, { state: areaState() })
		expect(container.querySelectorAll('[data-plot-area]').length).toBeGreaterThan(0)
	})

	it('emits above and below signed segments with a baseline', () => {
		const { container } = render(TestArea, { state: areaState(), options: { baseline: 0 } })
		expect(container.querySelector('[data-plot-area-sign="above"]')).toBeTruthy()
		expect(container.querySelector('[data-plot-area-sign="below"]')).toBeTruthy()
	})

	it('renders exactly two signed paths for a single series, each with a valid drawable path', () => {
		const { container } = render(TestArea, { state: areaState(), options: { baseline: 0 } })
		const paths = container.querySelectorAll('[data-plot-area-sign]')
		// Assert the collection is non-empty BEFORE looping — a loop-only assertion below would
		// still pass vacuously if the sign attribute were removed entirely (zero iterations).
		expect(paths.length).toBe(2)
		for (const p of paths) {
			const d = p.getAttribute('d')
			expect(d).toBeTruthy()
			expect(d).not.toContain('NaN')
		}
	})
})
