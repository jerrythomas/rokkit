import { describe, it, expect } from 'vitest'
import { PlotState } from '../src/PlotState.svelte.js'

// Deltas whose RUNNING TOTAL (0→100→160→135→120) exceeds the max single delta (100),
// so a naive domain from the raw `delta` field would clip the bars.
const data = [
	{ step: 'Start', delta: 100, total: false },
	{ step: 'Sales', delta: 60, total: false },
	{ step: 'Refunds', delta: -25, total: false },
	{ step: 'Fees', delta: -15, total: false },
	{ step: 'Net', delta: 0, total: true }
]

describe('PlotState — waterfall y-domain', () => {
	function state() {
		const s = new PlotState({ data, channels: { x: 'step', y: 'delta' }, width: 400, height: 300 })
		s.registerGeom({
			type: 'waterfall',
			channels: { x: 'step', y: 'delta' },
			options: { totalField: 'total' }
		})
		return s
	}

	it('y-scale domain spans the cumulative running total, not the raw delta range', () => {
		const s = state()
		const domain = s.yScale.domain()
		// cumulative peaks at 160; a raw-delta domain would top out at ~100.
		expect(domain[domain.length - 1]).toBeGreaterThanOrEqual(160)
		expect(domain[0]).toBeLessThanOrEqual(0)
	})

	it('does not clip: the peak cumulative (160) maps within the range', () => {
		const s = state()
		const y = s.yScale(160)
		const [r0, r1] = s.yScale.range()
		const top = Math.min(r0, r1)
		const bottom = Math.max(r0, r1)
		expect(y).toBeGreaterThanOrEqual(top - 0.5)
		expect(y).toBeLessThanOrEqual(bottom + 0.5)
	})
})
