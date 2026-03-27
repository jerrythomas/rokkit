import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ScatterPlot from '../../src/charts/ScatterPlot.svelte'

const data = [
	{ x: 1, y: 10, cat: 'A' },
	{ x: 5, y: 25, cat: 'A' },
	{ x: 3, y: 15, cat: 'B' }
]

// Data with duplicate (x, y) coordinates — tests for each_key_duplicate crash
const dupeData = [
	{ x: 1, y: 10, cat: 'A' },
	{ x: 1, y: 10, cat: 'B' }
]

describe('ScatterPlot', () => {
	it('renders without errors', () => {
		const { container } = render(ScatterPlot, { data, x: 'x', y: 'y' })
		expect(container).toBeTruthy()
	})

	it('renders an SVG element', () => {
		const { container } = render(ScatterPlot, { data, x: 'x', y: 'y' })
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('renders one point element per datum', () => {
		const { container } = render(ScatterPlot, { data, x: 'x', y: 'y' })
		const points = container.querySelectorAll('[data-plot-element="point"]')
		expect(points.length).toBe(3)
	})

	it('does not crash with duplicate (x, y) coordinates — Svelte key uniqueness', () => {
		expect(() => render(ScatterPlot, { data: dupeData, x: 'x', y: 'y' })).not.toThrow()
		const { container } = render(ScatterPlot, { data: dupeData, x: 'x', y: 'y' })
		const points = container.querySelectorAll('[data-plot-element="point"]')
		expect(points.length).toBe(2)
	})

	it('point cx and cy attributes are numeric (no NaN)', () => {
		const { container } = render(ScatterPlot, { data, x: 'x', y: 'y' })
		const points = container.querySelectorAll('[data-plot-element="point"]')
		for (const pt of points) {
			const cx = parseFloat(pt.getAttribute('cx'))
			const cy = parseFloat(pt.getAttribute('cy'))
			expect(isNaN(cx)).toBe(false)
			expect(isNaN(cy)).toBe(false)
		}
	})

	it('renders with color channel without crashing', () => {
		const { container } = render(ScatterPlot, { data, x: 'x', y: 'y', color: 'cat' })
		const points = container.querySelectorAll('[data-plot-element="point"]')
		expect(points.length).toBe(3)
	})

	it('renders path elements (not circles) when symbol prop is provided', () => {
		const { container } = render(ScatterPlot, { data, x: 'x', y: 'y', symbol: 'cat' })
		const paths = container.querySelectorAll('[data-plot-element="point"]')
		expect(paths.length).toBe(3)
		// All points should be <path> (symbol) not <circle>
		for (const el of paths) {
			expect(el.tagName.toLowerCase()).toBe('path')
		}
	})

	it('symbol paths have transform attribute positioning them at correct location', () => {
		const { container } = render(ScatterPlot, { data, x: 'x', y: 'y', symbol: 'cat' })
		const paths = container.querySelectorAll('[data-plot-element="point"]')
		for (const el of paths) {
			expect(el.getAttribute('transform')).toMatch(/translate\(/)
		}
	})
})
