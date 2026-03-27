import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import {
	buildGroupedBars,
	buildStackedBars,
	buildHorizontalBars
} from '../../../src/geoms/lib/bars.js'

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

describe('buildGroupedBars', () => {
	it('returns one rect per datum', () => {
		const bars = buildGroupedBars(
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
		const bars = buildGroupedBars(
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
		const bars = buildGroupedBars(
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
		const bars = buildGroupedBars(
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
		const bars = buildGroupedBars(data, { x: 'class', y: 'hwy' }, xScale, yScale, colors, 200)
		expect(bars).toHaveLength(4)
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

describe('buildHorizontalBars', () => {
	const yBand = scaleBand().domain(['compact', 'suv']).range([0, 200]).padding(0.2)
	const xLin = scaleLinear().domain([0, 40]).range([0, 300])

	it('returns one rect per datum', () => {
		const bars = buildHorizontalBars(
			data,
			{ x: 'hwy', y: 'class', color: 'drv' },
			xLin,
			yBand,
			colors,
			200
		)
		expect(bars).toHaveLength(4)
	})

	it('bar width reflects x value', () => {
		const bars = buildHorizontalBars(
			data,
			{ x: 'hwy', y: 'class', color: 'drv' },
			xLin,
			yBand,
			colors,
			200
		)
		const bar29 = bars.find((b) => b.data.hwy === 29)
		expect(bar29?.width).toBeCloseTo(xLin(29), 1)
	})
})
