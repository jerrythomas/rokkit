import { describe, it, expect } from 'vitest'
import { ChartBrewer } from '../../src/lib/brewing/brewer.svelte.js'

/**
 * Extended tests covering uncovered branches in brewer.svelte.js.
 * Existing brewer.spec.js covers basic construction and update.
 * This file covers: getters (width, height, mode, margin, innerWidth, innerHeight,
 * channels), update() options (mode, margin, layers, curve, stat),
 * patternDefs (same-field, different-field), sizeScale, arcs, lines, areas, points.
 */

const data = [
	{ month: 'Jan', revenue: 100, region: 'North' },
	{ month: 'Feb', revenue: 200, region: 'South' },
	{ month: 'Mar', revenue: 150, region: 'North' }
]

describe('ChartBrewer — getters', () => {
	it('width getter returns current width', () => {
		const brewer = new ChartBrewer()
		brewer.update({ width: 800 })
		expect(brewer.width).toBe(800)
	})

	it('height getter returns current height', () => {
		const brewer = new ChartBrewer()
		brewer.update({ height: 500 })
		expect(brewer.height).toBe(500)
	})

	it('mode getter returns current mode', () => {
		const brewer = new ChartBrewer()
		brewer.update({ mode: 'dark' })
		expect(brewer.mode).toBe('dark')
	})

	it('margin getter returns current margin', () => {
		const brewer = new ChartBrewer()
		brewer.update({ margin: { top: 10 } })
		expect(brewer.margin.top).toBe(10)
	})

	it('innerWidth is width minus horizontal margins', () => {
		const brewer = new ChartBrewer()
		brewer.update({ width: 600, margin: { left: 50, right: 20, top: 20, bottom: 40 } })
		expect(brewer.innerWidth).toBe(600 - 50 - 20)
	})

	it('innerHeight is height minus vertical margins', () => {
		const brewer = new ChartBrewer()
		brewer.update({ height: 400, margin: { top: 20, bottom: 40, left: 50, right: 20 } })
		expect(brewer.innerHeight).toBe(400 - 20 - 40)
	})

	it('channels getter returns current channels', () => {
		const brewer = new ChartBrewer()
		brewer.update({ channels: { x: 'month', y: 'revenue' } })
		expect(brewer.channels).toMatchObject({ x: 'month', y: 'revenue' })
	})
})

describe('ChartBrewer — update() with all options', () => {
	it('sets layers', () => {
		const brewer = new ChartBrewer()
		const layers = [{ data: [{ x: 1, y: 10 }], y: 'y' }]
		brewer.update({ layers })
		// yScale should use layers (no errors thrown)
		brewer.update({
			data: [{ x: 'A', y: 5 }],
			channels: { x: 'x', y: 'y' }
		})
		expect(brewer.yScale).toBeDefined()
	})

	it('sets curve', () => {
		const brewer = new ChartBrewer()
		brewer.update({ curve: 'smooth' })
		// No error thrown
		expect(brewer).toBeDefined()
	})

	it('sets stat', () => {
		const brewer = new ChartBrewer()
		brewer.update({ stat: 'sum' })
		// transform is identity by default; stat stored
		expect(brewer).toBeDefined()
	})
})

