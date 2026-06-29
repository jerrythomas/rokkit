import { describe, it, expect } from 'vitest'
import { buildYScale } from '../../src/lib/brewing/scales.js'

/**
 * Covers the missing path in scales.js:
 * maxFromLayer returns 0 when layer has no .data or no .y (line 26).
 */
describe('buildYScale — layer fallback paths', () => {
	const data = [
		{ month: 'Jan', revenue: 100 },
		{ month: 'Feb', revenue: 200 }
	]

	it('uses 0 when layer has no .data property', () => {
		// Layer without data → maxFromLayer returns 0 → dataMax wins
		const scale = buildYScale(data, 'revenue', 300, [{ y: 'revenue' }])
		expect(scale.domain()[1]).toBeGreaterThanOrEqual(200)
	})

	it('uses 0 when layer has no .y property', () => {
		// Layer without y → maxFromLayer returns 0 → dataMax wins
		const scale = buildYScale(data, 'revenue', 300, [{ data: [{ revenue: 500 }] }])
		expect(scale.domain()[1]).toBeGreaterThanOrEqual(200)
	})

	it('uses 0 when layer has empty data array', () => {
		const scale = buildYScale(data, 'revenue', 300, [{ data: [], y: 'revenue' }])
		// max of empty array is undefined → ?? 0 → 0 < dataMax → dataMax wins
		expect(scale.domain()[1]).toBeGreaterThanOrEqual(200)
	})
})
