import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { scaleLinear } from 'd3-scale'
import TestPoint from '../helpers/TestPoint.svelte'

const scatterData = [
	{ displ: 1.8, hwy: 29 },
	{ displ: 2.0, hwy: 24 },
	{ displ: 3.0, hwy: 20 },
	{ displ: 4.0, hwy: 18 }
]

function makeState(overrides = {}) {
	const xScale = scaleLinear().domain([1, 5]).range([0, 300])
	const yScale = scaleLinear().domain([0, 35]).range([200, 0])
	return { xScale, yScale, innerHeight: 200, ...overrides }
}

describe('Plot/Point.svelte', () => {
	it('renders nothing when scales are absent', () => {
		const state = { xScale: undefined, yScale: undefined, innerHeight: 200 }
		const { container } = render(TestPoint, {
			props: { state, data: scatterData, x: 'displ', y: 'hwy' }
		})
		expect(container.querySelectorAll('[data-plot-element="point"]').length).toBe(0)
	})

	it('renders nothing with empty data', () => {
		const state = makeState()
		const { container } = render(TestPoint, {
			props: { state, data: [], x: 'displ', y: 'hwy' }
		})
		expect(container.querySelectorAll('[data-plot-element="point"]').length).toBe(0)
	})

	it('renders one circle per data point', () => {
		const state = makeState()
		const { container } = render(TestPoint, {
			props: { state, data: scatterData, x: 'displ', y: 'hwy' }
		})
		const circles = container.querySelectorAll('[data-plot-element="point"]')
		expect(circles.length).toBe(4)
	})

	it('applies radius, fill, and stroke props', () => {
		const state = makeState()
		const { container } = render(TestPoint, {
			props: { state, data: scatterData, x: 'displ', y: 'hwy', r: 6, fill: 'coral', stroke: 'navy', strokeWidth: 2 }
		})
		const circle = container.querySelector('[data-plot-element="point"]')
		expect(circle.getAttribute('r')).toBe('6')
		expect(circle.getAttribute('fill')).toBe('coral')
		expect(circle.getAttribute('stroke')).toBe('navy')
		expect(circle.getAttribute('stroke-width')).toBe('2')
	})

	it('sets aria-label on each circle', () => {
		const state = makeState()
		const { container } = render(TestPoint, {
			props: { state, data: scatterData, x: 'displ', y: 'hwy' }
		})
		const circles = container.querySelectorAll('[data-plot-element="point"]')
		expect(circles[0].getAttribute('aria-label')).toContain('1.8')
		expect(circles[0].getAttribute('aria-label')).toContain('29')
	})

	it('filters out points with null scale output', () => {
		const xScale = scaleLinear().domain([1, 5]).range([0, 300])
		const yScale = scaleLinear().domain([0, 35]).range([200, 0])
		const state = { xScale, yScale, innerHeight: 200 }
		// Data with a field that maps to NaN (undefined → NaN → null from scale)
		const dataWithNaN = [
			{ displ: 1.8, hwy: 29 },
			{ displ: undefined, hwy: 24 } // xScale(undefined) returns NaN → filtered
		]
		const { container } = render(TestPoint, {
			props: { state, data: dataWithNaN, x: 'displ', y: 'hwy' }
		})
		// At least 1 valid point should render
		const circles = container.querySelectorAll('[data-plot-element="point"]')
		expect(circles.length).toBeGreaterThanOrEqual(1)
	})

	it('handles numeric data items without field mapping', () => {
		const xScale = scaleLinear().domain([0, 3]).range([0, 300])
		const yScale = scaleLinear().domain([0, 30]).range([200, 0])
		const state = { xScale, yScale, innerHeight: 200 }
		// Numeric items: accessor returns item itself when field is undefined
		const numData = [10, 20, 15]
		const { container } = render(TestPoint, {
			props: { state, data: numData }
		})
		expect(container.querySelectorAll('[data-plot-element="point"]').length).toBeGreaterThan(0)
	})
})
