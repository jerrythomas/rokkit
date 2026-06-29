import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildHorizontalBars, buildGroupedBars, buildStackedBars } from '../../../src/geoms/lib/bars.js'

/**
 * Extra tests covering uncovered lines in geoms/lib/bars.js:
 * - Lines 161-190: buildHorizontalBars with linear y-scale (rank-based)
 * - Lines 99-100: ensureBandX for linear x scale (band derived from data)
 */

const colors = new Map([
	['CompanyA', { fill: '#4e79a7', stroke: '#4e79a7' }],
	['CompanyB', { fill: '#f28e2b', stroke: '#f28e2b' }],
	['CompanyC', { fill: '#e15759', stroke: '#e15759' }]
])

describe('buildHorizontalBars — linear y-scale (rank-based)', () => {
	// Simulate a bar chart race: y is numeric _rank, x is numeric value
	const rankData = [
		{ _entity: 'CompanyA', revenue: 300, _rank: 0, category: 'CompanyA' },
		{ _entity: 'CompanyB', revenue: 200, _rank: 1, category: 'CompanyB' },
		{ _entity: 'CompanyC', revenue: 150, _rank: 2, category: 'CompanyC' }
	]

	// Linear y-scale: domain [0, 2] (ranks), range [200, 0]
	const yLinear = scaleLinear().domain([0, 2]).range([200, 0])
	const xLinear = scaleLinear().domain([0, 400]).range([0, 300])

	it('returns one bar per datum with linear y scale', () => {
		const bars = buildHorizontalBars(
			rankData,
			{ x: 'revenue', y: '_rank', color: 'category' },
			xLinear,
			yLinear,
			colors,
			200
		)
		expect(bars).toHaveLength(3)
	})

	it('bar x is 0 (all bars start from left)', () => {
		const bars = buildHorizontalBars(
			rankData,
			{ x: 'revenue', y: '_rank', color: 'category' },
			xLinear,
			yLinear,
			colors,
			200
		)
		for (const bar of bars) {
			expect(bar.x).toBe(0)
		}
	})

	it('bar width reflects x value', () => {
		const bars = buildHorizontalBars(
			rankData,
			{ x: 'revenue', y: '_rank', color: 'category' },
			xLinear,
			yLinear,
			colors,
			200
		)
		const barA = bars.find((b) => b._entity === 'CompanyA' || b.data._entity === 'CompanyA')
		// width = xScale(300) = 300 * (300/400) = 225
		expect(barA?.width).toBeCloseTo(xLinear(300), 1)
	})

	it('bar height > 0 (derived from step size)', () => {
		const bars = buildHorizontalBars(
			rankData,
			{ x: 'revenue', y: '_rank', color: 'category' },
			xLinear,
			yLinear,
			colors,
			200
		)
		for (const bar of bars) {
			expect(bar.height).toBeGreaterThan(0)
		}
	})

	it('bar key uses _entity when present', () => {
		const bars = buildHorizontalBars(
			rankData,
			{ x: 'revenue', y: '_rank', color: 'category' },
			xLinear,
			yLinear,
			colors,
			200
		)
		const barA = bars.find((b) => b.data._entity === 'CompanyA')
		expect(barA?.key).toContain('CompanyA')
	})

	it('applies color fill from colors map', () => {
		const bars = buildHorizontalBars(
			rankData,
			{ x: 'revenue', y: '_rank', color: 'category' },
			xLinear,
			yLinear,
			colors,
			200
		)
		const barA = bars.find((b) => b.data._entity === 'CompanyA')
		expect(barA?.fill).toBe('#4e79a7')
	})

	it('falls back to first color entry when color key not found', () => {
		const noMatchData = [{ _entity: 'Unknown', revenue: 100, _rank: 0, category: 'Unknown' }]
		const bars = buildHorizontalBars(
			noMatchData,
			{ x: 'revenue', y: '_rank', color: 'category' },
			xLinear,
			yLinear,
			colors,
			200
		)
		expect(bars[0].fill).toBeTruthy()
	})

	it('patternId is null for horizontal bars', () => {
		const bars = buildHorizontalBars(
			rankData,
			{ x: 'revenue', y: '_rank', color: 'category' },
			xLinear,
			yLinear,
			colors,
			200
		)
		for (const bar of bars) {
			expect(bar.patternId).toBeNull()
		}
	})
})

describe('buildGroupedBars — linear x scale (ensureBandX derivation)', () => {
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
		const bars = buildGroupedBars(
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
		const bars = buildGroupedBars(
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

describe('buildHorizontalBars — band y-scale sub-bands', () => {
	const data = [
		{ class: 'compact', drv: 'f', hwy: 29 },
		{ class: 'compact', drv: '4', hwy: 26 },
		{ class: 'suv', drv: 'f', hwy: 20 },
		{ class: 'suv', drv: '4', hwy: 18 }
	]
	const yBand = scaleBand().domain(['compact', 'suv']).range([0, 200]).padding(0.2)
	const xLin = scaleLinear().domain([0, 40]).range([0, 300])
	const groupColors = new Map([
		['f', { fill: '#blue', stroke: '#darkblue' }],
		['4', { fill: '#red', stroke: '#darkred' }]
	])

	it('creates sub-bands when multiple color keys and data > unique y values', () => {
		const bars = buildHorizontalBars(
			data,
			{ x: 'hwy', y: 'class', color: 'drv' },
			xLin,
			yBand,
			groupColors,
			200
		)
		expect(bars).toHaveLength(4)
		// With sub-bands, bar heights should be smaller than full band
		for (const bar of bars) {
			expect(bar.height).toBeLessThan(yBand.bandwidth())
		}
	})

	it('no sub-bands when single color key per y category', () => {
		const singleColorData = [
			{ class: 'compact', drv: 'f', hwy: 29 },
			{ class: 'suv', drv: 'f', hwy: 20 }
		]
		const singleColors = new Map([['f', { fill: '#blue', stroke: '#darkblue' }]])
		const bars = buildHorizontalBars(
			singleColorData,
			{ x: 'hwy', y: 'class', color: 'drv' },
			xLin,
			yBand,
			singleColors,
			200
		)
		// Only one color key → no sub-scale → full band height
		expect(bars).toHaveLength(2)
		expect(bars[0].height).toBeCloseTo(yBand.bandwidth(), 1)
	})

	it('handles literal color field (isLiteralColor) — no sub-bands created', () => {
		// When color field is a CSS color literal, it is not treated as a data field
		const literalColorData = [
			{ class: 'compact', hwy: 29 },
			{ class: 'suv', hwy: 20 }
		]
		const bars = buildHorizontalBars(
			literalColorData,
			{ x: 'hwy', y: 'class', color: '#ff0000' },
			xLin,
			yBand,
			new Map(),
			200
		)
		expect(bars).toHaveLength(2)
	})
})
