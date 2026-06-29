import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import TestCandlestick from '../helpers/TestCandlestick.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

const CANDLE_DATA = [
	{ date: '2024-01', open: 100, high: 120, low: 90, close: 115 }, // up (close > open)
	{ date: '2024-02', open: 115, high: 125, low: 100, close: 105 }, // down (close < open)
	{ date: '2024-03', open: 105, high: 130, low: 95, close: 125 } // up
]

function candlestickState(data = CANDLE_DATA, overrides = {}) {
	const xScale = scaleBand()
		.domain(data.map((d) => d.date))
		.range([0, 300])
		.padding(0.1)
	const yScale = scaleLinear().domain([80, 140]).range([200, 0])

	return createMockState({
		xScale,
		yScale,
		setHovered: () => {},
		clearHovered: () => {},
		geomData: () => data,
		...overrides
	})
}

describe('Candlestick.svelte', () => {
	it('renders nothing when data is empty', () => {
		const state = candlestickState([], { geomData: () => [] })
		const { container } = render(TestCandlestick, { props: { state } })
		expect(container.querySelector('[data-plot-geom="candlestick"]')).toBeNull()
	})

	it('renders a candlestick group for non-empty data', () => {
		const state = candlestickState()
		const { container } = render(TestCandlestick, { props: { state, x: 'date' } })
		expect(container.querySelector('[data-plot-geom="candlestick"]')).toBeTruthy()
	})

	it('renders one candle body rect per data item', () => {
		const state = candlestickState()
		const { container } = render(TestCandlestick, { props: { state, x: 'date' } })
		const candles = container.querySelectorAll('[data-plot-element="candle"]')
		expect(candles.length).toBe(CANDLE_DATA.length)
	})

	it('renders one wick line per data item', () => {
		const state = candlestickState()
		const { container } = render(TestCandlestick, { props: { state, x: 'date' } })
		const wicks = container.querySelectorAll('[data-plot-element="wick"]')
		expect(wicks.length).toBe(CANDLE_DATA.length)
	})

	it('up candles use upColor (default #22c55e)', () => {
		const state = candlestickState()
		const { container } = render(TestCandlestick, { props: { state, x: 'date' } })
		const candles = container.querySelectorAll('[data-plot-element="candle"]')
		// First candle: open=100, close=115 → up
		expect(candles[0].getAttribute('fill')).toBe('#22c55e')
	})

	it('down candles use downColor (default #ef4444)', () => {
		const state = candlestickState()
		const { container } = render(TestCandlestick, { props: { state, x: 'date' } })
		const candles = container.querySelectorAll('[data-plot-element="candle"]')
		// Second candle: open=115, close=105 → down
		expect(candles[1].getAttribute('fill')).toBe('#ef4444')
	})

	it('uses custom upColor and downColor via options', () => {
		const state = candlestickState()
		const { container } = render(TestCandlestick, {
			props: {
				state,
				x: 'date',
				options: { upColor: 'teal', downColor: 'crimson' }
			}
		})
		const candles = container.querySelectorAll('[data-plot-element="candle"]')
		expect(candles[0].getAttribute('fill')).toBe('teal') // up
		expect(candles[1].getAttribute('fill')).toBe('crimson') // down
	})

	it('candle bodies have x, y, width, height attributes', () => {
		const state = candlestickState()
		const { container } = render(TestCandlestick, { props: { state, x: 'date' } })
		const firstCandle = container.querySelector('[data-plot-element="candle"]')
		expect(firstCandle.getAttribute('x')).not.toBeNull()
		expect(firstCandle.getAttribute('y')).not.toBeNull()
		expect(Number(firstCandle.getAttribute('width'))).toBeGreaterThan(0)
		expect(Number(firstCandle.getAttribute('height'))).toBeGreaterThan(0)
	})

	it('wick lines span from high to low', () => {
		const state = candlestickState()
		const { container } = render(TestCandlestick, { props: { state, x: 'date' } })
		const firstWick = container.querySelector('[data-plot-element="wick"]')
		// y1 (top = high) should be less than y2 (bottom = low) in SVG coords
		const y1 = Number(firstWick.getAttribute('y1'))
		const y2 = Number(firstWick.getAttribute('y2'))
		expect(y1).toBeLessThan(y2)
	})

	it('renders a <title> inside each candle body', () => {
		const state = candlestickState()
		const { container } = render(TestCandlestick, { props: { state, x: 'date' } })
		const titles = container.querySelectorAll('[data-plot-element="candle"] title')
		expect(titles.length).toBe(CANDLE_DATA.length)
		expect(titles[0].textContent).toContain('O=')
		expect(titles[0].textContent).toContain('H=')
	})

	it('calls setHovered on mouseenter', async () => {
		let hovered = null
		const state = candlestickState(CANDLE_DATA, {
			setHovered: (d) => { hovered = d }
		})
		const { container } = render(TestCandlestick, { props: { state, x: 'date' } })
		const firstCandle = container.querySelector('[data-plot-element="candle"]')
		await fireEvent.mouseEnter(firstCandle)
		expect(hovered).not.toBeNull()
	})

	it('calls clearHovered on mouseleave', async () => {
		let cleared = false
		const state = candlestickState(CANDLE_DATA, {
			clearHovered: () => { cleared = true }
		})
		const { container } = render(TestCandlestick, { props: { state, x: 'date' } })
		const firstCandle = container.querySelector('[data-plot-element="candle"]')
		await fireEvent.mouseLeave(firstCandle)
		expect(cleared).toBe(true)
	})

	it('uses custom open/high/low/close field names via options', () => {
		const customData = [
			{ date: '2024-01', o: 100, h: 120, l: 90, c: 115 }
		]
		const state = candlestickState(customData, { geomData: () => customData })
		const { container } = render(TestCandlestick, {
			props: {
				state,
				x: 'date',
				options: { open: 'o', high: 'h', low: 'l', close: 'c' }
			}
		})
		const candles = container.querySelectorAll('[data-plot-element="candle"]')
		expect(candles.length).toBe(1)
	})

	it('uses wickWidth from options', () => {
		const state = candlestickState()
		const { container } = render(TestCandlestick, {
			props: { state, x: 'date', options: { wickWidth: 3 } }
		})
		const firstWick = container.querySelector('[data-plot-element="wick"]')
		expect(firstWick.getAttribute('stroke-width')).toBe('3')
	})
})
