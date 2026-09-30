import { describe, it, expect } from 'vitest'
import { convexHull, hullPath } from '../../src/lib/hull.js'

describe('convexHull', () => {
	it('drops interior points and returns the corners counter-clockwise', () => {
		const pts = [
			[0, 0],
			[2, 0],
			[1, 1],
			[2, 2],
			[0, 2],
			[1, 0.5]
		]
		expect(convexHull(pts)).toEqual([
			[0, 0],
			[2, 0],
			[2, 2],
			[0, 2]
		])
	})

	it('drops collinear points on an edge', () => {
		expect(
			convexHull([
				[0, 0],
				[1, 0],
				[2, 0],
				[1, 1]
			])
		).toEqual([
			[0, 0],
			[2, 0],
			[1, 1]
		])
	})

	it('de-duplicates and keeps degenerate inputs', () => {
		expect(convexHull([])).toEqual([])
		expect(
			convexHull([
				[3, 4],
				[3, 4]
			])
		).toEqual([[3, 4]])
		expect(
			convexHull([
				[0, 0],
				[5, 5],
				[2, 2]
			])
		).toEqual([
			[0, 0],
			[5, 5]
		])
	})

	it('does not mutate its input', () => {
		const pts = [
			[2, 0],
			[0, 0],
			[1, 1]
		]
		convexHull(pts)
		expect(pts).toEqual([
			[2, 0],
			[0, 0],
			[1, 1]
		])
	})
})

describe('hullPath', () => {
	it('closes a polygon', () => {
		expect(
			hullPath([
				[0, 0],
				[2, 0],
				[1, 1]
			])
		).toBe('M0,0L2,0L1,1Z')
	})

	it('draws a single point as a zero-length subpath — a round cap makes it a dot', () => {
		expect(hullPath([[3, 4]])).toBe('M3,4Z')
	})

	it('draws two points as a segment — round caps make it a capsule', () => {
		expect(
			hullPath([
				[0, 0],
				[5, 5]
			])
		).toBe('M0,0L5,5Z')
	})

	it('is empty for no points', () => {
		expect(hullPath([])).toBe('')
	})
})
