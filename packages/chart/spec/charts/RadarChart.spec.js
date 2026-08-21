import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import RadarChart from '../../src/charts/RadarChart.svelte'
import Plot from '../../src/Plot.svelte'

/**
 * RadarChart mirrors PieChart's shape (a Plot with no grid/axes plus one geom), with one
 * deliberate divergence asserted here: PieChart defaults `legend` to false, and radar
 * must NOT inherit that. Washed-out overlapping fills make colour-matching alone
 * insufficient to tell two series apart, so a legend is on by default once there is more
 * than one series.
 */

const AXES = ['speed', 'power', 'range']

const oneSeries = [
	{ metric: 'speed', score: 8, team: 'A' },
	{ metric: 'power', score: 5, team: 'A' },
	{ metric: 'range', score: 9, team: 'A' }
]

const twoSeries = [
	...oneSeries,
	{ metric: 'speed', score: 4, team: 'B' },
	{ metric: 'power', score: 9, team: 'B' },
	{ metric: 'range', score: 3, team: 'B' }
]

const props = { axis: 'metric', value: 'score', series: 'team', axes: AXES }

const legendOf = (c) => c.querySelector('[data-plot-legend]')
const radarOf = (c) => c.querySelector('[data-plot-geom="radar"]')
const areasOf = (c) => [...c.querySelectorAll('[data-plot-element="radar-area"]')]

describe('RadarChart', () => {
	it('renders a radar geom inside a Plot', () => {
		const { container } = render(RadarChart, { data: twoSeries, ...props })
		expect(radarOf(container)).toBeTruthy()
		expect(areasOf(container).length).toBe(2)
	})

	it('omits the legend for a single series', () => {
		const { container } = render(RadarChart, { data: oneSeries, ...props })
		expect(legendOf(container)).toBeNull()
	})

	it('shows the legend by default for two series, naming both', () => {
		const { container } = render(RadarChart, { data: twoSeries, ...props })
		const legend = legendOf(container)
		expect(legend).toBeTruthy()
		// Named, not merely present — a legend with no entries identifies nothing.
		expect(legend.textContent).toContain('A')
		expect(legend.textContent).toContain('B')
	})

	it('lets an explicit legend={false} override the multi-series default', () => {
		const { container } = render(RadarChart, { data: twoSeries, ...props, legend: false })
		expect(legendOf(container)).toBeNull()
	})

	it('lets an explicit legend={true} override the single-series default', () => {
		const { container } = render(RadarChart, { data: oneSeries, ...props, legend: true })
		expect(legendOf(container)).toBeTruthy()
	})

	it('draws one polygon with no legend when no series channel is given', () => {
		// A single-profile radar is a legitimate use — there is nothing to distinguish, so
		// there is nothing for a legend to say.
		const { container } = render(RadarChart, {
			data: oneSeries,
			axis: 'metric',
			value: 'score',
			axes: AXES
		})
		expect(areasOf(container).length).toBe(1)
		expect(legendOf(container)).toBeNull()
	})

	it('renders without a legend, and without throwing, on empty data', () => {
		let result
		expect(() => {
			result = render(RadarChart, { data: [], ...props })
		}).not.toThrow()
		expect(areasOf(result.container).length).toBe(0)
		expect(legendOf(result.container)).toBeNull()
	})
})

/**
 * Acceptance criterion: do NOT assume Plot's inherited sr-table is correct for radar.
 * Radar's rows are long-format (one row per series x axis cell), and `tableColumns` falls
 * back to Object.keys(firstRow) when no spec channels are declared. These assert what a
 * screen reader actually gets.
 */
describe('RadarChart — screen-reader data table', () => {
	it('renders a table row per (series, axis) cell with the data fields as headers', () => {
		const { container } = render(RadarChart, { data: twoSeries, ...props })
		const table = container.querySelector('table.plot-sr-table')
		expect(table).toBeTruthy()

		const headers = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim())
		expect(headers).toEqual(['metric', 'score', 'team'])

		const rows = [...table.querySelectorAll('tbody tr')]
		expect(rows.length).toBe(twoSeries.length)

		// A real reading, not just a shape: the first row must carry its own values.
		const firstCells = [...rows[0].querySelectorAll('td')].map((td) => td.textContent.trim())
		expect(firstCells).toEqual(['speed', '8', 'A'])
	})
})

/**
 * `GEOM_COMPONENTS` is consulted ONLY by Plot's spec-driven path, which passes x/y/color
 * — not radar's own axis/value/series. Registering radar without that mapping working
 * would be a registry entry that can never render, so this pins the whole route.
 */
describe('Plot — spec-driven radar', () => {
	// Deliberately NOT the data's first-appearance order (speed, power, range). If
	// `options.axes` were ignored, `resolveAxes` would infer that order instead and produce
	// a DIFFERENT answer — which is what makes the assertion below meaningful. An order
	// matching the data would pass either way.
	const DECLARED_ORDER = ['range', 'speed', 'power']

	const spec = {
		x: 'metric',
		y: 'score',
		color: 'team',
		geoms: [{ type: 'radar', options: { axes: DECLARED_ORDER } }]
	}

	it('resolves and renders radar from a spec', () => {
		const { container } = render(Plot, { data: twoSeries, spec, grid: false, axes: false })
		expect(radarOf(container)).toBeTruthy()
		expect(areasOf(container).length).toBe(2)
	})

	it('reads the axis order from options.axes rather than inferring it from the data', () => {
		const { container } = render(Plot, { data: twoSeries, spec, grid: false, axes: false })
		const labels = [...container.querySelectorAll('[data-plot-element="radar-axis-label"]')].map(
			(el) => el.getAttribute('data-plot-axis')
		)
		expect(labels).toEqual(DECLARED_ORDER)
		// Guard the guard: the inferred order really is different, so this test would fail
		// if the declared order were silently dropped.
		expect(DECLARED_ORDER).not.toEqual(AXES)
	})
})
