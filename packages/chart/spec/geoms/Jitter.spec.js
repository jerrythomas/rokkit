import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import TestJitter from '../helpers/TestJitter.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

const ROWS = [
	{ cat: 'A', val: 10 },
	{ cat: 'A', val: 20 },
	{ cat: 'B', val: 30 }
]

function jitterState(rows = ROWS, overrides = {}) {
	const xScale = scaleBand().domain(['A', 'B']).range([0, 200]).padding(0.1)
	const yScale = scaleLinear().domain([0, 100]).range([200, 0])
	return createMockState({
		xScale,
		yScale,
		colors: new Map([
			['A', { fill: '#4e79a7', stroke: '#264653' }],
			['B', { fill: '#f28e2b', stroke: '#8a4b00' }]
		]),
		geomData: () => rows,
		chartPreset: { opacity: { point: 0.8 } },
		setHovered: () => {},
		clearHovered: () => {},
		...overrides
	})
}

describe('Jitter.svelte', () => {
	it('renders one point per datum (jitter method)', () => {
		const state = jitterState()
		const { container } = render(TestJitter, { props: { state, x: 'cat', y: 'val', method: 'jitter' } })
		expect(container.querySelectorAll('[data-plot-element="jitter-point"]').length).toBe(3)
	})

	it('renders one point per datum (swarm method)', () => {
		const state = jitterState()
		const { container } = render(TestJitter, { props: { state, x: 'cat', y: 'val', method: 'swarm' } })
		expect(container.querySelectorAll('[data-plot-element="jitter-point"]').length).toBe(3)
	})

	it('swaps point coordinates when the plot is flipped (horizontal)', () => {
		const getPts = (state) => {
			const { container } = render(TestJitter, { props: { state, x: 'cat', y: 'val', method: 'jitter' } })
			return [...container.querySelectorAll('[data-plot-element="jitter-point"]')].map((c) => ({
				cx: Number(c.getAttribute('cx')),
				cy: Number(c.getAttribute('cy'))
			}))
		}
		const n = getPts(jitterState())
		const f = getPts(jitterState(ROWS, { isFlipped: true, place: (u, v) => ({ x: v, y: u }) }))
		// place() swaps the axes: flipped cx == vertical cy and vice-versa.
		expect(f[0].cx).toBeCloseTo(n[0].cy)
		expect(f[0].cy).toBeCloseTo(n[0].cx)
	})

	it('renders nothing when data is empty', () => {
		const state = jitterState([], { geomData: () => [] })
		const { container } = render(TestJitter, { props: { state, x: 'cat', y: 'val' } })
		expect(container.querySelector('[data-plot-geom="jitter"]')).toBeNull()
	})
})
