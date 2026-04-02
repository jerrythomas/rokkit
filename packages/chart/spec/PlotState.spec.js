import { describe, it, expect, vi } from 'vitest'
import mpg from './fixtures/mpg.json'
import { PlotState } from '../src/PlotState.svelte.js'

describe('PlotState — label resolution', () => {
	it('returns field name when no labels defined', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' }, labels: {} })
		expect(state.label('class')).toBe('class')
		expect(state.label('cty')).toBe('cty')
	})

	it('returns display label when defined', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'class', y: 'cty' },
			labels: { cty: 'City MPG', class: 'Vehicle Class' }
		})
		expect(state.label('cty')).toBe('City MPG')
		expect(state.label('class')).toBe('Vehicle Class')
	})
})

describe('PlotState — geom registration and stat', () => {
	it('registerGeom stores a geom config', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
		const id = state.registerGeom({
			type: 'bar',
			channels: { x: 'class', y: 'cty' },
			stat: 'identity'
		})
		expect(typeof id).toBe('string')
	})

	it('geomData returns post-stat rows for registered geom (identity)', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
		const id = state.registerGeom({
			type: 'bar',
			channels: { x: 'class', y: 'cty' },
			stat: 'identity'
		})
		const rows = state.geomData(id)
		expect(rows).toEqual(mpg)
	})

	it('geomData returns aggregated rows for stat=sum', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
		const id = state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'sum' })
		const rows = state.geomData(id)
		expect(rows.length).toBeLessThan(mpg.length)
		expect(rows[0]).toHaveProperty('class')
		expect(rows[0]).toHaveProperty('cty')
	})

	it('geomData with stat=mean produces correct average', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'hwy' } })
		const id = state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'hwy' }, stat: 'mean' })
		const rows = state.geomData(id)
		const compact = rows.find((r) => r.class === 'compact')
		const expectedMean =
			mpg.filter((r) => r.class === 'compact').reduce((a, r) => a + r.hwy, 0) /
			mpg.filter((r) => r.class === 'compact').length
		expect(compact.hwy).toBeCloseTo(expectedMean)
	})
})

describe('PlotState — color scale type inference', () => {
	it('infers categorical for string color field', () => {
		const state = new PlotState({ data: mpg, channels: { color: 'class' } })
		expect(state.colorScaleType).toBe('categorical')
	})

	it('infers sequential for numeric color field', () => {
		const state = new PlotState({ data: mpg, channels: { color: 'cty' } })
		expect(state.colorScaleType).toBe('sequential')
	})

	it('infers diverging when colorMidpoint set', () => {
		const state = new PlotState({ data: mpg, channels: { color: 'cty' }, colorMidpoint: 20 })
		expect(state.colorScaleType).toBe('diverging')
	})
})

describe('PlotState — orientation inference', () => {
	it('infers vertical when x is categorical (class)', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'class', y: 'cty' },
			width: 600,
			height: 400
		})
		state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'mean' })
		expect(state.orientation).toBe('vertical')
	})

	it('infers horizontal when y is categorical', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'cty', y: 'class' },
			width: 600,
			height: 400
		})
		state.registerGeom({ type: 'bar', channels: { x: 'cty', y: 'class' }, stat: 'mean' })
		expect(state.orientation).toBe('horizontal')
	})

	it('infers none for scatter (both continuous)', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'cty', y: 'hwy' },
			width: 600,
			height: 400
		})
		state.registerGeom({ type: 'point', channels: { x: 'cty', y: 'hwy' }, stat: 'identity' })
		expect(state.orientation).toBe('none')
	})
})

