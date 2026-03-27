import { describe, it, expect } from 'vitest'
import { scaleLinear } from 'd3-scale'
import { buildAreas, buildStackedAreas } from '../../../src/geoms/lib/areas.js'

const xScale = scaleLinear().domain([0, 10]).range([0, 300])
const yScale = scaleLinear().domain([0, 100]).range([200, 0])
const colors = new Map([
	['f', { fill: '#4e79a7', stroke: '#4e79a7' }],
	['4', { fill: '#f28e2b', stroke: '#f28e2b' }]
])

describe('buildAreas — single series (no color channel)', () => {
	const data = [
		{ month: 3, val: 30 },
		{ month: 1, val: 10 },
		{ month: 2, val: 20 }
	]

	it('returns one area entry', () => {
		const areas = buildAreas(data, { x: 'month', y: 'val' }, xScale, yScale, colors)
		expect(areas).toHaveLength(1)
	})

	it('has a valid SVG path string d', () => {
		const [area] = buildAreas(data, { x: 'month', y: 'val' }, xScale, yScale, colors)
		expect(typeof area.d).toBe('string')
		expect(area.d.length).toBeGreaterThan(0)
		expect(area.d).not.toContain('NaN')
	})

	it('sorts by X before drawing — path starts at leftmost x', () => {
		const [area] = buildAreas(data, { x: 'month', y: 'val' }, xScale, yScale, colors)
		// After sorting month=1,2,3 → first x pixel = xScale(1) = 30
		const firstX = parseFloat(area.d.split(/[ML,]/)[1])
		expect(firstX).toBeCloseTo(xScale(1), 0)
	})

	it('patternId is null when no patterns map', () => {
		const [area] = buildAreas(data, { x: 'month', y: 'val' }, xScale, yScale, colors)
		expect(area.patternId).toBeNull()
	})
})

describe('buildAreas — multi-series (with color channel)', () => {
	const data = [
		{ month: 2, drv: 'f', val: 20 },
		{ month: 1, drv: 'f', val: 10 },
		{ month: 2, drv: '4', val: 40 },
		{ month: 1, drv: '4', val: 30 }
	]

	it('returns one area per color group', () => {
		const areas = buildAreas(data, { x: 'month', y: 'val', color: 'drv' }, xScale, yScale, colors)
		expect(areas).toHaveLength(2)
		expect(areas.map((a) => a.key).sort()).toEqual(['4', 'f'])
	})

	it('each group path has no NaN', () => {
		const areas = buildAreas(data, { x: 'month', y: 'val', color: 'drv' }, xScale, yScale, colors)
		for (const area of areas) {
			expect(area.d).not.toContain('NaN')
		}
	})

	it('applies fill from colors map', () => {
		const areas = buildAreas(data, { x: 'month', y: 'val', color: 'drv' }, xScale, yScale, colors)
		const fArea = areas.find((a) => a.key === 'f')
		expect(fArea.fill).toBe('#4e79a7')
	})

	it('sets patternId when patterns map contains the color key', () => {
		const patterns = new Map([
			['f', 'diagonal'],
			['4', 'dots']
		])
		const areas = buildAreas(
			data,
			{ x: 'month', y: 'val', color: 'drv' },
			xScale,
			yScale,
			colors,
			undefined,
			patterns
		)
		const fArea = areas.find((a) => a.key === 'f')
		expect(fArea.patternId).toBe('chart-pat-f')
	})

	it('patternId is null for color keys not in patterns map', () => {
		const patterns = new Map([['f', 'diagonal']])
		const areas = buildAreas(
			data,
			{ x: 'month', y: 'val', color: 'drv' },
			xScale,
			yScale,
			colors,
			undefined,
			patterns
		)
		const fourArea = areas.find((a) => a.key === '4')
		expect(fourArea.patternId).toBeNull()
	})
})

describe('buildStackedAreas', () => {
	const data = [
		{ month: 1, drv: 'f', val: 10 },
		{ month: 1, drv: '4', val: 30 },
		{ month: 2, drv: 'f', val: 20 },
		{ month: 2, drv: '4', val: 40 }
	]

	it('returns one area per color group', () => {
		const areas = buildStackedAreas(
			data,
			{ x: 'month', y: 'val', color: 'drv' },
			xScale,
			yScale,
			colors
		)
		expect(areas).toHaveLength(2)
	})

	it('each path has no NaN', () => {
		const areas = buildStackedAreas(
			data,
			{ x: 'month', y: 'val', color: 'drv' },
			xScale,
			yScale,
			colors
		)
		for (const area of areas) {
			expect(area.d).toBeTruthy()
			expect(area.d).not.toContain('NaN')
		}
	})

	it('applies fill from colors map', () => {
		const areas = buildStackedAreas(
			data,
			{ x: 'month', y: 'val', color: 'drv' },
			xScale,
			yScale,
			colors
		)
		const fArea = areas.find((a) => a.key === 'f')
		expect(fArea.fill).toBe('#4e79a7')
	})

	it('falls back to buildAreas when no color channel', () => {
		const single = [
			{ month: 1, val: 10 },
			{ month: 2, val: 20 }
		]
		const areas = buildStackedAreas(single, { x: 'month', y: 'val' }, xScale, yScale, colors)
		expect(areas).toHaveLength(1)
	})

	it('sets patternId when patterns map provided', () => {
		const patterns = new Map([
			['f', 'diagonal'],
			['4', 'dots']
		])
		const areas = buildStackedAreas(
			data,
			{ x: 'month', y: 'val', color: 'drv' },
			xScale,
			yScale,
			colors,
			undefined,
			patterns
		)
		const fArea = areas.find((a) => a.key === 'f')
		expect(fArea.patternId).toBe('chart-pat-f')
	})
})
