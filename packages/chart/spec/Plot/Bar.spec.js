import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import TestBar from '../helpers/TestBar.svelte'

const data = [
	{ class: 'compact', hwy: 29 },
	{ class: 'suv', hwy: 20 },
	{ class: 'pickup', hwy: 17 }
]

function makeBandState(overrides = {}) {
	const xScale = scaleBand().domain(['compact', 'suv', 'pickup']).range([0, 300]).padding(0.1)
	const yScale = scaleLinear().domain([0, 40]).range([200, 0])
	return {
		xScale,
		yScale,
		innerHeight: 200,
		...overrides
	}
}

function makeLinearState() {
	const xScale = scaleLinear().domain([0, 40]).range([0, 300])
	const yScale = scaleLinear().domain([0, 40]).range([200, 0])
	return {
		xScale,
		yScale,
		innerHeight: 200
	}
}

describe('Plot/Bar.svelte', () => {
	it('renders nothing without context', () => {
		// No context — state is undefined, so bars = []
		const { container } = render(TestBar, {
			props: { state: { xScale: undefined, yScale: undefined, innerHeight: 0 }, data, x: 'class', y: 'hwy' }
		})
		expect(container.querySelectorAll('[data-plot-element="bar"]').length).toBe(0)
	})

	it('renders bars for each data point', () => {
		const state = makeBandState()
		const { container } = render(TestBar, {
			props: { state, data, x: 'class', y: 'hwy' }
		})
		const bars = container.querySelectorAll('[data-plot-element="bar"]')
		expect(bars.length).toBe(3)
	})

	it('renders nothing when data is empty', () => {
		const state = makeBandState()
		const { container } = render(TestBar, { props: { state, data: [], x: 'class', y: 'hwy' } })
		expect(container.querySelectorAll('[data-plot-element="bar"]').length).toBe(0)
	})

	it('renders nothing when data is undefined', () => {
		const state = makeBandState()
		const { container } = render(TestBar, { props: { state, data: undefined, x: 'class', y: 'hwy' } })
		expect(container.querySelectorAll('[data-plot-element="bar"]').length).toBe(0)
	})

	it('applies fill and opacity props', () => {
		const state = makeBandState()
		const { container } = render(TestBar, {
			props: { state, data, x: 'class', y: 'hwy', fill: 'tomato', opacity: 0.5 }
		})
		const bar = container.querySelector('[data-plot-element="bar"]')
		expect(bar.getAttribute('fill')).toBe('tomato')
		expect(bar.getAttribute('opacity')).toBe('0.5')
	})

	it('sets aria-label on each bar', () => {
		const state = makeBandState()
		const { container } = render(TestBar, {
			props: { state, data, x: 'class', y: 'hwy' }
		})
		const bars = container.querySelectorAll('[data-plot-element="bar"]')
		expect(bars[0].getAttribute('aria-label')).toContain('compact')
		expect(bars[0].getAttribute('aria-label')).toContain('29')
	})

	it('handles negative bars — baseline at y=0', () => {
		const xScale = scaleBand().domain(['a', 'b']).range([0, 300]).padding(0.1)
		// Domain spans 0: negative bars
		const yScale = scaleLinear().domain([-10, 10]).range([200, 0])
		const state = { xScale, yScale, innerHeight: 200 }
		const negData = [{ group: 'a', val: -5 }, { group: 'b', val: 5 }]
		const { container } = render(TestBar, {
			props: { state, data: negData, x: 'group', y: 'val' }
		})
		expect(container.querySelectorAll('[data-plot-element="bar"]').length).toBe(2)
	})

	it('handles non-band (linear) xScale without crash — uses fallback bandwidth=20', () => {
		const state = makeLinearState()
		const numericData = [{ val: 10, count: 5 }, { val: 20, count: 8 }]
		const { container } = render(TestBar, {
			props: { state, data: numericData, x: 'val', y: 'count' }
		})
		// Bars should still render (bandwidth fallback = 20)
		expect(container.querySelectorAll('[data-plot-element="bar"]').length).toBe(2)
	})

	it('renders bars with numeric data items (no field mapping)', () => {
		const xScale = scaleBand().domain(['0', '1', '2']).range([0, 300]).padding(0.1)
		const yScale = scaleLinear().domain([0, 50]).range([200, 0])
		const state = { xScale, yScale, innerHeight: 200 }
		const numData = [10, 20, 30]
		const { container } = render(TestBar, {
			props: { state, data: numData, x: undefined, y: undefined }
		})
		// Numeric data items: accessor returns the item itself
		expect(container.querySelectorAll('[data-plot-element="bar"]').length).toBeGreaterThan(0)
	})
})
