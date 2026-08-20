import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ChartLegend from '../src/ChartLegend.svelte'

/**
 * ChartLegend is a public export with no internal caller, so it needs its own
 * spec — nothing else in the suite renders it.
 */
const groups = [
	{
		label: 'Region',
		items: [
			{ key: 'n', label: 'North', fill: '#4e79a7', stroke: '#2f4b6b' },
			{ key: 's', label: 'South', fill: '#f28e2b', stroke: '#a4611c' }
		]
	}
]

describe('ChartLegend', () => {
	it('renders with all-default props', () => {
		const { container } = render(ChartLegend)
		const root = container.querySelector('[data-chart-legend]')
		expect(root).toBeTruthy()
		// Defaults: horizontal orientation, no groups, no gradient.
		expect(root.classList.contains('horizontal')).toBe(true)
		expect(container.querySelectorAll('[data-chart-legend-item]').length).toBe(0)
	})

	it('renders a group label and one entry per item', () => {
		const { container } = render(ChartLegend, { groups })
		expect(container.querySelector('[data-chart-legend-group-label]').textContent).toBe('Region')
		expect(container.querySelectorAll('[data-chart-legend-item]').length).toBe(2)
		expect([...container.querySelectorAll('[data-chart-legend-label]')].map((n) => n.textContent))
			.toEqual(['North', 'South'])
	})

	it('omits the group label when the group has none', () => {
		const { container } = render(ChartLegend, { groups: [{ items: groups[0].items }] })
		expect(container.querySelector('[data-chart-legend-group-label]')).toBeNull()
		expect(container.querySelectorAll('[data-chart-legend-item]').length).toBe(2)
	})

	it('applies the vertical orientation class', () => {
		const { container } = render(ChartLegend, { groups, orientation: 'vertical' })
		const root = container.querySelector('[data-chart-legend]')
		expect(root.classList.contains('vertical')).toBe(true)
		expect(root.classList.contains('horizontal')).toBe(false)
	})

	it('treats wrap as a horizontal orientation', () => {
		const { container } = render(ChartLegend, { groups, orientation: 'wrap' })
		expect(container.querySelector('[data-chart-legend]').classList.contains('horizontal')).toBe(
			true
		)
	})

	// ─── Swatch styles ────────────────────────────────────────────────────────

	it('defaults to a filled span swatch', () => {
		const { container } = render(ChartLegend, { groups })
		const swatch = container.querySelector('[data-chart-legend-swatch]')
		expect(swatch.tagName.toLowerCase()).toBe('span')
	})

	it('renders a line swatch with swatchStyle=line', () => {
		const { container } = render(ChartLegend, { groups, swatchStyle: 'line' })
		const swatch = container.querySelector('[data-chart-legend-swatch]')
		expect(swatch.tagName.toLowerCase()).toBe('svg')
		expect(swatch.querySelector('line')).toBeTruthy()
	})

	it('adds a symbol marker to a line swatch when the item has a shape', () => {
		const shaped = [{ items: [{ ...groups[0].items[0], shape: 'circle' }] }]
		const { container } = render(ChartLegend, { groups: shaped, swatchStyle: 'line' })
		expect(container.querySelector('[data-chart-legend-swatch] path')).toBeTruthy()
	})

	it('renders a point swatch when swatchStyle=point and the item has a shape', () => {
		const shaped = [{ items: [{ ...groups[0].items[0], shape: 'square' }] }]
		const { container } = render(ChartLegend, { groups: shaped, swatchStyle: 'point' })
		const swatch = container.querySelector('[data-chart-legend-swatch]')
		expect(swatch.tagName.toLowerCase()).toBe('svg')
		expect(swatch.querySelector('path')).toBeTruthy()
	})

	it('falls back to the span swatch when swatchStyle=point but no shape is set', () => {
		const { container } = render(ChartLegend, { groups, swatchStyle: 'point' })
		expect(container.querySelector('[data-chart-legend-swatch]').tagName.toLowerCase()).toBe('span')
	})

	it('renders a pattern overlay swatch when the item carries a patternId', () => {
		const patterned = [{ items: [{ ...groups[0].items[0], patternId: 'dots' }] }]
		const { container } = render(ChartLegend, { groups: patterned })
		const rects = container.querySelectorAll('[data-chart-legend-swatch] rect')
		expect(rects.length).toBe(2)
		expect(rects[1].getAttribute('fill')).toBe('url(#dots)')
	})

	// ─── Gradient mode ────────────────────────────────────────────────────────

	it('renders the gradient bar and its bounds instead of items', () => {
		const gradient = { style: 'background: linear-gradient(90deg, #000, #fff)', min: '0', max: '9' }
		const { container } = render(ChartLegend, { groups, gradient })
		expect(container.querySelector('[data-chart-legend-gradient]')).toBeTruthy()
		expect(container.querySelectorAll('[data-chart-legend-item]').length).toBe(0)
		expect(container.textContent).toContain('0')
		expect(container.textContent).toContain('9')
	})
})
