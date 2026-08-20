import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import TestLegend from '../helpers/TestLegend.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

describe('Legend item derivation', () => {
	it('builds categorical items from colors Map', () => {
		const colors = new Map([
			['compact', { fill: '#4e79a7', stroke: '#4e79a7' }],
			['suv', { fill: '#f28e2b', stroke: '#f28e2b' }]
		])
		const labels = { compact: 'Compact', suv: 'SUV' }
		const items = [...colors.entries()].map(([key, entry]) => ({
			key,
			label: labels[key] ?? key,
			fill: entry.fill
		}))
		expect(items).toHaveLength(2)
		expect(items[0]).toEqual({ key: 'compact', label: 'Compact', fill: '#4e79a7' })
		expect(items[1]).toEqual({ key: 'suv', label: 'SUV', fill: '#f28e2b' })
	})

	it('uses raw key as label when labels map is absent', () => {
		const colors = new Map([['compact', { fill: '#4e79a7', stroke: '#4e79a7' }]])
		const labels = {}
		const items = [...colors.entries()].map(([key, entry]) => ({
			key,
			label: labels[key] ?? key,
			fill: entry.fill
		}))
		expect(items[0].label).toBe('compact')
	})
})

describe('Legend gradient branch (stub — see issue #126)', () => {
	it('renders data-plot-legend-gradient element for sequential colorScaleType', () => {
		const state = createMockState({ colorScaleType: 'sequential' })
		const { container } = render(TestLegend, { props: { state } })
		expect(container.querySelector('[data-plot-legend-gradient]')).toBeTruthy()
	})

	it('renders data-plot-legend-gradient element for diverging colorScaleType', () => {
		const state = createMockState({ colorScaleType: 'diverging' })
		const { container } = render(TestLegend, { props: { state } })
		expect(container.querySelector('[data-plot-legend-gradient]')).toBeTruthy()
	})
})

// ─── Rendered legend sections ────────────────────────────────────────────────
// The derivation cases above recompute the item math in the test; these render the
// component so Legend's own $derived blocks (split pattern/symbol, gradient stops,
// continuous min/max labels) actually execute.

describe('Legend — rendered sections', () => {
	const colors = new Map([
		['a', { fill: '#4e79a7', stroke: '#2f4b6b' }],
		['b', { fill: '#f28e2b', stroke: '#a4611c' }]
	])

	it('renders one categorical entry per colour', () => {
		const state = createMockState({ colors, colorField: 'cat' })
		const { container } = render(TestLegend, { props: { state } })
		expect(container.querySelectorAll('[data-plot-legend-item]').length).toBe(2)
	})

	it('splits out a pattern section when pattern encodes a different field', () => {
		const state = createMockState({
			colors,
			colorField: 'cat',
			patternField: 'kind',
			patterns: new Map([
				['x', 'dots'],
				['y', 'lines']
			])
		})
		const { container } = render(TestLegend, { props: { state } })
		// 2 colour entries + 2 pattern entries
		expect(container.querySelectorAll('[data-plot-legend-item]').length).toBe(4)
	})

	it('keeps patterns inline when they encode the same field as colour', () => {
		const state = createMockState({
			colors,
			colorField: 'cat',
			patternField: 'cat',
			patterns: new Map([['a', 'dots']])
		})
		const { container } = render(TestLegend, { props: { state } })
		expect(container.querySelectorAll('[data-plot-legend-item]').length).toBe(2)
	})

	it('splits out a symbol section when symbol encodes a different field', () => {
		const state = createMockState({
			colors,
			colorField: 'cat',
			symbolField: 'kind',
			symbols: new Map([
				['p', 'circle'],
				['q', 'square']
			])
		})
		const { container } = render(TestLegend, { props: { state } })
		expect(container.querySelectorAll('[data-plot-legend-item]').length).toBe(4)
	})

	it('renders a symbol-only legend when there is no colour field', () => {
		const state = createMockState({
			colors: new Map(),
			colorField: undefined,
			symbols: new Map([['p', 'circle']])
		})
		const { container } = render(TestLegend, { props: { state } })
		expect(container.querySelectorAll('[data-plot-legend-item]').length).toBe(1)
	})

	// ─── Continuous scale: gradient + min/max labels ──────────────────────────

	const continuousState = (extra = {}) =>
		createMockState({
			colorScaleType: 'continuous',
			colorField: 'value',
			continuousColorScale: { domain: [0, 50], scale: (v) => `rgb(${Math.round(v)}, 0, 0)` },
			format: () => (v) => `${v} units`,
			...extra
		})

	it('builds an 11-stop gradient from the continuous colour scale', () => {
		const { container } = render(TestLegend, { props: { state: continuousState() } })
		const bar = container.querySelector('[data-plot-legend-gradient]')
		const style = bar.getAttribute('style') ?? ''
		expect(style).toContain('linear-gradient')
		// GRADIENT_STOPS = 10 → 11 sampled stops, first at 0% and last at 100%.
		expect(style).toContain('0%')
		expect(style).toContain('100%')
		expect(style.match(/rgb\(/g).length).toBe(11)
	})

	it('labels the continuous legend with the formatted domain bounds', () => {
		const { container } = render(TestLegend, { props: { state: continuousState() } })
		expect(container.textContent).toContain('0 units')
		expect(container.textContent).toContain('50 units')
	})

	it('falls back to raw domain bounds when no formatter is configured', () => {
		const state = continuousState({ format: () => null })
		const { container } = render(TestLegend, { props: { state } })
		expect(container.textContent).toContain('0')
		expect(container.textContent).toContain('50')
	})

	it('uses the default gradient when there is no continuous scale', () => {
		const state = createMockState({ colorScaleType: 'continuous', continuousColorScale: null })
		const { container } = render(TestLegend, { props: { state } })
		const style = container.querySelector('[data-plot-legend-gradient]').getAttribute('style') ?? ''
		// JSDOM normalises the hex literals in the fallback gradient to rgb().
		expect(style).toContain('rgb(207, 226, 243)')
		expect(style).toContain('rgb(8, 69, 148)')
	})
})
