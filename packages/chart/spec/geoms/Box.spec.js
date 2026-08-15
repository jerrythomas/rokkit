import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import TestBox from '../helpers/TestBox.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

// One pre-aggregated box row with a single outlier at y=95.
const BOX_ROWS = [
	{ cat: 'A', q1: 20, median: 40, q3: 60, iqr_min: 10, iqr_max: 80, outliers: [95] }
]

function boxState(rows = BOX_ROWS, overrides = {}) {
	const xScale = scaleBand().domain(['A']).range([0, 200]).padding(0.1)
	const yScale = scaleLinear().domain([0, 100]).range([200, 0])
	return createMockState({
		xScale,
		yScale,
		colors: new Map([['A', { fill: '#4e79a7', stroke: '#264653' }]]),
		geomData: () => rows,
		chartPreset: { opacity: { box: 0.5 } },
		setHovered: () => {},
		clearHovered: () => {},
		...overrides
	})
}

describe('Box.svelte outliers', () => {
	it('renders the box body group', () => {
		const state = boxState()
		const { container } = render(TestBox, { props: { state, x: 'cat', y: 'val' } })
		expect(container.querySelector('[data-plot-geom="box"]')).toBeTruthy()
	})

	it('renders one outlier circle per outlier value', () => {
		const state = boxState()
		const { container } = render(TestBox, { props: { state, x: 'cat', y: 'val' } })
		const dots = container.querySelectorAll('[data-plot-element="box-outlier"]')
		expect(dots.length).toBe(1)
	})

	it('renders no outlier circle when the row has none', () => {
		const rows = [{ cat: 'A', q1: 20, median: 40, q3: 60, iqr_min: 10, iqr_max: 80, outliers: [] }]
		const state = boxState(rows)
		const { container } = render(TestBox, { props: { state, x: 'cat', y: 'val' } })
		expect(container.querySelectorAll('[data-plot-element="box-outlier"]').length).toBe(0)
	})
})
