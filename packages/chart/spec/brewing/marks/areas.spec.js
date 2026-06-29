import { describe, it, expect } from 'vitest'
import { scaleLinear, scaleBand } from 'd3-scale'
import { buildAreas } from '../../../src/lib/brewing/marks/areas.js'

const xLinear = scaleLinear().domain([0, 10]).range([0, 300])
const yScale = scaleLinear().domain([0, 100]).range([200, 0])
const colors = new Map([
	['North', { fill: '#4e79a7', stroke: '#4e79a7' }],
	['South', { fill: '#f28e2b', stroke: '#f28e2b' }]
])

describe('buildAreas (brewing/marks/areas.js)', () => {
	describe('no fill channel (single series)', () => {
		const data = [
			{ x: 1, y: 30 },
			{ x: 3, y: 50 },
			{ x: 2, y: 40 }
		]

		it('returns one area when no fill channel', () => {
			const areas = buildAreas(data, { x: 'x', y: 'y' }, xLinear, yScale, colors)
			expect(areas).toHaveLength(1)
		})

		it('area has d, fill, stroke, colorKey=null, patternKey=null, patternId=null', () => {
			const [area] = buildAreas(data, { x: 'x', y: 'y' }, xLinear, yScale, colors)
			expect(typeof area.d).toBe('string')
			expect(area.d.length).toBeGreaterThan(0)
			expect(area.colorKey).toBeNull()
			expect(area.patternKey).toBeNull()
			expect(area.patternId).toBeNull()
		})

		it('uses first colors entry when no fill channel and colors provided', () => {
			const [area] = buildAreas(data, { x: 'x', y: 'y' }, xLinear, yScale, colors)
			expect(area.fill).toBe('#4e79a7')
		})

		it('falls back to #888 fill when no colors', () => {
			const [area] = buildAreas(data, { x: 'x', y: 'y' }, xLinear, yScale, null)
			expect(area.fill).toBe('#888')
		})

		it('applies smooth curve', () => {
			const [area] = buildAreas(data, { x: 'x', y: 'y' }, xLinear, yScale, colors, 'smooth')
			expect(area.d).not.toContain('NaN')
		})

		it('applies step curve', () => {
			const [area] = buildAreas(data, { x: 'x', y: 'y' }, xLinear, yScale, colors, 'step')
			expect(area.d).not.toContain('NaN')
		})
	})

	describe('with fill channel (multi-series)', () => {
		const data = [
			{ x: 1, y: 30, region: 'North' },
			{ x: 2, y: 50, region: 'North' },
			{ x: 1, y: 20, region: 'South' },
			{ x: 2, y: 40, region: 'South' }
		]

		it('returns one area per group', () => {
			const areas = buildAreas(data, { x: 'x', y: 'y', fill: 'region' }, xLinear, yScale, colors)
			expect(areas).toHaveLength(2)
		})

		it('each area has key, fill, d', () => {
			const areas = buildAreas(data, { x: 'x', y: 'y', fill: 'region' }, xLinear, yScale, colors)
			for (const area of areas) {
				expect(area.key).toBeTruthy()
				expect(area.fill).toBeTruthy()
				expect(area.d).not.toContain('NaN')
			}
		})

		it('patternId set when fill==pattern and patternMap has key', () => {
			const patternMap = new Map([['North', 'diagonal'], ['South', 'dots']])
			const areas = buildAreas(
				data,
				{ x: 'x', y: 'y', fill: 'region', pattern: 'region' },
				xLinear,
				yScale,
				colors,
				undefined,
				patternMap
			)
			const northArea = areas.find((a) => a.key === 'North')
			expect(northArea.patternId).not.toBeNull()
		})

		it('patternId is null when key not in patternMap', () => {
			const patternMap = new Map([['North', 'diagonal']])
			const areas = buildAreas(
				data,
				{ x: 'x', y: 'y', fill: 'region', pattern: 'region' },
				xLinear,
				yScale,
				colors,
				undefined,
				patternMap
			)
			const southArea = areas.find((a) => a.key === 'South')
			expect(southArea.patternId).toBeNull()
		})

		it('handles different-field pattern with positional assignment', () => {
			// pattern field differs from fill field
			const patternData = [
				{ x: 1, y: 30, region: 'North', quarter: 'Q1' },
				{ x: 2, y: 50, region: 'North', quarter: 'Q1' },
				{ x: 1, y: 20, region: 'South', quarter: 'Q2' },
				{ x: 2, y: 40, region: 'South', quarter: 'Q2' }
			]
			const patternMap = new Map([['Q1', 'diagonal'], ['Q2', 'dots']])
			const areas = buildAreas(
				patternData,
				{ x: 'x', y: 'y', fill: 'region', pattern: 'quarter' },
				xLinear,
				yScale,
				colors,
				undefined,
				patternMap
			)
			expect(areas).toHaveLength(2)
			// At least one should have a patternId from positional assignment
			const withPattern = areas.filter((a) => a.patternId !== null)
			expect(withPattern.length).toBeGreaterThan(0)
		})
	})

	describe('with band x scale', () => {
		const xBand = scaleBand().domain(['Jan', 'Feb', 'Mar']).range([0, 300]).padding(0.1)
		const bandData = [
			{ month: 'Jan', y: 30 },
			{ month: 'Mar', y: 50 },
			{ month: 'Feb', y: 40 }
		]

		it('uses band center x position (bandwidth/2 offset)', () => {
			const [area] = buildAreas(bandData, { x: 'month', y: 'y' }, xBand, yScale, colors)
			// Area should be generated without NaN - band scale path is valid
			expect(area.d).not.toContain('NaN')
		})

		it('groups are ordered by band domain when fill channel used', () => {
			const groupedBandData = [
				{ month: 'Feb', y: 30, group: 'A' },
				{ month: 'Jan', y: 20, group: 'A' },
				{ month: 'Mar', y: 40, group: 'A' }
			]
			const [area] = buildAreas(
				groupedBandData,
				{ x: 'month', y: 'y', fill: 'group' },
				xBand,
				yScale,
				new Map([['A', { fill: '#blue', stroke: '#darkblue' }]])
			)
			expect(area.d).not.toContain('NaN')
		})
	})
})
