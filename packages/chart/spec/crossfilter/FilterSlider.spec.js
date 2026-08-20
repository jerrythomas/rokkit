import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
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

	// ─── Range interaction (writes back to the crossfilter) ─────────────────────

	const withCf = () => {
		const cf = { setRange: vi.fn() }
		const { container } = render(FilterSlider, {
			props: { field: 'displ', min: 0, max: 100 },
			context: new Map([['crossfilter', cf]])
		})
		return {
			cf,
			low: container.querySelector('[data-filter-slider-low]'),
			high: container.querySelector('[data-filter-slider-high]')
		}
	}

	it('moving the low handle pushes the new range to the crossfilter', async () => {
		const { cf, low } = withCf()
		await fireEvent.input(low, { target: { value: '20' } })
		expect(cf.setRange).toHaveBeenCalledWith('displ', [20, 100])
	})

	it('moving the high handle pushes the new range to the crossfilter', async () => {
		const { cf, high } = withCf()
		await fireEvent.input(high, { target: { value: '80' } })
		expect(cf.setRange).toHaveBeenCalledWith('displ', [0, 80])
	})

	it('clamps the low handle so it cannot cross above the high handle', async () => {
		const { cf, low } = withCf()
		await fireEvent.input(low, { target: { value: '150' } })
		expect(cf.setRange).toHaveBeenCalledWith('displ', [100, 100])
	})

	it('clamps the high handle so it cannot cross below the low handle', async () => {
		const { cf, high } = withCf()
		await fireEvent.input(high, { target: { value: '-50' } })
		expect(cf.setRange).toHaveBeenCalledWith('displ', [0, 0])
	})

	it('is inert but does not throw when no crossfilter is in context', async () => {
		const { container } = render(FilterSlider, { props: { field: 'displ', min: 0, max: 100 } })
		const low = container.querySelector('[data-filter-slider-low]')
		await expect(fireEvent.input(low, { target: { value: '20' } })).resolves.not.toThrow()
	})
})