describe('PlotState — scale domain includes zero for bar charts', () => {
	it('yScale starts at 0 for vertical bar chart', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'class', y: 'cty' },
			width: 600,
			height: 400
		})
		state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'mean' })
		expect(state.yScale.domain()[0]).toBe(0)
	})

	it('xScale starts at 0 for horizontal bar chart', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'cty', y: 'class' },
			width: 600,
			height: 400
		})
		state.registerGeom({ type: 'bar', channels: { x: 'cty', y: 'class' }, stat: 'mean' })
		expect(state.xScale.domain()[0]).toBe(0)
	})

	it('yScale does NOT start at 0 for scatter (extent domain)', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'displ', y: 'hwy' },
			width: 600,
			height: 400
		})
		state.registerGeom({ type: 'point', channels: { x: 'displ', y: 'hwy' }, stat: 'identity' })
		expect(state.yScale.domain()[0]).toBeGreaterThan(0)
	})
})

describe('PlotState — axisOrigin', () => {
	it('axisOrigin defaults to [undefined, undefined]', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
		expect(state.axisOrigin).toEqual([undefined, undefined])
	})

	it('xAxisY returns innerHeight when no yScale', () => {
		const state = new PlotState({ data: mpg, channels: {}, width: 600, height: 400 })
		expect(state.xAxisY).toBe(state.innerHeight)
	})

	it('axisOrigin can be set for quadrant mode', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'displ', y: 'hwy' },
			width: 600,
			height: 400
		})
		state.registerGeom({ type: 'point', channels: { x: 'displ', y: 'hwy' }, stat: 'identity' })
		state.axisOrigin = [0, 0]
		const atZero = state.yScale(0)
		expect(state.xAxisY).toBe(atZero)
	})

	it('xAxisY auto-positions at y=0 when domain spans zero', () => {
		const data = [
			{ x: 1, y: -30 },
			{ x: 2, y: 50 },
			{ x: 3, y: -10 }
		]
		const state = new PlotState({
			data,
			channels: { x: 'x', y: 'y' },
			width: 600,
			height: 400
		})
		// Domain includes negative values: auto-quadrant places x-axis at y=0
		const yAtZero = state.yScale(0)
		expect(state.xAxisY).toBe(yAtZero)
		expect(yAtZero).toBeGreaterThan(0)
		expect(yAtZero).toBeLessThan(state.innerHeight)
	})

	it('xAxisY stays at bottom for all-positive y data', () => {
		const data = [
			{ x: 1, y: 10 },
			{ x: 2, y: 50 },
			{ x: 3, y: 30 }
		]
		const state = new PlotState({
			data,
			channels: { x: 'x', y: 'y' },
			width: 600,
			height: 400
		})
		// All positive: domain starts at 0 (includeZero=true), x-axis at bottom
		expect(state.xAxisY).toBeCloseTo(state.innerHeight, 1)
	})

	it('yAxisX auto-positions at x=0 when x domain spans zero', () => {
		const data = [
			{ x: -20, y: 10 },
			{ x: 30, y: 50 },
			{ x: -5, y: 30 }
		]
		const state = new PlotState({
			data,
			channels: { x: 'x', y: 'y' },
			width: 600,
			height: 400
		})
		const xAtZero = state.xScale(0)
		expect(state.yAxisX).toBe(xAtZero)
		expect(xAtZero).toBeGreaterThan(0)
		expect(xAtZero).toBeLessThan(state.innerWidth)
	})

	it('yAxisX stays at left edge for all-positive x data', () => {
		const data = [
			{ x: 10, y: 10 },
			{ x: 50, y: 50 }
		]
		const state = new PlotState({
			data,
			channels: { x: 'x', y: 'y' },
			width: 600,
			height: 400
		})
		// xDomain starts above 0, y-axis at left edge (xScale(domain[0]))
		const domain = state.xScale.domain()
		expect(state.yAxisX).toBe(state.xScale(domain[0]))
	})
})