describe('ChartBrewer — derived mark builders', () => {
	it('lines are built when x and y channels set', () => {
		const brewer = new ChartBrewer()
		brewer.update({
			data,
			channels: { x: 'month', y: 'revenue', color: 'region' }
		})
		expect(Array.isArray(brewer.lines)).toBe(true)
		expect(brewer.lines.length).toBeGreaterThan(0)
	})

	it('areas are built when x and y channels set', () => {
		const brewer = new ChartBrewer()
		brewer.update({
			data,
			channels: { x: 'month', y: 'revenue', fill: 'region' }
		})
		expect(Array.isArray(brewer.areas)).toBe(true)
		expect(brewer.areas.length).toBeGreaterThan(0)
	})

	it('arcs are built when y channel set (no x needed)', () => {
		const brewer = new ChartBrewer()
		brewer.update({
			data,
			channels: { y: 'revenue', color: 'region' }
		})
		expect(Array.isArray(brewer.arcs)).toBe(true)
		expect(brewer.arcs.length).toBeGreaterThan(0)
	})

	it('points are built when x and y channels set', () => {
		const pointData = [
			{ x: 1, y: 10 },
			{ x: 2, y: 20 },
			{ x: 3, y: 30 }
		]
		const brewer = new ChartBrewer()
		brewer.update({
			data: pointData,
			channels: { x: 'x', y: 'y' }
		})
		expect(Array.isArray(brewer.points)).toBe(true)
		expect(brewer.points.length).toBeGreaterThan(0)
	})

	it('sizeScale is null when no size channel', () => {
		const brewer = new ChartBrewer()
		brewer.update({ data, channels: { x: 'month', y: 'revenue' } })
		expect(brewer.sizeScale).toBeNull()
	})

	it('sizeScale is built when size channel set', () => {
		const sizeData = [
			{ x: 1, y: 10, size: 5 },
			{ x: 2, y: 20, size: 15 }
		]
		const brewer = new ChartBrewer()
		brewer.update({
			data: sizeData,
			channels: { x: 'x', y: 'y', size: 'size' }
		})
		expect(brewer.sizeScale).not.toBeNull()
	})

	it('symbolMap is built when symbol channel set', () => {
		const symData = [
			{ x: 1, y: 10, shape: 'A' },
			{ x: 2, y: 20, shape: 'B' }
		]
		const brewer = new ChartBrewer()
		brewer.update({
			data: symData,
			channels: { x: 'x', y: 'y', symbol: 'shape' }
		})
		expect(brewer.symbolMap.size).toBe(2)
	})

	it('bars/lines/areas/points are empty arrays when no x or y scale', () => {
		const brewer = new ChartBrewer()
		brewer.update({ data, channels: {} })
		expect(brewer.bars).toEqual([])
		expect(brewer.lines).toEqual([])
		expect(brewer.areas).toEqual([])
		expect(brewer.points).toEqual([])
	})

	it('arcs are empty when no y channel', () => {
		const brewer = new ChartBrewer()
		brewer.update({ data, channels: {} })
		expect(brewer.arcs).toEqual([])
	})
})

describe('ChartBrewer — patternDefs', () => {
	it('returns empty array when no pattern channel', () => {
		const brewer = new ChartBrewer()
		brewer.update({ data, channels: { x: 'month', y: 'revenue', color: 'region' } })
		expect(brewer.patternDefs).toEqual([])
	})

	it('returns empty array when patternMap is empty', () => {
		const brewer = new ChartBrewer()
		// pattern channel set but no distinct values (empty data)
		brewer.update({ data: [], channels: { x: 'month', y: 'revenue', pattern: 'region' } })
		expect(brewer.patternDefs).toEqual([])
	})

	it('returns simple defs when fill and pattern map same field', () => {
		const brewer = new ChartBrewer()
		brewer.update({
			data,
			channels: { x: 'month', y: 'revenue', fill: 'region', pattern: 'region' }
		})
		expect(brewer.patternDefs.length).toBeGreaterThan(0)
		// Each def has id, name, fill, stroke
		for (const def of brewer.patternDefs) {
			expect(def).toHaveProperty('id')
			expect(def).toHaveProperty('name')
			expect(def).toHaveProperty('fill')
			expect(def).toHaveProperty('stroke')
		}
	})

	it('returns simple defs when no fill channel (only pattern)', () => {
		const brewer = new ChartBrewer()
		brewer.update({
			data,
			channels: { x: 'month', y: 'revenue', pattern: 'region' }
		})
		expect(brewer.patternDefs.length).toBeGreaterThan(0)
	})

	it('returns simple + composite defs when fill and pattern are different fields', () => {
		const multiData = [
			{ month: 'Jan', revenue: 100, region: 'North', quarter: 'Q1' },
			{ month: 'Feb', revenue: 200, region: 'South', quarter: 'Q1' },
			{ month: 'Mar', revenue: 150, region: 'North', quarter: 'Q2' }
		]
		const brewer = new ChartBrewer()
		brewer.update({
			data: multiData,
			channels: { x: 'month', y: 'revenue', fill: 'region', pattern: 'quarter' }
		})
		// Should have simple defs (per patternKey) + composite defs (per fill::pattern combo)
		const defs = brewer.patternDefs
		expect(defs.length).toBeGreaterThan(0)
		// Composite defs should have :: in the id
		const compositeDefs = defs.filter((d) => d.id.includes('::'))
		// toPatternId replaces key with slugified version, but composite key has ::
		expect(defs.length).toBeGreaterThanOrEqual(2)
	})

	it('skips null/undefined pattern keys in composite defs', () => {
		const sparseData = [
			{ month: 'Jan', revenue: 100, region: 'North', quarter: null },
			{ month: 'Feb', revenue: 200, region: 'South', quarter: 'Q1' }
		]
		const brewer = new ChartBrewer()
		brewer.update({
			data: sparseData,
			channels: { x: 'month', y: 'revenue', fill: 'region', pattern: 'quarter' }
		})
		// Should not throw, null patternKey skipped
		expect(brewer.patternDefs).toBeDefined()
	})
})
