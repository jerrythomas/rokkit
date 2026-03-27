import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import LineChart from '../../src/charts/LineChart.svelte'

const timeSeries = [
	{ month: 3, revenue: 150 },
	{ month: 1, revenue: 100 },
	{ month: 2, revenue: 200 }
]

const multiSeries = [
	{ month: 2, category: 'A', val: 20 },
	{ month: 1, category: 'A', val: 10 },
	{ month: 2, category: 'B', val: 40 },
	{ month: 1, category: 'B', val: 30 }
]

describe('LineChart', () => {
	it('renders without errors', () => {
		const { container } = render(LineChart, { data: timeSeries, x: 'month', y: 'revenue' })
		expect(container).toBeTruthy()
	})

	it('renders an SVG element', () => {
		const { container } = render(LineChart, { data: timeSeries, x: 'month', y: 'revenue' })
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('renders a path element for the line', () => {
		const { container } = render(LineChart, { data: timeSeries, x: 'month', y: 'revenue' })
		const paths = container.querySelectorAll('[data-plot-element="line"]')
		expect(paths.length).toBeGreaterThanOrEqual(1)
	})

	it('line path d has no NaN (data sorted before drawing)', () => {
		const { container } = render(LineChart, { data: timeSeries, x: 'month', y: 'revenue' })
		const paths = container.querySelectorAll('[data-plot-element="line"]')
		for (const path of paths) {
			const d = path.getAttribute('d')
			expect(d).toBeTruthy()
			expect(d).not.toContain('NaN')
		}
	})

	it('renders one line per color group when color prop provided', () => {
		const { container } = render(LineChart, {
			data: multiSeries,
			x: 'month',
			y: 'val',
			color: 'category'
		})
		const paths = container.querySelectorAll('[data-plot-element="line"]')
		expect(paths.length).toBe(2)
	})

	it('renders line-marker elements when symbol prop is provided', () => {
		const { container } = render(LineChart, {
			data: multiSeries,
			x: 'month',
			y: 'val',
			color: 'category',
			symbol: 'category'
		})
		const markers = container.querySelectorAll('[data-plot-element="line-marker"]')
		expect(markers.length).toBeGreaterThan(0)
	})

	it('renders no line-markers when symbol prop is not provided', () => {
		const { container } = render(LineChart, { data: timeSeries, x: 'month', y: 'revenue' })
		const markers = container.querySelectorAll('[data-plot-element="line-marker"]')
		expect(markers.length).toBe(0)
	})

	it('stat=mean aggregates y values correctly (renders without error)', () => {
		const aggData = [
			{ month: 1, group: 'A', val: 10 },
			{ month: 1, group: 'A', val: 20 },
			{ month: 2, group: 'A', val: 30 }
		]
		const { container } = render(LineChart, { data: aggData, x: 'month', y: 'val', stat: 'mean' })
		const paths = container.querySelectorAll('[data-plot-element="line"]')
		expect(paths.length).toBeGreaterThanOrEqual(1)
		for (const path of paths) {
			expect(path.getAttribute('d')).not.toContain('NaN')
		}
	})
})