describe('PlotState — geomData with stat=boxplot', () => {
	const vals = [
		{ class: 'A', hwy: 10 },
		{ class: 'A', hwy: 20 },
		{ class: 'A', hwy: 30 },
		{ class: 'A', hwy: 40 },
		{ class: 'B', hwy: 5 },
		{ class: 'B', hwy: 15 }
	]

	it('returns quartile rows for stat=boxplot', () => {
		const state = new PlotState({ data: vals, channels: { x: 'class', y: 'hwy' } })
		const id = state.registerGeom({
			type: 'box',
			channels: { x: 'class', y: 'hwy', color: 'class' },
			stat: 'boxplot'
		})
		const rows = state.geomData(id)
		expect(rows).toHaveLength(2)
		expect(rows[0]).toHaveProperty('q1')
		expect(rows[0]).toHaveProperty('median')
		expect(rows[0]).toHaveProperty('q3')
		expect(rows[0]).toHaveProperty('iqr_min')
		expect(rows[0]).toHaveProperty('iqr_max')
	})

	it('none of the quartile values are NaN', () => {
		const state = new PlotState({ data: vals, channels: { x: 'class', y: 'hwy' } })
		const id = state.registerGeom({
			type: 'box',
			channels: { x: 'class', y: 'hwy', color: 'class' },
			stat: 'boxplot'
		})
		const rows = state.geomData(id)
		for (const row of rows) {
			expect(isNaN(row.q1)).toBe(false)
			expect(isNaN(row.median)).toBe(false)
			expect(isNaN(row.q3)).toBe(false)
			expect(isNaN(row.iqr_min)).toBe(false)
			expect(isNaN(row.iqr_max)).toBe(false)
		}
	})
})

describe('PlotState — yScale domain for box/violin geoms', () => {
	const vals = [
		{ class: 'A', hwy: 10 },
		{ class: 'A', hwy: 20 },
		{ class: 'A', hwy: 30 },
		{ class: 'A', hwy: 40 },
		{ class: 'B', hwy: 5 },
		{ class: 'B', hwy: 15 },
		{ class: 'B', hwy: 25 },
		{ class: 'B', hwy: 35 }
	]

	it('yScale domain spans iqr_min to iqr_max (not raw y extent)', () => {
		const state = new PlotState({
			data: vals,
			channels: { x: 'class', y: 'hwy' },
			width: 600,
			height: 400
		})
		state.registerGeom({
			type: 'box',
			channels: { x: 'class', y: 'hwy', color: 'class' },
			stat: 'boxplot'
		})
		const [domMin, domMax] = state.yScale.domain()
		// d3 linear interpolation on [10,20,30,40]: q1=17.5, q3=32.5, IQR=15
		// iqr_min = 17.5 - 22.5 = -5, iqr_max = 32.5 + 22.5 = 55
		expect(domMin).toBeLessThan(5) // below raw data min of 5
		expect(domMax).toBeGreaterThan(40) // above raw data max of 40
	})

	it('yScale domain does not use the raw y field (which is absent in aggregated rows)', () => {
		const state = new PlotState({
			data: vals,
			channels: { x: 'class', y: 'hwy' },
			width: 600,
			height: 400
		})
		state.registerGeom({
			type: 'box',
			channels: { x: 'class', y: 'hwy', color: 'class' },
			stat: 'boxplot'
		})
		const yAt0 = state.yScale(0)
		// If yScale was built from undefined values it would return NaN
		expect(isNaN(yAt0)).toBe(false)
	})
})

describe('PlotState — xScale uses band for bar geom with numeric X', () => {
	it('year on X axis uses scaleBand (discrete ticks, not continuous range)', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'year', y: 'hwy' },
			width: 600,
			height: 400
		})
		state.registerGeom({ type: 'bar', channels: { x: 'year', y: 'hwy' }, stat: 'mean' })
		const domain = state.xScale.domain()
		// Band scale: domain contains only the two distinct year values
		expect(typeof state.xScale.bandwidth).toBe('function')
		expect(domain).toContain(1999)
		expect(domain).toContain(2008)
		expect(domain).toHaveLength(2)
	})

	it('scatter with numeric X stays linear (no band forced)', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'displ', y: 'hwy' },
			width: 600,
			height: 400
		})
		state.registerGeom({ type: 'point', channels: { x: 'displ', y: 'hwy' }, stat: 'identity' })
		expect(typeof state.xScale.bandwidth).toBe('undefined')
	})
})

