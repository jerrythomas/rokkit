import { describe, it, expect } from 'vitest'
import { buildSwarm } from '../../../src/lib/brewing/marks/swarm.js'
import { scaleBand, scaleLinear } from 'd3-scale'

const xScale = scaleBand().domain(['A', 'B']).range([0, 200]).padding(0.1)
const yScale = scaleLinear().domain([0, 100]).range([200, 0])
const colors = new Map([
	['A', { fill: '#4e79a7', stroke: '#264653' }],
	['B', { fill: '#f28e2b', stroke: '#8a4b00' }]
])

const data = [
	{ cat: 'A', val: 10 },
	{ cat: 'A', val: 12 },
	{ cat: 'A', val: 50 },
	{ cat: 'B', val: 30 }
]

describe('buildSwarm', () => {
	it('returns one placed point per datum', () => {
		const pts = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { method: 'jitter', r: 2 })
		expect(pts).toHaveLength(4)
	})

	it('maps cy through yScale and colors by group', () => {
		const pts = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { method: 'jitter', r: 2 })
		const first = pts.find((p) => p.data.val === 10)
		expect(first.cy).toBeCloseTo(yScale(10))
		expect(first.fill).toBe('#4e79a7')
	})

	it('keeps every point within its category band', () => {
		const pts = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { method: 'jitter', r: 2 })
		const bw = xScale.bandwidth()
		for (const p of pts) {
			const bandStart = xScale(p.data.cat)
			expect(p.cx).toBeGreaterThanOrEqual(bandStart)
			expect(p.cx).toBeLessThanOrEqual(bandStart + bw)
		}
	})

	it('jitter layout is deterministic across calls', () => {
		const a = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { method: 'jitter', r: 2 })
		const b = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { method: 'jitter', r: 2 })
		expect(a.map((p) => p.cx)).toEqual(b.map((p) => p.cx))
	})

	it('swarm layout never overlaps two points within 2r and is deterministic', () => {
		// A tight cluster forces horizontal dodging.
		const cluster = Array.from({ length: 8 }, (_, i) => ({ cat: 'A', val: 50 + i * 0.2 }))
		const opts = { method: 'swarm', r: 4 }
		const a = buildSwarm(cluster, { x: 'cat', y: 'val' }, xScale, yScale, colors, opts)
		const b = buildSwarm(cluster, { x: 'cat', y: 'val' }, xScale, yScale, colors, opts)
		expect(a.map((p) => p.cx)).toEqual(b.map((p) => p.cx)) // deterministic
		for (let i = 0; i < a.length; i++) {
			for (let j = i + 1; j < a.length; j++) {
				const dist = Math.hypot(a[i].cx - a[j].cx, a[i].cy - a[j].cy)
				expect(dist).toBeGreaterThanOrEqual(2 * opts.r - 1e-6)
			}
		}
	})
})
