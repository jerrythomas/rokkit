import { describe, it, expect } from 'vitest'
import { clipAbline } from '../../src/lib/abline.js'

describe('clipAbline', () => {
	const unit = /** @type {[number, number]} */ ([0, 1])

	it('returns the full diagonal of the unit square for the main sequence', () => {
		expect(clipAbline(-1, 1, unit, unit)).toEqual({ x1: 0, y1: 1, x2: 1, y2: 0 })
	})

	it('clips a steep line at the top and bottom edges', () => {
		// y = 4x - 1 enters at y=0 (x=.25) and leaves at y=1 (x=.5)
		const seg = clipAbline(4, -1, unit, unit)
		expect(seg.x1).toBeCloseTo(0.25)
		expect(seg.y1).toBeCloseTo(0)
		expect(seg.x2).toBeCloseTo(0.5)
		expect(seg.y2).toBeCloseTo(1)
	})

	it('accepts reversed domains', () => {
		expect(clipAbline(-1, 1, [1, 0], [1, 0])).toEqual({ x1: 0, y1: 1, x2: 1, y2: 0 })
	})

	it('keeps a line that only touches a corner', () => {
		// y = x + 1 touches (0, 1)
		expect(clipAbline(1, 1, unit, unit)).toEqual({ x1: 0, y1: 1, x2: 0, y2: 1 })
	})

	it('returns null for a line that misses the domain', () => {
		expect(clipAbline(1, 2, unit, unit)).toBeNull()
		expect(clipAbline(0, -0.1, unit, unit)).toBeNull()
	})

	it('draws a flat line inside the domain edge to edge', () => {
		expect(clipAbline(0, 0.5, [0, 10], unit)).toEqual({ x1: 0, y1: 0.5, x2: 10, y2: 0.5 })
	})
})
