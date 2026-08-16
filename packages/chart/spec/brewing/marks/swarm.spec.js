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

	it('spreads overflow points across the band instead of stacking them (best-effort)', () => {
		// 20 identical-y points at r=8 exceed the band capacity; they must not all
		// collapse to the center — verify they spread and the layout is deterministic.
		const dense = Array.from({ length: 20 }, () => ({ cat: 'A', val: 50 }))
		const opts = { method: 'swarm', r: 8 }
		const a = buildSwarm(dense, { x: 'cat', y: 'val' }, xScale, yScale, colors, opts)
		const b = buildSwarm(dense, { x: 'cat', y: 'val' }, xScale, yScale, colors, opts)
		expect(a.map((p) => p.cx)).toEqual(b.map((p) => p.cx)) // deterministic
		const distinct = new Set(a.map((p) => Math.round(p.cx * 100)))
		expect(distinct.size).toBeGreaterThanOrEqual(5) // not collapsed to one x
	})
})

describe('buildSwarm — side (raincloud half)', () => {
	const centerOf = (xVal) => (xScale(xVal) ?? 0) + xScale.bandwidth() / 2

	it('side=right confines points to the right half of the band', () => {
		const pts = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { side: 'right' })
		for (const p of pts) expect(p.cx).toBeGreaterThanOrEqual(centerOf(p.data.cat) - 1e-6)
	})

	it('side=left confines points to the left half of the band', () => {
		const pts = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { side: 'left' })
		for (const p of pts) expect(p.cx).toBeLessThanOrEqual(centerOf(p.data.cat) + 1e-6)
	})

	it('the swarm method also respects side', () => {
		const pts = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { side: 'right', method: 'swarm' })
		for (const p of pts) expect(p.cx).toBeGreaterThanOrEqual(centerOf(p.data.cat) - 1e-6)
	})

	it('center (default) straddles the band centre', () => {
		const pts = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { side: 'center' })
		const aPts = pts.filter((p) => p.data.cat === 'A')
		const c = centerOf('A')
		expect(aPts.some((p) => p.cx < c)).toBe(true)
		expect(aPts.some((p) => p.cx > c)).toBe(true)
	})
})
