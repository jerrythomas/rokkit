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

	it('routes silhouette points through the place fn (flip transposes the path)', () => {
		const [vertical] = buildViolins(data, { x: 'cat' }, xScale, yScale, colors)
		const [flipped] = buildViolins(data, { x: 'cat' }, xScale, yScale, colors, (x, y) => ({ x: y, y: x }))
		// A place() that swaps x/y must change the path (the silhouette transposes).
		expect(flipped.d).not.toBe(vertical.d)
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

describe('buildViolins — side (half violin)', () => {
	const meanX = (d) => {
		const xs = [...d.matchAll(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g)].map((m) => Number(m[1]))
		return xs.reduce((a, b) => a + b, 0) / xs.length
	}

	it('side=right bulges right of the centre line; side=left bulges left', () => {
		const [right] = buildViolins(data, { x: 'cat' }, xScale, yScale, colors, undefined, 'right')
		const [left] = buildViolins(data, { x: 'cat' }, xScale, yScale, colors, undefined, 'left')
		const [center] = buildViolins(data, { x: 'cat' }, xScale, yScale, colors, undefined, 'center')
		expect(meanX(right.d)).toBeGreaterThan(right.cx)
		expect(meanX(left.d)).toBeLessThan(left.cx)
		expect(meanX(center.d)).toBeCloseTo(center.cx, 0)
	})

	it('each side produces a distinct path', () => {
		const [right] = buildViolins(data, { x: 'cat' }, xScale, yScale, colors, undefined, 'right')
		const [left] = buildViolins(data, { x: 'cat' }, xScale, yScale, colors, undefined, 'left')
		const [center] = buildViolins(data, { x: 'cat' }, xScale, yScale, colors, undefined, 'center')
		expect(new Set([right.d, left.d, center.d]).size).toBe(3)
	})
})

describe('buildViolins — pattern fill', () => {
	const patterns = new Map([['A', 'diagonal']])

	it('sets patternId from the pattern channel value', () => {
		const [v] = buildViolins(data, { x: 'cat', pattern: 'cat' }, xScale, yScale, colors, undefined, 'center', patterns)
		expect(v.patternId).toBeTruthy()
	})

	it('patternId is null without a pattern channel', () => {
		const [v] = buildViolins(data, { x: 'cat' }, xScale, yScale, colors)
		expect(v.patternId).toBeNull()
	})
})
