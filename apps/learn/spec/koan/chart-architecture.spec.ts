import { describe, it, expect } from 'vitest'
import {
	components,
	modules,
	covered,
	quantile,
	mainSequenceZones,
	thresholds,
	THRESHOLD_QUANTILE
} from '../../src/lib/koan/demos/chart/architecture'

describe('architecture metrics — the committed dataset', () => {
	it('has components on the unit plane', () => {
		expect(components.length).toBeGreaterThan(10)
		for (const c of components) {
			expect(c.instability).toBeGreaterThanOrEqual(0)
			expect(c.instability).toBeLessThanOrEqual(1)
			expect(c.abstractness).toBeGreaterThanOrEqual(0)
			expect(c.abstractness).toBeLessThanOrEqual(1)
			expect(c.distance).toBeCloseTo(Math.abs(c.abstractness + c.instability - 1), 2)
		}
	})

	it('has per-module metrics, and a covered subset with no null coverage', () => {
		expect(modules.length).toBeGreaterThan(100)
		expect(covered.length).toBeGreaterThan(0)
		expect(covered.every((m) => typeof m.coverage === 'number')).toBe(true)
	})
})

describe('quantile', () => {
	it('interpolates between ranks', () => {
		expect(quantile([1, 2, 3, 4, 5], 0.5)).toBe(3)
		expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5)
		expect(quantile([10, 0], 1)).toBe(10)
	})

	it('is 0 for no values', () => {
		expect(quantile([], 0.9)).toBe(0)
	})
})

describe('mainSequenceZones', () => {
	it('draws the zone of pain and of uselessness as triangles off the main sequence', () => {
		const { pain, uselessness } = mainSequenceZones(0.5)
		expect(pain).toEqual([
			[0, 0],
			[0.5, 0],
			[0, 0.5]
		])
		expect(uselessness).toEqual([
			[1, 1],
			[0.5, 1],
			[1, 0.5]
		])
	})

	it('every vertex of each zone sits at distance ≥ the threshold', () => {
		const t = 0.4
		for (const zone of Object.values(mainSequenceZones(t))) {
			for (const [i, a] of zone) expect(Math.abs(a + i - 1)).toBeGreaterThanOrEqual(t - 1e-9)
		}
	})
})

describe('thresholds', () => {
	it('are the upper quantiles of the module metrics', () => {
		expect(THRESHOLD_QUANTILE).toBe(0.95)
		expect(thresholds.complexity).toBe(quantile(modules.map((m) => m.complexity), 0.95))
		expect(thresholds.churn).toBe(quantile(modules.map((m) => m.churn), 0.95))
		expect(thresholds.fanOut).toBeGreaterThan(0)
		expect(thresholds.fanIn).toBeGreaterThan(0)
	})

	it('leave only the far tail past each line — not the ordinary middle', () => {
		for (const key of ['complexity', 'churn', 'fanIn', 'fanOut'] as const) {
			const past = modules.filter((m) => m[key] >= thresholds[key]).length
			expect(past / modules.length, key).toBeLessThan(0.1)
		}
	})
})
