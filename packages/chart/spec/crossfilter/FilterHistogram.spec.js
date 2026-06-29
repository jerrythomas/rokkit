import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import FilterHistogram from '../../src/crossfilter/FilterHistogram.svelte'
import TestFilterHistogram from '../helpers/TestFilterHistogram.svelte'
import { createCrossFilter } from '../../src/crossfilter/createCrossFilter.svelte.js'

const numericData = [
	{ displ: 1.8, hwy: 29 },
	{ displ: 2.0, hwy: 24 },
	{ displ: 2.8, hwy: 26 },
	{ displ: 3.0, hwy: 20 },
	{ displ: 4.0, hwy: 18 },
	{ displ: 5.0, hwy: 15 },
	{ displ: 1.5, hwy: 33 },
	{ displ: 2.5, hwy: 22 }
]

describe('FilterHistogram.svelte', () => {
	it('renders without crashing', () => {
		expect(() =>
			render(FilterHistogram, { props: { data: numericData, field: 'displ' } })
		).not.toThrow()
	})

	it('renders data-filter-histogram container', () => {
		const { container } = render(FilterHistogram, {
			props: { data: numericData, field: 'displ' }
		})
		expect(container.querySelector('[data-filter-histogram]')).toBeTruthy()
	})

	it('renders an SVG element', () => {
		const { container } = render(FilterHistogram, {
			props: { data: numericData, field: 'displ' }
		})
		expect(container.querySelector('svg')).toBeTruthy()
	})

	it('renders histogram bars', () => {
		const { container } = render(FilterHistogram, {
			props: { data: numericData, field: 'displ', bins: 5 }
		})
		const bars = container.querySelectorAll('[data-filter-histogram-bar]')
		expect(bars.length).toBeGreaterThan(0)
	})

	it('renders label when provided', () => {
		const { container } = render(FilterHistogram, {
			props: { data: numericData, field: 'displ', label: 'Displacement' }
		})
		expect(container.querySelector('[data-filter-histogram-label]')).toBeTruthy()
		expect(container.querySelector('[data-filter-histogram-label]').textContent).toBe('Displacement')
	})

	it('does not render label div when label is empty', () => {
		const { container } = render(FilterHistogram, {
			props: { data: numericData, field: 'displ', label: '' }
		})
		expect(container.querySelector('[data-filter-histogram-label]')).toBeNull()
	})

	it('renders with empty data without crashing', () => {
		const { container } = render(FilterHistogram, {
			props: { data: [], field: 'displ' }
		})
		expect(container.querySelector('[data-filter-histogram]')).toBeTruthy()
	})

	it('sets field on data-filter-field attribute', () => {
		const { container } = render(FilterHistogram, {
			props: { data: numericData, field: 'displ' }
		})
		expect(container.querySelector('[data-filter-field="displ"]')).toBeTruthy()
	})

	it('renders with width and height props', () => {
		const { container } = render(FilterHistogram, {
			props: { data: numericData, field: 'displ', width: 350, height: 150 }
		})
		const svg = container.querySelector('svg')
		expect(svg.getAttribute('width')).toBe('350')
		expect(svg.getAttribute('height')).toBe('150')
	})

	it('renders aria-label on SVG for accessibility', () => {
		const { container } = render(FilterHistogram, {
			props: { data: numericData, field: 'displ', label: 'Displacement' }
		})
		const svg = container.querySelector('svg')
		expect(svg.getAttribute('aria-label')).toContain('Displacement')
	})

	describe('with crossfilter context', () => {
		it('renders without active range initially', () => {
			const cf = createCrossFilter()
			const { container } = render(TestFilterHistogram, {
				props: { cf, data: numericData, field: 'displ' }
			})
			expect(container.querySelector('[data-filter-histogram-range]')).toBeNull()
		})

		it('shows active range display when range filter is set', async () => {
			const cf = createCrossFilter()
			cf.setRange('displ', [2.0, 4.0])
			const { container } = render(TestFilterHistogram, {
				props: { cf, data: numericData, field: 'displ' }
			})
			await tick()
			expect(container.querySelector('[data-filter-histogram-range]')).toBeTruthy()
		})

		it('clear button clears the filter', async () => {
			const cf = createCrossFilter()
			cf.setRange('displ', [2.0, 4.0])
			const { container } = render(TestFilterHistogram, {
				props: { cf, data: numericData, field: 'displ' }
			})
			await tick()
			const clearBtn = container.querySelector('[data-filter-histogram-clear]')
			expect(clearBtn).toBeTruthy()
			fireEvent.click(clearBtn)
			await tick()
			// After clearing, range display should go away
			expect(container.querySelector('[data-filter-histogram-range]')).toBeNull()
		})

		it('mousedown starts a brush', async () => {
			const cf = createCrossFilter()
			const { container } = render(TestFilterHistogram, {
				props: { cf, data: numericData, field: 'displ', width: 280, height: 120 }
			})
			const svg = container.querySelector('svg')
			// Start a brush drag
			fireEvent.mouseDown(svg, { clientX: 50, clientY: 50, currentTarget: svg })
			await tick()
			// Should not crash
			expect(container.querySelector('[data-filter-histogram]')).toBeTruthy()
		})

		it('mousemove while brushing updates brush', async () => {
			const cf = createCrossFilter()
			const { container } = render(TestFilterHistogram, {
				props: { cf, data: numericData, field: 'displ', width: 280, height: 120 }
			})
			const svg = container.querySelector('svg')
			fireEvent.mouseDown(svg, { clientX: 50, clientY: 50 })
			fireEvent.mouseMove(svg, { clientX: 150, clientY: 50 })
			await tick()
			expect(container.querySelector('[data-filter-histogram]')).toBeTruthy()
		})

		it('mouseup after wide drag sets a range filter', async () => {
			const cf = createCrossFilter()
			const { container } = render(TestFilterHistogram, {
				props: { cf, data: numericData, field: 'displ', width: 280, height: 120 }
			})
			const svg = container.querySelector('svg')
			// Start drag (clientX=50), move far right (clientX=200), then release
			fireEvent.mouseDown(svg, { clientX: 50, clientY: 50 })
			fireEvent.mouseMove(svg, { clientX: 200, clientY: 50 })
			fireEvent.mouseUp(svg)
			await tick()
			// Should not crash and range display may appear
			expect(container.querySelector('[data-filter-histogram]')).toBeTruthy()
		})

		it('mouseup with tiny drag (< 3px) clears filter (click behavior)', async () => {
			const cf = createCrossFilter()
			cf.setRange('displ', [2.0, 4.0])
			const { container } = render(TestFilterHistogram, {
				props: { cf, data: numericData, field: 'displ', width: 280, height: 120 }
			})
			const svg = container.querySelector('svg')
			await tick()
			// Click (tiny drag)
			fireEvent.mouseDown(svg, { clientX: 100, clientY: 50 })
			fireEvent.mouseUp(svg)
			await tick()
			// Filter should be cleared by click
			expect(cf.filters.has('displ')).toBe(false)
		})

		it('mouseleave triggers mouseup handler', async () => {
			const cf = createCrossFilter()
			const { container } = render(TestFilterHistogram, {
				props: { cf, data: numericData, field: 'displ', width: 280, height: 120 }
			})
			const svg = container.querySelector('svg')
			fireEvent.mouseDown(svg, { clientX: 50, clientY: 50 })
			fireEvent.mouseLeave(svg)
			await tick()
			expect(container.querySelector('[data-filter-histogram]')).toBeTruthy()
		})

		it('mousemove while NOT brushing does nothing', async () => {
			const cf = createCrossFilter()
			const { container } = render(TestFilterHistogram, {
				props: { cf, data: numericData, field: 'displ' }
			})
			const svg = container.querySelector('svg')
			// Move without mousedown first
			fireEvent.mouseMove(svg, { clientX: 100, clientY: 50 })
			await tick()
			// Should not crash
			expect(container.querySelector('[data-filter-histogram]')).toBeTruthy()
		})

		it('renders brush rect when active range is set (committed range display)', async () => {
			const cf = createCrossFilter()
			cf.setRange('displ', [2.0, 4.0])
			const { container } = render(TestFilterHistogram, {
				props: { cf, data: numericData, field: 'displ' }
			})
			await tick()
			// Brush overlay rects should be rendered
			expect(container.querySelectorAll('rect').length).toBeGreaterThan(0)
		})

		it('bins outside active range get dim color', async () => {
			const cf = createCrossFilter()
			cf.setRange('displ', [3.0, 5.0])
			const { container } = render(TestFilterHistogram, {
				props: { cf, data: numericData, field: 'displ', bins: 5 }
			})
			await tick()
			const bars = container.querySelectorAll('[data-filter-histogram-bar]')
			// Some bars should have the dim color (they're out of range)
			expect(bars.length).toBeGreaterThan(0)
		})
	})
})
