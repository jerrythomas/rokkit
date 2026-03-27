import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import FilterSlider from '../../src/crossfilter/FilterSlider.svelte'

describe('FilterSlider', () => {
	it('renders without crashing', () => {
		expect(() =>
			render(FilterSlider, {
				props: { field: 'displ', min: 1.6, max: 7.0 }
			})
		).not.toThrow()
	})

	it('renders data-filter-slider container', () => {
		const { container } = render(FilterSlider, {
			props: { field: 'displ', min: 1.6, max: 7.0 }
		})
		expect(container.querySelector('[data-filter-slider]')).toBeTruthy()
	})

	it('renders two range inputs (low and high)', () => {
		const { container } = render(FilterSlider, {
			props: { field: 'displ', min: 1.6, max: 7.0 }
		})
		const inputs = container.querySelectorAll('input[type="range"]')
		expect(inputs.length).toBe(2)
	})

	it('renders data-filter-slider-low and data-filter-slider-high', () => {
		const { container } = render(FilterSlider, {
			props: { field: 'displ', min: 1.6, max: 7.0 }
		})
		expect(container.querySelector('[data-filter-slider-low]')).toBeTruthy()
		expect(container.querySelector('[data-filter-slider-high]')).toBeTruthy()
	})
})
