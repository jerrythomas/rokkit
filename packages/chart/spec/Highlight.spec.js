import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Plot from '../src/Plot.svelte'

const data = [
	{ day: 0, v: 5 },
	{ day: 1, v: 9 },
	{ day: 2, v: 3 },
	{ day: 3, v: 7 }
]
const spec = { data, x: 'day', y: 'v', geoms: [{ type: 'line' }] }

describe('Highlight overlay', () => {
	it('renders one marker for a keyword selector', () => {
		const { container } = render(Plot, {
			props: { spec, highlight: 'last', grid: false, width: 400, height: 300 }
		})
		expect(container.querySelectorAll('[data-plot-highlight]')).toHaveLength(1)
	})
	it('renders a marker per match for a predicate', () => {
		const { container } = render(Plot, {
			props: { spec, highlight: (r) => r.v > 4, grid: false, width: 400, height: 300 }
		})
		expect(container.querySelectorAll('[data-plot-highlight]')).toHaveLength(3)
	})
	it('renders a label only when requested', () => {
		const { container } = render(Plot, {
			props: { spec, highlight: 'max', grid: false, width: 400, height: 300 }
		})
		expect(container.querySelectorAll('[data-plot-highlight-label]')).toHaveLength(0)
	})
	it('renders nothing when highlight is unset', () => {
		const { container } = render(Plot, { props: { spec, grid: false, width: 400, height: 300 } })
		expect(container.querySelectorAll('[data-plot-highlight]')).toHaveLength(0)
	})
	it('supports index 0 (not treated as falsy)', () => {
		const { container } = render(Plot, {
			props: { spec, highlight: 0, grid: false, width: 400, height: 300 }
		})
		expect(container.querySelectorAll('[data-plot-highlight]')).toHaveLength(1)
	})
	it('renders multiple markers when two rows share x/y (no key crash)', () => {
		const dupSpec = {
			data: [
				{ day: 0, v: 5 },
				{ day: 0, v: 5 }
			],
			x: 'day',
			y: 'v',
			geoms: [{ type: 'line' }]
		}
		const { container } = render(Plot, {
			props: { spec: dupSpec, highlight: () => true, grid: false, width: 400, height: 300 }
		})
		expect(container.querySelectorAll('[data-plot-highlight]')).toHaveLength(2)
	})
})
