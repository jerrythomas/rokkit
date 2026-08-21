import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import RadarGeometry from './fixtures/RadarGeometry.svelte'
import RadarSqrtWeights, { WEIGHTS, VALUES } from './fixtures/RadarSqrtWeights.svelte'
import RadarLayers from './fixtures/RadarLayers.svelte'
import RadarSparkPlotParity from './fixtures/RadarSparkPlotParity.svelte'
import { defaultPreset } from '../src/lib/preset.js'

/**
 * What this covers that the jsdom suite cannot:
 *
 * JSDOM reports 0 for every field of getBoundingClientRect(), so a jsdom test can compare
 * `cx`/`cy`/`d` attribute strings but can never confirm a vertex actually lands on the pixel
 * its angle and radius imply — attribute equality doesn't rule out a viewBox or margin-group
 * transform putting the whole thing somewhere else. It also cannot read computed style, so
 * "the fill is 0.25 opaque" is unverifiable there.
 *
 * The expected geometry below is written out INDEPENDENTLY of the source: the radius and the
 * angles are recomputed from literal constants rather than by calling resolveRadarRadius or
 * anglesFor. Asserting against the component's own layout call would only prove
 * self-consistency — it would pass just as happily if both moved together in the wrong
 * direction.
 */

async function nextFrames(n = 2) {
	for (let i = 0; i < n; i++) {
		await new Promise((r) => requestAnimationFrame(r))
	}
}

// Pinned duplicates of the source constants — see the note above on independence.
const LABEL_MARGIN = 32
const MICRO_THRESHOLD = 112

/** The full-form outer radius, re-derived rather than imported. */
function expectedRadius(size: number) {
	expect(size).toBeGreaterThanOrEqual(MICRO_THRESHOLD) // else the micro form applies
	return size / 2 - LABEL_MARGIN
}

/** Equal-weight angles: the closed form the weighted formula must reduce to. */
function expectedAngle(i: number, n: number) {
	return -90 + (i * 360) / n
}

/**
 * Centre of an element's real pixel box in the plot's own coordinate space.
 *
 * The origin MUST be the `<svg>`, not the `[data-plot-canvas]` group: getBoundingClientRect
 * on an SVG `<g>` returns the union bbox of its CHILDREN, not the group's coordinate origin,
 * so measuring against the group silently shifts everything by however far the marks happen
 * to start from the edge. The svg's viewBox matches its width/height, so 1 user unit is
 * 1 CSS px and no scale correction is needed; the fixtures use zero margin, so the canvas
 * group sits exactly at the svg origin.
 */
function centerInPlot(el: Element, svg: Element) {
	const a = el.getBoundingClientRect()
	const b = svg.getBoundingClientRect()
	return { x: a.left + a.width / 2 - b.left, y: a.top + a.height / 2 - b.top }
}

const vertexFor = (container: Element, axisKey: string) =>
	container.querySelector(`[data-plot-element="radar-vertex"][data-plot-axis="${axisKey}"]`)!

describe('Radar — real vertex geometry', () => {
	it('places each vertex at the pixel its angle and radius imply', async () => {
		const SIZE = 300
		const { container } = render(RadarGeometry)
		await nextFrames()

		const svg = container.querySelector('svg[data-plot-root]')!
		const R = expectedRadius(SIZE)

		// Declared [0, 10] domains with values 10 / 5 / 2.5 → R, R/2, R/4 under linear.
		const cases = [
			{ key: 'a', i: 0, radius: R },
			{ key: 'b', i: 1, radius: R / 2 },
			{ key: 'c', i: 2, radius: R / 4 }
		]

		expect(cases.length).toBeGreaterThan(0)

		for (const { key, i, radius } of cases) {
			const measured = centerInPlot(vertexFor(container, key), svg)
			const theta = (expectedAngle(i, cases.length) * Math.PI) / 180
			// Origin is the plot centre; zero margin means the canvas group sits at the svg origin.
			const expectedX = SIZE / 2 + radius * Math.cos(theta)
			const expectedY = SIZE / 2 + radius * Math.sin(theta)

			expect(measured.x).toBeCloseTo(expectedX, 0)
			expect(measured.y).toBeCloseTo(expectedY, 0)
		}
	})

	it('puts the first axis at the top and gives the three vertices distinct radii', async () => {
		const SIZE = 300
		const { container } = render(RadarGeometry)
		await nextFrames()

		const svg = container.querySelector('svg[data-plot-root]')!
		const radiusOf = (key: string) => {
			const c = centerInPlot(vertexFor(container, key), svg)
			return Math.hypot(c.x - SIZE / 2, c.y - SIZE / 2)
		}

		// First axis straight up: same x as the centre, strictly above it.
		const a = centerInPlot(vertexFor(container, 'a'), svg)
		expect(a.x).toBeCloseTo(SIZE / 2, 0)
		expect(a.y).toBeLessThan(SIZE / 2)

		// Distinct, ordered radii — a vertex pinned to the ring or the centre fails here.
		expect(radiusOf('a')).toBeGreaterThan(radiusOf('b'))
		expect(radiusOf('b')).toBeGreaterThan(radiusOf('c'))
	})
})

