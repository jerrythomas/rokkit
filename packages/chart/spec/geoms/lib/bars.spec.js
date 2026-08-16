import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildBars, buildStackedBars } from '../../../src/geoms/lib/bars.js'

// Horizontal orientation: category on the vertical screen, value on the horizontal screen.
const swap = (u, v) => ({ x: v, y: u })

const data = [
	{ class: 'compact', drv: 'f', hwy: 29 },
	{ class: 'compact', drv: '4', hwy: 26 },
	{ class: 'suv', drv: 'f', hwy: 20 },
	{ class: 'suv', drv: '4', hwy: 18 }
]

const xScale = scaleBand().domain(['compact', 'suv']).range([0, 300]).padding(0.2)
const yScale = scaleLinear().domain([0, 40]).range([200, 0])
const colors = new Map([
	['f', { fill: '#4e79a7', stroke: '#4e79a7' }],
	['4', { fill: '#f28e2b', stroke: '#f28e2b' }]
])

describe('buildBars', () => {
	it('returns one rect per datum', () => {
		const bars = buildBars(
			data,
			{ x: 'class', y: 'hwy', color: 'drv' },
			xScale,
			yScale,
			colors,
			200
		)
		expect(bars).toHaveLength(4)
	})

	it('groups rects within the parent band', () => {
		const bars = buildBars(
			data,
			{ x: 'class', y: 'hwy', color: 'drv' },
			xScale,
			yScale,
			colors,
			200
		)
		const compactBars = bars.filter((b) => b.data.class === 'compact')
		const bandStart = xScale('compact') ?? 0
		const bandEnd = bandStart + xScale.bandwidth()
		for (const b of compactBars) {
			expect(b.x).toBeGreaterThanOrEqual(bandStart)
			expect(b.x + b.width).toBeLessThanOrEqual(bandEnd + 0.001)
		}
	})

	it('applies color fill from colors Map', () => {
		const bars = buildBars(
			data,
			{ x: 'class', y: 'hwy', color: 'drv' },
			xScale,
			yScale,
			colors,
			200
		)
		const fBar = bars.find((b) => b.data.drv === 'f')
		expect(fBar?.fill).toBe('#4e79a7')
	})

	it('bar height reflects y value', () => {
		const bars = buildBars(
			data,
			{ x: 'class', y: 'hwy', color: 'drv' },
			xScale,
			yScale,
			colors,
			200
		)
		const bar29 = bars.find((b) => b.data.hwy === 29)
		expect(bar29?.height).toBeCloseTo(200 - yScale(29), 1)
	})

	it('returns single-bar-per-x when no color channel', () => {
		const bars = buildBars(data, { x: 'class', y: 'hwy' }, xScale, yScale, colors, 200)
		expect(bars).toHaveLength(4)
	})

	it('renders negative bars correctly when domain spans zero', () => {
		const negData = [
			{ cat: 'A', val: 20 },
			{ cat: 'B', val: -15 },
			{ cat: 'C', val: 5 }
		]
		const xBand = scaleBand().domain(['A', 'B', 'C']).range([0, 300]).padding(0.2)
		const yLin = scaleLinear().domain([-20, 25]).range([200, 0])
		const baseline = yLin(0)

		const bars = buildBars(negData, { x: 'cat', y: 'val' }, xBand, yLin, new Map(), 200)

		const barA = bars.find((b) => b.data.cat === 'A')
		const barB = bars.find((b) => b.data.cat === 'B')

		// Positive bar: y is above baseline, height goes down to baseline
		expect(barA?.y).toBeLessThan(baseline)
		expect(barA?.y + barA?.height).toBeCloseTo(baseline, 1)

		// Negative bar: y starts at baseline, extends downward
		expect(barB?.y).toBeCloseTo(baseline, 1)
		expect(barB?.height).toBeGreaterThan(0)
		expect(barB?.y + barB?.height).toBeCloseTo(yLin(-15), 1)
	})
})

describe('buildStackedBars', () => {
	const stackData = [
		{ class: 'compact', drv: 'f', hwy: 29 },
		{ class: 'compact', drv: '4', hwy: 26 },
		{ class: 'suv', drv: 'f', hwy: 20 },
		{ class: 'suv', drv: '4', hwy: 18 }
	]

	it('returns one rect per datum', () => {
		const bars = buildStackedBars(
			stackData,
			{ x: 'class', y: 'hwy', color: 'drv' },
			xScale,
			yScale,
			colors,
			200
		)
		expect(bars).toHaveLength(4)
	})

	it('stacks bars vertically (y0 + y1 pattern)', () => {
		const bars = buildStackedBars(
			stackData,
			{ x: 'class', y: 'hwy', color: 'drv' },
			xScale,
			yScale,
			colors,
			200
		)
		// sort ascending by y: bars[0] = upper bar (smaller SVG y), bars[1] = lower bar
		const compactBars = bars.filter((b) => b.data.class === 'compact').sort((a, b) => a.y - b.y)
		expect(compactBars[0].y + compactBars[0].height).toBeCloseTo(compactBars[1].y, 1)
	})
})

// Grouped horizontal bars = buildBars with a band category (class) + place() swap. The value
// (hwy) runs along the horizontal screen (width); the category stands up on the vertical screen.
describe('buildBars — grouped horizontal (band category via place)', () => {
	const classBand = scaleBand().domain(['compact', 'suv']).range([0, 200]).padding(0.2)
	const hwyLin = scaleLinear().domain([0, 40]).range([0, 300])

	it('returns one rect per datum', () => {
		const bars = buildBars(
			data,
			{ x: 'class', y: 'hwy', color: 'drv' },
			classBand,
			hwyLin,
			colors,
			200,
			undefined,
			swap
		)
		expect(bars).toHaveLength(4)
	})

	it('bar width reflects the value (hwy)', () => {
		const bars = buildBars(
			data,
			{ x: 'class', y: 'hwy', color: 'drv' },
			classBand,
			hwyLin,
			colors,
			200,
			undefined,
			swap
		)
		const bar29 = bars.find((b) => b.data.hwy === 29)
		expect(bar29?.width).toBeCloseTo(hwyLin(29), 1)
	})
})

describe('buildBars — orientation flip', () => {
	const xs = scaleBand().domain(['compact', 'suv']).range([0, 300]).padding(0.2)
	const ys = scaleLinear().domain([0, 30]).range([200, 0])
	const cols = new Map([['f', { fill: '#a', stroke: '#a' }], ['4', { fill: '#b', stroke: '#b' }]])
	it('transposes each bar rect (width<->height) via place() when flipped', () => {
		const vertical = buildBars(data, { x: 'class', y: 'hwy', color: 'drv' }, xs, ys, cols, 200)
		const flipped = buildBars(data, { x: 'class', y: 'hwy', color: 'drv' }, xs, ys, cols, 200, undefined, (x, y) => ({ x: y, y: x }))
		// The flip swaps the rect's width and height for each bar.
		expect(flipped[0].width).toBeCloseTo(vertical[0].height)
		expect(flipped[0].height).toBeCloseTo(vertical[0].width)
	})
})
