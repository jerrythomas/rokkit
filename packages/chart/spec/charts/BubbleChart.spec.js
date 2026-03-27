import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import BubbleChart from '../../src/charts/BubbleChart.svelte'

const data = [
	{ country: 'A', gdp: 10, life: 70, population: 100 },
	{ country: 'B', gdp: 20, life: 75, population: 200 },
	{ country: 'C', gdp: 15, life: 72, population: 150 }
]

describe('BubbleChart', () => {
	it('renders without errors', () => {
		const { container } = render(BubbleChart, { data, x: 'gdp', y: 'life', size: 'population' })
		expect(container).toBeTruthy()
	})

	it('renders an SVG', () => {
		const { container } = render(BubbleChart, { data, x: 'gdp', y: 'life', size: 'population' })
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('renders a plot container', () => {
		const { container } = render(BubbleChart, { data, x: 'gdp', y: 'life', size: 'population' })
		expect(container.querySelector('[data-plot-root]')).toBeTruthy()
	})

	it('renders one point per datum', () => {
		const { container } = render(BubbleChart, { data, x: 'gdp', y: 'life', size: 'population' })
		const points = container.querySelectorAll('[data-plot-element="point"]')
		expect(points.length).toBe(3)
	})

	it('points have numeric cx, cy, r attributes (no NaN)', () => {
		const { container } = render(BubbleChart, { data, x: 'gdp', y: 'life', size: 'population' })
		const points = container.querySelectorAll('[data-plot-element="point"]')
		for (const pt of points) {
			expect(isNaN(parseFloat(pt.getAttribute('cx')))).toBe(false)
			expect(isNaN(parseFloat(pt.getAttribute('cy')))).toBe(false)
			expect(isNaN(parseFloat(pt.getAttribute('r')))).toBe(false)
		}
	})

	it('does not crash with duplicate coordinates', () => {
		const dupeData = [
			{ country: 'A', gdp: 10, life: 70, population: 100 },
			{ country: 'B', gdp: 10, life: 70, population: 200 }
		]
		expect(() =>
			render(BubbleChart, { data: dupeData, x: 'gdp', y: 'life', size: 'population' })
		).not.toThrow()
	})
})
