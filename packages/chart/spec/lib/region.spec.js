import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { spanOf, positionOf, regionVertices, centroid, polygonPath } from '../../src/lib/region.js'

const lin = scaleLinear().domain([0, 10]).range([0, 100])
const band = scaleBand().domain(['a', 'b', 'c']).range([0, 90])

describe('region geometry', () => {
	it('spanOf orders a reversed range and spans the axis when omitted', () => {
		expect(spanOf(lin, [8, 2])).toEqual([20, 80])
		expect(spanOf(lin, undefined)).toEqual([0, 100])
		expect(spanOf(lin, [5])).toEqual([0, 100])
	})

	it('spanOf covers whole bands', () => {
		expect(spanOf(band, ['b', 'c'])).toEqual([30, 90])
	})

	it('positionOf resolves a band category to its centre', () => {
		expect(positionOf(band, 'b')).toBe(45)
		expect(positionOf(lin, 5)).toBe(50)
	})

	it('regionVertices prefers points and needs three of them', () => {
		expect(regionVertices({ points: [[0, 0], [10, 0], [0, 10]], x: [0, 10] }, lin, lin)).toEqual([
			[0, 0],
			[100, 0],
			[0, 100]
		])
		expect(regionVertices({ points: [[0, 0], [1, 1]] }, lin, lin)).toEqual([])
		expect(regionVertices({}, lin, lin)).toEqual([])
	})

	it('centroid falls back to the vertex mean for a collinear polygon', () => {
		expect(centroid([{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 4, y: 0 }])).toEqual({ x: 2, y: 0 })
		expect(centroid([{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }])).toEqual({ x: 2, y: 2 })
	})

	it('polygonPath closes the shape and rounds to 3 decimals', () => {
		expect(polygonPath([{ x: 0, y: 0 }, { x: 1.23456, y: 0 }, { x: 0, y: 2 }])).toBe('M0,0 L1.235,0 L0,2 Z')
	})
})
