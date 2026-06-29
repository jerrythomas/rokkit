import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import TestWaterfall from '../helpers/TestWaterfall.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

const WATERFALL_DATA = [
	{ label: 'Start', value: 100 },
	{ label: 'Revenue', value: 50 },
	{ label: 'Cost', value: -30 },
	{ label: 'Tax', value: -10 },
	{ label: 'Net', value: 110, isTotal: true }
]

function waterfallState(overrides = {}) {
	const xScale = scaleBand()
		.domain(WATERFALL_DATA.map((d) => d.label))
		.range([0, 400])
		.padding(0.1)
	const yScale = scaleLinear().domain([0, 200]).range([200, 0])

	return createMockState({
		xScale,
		yScale,
		setHovered: () => {},
		clearHovered: () => {},
		...overrides
	})
}

describe('Waterfall.svelte', () => {
	it('renders nothing when data is empty', () => {
		const state = waterfallState({ geomData: () => [] })
		const { container } = render(TestWaterfall, { props: { state } })
		expect(container.querySelector('[data-plot-geom="waterfall"]')).toBeNull()
	})

	it('renders a waterfall group for non-empty data', () => {
		const state = waterfallState({ geomData: () => WATERFALL_DATA })
		const { container } = render(TestWaterfall, {
			props: { state, x: 'label', y: 'value' }
		})
		expect(container.querySelector('[data-plot-geom="waterfall"]')).toBeTruthy()
	})

	it('renders one bar rect per data item', () => {
		const state = waterfallState({ geomData: () => WATERFALL_DATA })
		const { container } = render(TestWaterfall, {
			props: { state, x: 'label', y: 'value' }
		})
		const bars = container.querySelectorAll('[data-plot-element="waterfall-bar"]')
		expect(bars.length).toBe(WATERFALL_DATA.length)
	})

	it('bars have x, y, width, height attributes', () => {
		const state = waterfallState({ geomData: () => WATERFALL_DATA })
		const { container } = render(TestWaterfall, {
			props: { state, x: 'label', y: 'value' }
		})
		const firstBar = container.querySelector('[data-plot-element="waterfall-bar"]')
		expect(firstBar.getAttribute('x')).not.toBeNull()
		expect(firstBar.getAttribute('y')).not.toBeNull()
		expect(Number(firstBar.getAttribute('width'))).toBeGreaterThan(0)
		expect(Number(firstBar.getAttribute('height'))).toBeGreaterThan(0)
	})

	it('positive bars use positiveColor (default #22c55e)', () => {
		const state = waterfallState({
			geomData: () => [{ label: 'Up', value: 50 }]
		})
		const { container } = render(TestWaterfall, {
			props: { state, x: 'label', y: 'value' }
		})
		const bar = container.querySelector('[data-plot-element="waterfall-bar"]')
		expect(bar.getAttribute('fill')).toBe('#22c55e')
	})

	it('negative bars use negativeColor (default #ef4444)', () => {
		const state = waterfallState({
			geomData: () => [{ label: 'Down', value: -20 }]
		})
		const { container } = render(TestWaterfall, {
			props: { state, x: 'label', y: 'value' }
		})
		const bar = container.querySelector('[data-plot-element="waterfall-bar"]')
		expect(bar.getAttribute('fill')).toBe('#ef4444')
	})

	it('total bars use totalColor (default #3b82f6) when totalField is set', () => {
		const state = waterfallState({
			geomData: () => [{ label: 'Total', value: 100, isTotal: true }]
		})
		const { container } = render(TestWaterfall, {
			props: { state, x: 'label', y: 'value', options: { totalField: 'isTotal' } }
		})
		const bar = container.querySelector('[data-plot-element="waterfall-bar"]')
		expect(bar.getAttribute('fill')).toBe('#3b82f6')
	})

	it('uses custom colors via options', () => {
		const state = waterfallState({
			geomData: () => [
				{ label: 'Up', value: 30 },
				{ label: 'Down', value: -10 }
			]
		})
		const { container } = render(TestWaterfall, {
			props: {
				state,
				x: 'label',
				y: 'value',
				options: { positiveColor: 'cyan', negativeColor: 'magenta' }
			}
		})
		const bars = container.querySelectorAll('[data-plot-element="waterfall-bar"]')
		expect(bars[0].getAttribute('fill')).toBe('cyan')
		expect(bars[1].getAttribute('fill')).toBe('magenta')
	})

	it('renders connector lines between bars (except after last bar)', () => {
		const state = waterfallState({ geomData: () => WATERFALL_DATA })
		const { container } = render(TestWaterfall, {
			props: { state, x: 'label', y: 'value' }
		})
		const connectors = container.querySelectorAll('[data-plot-element="connector"]')
		// One connector between each pair of adjacent bars = n-1
		expect(connectors.length).toBe(WATERFALL_DATA.length - 1)
	})

	it('connectors are dashed lines', () => {
		const state = waterfallState({ geomData: () => WATERFALL_DATA })
		const { container } = render(TestWaterfall, {
			props: { state, x: 'label', y: 'value' }
		})
		const firstConnector = container.querySelector('[data-plot-element="connector"]')
		expect(firstConnector.getAttribute('stroke-dasharray')).toBeTruthy()
	})

	it('renders a <title> inside each bar', () => {
		const state = waterfallState({ geomData: () => WATERFALL_DATA })
		const { container } = render(TestWaterfall, {
			props: { state, x: 'label', y: 'value' }
		})
		const titles = container.querySelectorAll('[data-plot-element="waterfall-bar"] title')
		expect(titles.length).toBe(WATERFALL_DATA.length)
	})

	it('calls setHovered on mouseenter', async () => {
		let hovered = null
		const state = waterfallState({
			geomData: () => WATERFALL_DATA,
			setHovered: (d) => { hovered = d }
		})
		const { container } = render(TestWaterfall, {
			props: { state, x: 'label', y: 'value' }
		})
		const firstBar = container.querySelector('[data-plot-element="waterfall-bar"]')
		await fireEvent.mouseEnter(firstBar)
		expect(hovered).not.toBeNull()
	})

	it('calls clearHovered on mouseleave', async () => {
		let cleared = false
		const state = waterfallState({
			geomData: () => WATERFALL_DATA,
			clearHovered: () => { cleared = true }
		})
		const { container } = render(TestWaterfall, {
			props: { state, x: 'label', y: 'value' }
		})
		const firstBar = container.querySelector('[data-plot-element="waterfall-bar"]')
		await fireEvent.mouseLeave(firstBar)
		expect(cleared).toBe(true)
	})

	it('respects custom connectorWidth via options', () => {
		const state = waterfallState({ geomData: () => WATERFALL_DATA })
		const { container } = render(TestWaterfall, {
			props: { state, x: 'label', y: 'value', options: { connectorWidth: 2 } }
		})
		const firstConnector = container.querySelector('[data-plot-element="connector"]')
		expect(firstConnector.getAttribute('stroke-width')).toBe('2')
	})
})
