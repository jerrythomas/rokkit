import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { scaleLinear } from 'd3-scale'
import TestRegion from '../helpers/TestRegion.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

// Unit plane: x [0,1] over [0,300]; y [0,1] over [200,0].
const unit = (overrides = {}) =>
	createMockState({
		xScale: scaleLinear().domain([0, 1]).range([0, 300]),
		yScale: scaleLinear().domain([0, 1]).range([200, 0]),
		...overrides
	})

/** Parse "M x,y L x,y … Z" into [[x, y], …] */
const vertices = (d) =>
	d
		.replace(/[MLZ]/g, ' ')
		.trim()
		.split(/\s+/)
		.map((p) => p.split(',').map(Number))

describe('Region.svelte', () => {
	it('fills a polygon given in data coordinates', () => {
		const { container } = render(TestRegion, {
			props: { state: unit(), points: [[0, 0], [0.5, 0], [0, 0.5]] }
		})
		const path = container.querySelector('[data-plot-element="region"]')
		expect(path).toBeTruthy()
		expect(vertices(path.getAttribute('d'))).toEqual([
			[0, 200],
			[150, 200],
			[0, 100]
		])
	})

	it('fills a band from x and y ranges', () => {
		const { container } = render(TestRegion, { props: { state: unit(), x: [0.5, 1], y: [0.5, 1] } })
		const pts = vertices(container.querySelector('[data-plot-element="region"]').getAttribute('d'))
		expect(pts).toEqual([
			[150, 100],
			[300, 100],
			[300, 0],
			[150, 0]
		])
	})

	it('spans the whole axis when one range is omitted', () => {
		const { container } = render(TestRegion, { props: { state: unit(), y: [0.8, 1] } })
		const xs = vertices(container.querySelector('[data-plot-element="region"]').getAttribute('d')).map((p) => p[0])
		expect(Math.min(...xs)).toBe(0)
		expect(Math.max(...xs)).toBe(300)
	})

	it('covers whole bands on a band axis', () => {
		// mock band x: a,b,c over [0,300] with padding 0.1
		const state = createMockState()
		const { container } = render(TestRegion, { props: { state, x: ['a', 'b'] } })
		const xs = vertices(container.querySelector('[data-plot-element="region"]').getAttribute('d')).map((p) => p[0])
		expect(Math.min(...xs)).toBeCloseTo(state.xScale('a'), 2)
		expect(Math.max(...xs)).toBeCloseTo(state.xScale('b') + state.xScale.bandwidth(), 2)
	})

	it('names the region for theming and labels it at its centroid', () => {
		const { container } = render(TestRegion, {
			props: { state: unit(), name: 'pain', label: 'Zone of pain', points: [[0, 0], [0.6, 0], [0, 0.6]] }
		})
		const group = container.querySelector('[data-plot-geom="region"]')
		expect(group.getAttribute('data-plot-region')).toBe('pain')
		const text = container.querySelector('[data-plot-element="region-label"]')
		expect(text.textContent).toBe('Zone of pain')
		// centroid of the triangle = (0.2, 0.2) → (60, 160)
		expect(Number(text.getAttribute('x'))).toBeCloseTo(60, 3)
		expect(Number(text.getAttribute('y'))).toBeCloseTo(160, 3)
	})

	it('places the label at labelAt when given', () => {
		const { container } = render(TestRegion, {
			props: { state: unit(), label: 'here', labelAt: [1, 1], x: [0, 1] }
		})
		const text = container.querySelector('[data-plot-element="region-label"]')
		expect(Number(text.getAttribute('x'))).toBe(300)
		expect(Number(text.getAttribute('y'))).toBe(0)
	})

	it('clips to the plot area so a region past the domain cannot spill', () => {
		const { container } = render(TestRegion, { props: { state: unit(), points: [[0, 0], [2, 0], [0, 2]] } })
		const clip = container.querySelector('clipPath rect')
		expect(clip).toBeTruthy()
		expect([clip.getAttribute('width'), clip.getAttribute('height')]).toEqual(['300', '200'])
		const group = container.querySelector('[data-plot-geom="region"]')
		expect(group.getAttribute('clip-path')).toContain(container.querySelector('clipPath').id)
	})

	it('applies literal fill and alpha', () => {
		const { container } = render(TestRegion, { props: { state: unit(), x: [0, 1], fill: '#f00', alpha: 0.3 } })
		const path = container.querySelector('[data-plot-element="region"]')
		expect(path.getAttribute('fill')).toBe('#f00')
		expect(path.getAttribute('fill-opacity')).toBe('0.3')
	})

	it('transposes under flip', () => {
		const state = unit({ isFlipped: true, place: (u, v) => ({ x: v, y: u }) })
		const { container } = render(TestRegion, { props: { state, points: [[0, 0], [0.5, 0], [0, 0.5]] } })
		expect(vertices(container.querySelector('[data-plot-element="region"]').getAttribute('d'))).toEqual([
			[200, 0],
			[200, 150],
			[100, 0]
		])
	})

	it('renders nothing without a shape or scales', () => {
		expect(render(TestRegion, { props: { state: unit() } }).container.querySelector('[data-plot-geom="region"]')).toBeNull()
		expect(
			render(TestRegion, { props: { state: unit({ xScale: null }), x: [0, 1] } }).container.querySelector(
				'[data-plot-geom="region"]'
			)
		).toBeNull()
		expect(
			render(TestRegion, { props: { state: unit(), points: [[0, 0], [1, 1]] } }).container.querySelector(
				'[data-plot-geom="region"]'
			)
		).toBeNull()
	})
})
