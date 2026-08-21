import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import TestRadar from '../helpers/TestRadar.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'
import { toPatternId } from '../../src/lib/brewing/patterns.js'

/**
 * Full-form Radar rendering: series polygons over an optional grid of rings, spokes
 * and zero-reference markers, plus hemisphere-anchored axis labels. The pure layout
 * (`lib/brewing/polar.js`, 74 tests) and the adapter (`geoms/lib/marks/radar.js`, 8
 * tests) are both already covered elsewhere — these tests are the render-layer check:
 * does `Radar.svelte` actually wire that geometry into the DOM, with the specced hooks,
 * at the values the geometry computes (not merely "truthy" or "present").
 */

const AXES = ['metric1', 'metric2', 'metric3']

const colors = new Map([
	['S1', { fill: 'lightblue', stroke: 'darkblue' }],
	['S2', { fill: 'lightred', stroke: 'darkred' }]
])

const oneSeriesData = [
	{ axis: 'metric1', value: 10, series: 'S1' },
	{ axis: 'metric2', value: 20, series: 'S1' },
	{ axis: 'metric3', value: 15, series: 'S1' }
]

const twoSeriesData = [
	...oneSeriesData,
	{ axis: 'metric1', value: 5, series: 'S2' },
	{ axis: 'metric2', value: 8, series: 'S2' },
	{ axis: 'metric3', value: 12, series: 'S2' }
]

function radarState(overrides = {}) {
	return createMockState({
		innerWidth: 300,
		innerHeight: 300,
		colors,
		patterns: new Map(),
		...overrides
	})
}

const areas = (container) => [...container.querySelectorAll('[data-plot-element="radar-area"]')]
const rings = (container) => [
	...container.querySelectorAll('[data-plot-element="radar-grid-ring"]')
]
const spokes = (container) => [
	...container.querySelectorAll('[data-plot-element="radar-grid-spoke"]')
]
const zeroMarkers = (container) => [
	...container.querySelectorAll('[data-plot-element="radar-zero-ring"]')
]
const axisLabels = (container) => [
	...container.querySelectorAll('[data-plot-element="radar-axis-label"]')
]
const vertices = (container) => [
	...container.querySelectorAll('[data-plot-element="radar-vertex"]')
]

// Pulls the x,y of the path's first "M" (moveto) command, mirroring radar-marks.spec.js.
function firstPoint(d) {
	const found = d.match(/^M(-?[\d.]+),(-?[\d.]+)/)
	if (!found) throw new Error(`no leading M command in path: ${d}`)
	return { x: Number(found[1]), y: Number(found[2]) }
}

describe('Radar — series polygons', () => {
	it('renders one radar-area polygon for a single series, with a non-empty, NaN-free d', () => {
		const state = radarState({ geomData: () => oneSeriesData })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: AXES
		})
		const els = areas(container)
		expect(els.length).toBe(1)
		const d = els[0].getAttribute('d')
		expect(d).toBeTruthy()
		expect(d.length).toBeGreaterThan(0)
		expect(d).not.toMatch(/NaN/)
	})

	it('renders two polygons for two series, each carrying its own data-plot-series', () => {
		const state = radarState({ geomData: () => twoSeriesData })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: AXES
		})
		const els = areas(container)
		expect(els.length).toBe(2)
		const seriesValues = els.map((el) => el.getAttribute('data-plot-series')).sort()
		expect(seriesValues).toEqual(['S1', 'S2'])
	})
})

describe('Radar — grid', () => {
	it('renders rings and spokes when options.grid is true', () => {
		const state = radarState({ geomData: () => oneSeriesData })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: AXES,
			options: { grid: true }
		})
		expect(rings(container).length).toBeGreaterThan(0)
		expect(spokes(container).length).toBe(AXES.length)
	})

	it('renders neither rings nor spokes when options.grid is omitted', () => {
		const state = radarState({ geomData: () => oneSeriesData })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: AXES
			// options omitted entirely — grid defaults off
		})
		expect(rings(container).length).toBe(0)
		expect(spokes(container).length).toBe(0)
	})

	it('ring count follows uniform AxisSpec.ticks when every axis declares the same value', () => {
		const uniformTicksAxes = [
			{ key: 'metric1', ticks: 5 },
			{ key: 'metric2', ticks: 5 },
			{ key: 'metric3', ticks: 5 }
		]
		const state = radarState({ geomData: () => oneSeriesData })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: uniformTicksAxes,
			options: { grid: true }
		})
		expect(rings(container).length).toBe(5)
	})

	it('falls back to options.rings when axes do not declare a uniform ticks count', () => {
		const state = radarState({ geomData: () => oneSeriesData })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: AXES, // bare strings — no `ticks` declared at all
			options: { grid: true, rings: 3 }
		})
		expect(rings(container).length).toBe(3)
	})
})

