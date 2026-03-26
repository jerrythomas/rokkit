import { describe, it, expect } from 'vitest'
import { jitterOffset, buildPoints } from '../../../src/lib/brewing/marks/points.js'
import { scaleLinear } from 'd3-scale'

describe('jitterOffset', () => {
	it('returns a value in ±range/2', () => {
		for (let i = 0; i < 100; i++) {
			const offset = jitterOffset(i, 10)
			expect(offset).toBeGreaterThanOrEqual(-5)
			expect(offset).toBeLessThanOrEqual(5)
		}
	})

	it('returns stable values for the same index', () => {
		expect(jitterOffset(0, 10)).toBe(jitterOffset(0, 10))
		expect(jitterOffset(42, 10)).toBe(jitterOffset(42, 10))
	})

	it('returns different values for different indices', () => {
		const vals = Array.from({ length: 10 }, (_, i) => jitterOffset(i, 10))
		const unique = new Set(vals)
		expect(unique.size).toBeGreaterThan(5)
	})
})

describe('buildPoints with jitter', () => {
	const xScale = scaleLinear().domain([0, 10]).range([0, 100])
	const yScale = scaleLinear().domain([0, 10]).range([100, 0])
	const data = Array.from({ length: 5 }, (_, i) => ({ x: i, y: i }))
	const channels = { x: 'x', y: 'y' }

	it('applies no offset when jitter is null', () => {
		const points = buildPoints(data, channels, xScale, yScale, new Map(), null, null, 5, null)
		points.forEach((pt, i) => {
			expect(pt.cx).toBe(xScale(data[i].x))
			expect(pt.cy).toBe(yScale(data[i].y))
		})
	})

	it('applies x offset when jitter.width is set', () => {
		const points = buildPoints(data, channels, xScale, yScale, new Map(), null, null, 5, {
			width: 10
		})
		points.forEach((pt, i) => {
			expect(pt.cx).not.toBe(xScale(data[i].x))
			expect(pt.cy).toBe(yScale(data[i].y))
		})
	})

	it('applies y offset when jitter.height is set', () => {
		const points = buildPoints(data, channels, xScale, yScale, new Map(), null, null, 5, {
			height: 10
		})
		points.forEach((pt, i) => {
			expect(pt.cx).toBe(xScale(data[i].x))
			expect(pt.cy).not.toBe(yScale(data[i].y))
		})
	})

	it('x and y offsets are uncorrelated (use different seeds)', () => {
		const points = buildPoints(data, channels, xScale, yScale, new Map(), null, null, 5, {
			width: 20,
			height: 20
		})
		points.forEach((pt, i) => {
			const expectedJx = jitterOffset(i, 20)
			const expectedJy = jitterOffset(i + 100000, 20)
			expect(pt.cx).toBeCloseTo(xScale(data[i].x) + expectedJx)
			expect(pt.cy).toBeCloseTo(yScale(data[i].y) + expectedJy)
		})
	})
})
