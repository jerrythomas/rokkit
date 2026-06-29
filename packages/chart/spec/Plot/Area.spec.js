import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { scaleLinear, scaleBand } from 'd3-scale'
import { curveBasis } from 'd3-shape'
import TestArea from '../helpers/TestArea.svelte'

const timeData = [
	{ year: 2000, value: 10 },
	{ year: 2001, value: 15 },
	{ year: 2002, value: 12 },
	{ year: 2003, value: 20 }
]

function makeLinearState(overrides = {}) {
	const xScale = scaleLinear().domain([2000, 2003]).range([0, 300])
	const yScale = scaleLinear().domain([0, 25]).range([200, 0])
	return { xScale, yScale, innerHeight: 200, ...overrides }
}

describe('Plot/Area.svelte', () => {
	it('renders nothing without scales in state', () => {
		const state = { xScale: undefined, yScale: undefined, innerHeight: 200 }
		const { container } = render(TestArea, {
			props: { state, data: timeData, x: 'year', y: 'value' }
		})
		expect(container.querySelector('[data-plot-element="area"]')).toBeNull()
	})

	it('renders nothing with empty data', () => {
		const state = makeLinearState()
		const { container } = render(TestArea, {
			props: { state, data: [], x: 'year', y: 'value' }
		})
		expect(container.querySelector('[data-plot-element="area"]')).toBeNull()
	})

	it('renders a path element for area with data', () => {
		const state = makeLinearState()
		const { container } = render(TestArea, {
			props: { state, data: timeData, x: 'year', y: 'value' }
		})
		const path = container.querySelector('[data-plot-element="area"]')
		expect(path).toBeTruthy()
		expect(path.tagName.toLowerCase()).toBe('path')
	})

	it('applies fill and opacity props', () => {
		const state = makeLinearState()
		const { container } = render(TestArea, {
			props: { state, data: timeData, x: 'year', y: 'value', fill: 'coral', opacity: 0.5 }
		})
		const path = container.querySelector('[data-plot-element="area"]')
		expect(path.getAttribute('fill')).toBe('coral')
		expect(path.getAttribute('opacity')).toBe('0.5')
	})

	it('uses innerHeight as default y0 baseline', () => {
		const state = makeLinearState()
		const { container } = render(TestArea, {
			props: { state, data: timeData, x: 'year', y: 'value' }
		})
		const path = container.querySelector('[data-plot-element="area"]')
		// Path should be generated (d attribute present)
		expect(path.getAttribute('d')).toBeTruthy()
	})

	it('uses y0 field when provided', () => {
		const bandedData = [
			{ year: 2000, low: 5, high: 15 },
			{ year: 2001, low: 8, high: 18 }
		]
		const state = makeLinearState()
		const { container } = render(TestArea, {
			props: { state, data: bandedData, x: 'year', y: 'high', y0: 'low' }
		})
		const path = container.querySelector('[data-plot-element="area"]')
		expect(path).toBeTruthy()
	})

	it('applies curve factory when provided', () => {
		const state = makeLinearState()
		const { container } = render(TestArea, {
			props: { state, data: timeData, x: 'year', y: 'value', curve: curveBasis }
		})
		const path = container.querySelector('[data-plot-element="area"]')
		expect(path).toBeTruthy()
	})

	it('handles numeric data items without field mapping', () => {
		const xScale = scaleLinear().domain([0, 3]).range([0, 300])
		const yScale = scaleLinear().domain([0, 30]).range([200, 0])
		const state = { xScale, yScale, innerHeight: 200 }
		const numData = [10, 20, 15, 25]
		const { container } = render(TestArea, {
			props: { state, data: numData, x: undefined, y: undefined }
		})
		// Accessor returns the item itself for numeric data
		expect(container.querySelector('[data-plot-element="area"]')).toBeTruthy()
	})
})
