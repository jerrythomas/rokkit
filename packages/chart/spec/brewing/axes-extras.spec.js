import { describe, it, expect } from 'vitest'
import {
	createXAxis,
	createYAxis
} from '../../src/lib/brewing/axes.svelte.js'

/**
 * Extra tests covering uncovered lines in axes.svelte.js:
 * - Lines 20-21: xTicksFromContinuous — linear x scale with .ticks method
 * - Lines 120-123: yTicksFromDomain when domain.length > tickCount (downsample)
 * - Lines 132-134: resolveYTicks when yScale has no ticks and no domain → returns []
 */

const testDimensions = {
	width: 600,
	height: 400,
	innerWidth: 520,
	innerHeight: 340
}

describe('createXAxis — continuous (linear) x scale', () => {
	it('uses xScale.ticks() when no tickCount (line 20: tickCount === null path)', () => {
		// A linear scale has .ticks method → xTicksFromContinuous is called
		const xLinear = (val) => val * 30
		xLinear.ticks = (n) => n !== undefined ? [0, 25, 50, 75, 100].slice(0, n) : [0, 25, 50, 75, 100]
		// No bandwidth → position = xScale(value) directly
		const scales = { x: xLinear, y: null }
		const dims = { innerWidth: 300, innerHeight: 200 }

		const axis = createXAxis(scales, dims)
		// ticks() with no count → 5 values
		expect(axis.ticks).toHaveLength(5)
	})

	it('uses xScale.ticks(tickCount) when tickCount is non-null (line 20: tickCount !== null path)', () => {
		const xLinear = (val) => val * 3
		xLinear.ticks = (n) => n !== undefined ? [0, 50, 100].slice(0, n) : [0, 50, 100]
		const scales = { x: xLinear, y: null }
		const dims = { innerWidth: 300, innerHeight: 200 }

		const axis = createXAxis(scales, dims, { tickCount: 2 })
		expect(axis.ticks).toHaveLength(2)
	})
})

describe('createYAxis — yTicksFromDomain', () => {
	it('downsamples domain when tickCount < domain.length', () => {
		// y scale that has .domain but no .ticks (ordinal/categorical band-like)
		const catYScale = (val) => val * 10
		catYScale.domain = () => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
		// No .ticks property → falls into yTicksFromDomain

		const yAxis = createYAxis({ y: catYScale }, testDimensions, { tickCount: 3 })
		// Should downsample 8-item domain to fewer ticks
		expect(yAxis.ticks.length).toBeLessThan(8)
		expect(yAxis.ticks.length).toBeGreaterThan(0)
	})

	it('returns full domain when tickCount >= domain.length', () => {
		const catYScale = (val) => val * 10
		catYScale.domain = () => ['A', 'B', 'C']
		// tickCount >= domain.length → full domain returned

		const yAxis = createYAxis({ y: catYScale }, testDimensions, { tickCount: 10 })
		expect(yAxis.ticks.length).toBe(3)
	})

	it('returns full domain when tickCount is null', () => {
		const catYScale = (val) => val * 10
		catYScale.domain = () => ['A', 'B', 'C']

		const yAxis = createYAxis({ y: catYScale }, testDimensions)
		expect(yAxis.ticks.length).toBe(3)
	})
})

describe('createYAxis — resolveYTicks no-ticks no-domain path', () => {
	it('returns empty ticks when y scale has neither .ticks nor .domain', () => {
		// A bare function with no d3 scale methods
		const bareScale = (val) => val * 2
		// No .ticks, no .domain

		const yAxis = createYAxis({ y: bareScale }, testDimensions)
		expect(yAxis.ticks).toEqual([])
	})
})