describe('Radar — axis labels', () => {
	it('renders one radar-axis-label per axis, each carrying data-plot-axis', () => {
		const state = radarState({ geomData: () => oneSeriesData })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: AXES
		})
		const labels = axisLabels(container)
		expect(labels.length).toBe(AXES.length)
		expect(labels.map((l) => l.getAttribute('data-plot-axis')).sort()).toEqual([...AXES].sort())
	})

	it('anchors labels by hemisphere: top=middle, right=start, left=end (not a hardcoded middle)', () => {
		const fourAxes = ['top', 'right', 'bottom', 'left']
		const data = [
			{ axis: 'top', value: 10, series: 'S1' },
			{ axis: 'right', value: 10, series: 'S1' },
			{ axis: 'bottom', value: 10, series: 'S1' },
			{ axis: 'left', value: 10, series: 'S1' }
		]
		const state = radarState({ geomData: () => data })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: fourAxes
		})
		const byAxis = (key) =>
			container.querySelector(`[data-plot-element="radar-axis-label"][data-plot-axis="${key}"]`)

		expect(byAxis('top').getAttribute('text-anchor')).toBe('middle')
		expect(byAxis('right').getAttribute('text-anchor')).toBe('start')
		expect(byAxis('left').getAttribute('text-anchor')).toBe('end')
	})
})

describe('Radar — zero-reference marker', () => {
	it('renders for a domain that crosses zero without starting there, not for one anchored at zero', () => {
		const crossingAxes = [
			{ key: 'metric1', domain: [-5, 10] },
			{ key: 'metric2', domain: [0, 10] }
		]
		const data = [
			{ axis: 'metric1', value: 3, series: 'S1' },
			{ axis: 'metric2', value: 3, series: 'S1' }
		]
		const state = radarState({ geomData: () => data })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: crossingAxes,
			options: { grid: true }
		})
		expect(zeroMarkers(container).length).toBe(1)
	})
})

describe('Radar — ring labels', () => {
	it('uses tickLabels as ring labels when declared, instead of a computed numeric value', () => {
		const axesWithLabels = [
			{ key: 'metric1', ticks: 2, tickLabels: ['Low', 'High'] },
			{ key: 'metric2', ticks: 2, tickLabels: ['Low', 'High'] }
		]
		const data = [
			{ axis: 'metric1', value: 5, series: 'S1' },
			{ axis: 'metric2', value: 8, series: 'S1' }
		]
		const state = radarState({ geomData: () => data })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: axesWithLabels,
			options: { grid: true }
		})
		expect(container.textContent).toContain('Low')
		expect(container.textContent).toContain('High')
	})
})

describe('Radar — root transform', () => {
	it('translates the root <g> to the plot centre', () => {
		const state = radarState({ geomData: () => oneSeriesData, innerWidth: 300, innerHeight: 200 })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: AXES
		})
		const g = container.querySelector('[data-plot-geom="radar"]')
		expect(g).toBeTruthy()
		expect(g.getAttribute('transform')).toBe('translate(150, 100)')
	})
})

describe('Radar — empty data', () => {
	it('does not throw, and emits no polygon, when data is empty', () => {
		const state = radarState({ geomData: () => [] })
		let result
		expect(() => {
			result = render(TestRadar, {
				state,
				axis: 'axis',
				value: 'value',
				series: 'series',
				axes: AXES
			})
		}).not.toThrow()
		expect(areas(result.container).length).toBe(0)
	})
})

describe('Radar — own channel props (no fallback to the container)', () => {
	it('renders nothing when axis/value are omitted, even though the container declares x/y', () => {
		const state = radarState({
			geomData: () => oneSeriesData,
			channels: { x: 'axis', y: 'value' }
		})
		const { container } = render(TestRadar, {
			state,
			series: 'series',
			axes: AXES
			// axis/value intentionally omitted from the geom's own props
		})
		expect(areas(container).length).toBe(0)
		expect(spokes(container).length).toBe(0)
	})
})

describe('Radar — pattern fill', () => {
	it('renders a pattern-fill overlay when channels.pattern resolves to a known pattern', () => {
		const patterns = new Map([['S1', 'dots']])
		const state = radarState({ geomData: () => oneSeriesData, patterns })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			pattern: 'series',
			axes: AXES
		})
		const patterned = areas(container).find((el) => el.getAttribute('fill')?.startsWith('url('))
		expect(patterned).toBeTruthy()
		expect(patterned.getAttribute('fill')).toBe(`url(#${toPatternId('S1')})`)
	})
})

