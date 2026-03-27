import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import BoxPlot from '../../src/charts/BoxPlot.svelte'

const data = [
	{ category: 'A', value: 10 },
	{ category: 'A', value: 20 },
	{ category: 'A', value: 30 },
	{ category: 'A', value: 40 },
	{ category: 'B', value: 5 },
	{ category: 'B', value: 15 },
	{ category: 'B', value: 25 },
	{ category: 'B', value: 35 }
]

describe('BoxPlot', () => {
	it('renders without errors', () => {
		const { container } = render(BoxPlot, { data, x: 'category', y: 'value' })
		expect(container).toBeTruthy()
	})

	it('renders an SVG element', () => {
		const { container } = render(BoxPlot, { data, x: 'category', y: 'value' })
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('renders a plot container', () => {
		const { container } = render(BoxPlot, { data, x: 'category', y: 'value' })
		expect(container.querySelector('[data-plot-root]')).toBeTruthy()
	})

	it('renders box body rects (one per category)', () => {
		const { container } = render(BoxPlot, { data, x: 'category', y: 'value' })
		const boxes = container.querySelectorAll('[data-plot-element="box-body"]')
		expect(boxes.length).toBe(2)
	})

	it('box body rect has no NaN height or y', () => {
		const { container } = render(BoxPlot, { data, x: 'category', y: 'value' })
		const boxes = container.querySelectorAll('[data-plot-element="box-body"]')
		for (const box of boxes) {
			const h = parseFloat(box.getAttribute('height'))
			const y = parseFloat(box.getAttribute('y'))
			expect(isNaN(h)).toBe(false)
			expect(isNaN(y)).toBe(false)
			expect(h).toBeGreaterThanOrEqual(0)
		}
	})

	it('renders median lines (one per category)', () => {
		const { container } = render(BoxPlot, { data, x: 'category', y: 'value' })
		const medians = container.querySelectorAll('[data-plot-element="box-median"]')
		expect(medians.length).toBe(2)
	})

	it('renders whisker lines (two per category)', () => {
		const { container } = render(BoxPlot, { data, x: 'category', y: 'value' })
		const whiskers = container.querySelectorAll('[data-plot-element="box-whisker"]')
		expect(whiskers.length).toBe(4)
	})
})
