import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildJitterMarks } from '../../src/geoms/lib/marks/jitter.js'
import { defaultPreset } from '../../src/lib/preset.js'

const data = [
	{ grp: 'A', val: 10, kind: 'x' },
	{ grp: 'A', val: 12, kind: 'y' },
	{ grp: 'B', val: 20, kind: 'x' }
]
const colors = new Map([
	['A', { fill: 'fA', stroke: 'sA' }],
	['B', { fill: 'fB', stroke: 'sB' }],
	['x', { fill: 'fx', stroke: 'sx' }],
	['y', { fill: 'fy', stroke: 'sy' }]
])

function fakePlot() {
	return {
		xScale: scaleBand().domain(['A', 'B']).range([0, 200]).padding(0.1),
		yScale: scaleLinear().domain([0, 20]).range([200, 0]),
		colors,
		chartPreset: defaultPreset,
		isFlipped: false,
		place: (x, y) => ({ x, y })
	}
}

describe('buildJitterMarks', () => {
	it('one point per row with fill/stroke from fill (default x) + alpha', () => {
		const pts = buildJitterMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'grp', y: 'val', fill: 'grp' },
			options: { method: 'jitter', r: 2 },
			type: 'jitter'
		})
		expect(pts).toHaveLength(3)
		expect(pts[0]).toHaveProperty('cx')
		expect(pts[0]).toHaveProperty('cy')
		expect(pts.every((p) => p.alpha === defaultPreset.opacity.jitter)).toBe(true)
	})

	it('a separate color channel overrides the point stroke', () => {
		const pts = buildJitterMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'grp', y: 'val', fill: 'grp', color: 'kind' },
			options: { method: 'jitter', r: 2 },
			type: 'jitter'
		})
		// strokes now come from the `kind` field (x/y), not the grp fill
		expect(pts.map((p) => p.stroke)).toContain('sx')
	})

	it('applies an explicit alpha', () => {
		const pts = buildJitterMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'grp', y: 'val', fill: 'grp' },
			options: { method: 'jitter', r: 2 },
			alpha: 0.3,
			type: 'jitter'
		})
		expect(pts.every((p) => p.alpha === 0.3)).toBe(true)
	})
})