describe('Radar — vertices', () => {
	it('renders one radar-vertex per (series, axis) cell, each tagged with both keys', () => {
		const state = radarState({ geomData: () => twoSeriesData })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: AXES
		})
		const els = vertices(container)
		expect(els.length).toBe(2 * AXES.length)

		// Every cell in the series × axis product is present exactly once.
		const cells = els
			.map((el) => `${el.getAttribute('data-plot-series')}/${el.getAttribute('data-plot-axis')}`)
			.sort()
		expect(cells).toEqual(
			['S1/metric1', 'S1/metric2', 'S1/metric3', 'S2/metric1', 'S2/metric2', 'S2/metric3'].sort()
		)
	})

	it('places a vertex at the pixel its angle and radius imply', () => {
		const state = radarState({ geomData: () => twoSeriesData, innerWidth: 300, innerHeight: 300 })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: AXES
		})
		// R = min(300,300)/2 - LABEL_MARGIN(32) = 118. metric1 is the first axis, so it sits at
		// -90° (straight up), and S1's value there (10) is metric1's inferred domain max, so it
		// plots at the full radius. Straight up at full radius is exactly (0, -118) — asserted
		// against the formula's output rather than against whatever the component happened to emit.
		const el = container.querySelector(
			'[data-plot-element="radar-vertex"][data-plot-series="S1"][data-plot-axis="metric1"]'
		)
		expect(el).toBeTruthy()
		expect(Number(el.getAttribute('cx'))).toBeCloseTo(0, 5)
		expect(Number(el.getAttribute('cy'))).toBeCloseTo(-118, 5)
	})

	it('places a half-domain value at half the radius under the default linear transform', () => {
		// S2's metric1 value (5) is half of metric1's inferred [0, 10] domain, so it must land at
		// half the radius — a value-dependent position, so a vertex pinned to the outer ring or to
		// the centre would fail this.
		const state = radarState({ geomData: () => twoSeriesData, innerWidth: 300, innerHeight: 300 })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: AXES
		})
		const el = container.querySelector(
			'[data-plot-element="radar-vertex"][data-plot-series="S2"][data-plot-axis="metric1"]'
		)
		expect(Number(el.getAttribute('cy'))).toBeCloseTo(-59, 5)
	})

	it('colours each vertex with its own series stroke, not one shared colour', () => {
		const state = radarState({ geomData: () => twoSeriesData })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: AXES
		})
		const fillOf = (seriesKey) =>
			container
				.querySelector(`[data-plot-element="radar-vertex"][data-plot-series="${seriesKey}"]`)
				.getAttribute('fill')

		expect(fillOf('S1')).toBe('darkblue')
		expect(fillOf('S2')).toBe('darkred')
	})

	it('emits no vertex for a missing (series, axis) cell, rather than one at zero', () => {
		// S2 has no metric3 row at all — that cell is a gap, and a gap is an absent vertex, not a
		// vertex sitting at the centre.
		const withGap = [
			...oneSeriesData,
			{ axis: 'metric1', value: 5, series: 'S2' },
			{ axis: 'metric2', value: 8, series: 'S2' }
		]
		const state = radarState({ geomData: () => withGap })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: AXES
		})
		expect(vertices(container).length).toBe(5)
		expect(
			container.querySelector(
				'[data-plot-element="radar-vertex"][data-plot-series="S2"][data-plot-axis="metric3"]'
			)
		).toBeNull()
	})
})

describe('Radar — grid/polygon radius consistency', () => {
	it('computes the same outer radius for the grid as the adapter uses for the polygons', () => {
		const state = radarState({ geomData: () => oneSeriesData, innerWidth: 300, innerHeight: 300 })
		const { container } = render(TestRadar, {
			state,
			axis: 'axis',
			value: 'value',
			series: 'series',
			axes: AXES,
			options: { grid: true }
		})
		// metric1's value (10) is also its inferred domain max, so its vertex sits at the full
		// resolved radius — the same quantity the outermost grid ring is drawn at.
		const [fill] = areas(container)
		const { x, y } = firstPoint(fill.getAttribute('d'))
		const outerRadius = Math.hypot(x, y)

		const allRings = rings(container)
		const outermostRing = allRings[allRings.length - 1]
		expect(Number(outermostRing.getAttribute('r'))).toBeCloseTo(outerRadius, 5)
	})
})
