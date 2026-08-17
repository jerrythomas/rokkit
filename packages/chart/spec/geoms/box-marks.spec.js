import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildBoxMarks } from '../../src/geoms/lib/marks/box.js'
import { defaultPreset } from '../../src/lib/preset.js'

// Pre-aggregated boxplot rows (quartile fields already computed).
const data = [
	{ grp: 'A', kind: 'x', q1: 10, median: 20, q3: 30, iqr_min: 5, iqr_max: 35, outliers: [] },
	{ grp: 'B', kind: 'y', q1: 15, median: 25, q3: 35, iqr_min: 8, iqr_max: 40, outliers: [] }
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
		yScale: scaleLinear().domain([0, 40]).range([200, 0]),
		colors,
		patterns: new Map(),
		chartPreset: defaultPreset
	}
}

describe('buildBoxMarks', () => {
	it('body fill + outline from fill (defaulting to x), with alpha', () => {
		const boxes = buildBoxMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'grp', y: 'val', fill: 'grp' },
			type: 'box'
		})
		expect(boxes).toHaveLength(2)
		expect(boxes.map((b) => b.fill).sort()).toEqual(['fA', 'fB'])
		expect(boxes.map((b) => b.stroke).sort()).toEqual(['sA', 'sB'])
		expect(boxes[0].alpha).toBe(defaultPreset.opacity.box)
	})

	it('a separate color channel overrides the outline stroke (interior stays from fill)', () => {
		const boxes = buildBoxMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'grp', y: 'val', fill: 'grp', color: 'kind' },
			type: 'box'
		})
		expect(boxes.map((b) => b.fill).sort()).toEqual(['fA', 'fB']) // interior from grp
		expect(boxes.map((b) => b.stroke).sort()).toEqual(['sx', 'sy']) // outline from kind
	})

	it('applies an explicit alpha', () => {
		const boxes = buildBoxMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'grp', y: 'val', fill: 'grp' },
			alpha: 0.2,
			type: 'box'
		})
		expect(boxes.every((b) => b.alpha === 0.2)).toBe(true)
	})
})
