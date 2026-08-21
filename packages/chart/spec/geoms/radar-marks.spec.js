import { describe, it, expect } from 'vitest'
import { buildRadarMarks } from '../../src/geoms/lib/marks/radar.js'
import { defaultPreset } from '../../src/lib/preset.js'
import { createMockState } from '../helpers/mock-plot-state.js'

const AXES = ['metric1', 'metric2', 'metric3']

const oneSeries = [
	{ axis: 'metric1', value: 10, series: 'S1' },
	{ axis: 'metric2', value: 20, series: 'S1' },
	{ axis: 'metric3', value: 15, series: 'S1' }
]

const twoSeries = [
	...oneSeries,
	{ axis: 'metric1', value: 5, series: 'S2' },
	{ axis: 'metric2', value: 8, series: 'S2' },
	{ axis: 'metric3', value: 12, series: 'S2' }
]

// metric2 is entirely absent for S1 here — a genuine missing cell, not a zero.
const gappedSeries = [
	{ axis: 'metric1', value: 10, series: 'S1' },
	{ axis: 'metric3', value: 15, series: 'S1' }
]

const colors = new Map([
	['S1', { fill: 'lightblue', stroke: 'darkblue' }],
	['S2', { fill: 'lightred', stroke: 'darkred' }]
])

function fakePlot(overrides = {}) {
	return createMockState({
		colors,
		chartPreset: defaultPreset,
		...overrides
	})
}

// Pulls the x,y of the path's first "M" (moveto) command out of an SVG path string,
// so a test can check the actual plotted position of a specific vertex.
function firstPoint(d) {
	const found = d.match(/^M(-?[\d.]+),(-?[\d.]+)/)
	if (!found) throw new Error(`no leading M command in path: ${d}`)
	return { x: Number(found[1]), y: Number(found[2]) }
}

function countMoves(d) {
	return (d.match(/M/g) || []).length
}

function fillsOf(marks) {
	return marks.filter((m) => m.fill !== 'none')
}

function strokesOf(marks) {
	return marks.filter((m) => m.stroke !== 'none')
}

