import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildAreas, buildStackedAreas } from '../../../src/geoms/lib/areas.js'

/**
 * Extra coverage for geoms/lib/areas.js:
 * - Lines 37-39: band scale sort in sortByX (categorical x path)
 * - Lines 140-141: buildStackedAreas — pattern different from color field (positional assignment)
 */

const xBand = scaleBand().domain(['Jan', 'Feb', 'Mar']).range([0, 300]).padding(0.1)
const yScale = scaleLinear().domain([0, 100]).range([200, 0])
const colors = new Map([
	['f', { fill: '#4e79a7', stroke: '#4e79a7' }],
	['4', { fill: '#f28e2b', stroke: '#f28e2b' }]
])

describe('buildAreas — band (categorical) x scale sortByX', () => {
	// Intentionally supply data out of band-domain order
	const unorderedData = [
		{ month: 'Mar', val: 50 },
		{ month: 'Jan', val: 30 },
		{ month: 'Feb', val: 40 }
	]

	it('returns a valid path with band scale (uses domain ordering)', () => {
		const [area] = buildAreas(
			unorderedData,
			{ x: 'month', y: 'val' },
			xBand,
			yScale,
			colors
		)
		expect(area.d).not.toContain('NaN')
		expect(typeof area.d).toBe('string')
		expect(area.d.length).toBeGreaterThan(0)
	})

	it('produces path that starts at the first band-domain position', () => {
		const [area] = buildAreas(
			unorderedData,
			{ x: 'month', y: 'val' },
			xBand,
			yScale,
			colors
		)
		// First x in path should be xBand('Jan') + bandwidth/2
		const expectedX = xBand('Jan') + xBand.bandwidth() / 2
		const firstX = parseFloat(area.d.split(/[ML,]/)[1])
		expect(firstX).toBeCloseTo(expectedX, 0)
	})

	it('multi-series with band scale sorts each group by domain', () => {
		const groupedData = [
			{ month: 'Mar', val: 50, group: 'f' },
			{ month: 'Jan', val: 30, group: 'f' },
			{ month: 'Feb', val: 40, group: 'f' },
			{ month: 'Mar', val: 20, group: '4' },
			{ month: 'Jan', val: 15, group: '4' },
			{ month: 'Feb', val: 35, group: '4' }
		]
		const areas = buildAreas(
			groupedData,
			{ x: 'month', y: 'val', color: 'group' },
			xBand,
			yScale,
			colors
		)
		expect(areas).toHaveLength(2)
		for (const area of areas) {
			expect(area.d).not.toContain('NaN')
		}
	})

	it('applies smooth curve with band scale', () => {
		const [area] = buildAreas(
			unorderedData,
			{ x: 'month', y: 'val' },
			xBand,
			yScale,
			colors,
			'smooth'
		)
		expect(area.d).not.toContain('NaN')
	})

	it('applies step curve with band scale', () => {
		const [area] = buildAreas(
			unorderedData,
			{ x: 'month', y: 'val' },
			xBand,
			yScale,
			colors,
			'step'
		)
		expect(area.d).not.toContain('NaN')
	})

	it('single series with pattern and no color channel — band scale', () => {
		const patterns = new Map([['dots', 'dots']])
		const dataWithPat = [
			{ month: 'Jan', val: 30, pat: 'dots' },
			{ month: 'Feb', val: 40, pat: 'dots' }
		]
		const [area] = buildAreas(
			dataWithPat,
			{ x: 'month', y: 'val', pattern: 'pat' },
			xBand,
			yScale,
			colors,
			undefined,
			patterns
		)
		// patternKey = data[0][pf] = 'dots', patternId set
		expect(area.patternId).not.toBeNull()
	})
})

