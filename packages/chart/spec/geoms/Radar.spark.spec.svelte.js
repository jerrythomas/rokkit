import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import SparkRadarHarness from '../helpers/SparkRadarHarness.svelte'
import {
	resolveRadarRadius,
	LABEL_MARGIN,
	MIN_PLOT_RADIUS,
	MICRO_THRESHOLD
} from '../../src/geoms/lib/marks/radar.js'

/**
 * The micro form: <Radar> inside <Spark> is a static gestalt glyph — the polygon and
 * nothing else. No rings, spokes, axis labels, vertex hit targets or tooltips, because
 * a 24px minimum hit target does not fit in a 24px-tall glyph even once.
 */

const AXES = ['speed', 'power', 'range', 'grip']

const data = [
	{ metric: 'speed', score: 8 },
	{ metric: 'power', score: 5 },
	{ metric: 'range', score: 9 },
	{ metric: 'grip', score: 3 }
]

const el = (container, name) => [...container.querySelectorAll(`[data-plot-element="${name}"]`)]

describe('Radar — micro form inside Spark', () => {
	it('renders a polygon with real extent, not a collapsed point', () => {
		const { container } = render(SparkRadarHarness, { data, axes: AXES })

		const areas = el(container, 'radar-area')
		expect(areas.length).toBe(1)

		const d = areas[0].getAttribute('d')
		expect(d).toBeTruthy()
		expect(d).not.toMatch(/NaN/)

		// The real assertion: the polygon encloses actual area. A radius collapsed to 0
		// still yields a syntactically valid path ("M0,0A0,0..."), so asserting the path
		// merely exists would pass on a glyph that renders as an invisible dot.
		const coords = [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map(([, x, y]) => ({
			x: Number(x),
			y: Number(y)
		}))
		expect(coords.length).toBeGreaterThan(0)
		const maxRadius = Math.max(...coords.map((p) => Math.hypot(p.x, p.y)))
		expect(maxRadius).toBeGreaterThan(1)
	})

	it('renders no grid, no labels and no hit targets', () => {
		const { container } = render(SparkRadarHarness, { data, axes: AXES })

		expect(el(container, 'radar-grid-ring').length).toBe(0)
		expect(el(container, 'radar-grid-spoke').length).toBe(0)
		expect(el(container, 'radar-axis-label').length).toBe(0)
		expect(el(container, 'radar-vertex').length).toBe(0)
	})

	it('warns when the axis count leaves the legible 3-5 range at glyph size', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const sixAxes = ['a', 'b', 'c', 'd', 'e', 'f']
		render(SparkRadarHarness, {
			data: sixAxes.map((metric, i) => ({ metric, score: i + 1 })),
			axes: sixAxes
		})
		expect(warn).toHaveBeenCalled()
		expect(warn.mock.calls.some((c) => /micro/i.test(String(c[0])))).toBe(true)
		warn.mockRestore()
	})

	it('does not warn for an axis count inside the legible range', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		render(SparkRadarHarness, { data, axes: AXES })
		expect(warn.mock.calls.some((c) => /micro/i.test(String(c[0])))).toBe(false)
		warn.mockRestore()
	})

	it('ignores an explicit options.grid request at glyph size', () => {
		// Even asked for a grid, the micro form refuses: there is no room for it, and a
		// consumer composing <Radar> into <Spark> should not have to know that.
		const { container } = render(SparkRadarHarness, {
			data,
			axes: AXES,
			options: { grid: true }
		})
		expect(el(container, 'radar-grid-ring').length).toBe(0)
		expect(el(container, 'radar-grid-spoke').length).toBe(0)
	})
})

/**
 * `resolveRadarRadius` is now the single source of the outer radius: `Radar.svelte` draws
 * the grid/labels/vertices from it and `buildRadarMarks` builds the polygons from it, so
 * the two cannot disagree. These pin the rule itself, including the boundary.
 */
describe('resolveRadarRadius', () => {
	it('spends the whole half-extent on the polygon below the micro threshold', () => {
		// A Spark is 80×24: half-extent 12 against a 32px label margin. Reserving the
		// margin here is what produced R = 0 and an invisible glyph.
		const { R, micro } = resolveRadarRadius(80, 24)
		expect(micro).toBe(true)
		expect(R).toBe(12)
	})

	it('reserves the label margin above the threshold', () => {
		const { R, micro } = resolveRadarRadius(300, 300)
		expect(micro).toBe(false)
		expect(R).toBe(150 - LABEL_MARGIN)
	})

	it('treats the threshold itself as the full form, leaving exactly MIN_PLOT_RADIUS', () => {
		// The threshold is defined as the size at which the margin AND a usable radius
		// both just fit, so this is the boundary the constant is derived from.
		const { R, micro } = resolveRadarRadius(MICRO_THRESHOLD, MICRO_THRESHOLD)
		expect(micro).toBe(false)
		expect(R).toBe(MIN_PLOT_RADIUS)
	})

	it('drops to the micro form one pixel below the threshold', () => {
		expect(resolveRadarRadius(MICRO_THRESHOLD - 1, MICRO_THRESHOLD).micro).toBe(true)
	})

	it('never returns a negative radius for a degenerate size', () => {
		expect(resolveRadarRadius(0, 0).R).toBe(0)
	})

	it('measures the smaller dimension, so a wide thin box is micro', () => {
		// 800 wide but 40 tall is a glyph, not a plot — the limiting dimension decides.
		expect(resolveRadarRadius(800, 40).micro).toBe(true)
	})
})
