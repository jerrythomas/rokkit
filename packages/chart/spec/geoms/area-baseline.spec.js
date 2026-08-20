import { describe, it, expect } from 'vitest'
import { scaleLinear } from 'd3-scale'
import { render } from '@testing-library/svelte'
import { buildAreas } from '../../src/geoms/lib/areas.js'
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

	it('renders exactly two signed paths for a single series', () => {
		const { container } = render(TestArea, { state: areaState(), options: { baseline: 0 } })
		expect(container.querySelectorAll('[data-plot-area-sign]').length).toBe(2)
	})

	it('draws valid paths for both signed segments', () => {
		const { container } = render(TestArea, { state: areaState(), options: { baseline: 0 } })
		for (const p of container.querySelectorAll('[data-plot-area-sign]')) {
			const d = p.getAttribute('d')
			expect(d).toBeTruthy()
			expect(d).not.toContain('NaN')
		}
	})
})
