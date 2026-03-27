import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import FilterBar from '../../src/crossfilter/FilterBar.svelte'

const data = [
	{ class: 'compact', hwy: 29 },
	{ class: 'suv', hwy: 20 }
]

describe('FilterBar', () => {
	it('renders without crashing', () => {
		expect(() =>
			render(FilterBar, {
				props: { data, field: 'class', valueField: 'hwy' }
			})
		).not.toThrow()
	})

	it('renders data-plot-root (contains a Plot)', () => {
		const { container } = render(FilterBar, {
			props: { data, field: 'class', valueField: 'hwy' }
		})
		expect(container.querySelector('[data-plot-root]')).toBeTruthy()
	})

	it('renders bars marked as filterable', () => {
		const { container } = render(FilterBar, {
			props: { data, field: 'class', valueField: 'hwy' }
		})
		expect(container.querySelector('[data-plot-element="bar"]')).toBeTruthy()
	})
})
