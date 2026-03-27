import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildLines } from '../../../src/lib/brewing/marks/lines.js'

const xScale = scaleLinear().domain([0, 10]).range([0, 300])
const yScale = scaleLinear().domain([0, 100]).range([200, 0])
const colors = new Map([
	['f', { fill: 'none', stroke: '#4e79a7' }],
	['4', { fill: 'none', stroke: '#f28e2b' }]
])

describe('buildLines — single series (no color channel)', () => {
	const data = [
		{ month: 3, val: 30 },
		{ month: 1, val: 10 },
		{ month: 2, val: 20 }
	]

	it('returns one line entry', () => {
		const lines = buildLines(data, { x: 'month', y: 'val' }, xScale, yScale, colors)
		expect(lines).toHaveLength(1)
	})

	it('has a valid SVG path string d', () => {
		const [line] = buildLines(data, { x: 'month', y: 'val' }, xScale, yScale, colors)
		expect(typeof line.d).toBe('string')
		expect(line.d.length).toBeGreaterThan(0)
		expect(line.d).not.toContain('NaN')
	})

	it('sorts by X before drawing — path visits points in ascending x order', () => {
		const [line] = buildLines(data, { x: 'month', y: 'val' }, xScale, yScale, colors)
		// Points sorted: month=1 (x=30), month=2 (x=60), month=3 (x=90)
		// An unsorted path would have M30,... then M/L going backwards
		// The sorted path starts at the leftmost x=30
		const firstX = parseFloat(line.d.split(/[ML,]/)[1])
		expect(firstX).toBeCloseTo(xScale(1), 0)
	})

	it('points array is sorted by x ascending', () => {
		const [line] = buildLines(data, { x: 'month', y: 'val' }, xScale, yScale, colors)
		const xVals = line.points.map((p) => p.x)
		expect(xVals[0]).toBeLessThan(xVals[1])
		expect(xVals[1]).toBeLessThan(xVals[2])
	})
})

describe('buildLines — multi-series (with color channel)', () => {
	const data = [
		{ month: 2, drv: 'f', val: 20 },
		{ month: 1, drv: 'f', val: 10 },
		{ month: 2, drv: '4', val: 40 },
		{ month: 1, drv: '4', val: 30 }
	]

	it('returns one entry per color group', () => {
		const lines = buildLines(data, { x: 'month', y: 'val', color: 'drv' }, xScale, yScale, colors)
		expect(lines).toHaveLength(2)
		expect(lines.map((l) => l.key).sort()).toEqual(['4', 'f'])
	})

	it('each group path is sorted by x', () => {
		const lines = buildLines(data, { x: 'month', y: 'val', color: 'drv' }, xScale, yScale, colors)
		for (const line of lines) {
			const xVals = line.points.map((p) => p.x)
			expect(xVals[0]).toBeLessThanOrEqual(xVals[1])
		}
	})

	it('each group path has no NaN', () => {
		const lines = buildLines(data, { x: 'month', y: 'val', color: 'drv' }, xScale, yScale, colors)
		for (const line of lines) {
			expect(line.d).not.toContain('NaN')
		}
	})

	it('applies stroke color from colors map', () => {
		const lines = buildLines(data, { x: 'month', y: 'val', color: 'drv' }, xScale, yScale, colors)
		const fLine = lines.find((l) => l.key === 'f')
		expect(fLine.stroke).toBe('#4e79a7')
	})
})

describe('buildLines — band scale X (categorical months)', () => {
	const xBand = scaleBand().domain(['Jan', 'Feb', 'Mar']).range([0, 300])
	const data = [
		{ month: 'Mar', val: 30 },
		{ month: 'Jan', val: 10 },
		{ month: 'Feb', val: 20 }
	]

	it('centers points on band midpoint', () => {
		const [line] = buildLines(data, { x: 'month', y: 'val' }, xBand, yScale, colors)
		const janX = xBand('Jan') + xBand.bandwidth() / 2
		const janPoint = line.points.find((p) => Math.abs(p.x - janX) < 0.01)
		expect(janPoint).toBeDefined()
	})
})