describe('buildAreas — different-field pattern (geoms/lib/areas.js lines 69-70)', () => {
	const data = [
		{ month: 1, drv: 'f', val: 10, quarter: 'Q1' },
		{ month: 2, drv: 'f', val: 20, quarter: 'Q1' },
		{ month: 1, drv: '4', val: 30, quarter: 'Q2' },
		{ month: 2, drv: '4', val: 40, quarter: 'Q2' }
	]
	const xLinear = scaleLinear().domain([0, 3]).range([0, 300])

	it('assigns patterns positionally when pf !== cf in buildAreas', () => {
		const patterns = new Map([['Q1', 'diagonal'], ['Q2', 'dots']])
		// pf = 'quarter', cf = 'drv' → different fields → positional assignment (lines 69-70)
		const areas = buildAreas(
			data,
			{ x: 'month', y: 'val', color: 'drv', pattern: 'quarter' },
			xLinear,
			yScale,
			colors,
			undefined,
			patterns
		)
		expect(areas).toHaveLength(2)
		// With positional assignment, both areas get patterns
		expect(areas.some((a) => a.patternId !== null)).toBe(true)
	})
})

describe('buildStackedAreas — different-field pattern (positional assignment)', () => {
	const data = [
		{ month: 1, drv: 'f', val: 10, quarter: 'Q1' },
		{ month: 1, drv: '4', val: 30, quarter: 'Q2' },
		{ month: 2, drv: 'f', val: 20, quarter: 'Q1' },
		{ month: 2, drv: '4', val: 40, quarter: 'Q2' }
	]
	const xLinear = scaleLinear().domain([0, 3]).range([0, 300])

	it('assigns patterns positionally when pf !== cf', () => {
		const patterns = new Map([['Q1', 'diagonal'], ['Q2', 'dots']])
		const areas = buildStackedAreas(
			data,
			{ x: 'month', y: 'val', color: 'drv', pattern: 'quarter' },
			xLinear,
			yScale,
			colors,
			undefined,
			patterns
		)
		expect(areas).toHaveLength(2)
		// At least one should have a pattern assigned
		expect(areas.some((a) => a.patternId !== null)).toBe(true)
	})

	it('pattern is null when no patterns map provided', () => {
		const areas = buildStackedAreas(
			data,
			{ x: 'month', y: 'val', color: 'drv', pattern: 'quarter' },
			xLinear,
			yScale,
			colors
		)
		for (const area of areas) {
			expect(area.patternId).toBeNull()
		}
	})

	it('orderedPatternKeys is null when no pf (no pattern channel)', () => {
		// No pattern field → orderedPatternKeys = null → patternKey = colorKey → not in empty patterns → null
		const areas = buildStackedAreas(
			data,
			{ x: 'month', y: 'val', color: 'drv' },
			xLinear,
			yScale,
			colors
		)
		for (const area of areas) {
			expect(area.patternId).toBeNull()
		}
	})

	it('same-field pattern (pf === cf) uses colorKey lookup', () => {
		const patterns = new Map([['f', 'diagonal'], ['4', 'dots']])
		const areas = buildStackedAreas(
			data,
			{ x: 'month', y: 'val', color: 'drv', pattern: 'drv' },
			xLinear,
			yScale,
			colors,
			undefined,
			patterns
		)
		expect(areas).toHaveLength(2)
		expect(areas.every((a) => a.patternId !== null)).toBe(true)
	})

	it('applies smooth curve to stacked areas', () => {
		const areas = buildStackedAreas(
			data,
			{ x: 'month', y: 'val', color: 'drv' },
			xLinear,
			yScale,
			colors,
			'smooth'
		)
		for (const area of areas) {
			expect(area.d).not.toContain('NaN')
		}
	})

	it('applies step curve to stacked areas', () => {
		const areas = buildStackedAreas(
			data,
			{ x: 'month', y: 'val', color: 'drv' },
			xLinear,
			yScale,
			colors,
			'step'
		)
		for (const area of areas) {
			expect(area.d).not.toContain('NaN')
		}
	})
})
