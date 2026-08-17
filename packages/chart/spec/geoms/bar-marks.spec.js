import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildBarMarks } from '../../src/geoms/lib/marks/bar.js'
import { defaultPreset } from '../../src/lib/preset.js'

const data = [
	{ cat: 'A', val: 50, region: 'North' },
	{ cat: 'B', val: 80, region: 'South' }
]
const colors = new Map([
	['A', { fill: 'fA', stroke: 'sA' }],
	['B', { fill: 'fB', stroke: 'sB' }],
	['North', { fill: 'fN', stroke: 'sN' }],
	['South', { fill: 'fS', stroke: 'sS' }]
])

function fakePlot() {
	return {
		xScale: scaleBand().domain(['A', 'B']).range([0, 200]).padding(0.1),
		yScale: scaleLinear().domain([0, 100]).range([200, 0]),
		colors,
		patterns: new Map(),
		innerHeight: 200,
		chartPreset: defaultPreset,
		place: (x, y) => ({ x, y }),
		continuousCategory: false
	}
}

describe('buildBarMarks', () => {
	it('one bar per row with geometry + fill/stroke + alpha', () => {
		const bars = buildBarMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'cat', y: 'val', fill: 'cat' },
			type: 'bar'
		})
		expect(bars).toHaveLength(2)
		for (const key of ['x', 'y', 'width', 'height', 'fill', 'stroke', 'alpha']) {
			expect(bars[0], `bar.${key}`).toHaveProperty(key)
		}
	})

	it('interior fills by fill ?? color', () => {
		const byFill = buildBarMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'cat', y: 'val', fill: 'region' },
			type: 'bar'
		})
		expect(byFill.map((b) => b.fill).sort()).toEqual(['fN', 'fS'])

		const byColor = buildBarMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'cat', y: 'val', color: 'region' },
			type: 'bar'
		})
		expect(byColor.map((b) => b.fill).sort()).toEqual(['fN', 'fS'])
	})

	it('applies alpha (default = preset.opacity.bar = 1)', () => {
		const bars = buildBarMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'cat', y: 'val', fill: 'cat' },
			type: 'bar'
		})
		expect(bars[0].alpha).toBe(defaultPreset.opacity.bar)
		const withAlpha = buildBarMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'cat', y: 'val', fill: 'cat' },
			alpha: 0.5,
			type: 'bar'
		})
		expect(withAlpha[0].alpha).toBe(0.5)
	})
})
