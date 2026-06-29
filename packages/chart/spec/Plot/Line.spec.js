import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { scaleLinear } from 'd3-scale'
import { curveCatmullRom } from 'd3-shape'
import TestLine from '../helpers/TestLine.svelte'

const timeData = [
	{ year: 2000, value: 10 },
	{ year: 2001, value: 15 },
	{ year: 2002, value: 12 },
	{ year: 2003, value: 20 }
]

function makeState(overrides = {}) {
	const xScale = scaleLinear().domain([2000, 2003]).range([0, 300])
	const yScale = scaleLinear().domain([0, 25]).range([200, 0])
	return { xScale, yScale, innerHeight: 200, ...overrides }
}

describe('Plot/Line.svelte', () => {
	it('renders nothing when scales are absent', () => {
		const state = { xScale: undefined, yScale: undefined, innerHeight: 200 }
		const { container } = render(TestLine, {
			props: { state, data: timeData, x: 'year', y: 'value' }
		})
		expect(container.querySelector('[data-plot-element="line"]')).toBeNull()
	})

	it('renders nothing with empty data', () => {
		const state = makeState()
		const { container } = render(TestLine, {
			props: { state, data: [], x: 'year', y: 'value' }
		})
		expect(container.querySelector('[data-plot-element="line"]')).toBeNull()
	})

	it('renders a path element for line with data', () => {
		const state = makeState()
		const { container } = render(TestLine, {
			props: { state, data: timeData, x: 'year', y: 'value' }
		})
		const path = container.querySelector('[data-plot-element="line"]')
		expect(path).toBeTruthy()
		expect(path.tagName.toLowerCase()).toBe('path')
	})

	it('path has fill="none" and correct stroke', () => {
		const state = makeState()
		const { container } = render(TestLine, {
			props: { state, data: timeData, x: 'year', y: 'value', stroke: 'tomato' }
		})
		const path = container.querySelector('[data-plot-element="line"]')
		expect(path.getAttribute('fill')).toBe('none')
		expect(path.getAttribute('stroke')).toBe('tomato')
	})

	it('applies strokeWidth prop', () => {
		const state = makeState()
		const { container } = render(TestLine, {
			props: { state, data: timeData, x: 'year', y: 'value', strokeWidth: 3 }
		})
		const path = container.querySelector('[data-plot-element="line"]')
		expect(path.getAttribute('stroke-width')).toBe('3')
	})

	it('applies curve factory when provided', () => {
		const state = makeState()
		const { container } = render(TestLine, {
			props: { state, data: timeData, x: 'year', y: 'value', curve: curveCatmullRom }
		})
		const path = container.querySelector('[data-plot-element="line"]')
		expect(path).toBeTruthy()
		expect(path.getAttribute('d')).toBeTruthy()
	})

	it('path has stroke-linejoin and stroke-linecap attributes', () => {
		const state = makeState()
		const { container } = render(TestLine, {
			props: { state, data: timeData, x: 'year', y: 'value' }
		})
		const path = container.querySelector('[data-plot-element="line"]')
		expect(path.getAttribute('stroke-linejoin')).toBe('round')
		expect(path.getAttribute('stroke-linecap')).toBe('round')
	})

	it('handles numeric items (no field mapping)', () => {
		const xScale = scaleLinear().domain([0, 3]).range([0, 300])
		const yScale = scaleLinear().domain([0, 30]).range([200, 0])
		const state = { xScale, yScale, innerHeight: 200 }
		const numData = [10, 20, 15]
		const { container } = render(TestLine, {
			props: { state, data: numData }
		})
		expect(container.querySelector('[data-plot-element="line"]')).toBeTruthy()
	})
})
