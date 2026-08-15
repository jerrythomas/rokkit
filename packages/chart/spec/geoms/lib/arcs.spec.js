import { describe, it, expect } from 'vitest'
import { buildArcs } from '../../../src/lib/brewing/marks/arcs.js'

const colors = new Map([
	['compact', { fill: '#4e79a7', stroke: '#fff' }],
	['suv', { fill: '#f28e2b', stroke: '#fff' }]
])

const data = [
	{ segment: 'compact', hwy: 29 },
	{ segment: 'suv', hwy: 18 }
]

describe('buildArcs — color channel drives fill lookup', () => {
	it('returns one arc per datum', () => {
		const arcs = buildArcs(data, { color: 'segment', y: 'hwy' }, colors, 300, 300)
		expect(arcs).toHaveLength(2)
	})

	it('arc has d (SVG path), fill, stroke, key', () => {
		const [arc] = buildArcs(data, { color: 'segment', y: 'hwy' }, colors, 300, 300)
		expect(arc).toHaveProperty('d')
		expect(arc).toHaveProperty('fill')
		expect(arc).toHaveProperty('stroke')
		expect(arc).toHaveProperty('key')
	})

	it('uses color channel value as key for colors Map lookup', () => {
		const arcs = buildArcs(data, { color: 'segment', y: 'hwy' }, colors, 300, 300)
		const compact = arcs.find((a) => a.key === 'compact')
		expect(compact).toBeDefined()
		expect(compact.fill).toBe('#4e79a7')
	})

	it('arc d is a non-empty SVG path string with no NaN', () => {
		const arcs = buildArcs(data, { color: 'segment', y: 'hwy' }, colors, 300, 300)
		for (const arc of arcs) {
			expect(typeof arc.d).toBe('string')
			expect(arc.d.length).toBeGreaterThan(0)
			expect(arc.d).not.toContain('NaN')
		}
	})

	it('falls back to default fill (#888) when color key is absent from colors Map', () => {
		const [arc] = buildArcs(
			[{ segment: 'unknown', hwy: 50 }],
			{ color: 'segment', y: 'hwy' },
			colors,
			300,
			300
		)
		expect(arc.fill).toBe('#888')
	})

	it('innerRadius option produces donut arcs', () => {
		const solidArcs = buildArcs(data, { color: 'segment', y: 'hwy' }, colors, 300, 300, {
			innerRadius: 0
		})
		const donutArcs = buildArcs(data, { color: 'segment', y: 'hwy' }, colors, 300, 300, {
			innerRadius: 50
		})
		// Donut arcs have a different path (inner cutout changes the M/A commands)
		expect(donutArcs[0].d).not.toBe(solidArcs[0].d)
	})
})

// Extract the arc radii from an SVG path's `A<rx>,<ry>` commands.
const arcRadii = (d) => [...d.matchAll(/A(\d+(?:\.\d+)?),/g)].map((m) => Number(m[1]))

describe('buildArcs — innerRadius interpretation + clamp', () => {
	const ch = { color: 'segment', y: 'hwy' }

	it('a solid pie draws to the outer radius min(w,h)/2 (no oversized ring)', () => {
		// 400x400 → outer radius 200
		const [arc] = buildArcs(data, ch, colors, 400, 400, { innerRadius: 0 })
		expect(Math.max(...arcRadii(arc.d))).toBeCloseTo(200, -1)
	})

	it('interprets innerRadius <= 1 as a fraction of the radius (responsive donut)', () => {
		// 400x400 → R 200; fraction 0.5 → inner 100
		const [arc] = buildArcs(data, ch, colors, 400, 400, { innerRadius: 0.5 })
		const rs = arcRadii(arc.d)
		expect(Math.max(...rs)).toBeCloseTo(200, -1)
		expect(Math.min(...rs)).toBeCloseTo(100, 0)
	})

	it('interprets innerRadius > 1 as absolute pixels', () => {
		// 400x400 → R 200; 60px inner hole
		const [arc] = buildArcs(data, ch, colors, 400, 400, { innerRadius: 60 })
		const rs = arcRadii(arc.d)
		expect(Math.max(...rs)).toBeCloseTo(200, -1)
		expect(Math.min(...rs)).toBeCloseTo(60, 0)
	})

	it('clamps an out-of-range innerRadius so slices never render outside the circle', () => {
		// The original bug: a fraction×px mixup produced innerRadius 11400 >> outer 200,
		// which d3 silently swapped into a giant ring outside the circle. The clamp must
		// keep the outer radius ~200 regardless.
		const [arc] = buildArcs(data, ch, colors, 400, 400, { innerRadius: 11400 })
		expect(Math.max(...arcRadii(arc.d))).toBeLessThanOrEqual(201)
	})
})
