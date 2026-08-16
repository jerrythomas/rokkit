import { describe, it, expect } from 'vitest'
import { buildBoxes } from '../../../src/lib/brewing/marks/boxes.js'
import { scaleBand, scaleLinear } from 'd3-scale'

const xScale = scaleBand().domain(['A', 'B']).range([0, 200]).padding(0.1)
const yScale = scaleLinear().domain([0, 100]).range([200, 0])
const colors = new Map([
	['A', { fill: '#blue', stroke: '#darkblue' }],
	['B', { fill: '#red', stroke: '#darkred' }]
])

const data = [
	{ cat: 'A', q1: 20, median: 40, q3: 60, iqr_min: 5, iqr_max: 80 },
	{ cat: 'B', q1: 30, median: 50, q3: 70, iqr_min: 10, iqr_max: 90 }
]

describe('buildBoxes', () => {
	it('returns one box per row', () => {
		const boxes = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors)
		expect(boxes).toHaveLength(2)
	})

	it('box has cx, q1, median, q3, iqr_min, iqr_max, width, fill, stroke', () => {
		const [box] = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors)
		expect(box).toHaveProperty('cx')
		expect(box).toHaveProperty('q1')
		expect(box).toHaveProperty('median')
		expect(box).toHaveProperty('q3')
		expect(box).toHaveProperty('iqr_min')
		expect(box).toHaveProperty('iqr_max')
		expect(box).toHaveProperty('width')
		expect(box).toHaveProperty('fill')
		expect(box).toHaveProperty('stroke')
	})

	it('cx is centered in band', () => {
		const [box] = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors)
		const expectedCx = xScale('A') + xScale.bandwidth() / 2
		expect(box.cx).toBeCloseTo(expectedCx)
	})

	it('uses fill field for interior color (lighter shade)', () => {
		const d = [{ cat: 'A', region: 'North', q1: 20, median: 40, q3: 60, iqr_min: 5, iqr_max: 80 }]
		const fillColors = new Map([['North', { fill: 'green', stroke: 'darkgreen' }]])
		const [box] = buildBoxes(d, { x: 'cat', fill: 'region' }, xScale, yScale, fillColors)
		expect(box.fill).toBe('green')
	})

	it('stroke comes from the same colors map entry as fill (darker shade)', () => {
		const [box] = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors)
		// When no fill channel, defaults to x-field lookup — colors['A'].stroke
		expect(box.stroke).toBe('#darkblue')
	})

	it('stroke matches fill entry even when fill channel differs from x', () => {
		const d = [{ cat: 'A', region: 'North', q1: 20, median: 40, q3: 60, iqr_min: 5, iqr_max: 80 }]
		const fillColors = new Map([['North', { fill: 'blue', stroke: 'darkblue' }]])
		const [box] = buildBoxes(d, { x: 'cat', fill: 'region' }, xScale, yScale, fillColors)
		expect(box.stroke).toBe('darkblue')
	})

	it('maps outliers to screen positions at the box cx', () => {
		const d = [{ cat: 'A', q1: 20, median: 40, q3: 60, iqr_min: 10, iqr_max: 80, outliers: [95] }]
		const [box] = buildBoxes(d, { x: 'cat' }, xScale, yScale, colors)
		expect(box.outliers).toHaveLength(1)
		expect(box.outliers[0].cy).toBeCloseTo(yScale(95))
		expect(box.outliers[0].value).toBe(95)
	})

	it('defaults outliers to an empty array when the field is absent', () => {
		const [box] = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors)
		expect(box.outliers).toEqual([])
	})
})

describe('buildBoxes — side & width (raincloud)', () => {
	const centerOf = (xVal) => (xScale(xVal) ?? 0) + xScale.bandwidth() / 2

	it('side=left offsets the box into the left half', () => {
		const [center] = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors)
		const [left] = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors, { side: 'left' })
		expect(left.cx).toBeLessThan(center.cx)
		expect(left.cx).toBeCloseTo(centerOf('A') - xScale.bandwidth() / 4, 3)
	})

	it('side=right offsets the box into the right half', () => {
		const [right] = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors, { side: 'right' })
		expect(right.cx).toBeCloseTo(centerOf('A') + xScale.bandwidth() / 4, 3)
	})

	it('width shrinks the box thickness (thin raincloud box)', () => {
		const [wide] = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors)
		const [thin] = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors, { width: 0.16 })
		expect(thin.width).toBeLessThan(wide.width)
		expect(thin.width).toBeCloseTo(xScale.bandwidth() * 0.16, 3)
	})

	it('defaults are unchanged when no opts are passed', () => {
		const [box] = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors)
		expect(box.width).toBeCloseTo(xScale.bandwidth() * 0.6, 3)
		expect(box.cx).toBeCloseTo(centerOf('A'), 3)
	})
})
