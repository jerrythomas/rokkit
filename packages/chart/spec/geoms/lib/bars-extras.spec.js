import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildBars, buildStackedBars } from '../../../src/geoms/lib/bars.js'

// Horizontal orientation: category on the vertical screen, value on the horizontal screen.
const swap = (u, v) => ({ x: v, y: u })

/**
 * Extra coverage for geoms/lib/bars.js:
 * - buildBars continuous-category mode (a bar-chart race's linear rank axis)
 * - buildBars band mode: ensureBandX for a linear x scale (band derived from data)
 * - buildBars grouped-horizontal (band category via place)
 */

const colors = new Map([
	['CompanyA', { fill: '#4e79a7', stroke: '#4e79a7' }],
	['CompanyB', { fill: '#f28e2b', stroke: '#f28e2b' }],
	['CompanyC', { fill: '#e15759', stroke: '#e15759' }]
])

// A bar-chart race in the STANDARD convention: x = _rank (a continuous category/position on a
// LINEAR scale), y = revenue (value). place() swap → rank on the vertical screen, value along the
// horizontal. continuousCategory=true keeps the rank axis linear so fractional ranks tween smoothly.
describe('buildBars — continuous category (rank-based race)', () => {
	const rankData = [
		{ _entity: 'CompanyA', revenue: 300, _rank: 0, category: 'CompanyA' },
		{ _entity: 'CompanyB', revenue: 200, _rank: 1, category: 'CompanyB' },
		{ _entity: 'CompanyC', revenue: 150, _rank: 2, category: 'CompanyC' }
	]
	const rankScale = scaleLinear().domain([0, 2]).range([200, 0]) // continuous position axis
	const valueScale = scaleLinear().domain([0, 400]).range([0, 300]) // value axis
	const build = (data = rankData) =>
		buildBars(
			data,
			{ x: '_rank', y: 'revenue', color: 'category' },
			rankScale,
			valueScale,
			colors,
			200,
			undefined,
			swap,
			true
		)

	it('returns one bar per datum', () => {
		expect(build()).toHaveLength(3)
	})

	it('bars start at x=0 (value grows along the horizontal screen)', () => {
		for (const bar of build()) expect(bar.x).toBeCloseTo(0, 6)
	})

	it('bar width reflects the value (revenue)', () => {
		const barA = build().find((b) => b.data._entity === 'CompanyA')
		expect(barA?.width).toBeCloseTo(valueScale(300), 1)
	})

	it('bar height > 0 (thickness derived from the step size)', () => {
		for (const bar of build()) expect(bar.height).toBeGreaterThan(0)
	})

	it('bar key uses _entity (so Svelte reuses each bar as its rank tweens)', () => {
		const barA = build().find((b) => b.data._entity === 'CompanyA')
		expect(barA?.key).toContain('CompanyA')
	})

	it('applies color fill from the colors map', () => {
		const barA = build().find((b) => b.data._entity === 'CompanyA')
		expect(barA?.fill).toBe('#4e79a7')
	})

	it('falls back to the first color entry when the color key is not found', () => {
		const bars = build([{ _entity: 'Unknown', revenue: 100, _rank: 0, category: 'Unknown' }])
		expect(bars[0].fill).toBeTruthy()
	})

	it('patternId is null when no patterns provided', () => {
		for (const bar of build()) expect(bar.patternId).toBeNull()
	})
})

describe('buildBars — band mode: linear x scale (ensureBandX derivation)', () => {
	// When xScale is linear (not band), ensureBandX derives a band scale from data
	const yearData = [
		{ year: 2020, val: 100, group: 'A' },
		{ year: 2020, val: 80, group: 'B' },
		{ year: 2021, val: 150, group: 'A' },
		{ year: 2021, val: 120, group: 'B' }
	]

	const xLinear = scaleLinear().domain([2019, 2022]).range([0, 300])
	const yScale = scaleLinear().domain([0, 200]).range([200, 0])
	const groupColors = new Map([
		['A', { fill: '#blue', stroke: '#darkblue' }],
		['B', { fill: '#red', stroke: '#darkred' }]
	])

	it('builds bars with linear x scale (ensureBandX creates band from data)', () => {
		const bars = buildBars(
			yearData,
			{ x: 'year', y: 'val', color: 'group' },
			xLinear,
			yScale,
			groupColors,
			200
		)
		expect(bars).toHaveLength(4)
	})

	it('each bar has positive width', () => {
		const bars = buildBars(
			yearData,
			{ x: 'year', y: 'val', color: 'group' },
			xLinear,
			yScale,
			groupColors,
			200
		)
		for (const bar of bars) {
			expect(bar.width).toBeGreaterThan(0)
		}
	})
})