describe('Radar — sqrt transform keeps sector area proportional to weight x value', () => {
	it('measures sector areas in the ratio of weight x value', async () => {
		const SIZE = 320
		const { container } = render(RadarSqrtWeights)
		await nextFrames()

		const svg = container.querySelector('svg[data-plot-root]')!
		const keys = ['a', 'b', 'c']

		// MEASURED: each vertex's radius, in real pixels. GIVEN: the wedge widths, which come
		// from the declared weights. The radius transform is what is under test here, so the
		// measured quantity is the one that could be wrong.
		const total = WEIGHTS.reduce((s, w) => s + w, 0)
		const areas = keys.map((key, i) => {
			const c = centerInPlot(vertexFor(container, key), svg)
			const r = Math.hypot(c.x - SIZE / 2, c.y - SIZE / 2)
			const theta = (2 * Math.PI * WEIGHTS[i]) / total
			return 0.5 * theta * r * r
		})

		expect(areas.every((a) => a > 0)).toBe(true)

		const products = WEIGHTS.map((w, i) => w * VALUES[i])
		// Compare as ratios against the first axis, so the shared R² / domain factors cancel.
		for (let i = 1; i < areas.length; i++) {
			expect(areas[i] / areas[0]).toBeCloseTo(products[i] / products[0], 2)
		}

		// Guard the guard: the products must actually differ, or the loop above proves nothing.
		expect(new Set(products).size).toBe(products.length)
	})
})

describe('Radar — rendered paint order and alpha', () => {
	it('applies the radar preset alpha to the fill rather than full opacity', async () => {
		const { container } = render(RadarLayers)
		await nextFrames()

		const fill = container.querySelector('[data-plot-element="radar-area"]')!
		const opacity = Number(getComputedStyle(fill).fillOpacity)

		// Real computed style, unavailable under jsdom.
		expect(opacity).toBeCloseTo(defaultPreset.opacity.radar, 5)
		expect(opacity).toBeLessThan(1)
	})

	it('emits every fill before any stroke in the rendered document', async () => {
		const { container } = render(RadarLayers)
		await nextFrames()

		const paths = [
			...container.querySelectorAll(
				'[data-plot-element="radar-area"], [data-plot-element="radar-outline"]'
			)
		]
		const isStroke = (p: Element) => p.getAttribute('data-plot-element') === 'radar-outline'

		const strokeIndexes = paths.map((p, i) => (isStroke(p) ? i : -1)).filter((i) => i >= 0)
		const fillIndexes = paths.map((p, i) => (isStroke(p) ? -1 : i)).filter((i) => i >= 0)

		// Non-empty, or the comparison below is vacuous.
		expect(fillIndexes.length).toBe(2)
		expect(strokeIndexes.length).toBe(2)
		expect(Math.max(...fillIndexes)).toBeLessThan(Math.min(...strokeIndexes))
	})

	it('keeps the inner series outline visible above the outer series fill', async () => {
		const { container } = render(RadarLayers)
		await nextFrames()

		const paths = [
			...container.querySelectorAll(
				'[data-plot-element="radar-area"], [data-plot-element="radar-outline"]'
			)
		]
		const at = (series: string, element: string) =>
			paths.findIndex(
				(p) =>
					p.getAttribute('data-plot-series') === series &&
					p.getAttribute('data-plot-element') === element
			)

		const outerFill = at('outer', 'radar-area')
		const innerStroke = at('inner', 'radar-outline')

		expect(outerFill).toBeGreaterThanOrEqual(0)
		expect(innerStroke).toBeGreaterThanOrEqual(0)
		// This is the concrete failure paint order prevents: the nested outline buried.
		expect(innerStroke).toBeGreaterThan(outerFill)
	})
})

describe('Radar — Spark and Plot render identically at the same size', () => {
	it('produces the same polygon path data in both containers', async () => {
		const { container } = render(RadarSparkPlotParity)
		await nextFrames()

		const sparkFill = container.querySelector(
			'[data-parity-spark] [data-plot-element="radar-area"]'
		)!
		const plotFill = container.querySelector('[data-parity-plot] [data-plot-element="radar-area"]')!

		expect(sparkFill.getAttribute('d')).toBeTruthy()
		expect(plotFill.getAttribute('d')).toBe(sparkFill.getAttribute('d'))
	})

	it('occupies the same real pixel box in both containers', async () => {
		const { container } = render(RadarSparkPlotParity)
		await nextFrames()

		const sparkFill = container.querySelector(
			'[data-parity-spark] [data-plot-element="radar-area"]'
		)!
		const plotFill = container.querySelector('[data-parity-plot] [data-plot-element="radar-area"]')!

		const s = sparkFill.getBoundingClientRect()
		const p = plotFill.getBoundingClientRect()

		// Real geometry, not jsdom's zeros — the premise of this suite.
		expect(s.width).toBeGreaterThan(0)
		expect(s.height).toBeGreaterThan(0)

		expect(p.top).toBeCloseTo(s.top, 1)
		expect(p.left).toBeCloseTo(s.left, 1)
		expect(p.width).toBeCloseTo(s.width, 1)
		expect(p.height).toBeCloseTo(s.height, 1)
	})

	it('renders the full form in both, since the size is above the micro threshold', async () => {
		const { container } = render(RadarSparkPlotParity)
		await nextFrames()

		// The form follows available space, not the container's identity. A Spark given
		// plot-sized dimensions must therefore show the chrome a Plot shows.
		for (const scope of ['[data-parity-spark]', '[data-parity-plot]']) {
			const root = container.querySelector(scope)!
			expect(root.querySelectorAll('[data-plot-element="radar-vertex"]').length).toBeGreaterThan(0)
			expect(
				root.querySelectorAll('[data-plot-element="radar-axis-label"]').length
			).toBeGreaterThan(0)
		}
	})
})
