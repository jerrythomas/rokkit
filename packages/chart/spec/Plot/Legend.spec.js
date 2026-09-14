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

// The cases above derive `items` inline and assert on that local construction —
// they never render Legend. These drive the actual swatch branches, which differ
// per geom: a line gets a stroke rule, a scatter gets its symbol shape, and a
// pattern-encoded series gets a texture overlay.

describe('Legend — swatch variants', () => {
	const colors = new Map([
		['a', { fill: '#4e79a7', stroke: '#31597c' }],
		['b', { fill: '#f28e2b', stroke: '#b56a20' }]
	])

	// colorField AND symbolField set to the SAME field: that makes splitSymbol and
	// symbolOnly both false, which is the combined-swatch path. With no colorField
	// the component diverts to a separate symbol-only section instead.
	const legendState = (overrides = {}) =>
		createMockState({
			colors,
			legend: true,
			colorField: 'cat',
			symbolField: 'cat',
			channels: { color: 'cat', symbol: 'cat' },
			...overrides
		})

	it('renders a line rule swatch for a line geom', () => {
		const { container } = render(TestLegend, {
			state: legendState({ geomTypes: new Set(['line']) })
		})

		const swatch = container.querySelector('[data-plot-legend-swatch]')
		expect(swatch).toBeTruthy()
		expect(swatch.querySelector('line')).toBeTruthy()
	})

	it('adds the symbol onto the line swatch when the series has one', () => {
		const { container } = render(TestLegend, {
			state: legendState({
				geomTypes: new Set(['line']),
				symbols: new Map([
					['a', 'circle'],
					['b', 'square']
				])
			})
		})

		const swatch = container.querySelector('[data-plot-legend-swatch]')
		expect(swatch.querySelector('line')).toBeTruthy()
		expect(swatch.querySelector('path')).toBeTruthy()
	})

	it('renders a symbol-only swatch for a point geom', () => {
		const { container } = render(TestLegend, {
			state: legendState({
				geomTypes: new Set(['point']),
				symbols: new Map([
					['a', 'triangle'],
					['b', 'square']
				])
			})
		})

		const swatch = container.querySelector('[data-plot-legend-swatch]')
		expect(swatch).toBeTruthy()
		expect(swatch.querySelector('path')).toBeTruthy()
		// A scatter legend must NOT draw the line rule.
		expect(swatch.querySelector('line')).toBeNull()
	})

	it('falls back to a plain fill swatch for a point geom with no symbols', () => {
		const { container } = render(TestLegend, {
			state: legendState({ geomTypes: new Set(['point']), symbols: new Map() })
		})

		expect(container.querySelector('[data-plot-legend-item]')).toBeTruthy()
	})

	it('renders one legend item per colour key', () => {
		const { container } = render(TestLegend, {
			state: legendState({ geomTypes: new Set(['bar']) })
		})

		expect(container.querySelectorAll('[data-plot-legend-item]')).toHaveLength(2)
	})
})

describe('Legend — separate symbol section', () => {
	// When symbol encodes a DIFFERENT field from colour, the legend grows a second
	// section so the reader can decode both channels independently.
	const splitState = (overrides = {}) =>
		createMockState({
			colors: new Map([
				['a', { fill: '#4e79a7', stroke: '#31597c' }],
				['b', { fill: '#f28e2b', stroke: '#b56a20' }]
			]),
			legend: true,
			colorField: 'cat',
			symbolField: 'shape',
			channels: { color: 'cat', symbol: 'shape' },
			symbols: new Map([
				['round', 'circle'],
				['boxy', 'square']
			]),
			...overrides
		})

	it('renders a second section for the symbol channel', () => {
		const { container } = render(TestLegend, {
			state: splitState({ geomTypes: new Set(['point']) })
		})

		expect(container.querySelectorAll('.legend-section').length).toBeGreaterThan(0)
	})

	it('uses a dashed rule plus the shape for a line geom', () => {
		const { container } = render(TestLegend, {
			state: splitState({ geomTypes: new Set(['line']) })
		})

		const dashed = [...container.querySelectorAll('line')].filter((l) =>
			l.getAttribute('stroke-dasharray')
		)
		expect(dashed.length).toBeGreaterThan(0)
		// The shape rides on the dashed rule so both channels read at once.
		expect(dashed[0].parentElement.querySelector('path')).toBeTruthy()
	})

	it('uses a shape-only swatch for a non-line geom', () => {
		const { container } = render(TestLegend, {
			state: splitState({ geomTypes: new Set(['point']) })
		})

		const section = container.querySelector('.legend-section')
		expect(section.querySelector('path')).toBeTruthy()
		expect(section.querySelector('line[stroke-dasharray]')).toBeNull()
	})
})