describe('buildStackedBars — extra coverage', () => {
	const data = [
		{ cat: 'A', drv: 'f', val: 30 },
		{ cat: 'A', drv: '4', val: 20 },
		{ cat: 'B', drv: 'f', val: 40 },
		{ cat: 'B', drv: '4', val: 35 }
	]
	const xScale = scaleBand().domain(['A', 'B']).range([0, 300]).padding(0.2)
	const yScale = scaleLinear().domain([0, 80]).range([200, 0])
	const colors = new Map([
		['f', { fill: '#4e79a7', stroke: '#4e79a7' }],
		['4', { fill: '#f28e2b', stroke: '#f28e2b' }]
	])

	it('color lookup: cf === stackField (colored by stack key)', () => {
		// cf = drv = stackField → colorKey = stackKey (e.g. 'f' or '4')
		const bars = buildStackedBars(
			data,
			{ x: 'cat', y: 'val', color: 'drv' },
			xScale,
			yScale,
			colors,
			200
		)
		expect(bars.length).toBeGreaterThan(0)
		// Each bar has a fill sourced from the stack layer key
		expect(bars.every((b) => b.fill)).toBe(true)
	})

	it('color lookup: cf === xf (colored by x value)', () => {
		// cf = cat = xf → colorKey = xVal (the x category)
		const xColors = new Map([
			['A', { fill: '#green', stroke: '#darkgreen' }],
			['B', { fill: '#purple', stroke: '#darkpurple' }]
		])
		const bars = buildStackedBars(
			data,
			{ x: 'cat', y: 'val', color: 'cat' },
			xScale,
			yScale,
			xColors,
			200
		)
		expect(bars.length).toBeGreaterThan(0)
		// bars that correspond to 'cat:A' rows should use the 'A' color
		// point.data[xf] = 'A' → colorKey = 'A' → fill = '#green'
		expect(bars.some((b) => b.fill === '#green')).toBe(true)
	})

	it('pattern lookup: pf === stackField', () => {
		const patterns = new Map([['f', 'diagonal'], ['4', 'dots']])
		const bars = buildStackedBars(
			data,
			{ x: 'cat', y: 'val', color: 'drv', pattern: 'drv' },
			xScale,
			yScale,
			colors,
			200,
			patterns
		)
		// All bars have stackKey ('f' or '4') as patternKey → all in patterns map → all have patternId
		expect(bars.some((b) => b.patternId !== null)).toBe(true)
	})

	it('pattern lookup: pf === xf', () => {
		const patterns = new Map([['A', 'diagonal'], ['B', 'dots']])
		const bars = buildStackedBars(
			data,
			{ x: 'cat', y: 'val', color: 'drv', pattern: 'cat' },
			xScale,
			yScale,
			colors,
			200,
			patterns
		)
		expect(bars.length).toBeGreaterThan(0)
	})

	it('color lookup: cf is different field (not xf, not stackField) → null', () => {
		// cf = 'other' which differs from both xf='cat' and stackField='drv'
		// → colorKey = null → fallback color
		const extraData = data.map((d) => ({ ...d, other: 'Z' }))
		const bars = buildStackedBars(
			extraData,
			{ x: 'cat', y: 'val', color: 'other' },
			xScale,
			yScale,
			colors,
			200
		)
		// Should not throw; colorKey=null → fallback
		expect(bars.length).toBeGreaterThan(0)
	})

	it('falls back to grouped bars when no sub fields', () => {
		// No color or pattern fields that differ from x
		const bars = buildStackedBars(
			data,
			{ x: 'cat', y: 'val' },
			xScale,
			yScale,
			colors,
			200
		)
		// buildGroupedBars is called as fallback
		expect(bars).toHaveLength(4)
	})
})

// Grouped horizontal bars = buildBars, band category (class) on x, value (hwy) on y, place() swap.
// The bar's on-screen HEIGHT is the (sub-)band thickness; its WIDTH is the value.
describe('buildBars — grouped horizontal sub-bands (band category via place)', () => {
	const data = [
		{ class: 'compact', drv: 'f', hwy: 29 },
		{ class: 'compact', drv: '4', hwy: 26 },
		{ class: 'suv', drv: 'f', hwy: 20 },
		{ class: 'suv', drv: '4', hwy: 18 }
	]
	const classBand = scaleBand().domain(['compact', 'suv']).range([0, 200]).padding(0.2)
	const hwyLin = scaleLinear().domain([0, 40]).range([0, 300])
	const groupColors = new Map([
		['f', { fill: '#blue', stroke: '#darkblue' }],
		['4', { fill: '#red', stroke: '#darkred' }]
	])

	it('creates sub-bands when multiple color keys split a category', () => {
		const bars = buildBars(
			data,
			{ x: 'class', y: 'hwy', color: 'drv' },
			classBand,
			hwyLin,
			groupColors,
			200,
			undefined,
			swap
		)
		expect(bars).toHaveLength(4)
		// Sub-banded → each bar's on-screen thickness (height) is less than the full band
		for (const bar of bars) {
			expect(bar.height).toBeLessThan(classBand.bandwidth())
		}
	})

	it('no sub-bands when a single color key per category → full band thickness', () => {
		const singleColorData = [
			{ class: 'compact', drv: 'f', hwy: 29 },
			{ class: 'suv', drv: 'f', hwy: 20 }
		]
		const singleColors = new Map([['f', { fill: '#blue', stroke: '#darkblue' }]])
		const bars = buildBars(
			singleColorData,
			{ x: 'class', y: 'hwy', color: 'drv' },
			classBand,
			hwyLin,
			singleColors,
			200,
			undefined,
			swap
		)
		expect(bars).toHaveLength(2)
		expect(bars[0].height).toBeCloseTo(classBand.bandwidth(), 1)
	})

	it('handles a literal color field (isLiteralColor) — no sub-bands created', () => {
		const literalColorData = [
			{ class: 'compact', hwy: 29 },
			{ class: 'suv', hwy: 20 }
		]
		const bars = buildBars(
			literalColorData,
			{ x: 'class', y: 'hwy', color: '#ff0000' },
			classBand,
			hwyLin,
			new Map(),
			200,
			undefined,
			swap
		)
		expect(bars).toHaveLength(2)
	})
})