describe('PlotState — stacked bar Y domain with stat=identity', () => {
	// Bug: summing raw rows overcounted when multiple rows share the same (x, color).
	// Fix: mirror buildStackedBars last-write-wins per (x, colorKey).
	const stackData = [
		{ class: 'compact', drv: 'f', hwy: 29 },
		{ class: 'compact', drv: '4', hwy: 26 },
		{ class: 'suv', drv: 'f', hwy: 20 },
		{ class: 'suv', drv: '4', hwy: 18 }
	]

	it('stacked Y domain = max column total (29+26=55), not sum of all rows', () => {
		const state = new PlotState({
			data: stackData,
			channels: { x: 'class', y: 'hwy', color: 'drv' },
			width: 600,
			height: 400
		})
		state.registerGeom({
			type: 'bar',
			channels: { x: 'class', y: 'hwy', color: 'drv' },
			stat: 'identity',
			options: { stack: true }
		})
		const [, domMax] = state.yScale.domain()
		// compact column: f(29) + 4(26) = 55; suv column: f(20) + 4(18) = 38; max = 55
		expect(domMax).toBeGreaterThanOrEqual(55)
		// Must NOT be sum of all rows (29+26+20+18 = 93)
		expect(domMax).toBeLessThan(90)
	})
})

describe('PlotState — colors map for arc/pie geom', () => {
	const pieData = [
		{ segment: 'A', value: 30 },
		{ segment: 'B', value: 70 }
	]

	it('colors map is populated when arc geom registers color channel', () => {
		const state = new PlotState({ data: pieData, channels: {} })
		state.registerGeom({
			type: 'arc',
			channels: { color: 'segment', y: 'value' },
			stat: 'identity'
		})
		// colors is derived from effectiveChannels.color which falls back to first geom's channels
		expect(state.colors.size).toBe(2)
		expect(state.colors.has('A')).toBe(true)
		expect(state.colors.has('B')).toBe(true)
	})

	it('colors map has fill and stroke for each segment', () => {
		const state = new PlotState({ data: pieData, channels: {} })
		state.registerGeom({
			type: 'arc',
			channels: { color: 'segment', y: 'value' },
			stat: 'identity'
		})
		const a = state.colors.get('A')
		expect(a).toHaveProperty('fill')
		expect(a).toHaveProperty('stroke')
		expect(a.fill).not.toBe('')
	})
})

describe('PlotState — colors map for box geom (keyed by x field)', () => {
	const vals = [
		{ class: 'A', hwy: 10 },
		{ class: 'A', hwy: 20 },
		{ class: 'B', hwy: 30 },
		{ class: 'B', hwy: 40 }
	]

	it('colors map is keyed by x categories when box geom uses color=x', () => {
		const state = new PlotState({ data: vals, channels: {} })
		state.registerGeom({
			type: 'box',
			channels: { x: 'class', y: 'hwy', color: 'class' },
			stat: 'boxplot'
		})
		expect(state.colors.size).toBe(2)
		expect(state.colors.has('A')).toBe(true)
		expect(state.colors.has('B')).toBe(true)
	})
})

describe('PlotState — preset from spec config', () => {
	it('resolves preset by name from config.preset', () => {
		const brandPreset = { colors: ['#ff0000'], patterns: [], symbols: [] }
		const state = new PlotState({
			data: mpg,
			channels: {},
			preset: 'brand',
			helpers: { presets: { brand: brandPreset } }
		})
		expect(state.preset().colors).toEqual(['#ff0000'])
	})

	it('returns default preset when no preset in config', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		expect(state.preset().colors.length).toBeGreaterThan(0)
	})
})