describe('buildRadarMarks', () => {
	it('one series over 3 axes yields one fill polygon + one stroke polygon, both with a non-empty, NaN-free d', () => {
		const marks = buildRadarMarks({
			data: oneSeries,
			plot: fakePlot(),
			channels: { x: 'axis', y: 'value', color: 'series' },
			options: { axes: AXES },
			type: 'radar'
		})

		const fills = fillsOf(marks)
		const strokes = strokesOf(marks)
		expect(fills).toHaveLength(1)
		expect(strokes).toHaveLength(1)

		for (const mark of [...fills, ...strokes]) {
			expect(mark.d).toBeTruthy()
			expect(mark.d.length).toBeGreaterThan(0)
			expect(mark.d).not.toMatch(/NaN/)
		}
	})

	it('places the first axis (-90deg, full radius) at the top: x ≈ 0, y < 0', () => {
		const marks = buildRadarMarks({
			data: oneSeries,
			plot: fakePlot(),
			channels: { x: 'axis', y: 'value', color: 'series' },
			options: { axes: AXES },
			type: 'radar'
		})
		const [fill] = fillsOf(marks)
		const { x, y } = firstPoint(fill.d)

		// metric1's only value (10) is also its domain max, so it sits at the FULL
		// computed radius — isolating the angle conversion from the value→radius mapping.
		expect(x).toBeCloseTo(0, 5)
		expect(y).toBeLessThan(0)
	})

	it('two series yield two fill polygons with different fills', () => {
		const marks = buildRadarMarks({
			data: twoSeries,
			plot: fakePlot(),
			channels: { x: 'axis', y: 'value', color: 'series' },
			options: { axes: AXES },
			type: 'radar'
		})
		const fills = fillsOf(marks)
		expect(fills).toHaveLength(2)
		expect(fills.map((m) => m.fill).sort()).toEqual(['lightblue', 'lightred'])
	})

	it('a missing cell (null vertex) breaks the path instead of closing across the gap', () => {
		const complete = buildRadarMarks({
			data: oneSeries,
			plot: fakePlot(),
			channels: { x: 'axis', y: 'value', color: 'series' },
			options: { axes: AXES },
			type: 'radar'
		})
		const gapped = buildRadarMarks({
			data: gappedSeries,
			plot: fakePlot(),
			channels: { x: 'axis', y: 'value', color: 'series' },
			options: { axes: AXES },
			type: 'radar'
		})

		const [completeFill] = fillsOf(complete)
		const [gappedFill] = fillsOf(gapped)

		const completeMoves = countMoves(completeFill.d)
		const gappedMoves = countMoves(gappedFill.d)

		// A complete series draws as a single continuous subpath (one "M"). A gap forces
		// the generator to start a new subpath after the break, so it must have MORE
		// moves than the complete series — an implementation that (wrongly) drew straight
		// through the missing vertex would produce the same single-M path as the complete
		// case, so this comparison is falsifiable.
		expect(completeMoves).toBe(1)
		expect(gappedMoves).toBeGreaterThan(completeMoves)
	})

	it('paint order: every fill mark precedes every stroke mark', () => {
		const marks = buildRadarMarks({
			data: twoSeries,
			plot: fakePlot(),
			channels: { x: 'axis', y: 'value', color: 'series' },
			options: { axes: AXES },
			type: 'radar'
		})
		expect(marks.length).toBeGreaterThan(0)

		const roles = marks.map((m) => (m.fill === 'none' ? 'stroke' : 'fill'))
		const lastFillIndex = roles.lastIndexOf('fill')
		const firstStrokeIndex = roles.indexOf('stroke')

		// With two series, a fill-then-stroke-PER-SERIES implementation interleaves
		// (fill1, stroke1, fill2, stroke2), which puts a fill AFTER the first stroke —
		// so this assertion fails under that (wrong) ordering.
		expect(lastFillIndex).toBeLessThan(firstStrokeIndex)
	})

	it('fill opacity comes from preset.opacity.radar (0.25), not 1', () => {
		const marks = buildRadarMarks({
			data: oneSeries,
			plot: fakePlot(),
			channels: { x: 'axis', y: 'value', color: 'series' },
			options: { axes: AXES },
			type: 'radar'
		})
		const [fill] = fillsOf(marks)
		// Asserts the actual resolved alpha a caller would see, not the config value in
		// isolation — if `opacity.radar` were ever removed, `resolveAlpha` falls back to a
		// fully-opaque 1, which is exactly the silent-visual-bug this default prevents.
		expect(fill.alpha).toBe(0.25)
		expect(fill.alpha).not.toBe(1)
	})

	it('R is reduced by the label margin: the outer vertex sits strictly inside min(w,h)/2', () => {
		const plot = fakePlot()
		const marks = buildRadarMarks({
			data: oneSeries,
			plot,
			channels: { x: 'axis', y: 'value', color: 'series' },
			options: { axes: AXES },
			type: 'radar'
		})
		const [fill] = fillsOf(marks)
		// metric1 sits at full computed radius (see the angle-conversion test above), so
		// its distance from centre IS the geom's resolved R.
		const { x, y } = firstPoint(fill.d)
		const resolvedR = Math.hypot(x, y)
		const rawR = Math.min(plot.innerWidth, plot.innerHeight) / 2

		expect(resolvedR).toBeGreaterThan(0)
		expect(resolvedR).toBeLessThan(rawR)
	})

	it('sets patternId per series when channels.pattern is given, using plot.patterns', () => {
		const patterns = new Map([['S1', 'dots']])
		const withPattern = buildRadarMarks({
			data: oneSeries,
			plot: fakePlot({ patterns }),
			channels: { x: 'axis', y: 'value', color: 'series', pattern: 'series' },
			options: { axes: AXES },
			type: 'radar'
		})
		const [fillWithPattern] = fillsOf(withPattern)
		expect(fillWithPattern.patternId).toBe('chart-pat-S1')

		const withoutPattern = buildRadarMarks({
			data: oneSeries,
			plot: fakePlot({ patterns }),
			channels: { x: 'axis', y: 'value', color: 'series' },
			options: { axes: AXES },
			type: 'radar'
		})
		const [fillWithoutPattern] = fillsOf(withoutPattern)
		expect(fillWithoutPattern.patternId).toBeFalsy()
	})
})
