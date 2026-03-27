import { describe, it, expect } from 'vitest'
import { buildViolins } from '../../../src/lib/brewing/marks/violins.js'
import { scaleBand, scaleLinear } from 'd3-scale'

const xScale = scaleBand().domain(['A']).range([0, 200]).padding(0.1)
const yScale = scaleLinear().domain([0, 100]).range([200, 0])
const colors = new Map([['A', { fill: '#aaa', stroke: '#333' }]])
const data = [{ cat: 'A', q1: 25, median: 50, q3: 75, iqr_min: 10, iqr_max: 90 }]

describe('buildViolins', () => {
	it('returns one violin per row', () => {
		const violins = buildViolins(data, { x: 'cat' }, xScale, yScale, colors)
		expect(violins).toHaveLength(1)
	})

	it('violin has d (SVG path), fill, stroke, cx', () => {
		const [v] = buildViolins(data, { x: 'cat' }, xScale, yScale, colors)
		expect(v).toHaveProperty('d')
		expect(typeof v.d).toBe('string')
		expect(v.d.length).toBeGreaterThan(0)
		expect(v).toHaveProperty('fill')
		expect(v).toHaveProperty('stroke')
		expect(v).toHaveProperty('cx')
	})

	it('uses fill channel for interior color (lighter shade)', () => {
		const d = [{ cat: 'A', region: 'N', q1: 25, median: 50, q3: 75, iqr_min: 10, iqr_max: 90 }]
		const c = new Map([['N', { fill: 'blue', stroke: 'darkblue' }]])
		const [v] = buildViolins(d, { x: 'cat', fill: 'region' }, xScale, yScale, c)
		expect(v.fill).toBe('blue')
	})

	it('stroke comes from the same colors map entry as fill (darker shade)', () => {
		const [v] = buildViolins(data, { x: 'cat' }, xScale, yScale, colors)
		expect(v.stroke).toBe('#333')
	})

	it('stroke matches fill entry when fill channel is set', () => {
		const d = [{ cat: 'A', region: 'N', q1: 25, median: 50, q3: 75, iqr_min: 10, iqr_max: 90 }]
		const c = new Map([['N', { fill: 'blue', stroke: 'darkblue' }]])
		const [v] = buildViolins(d, { x: 'cat', fill: 'region' }, xScale, yScale, c)
		expect(v.stroke).toBe('darkblue')
	})
})
