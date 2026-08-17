import { describe, it, expect } from 'vitest'
import { scaleLinear } from 'd3-scale'
import { buildLineMarks } from '../../src/geoms/lib/marks/line.js'
import { defaultPreset } from '../../src/lib/preset.js'

const data = [
	{ t: 0, v: 10, region: 'North' },
	{ t: 1, v: 20, region: 'North' },
	{ t: 0, v: 5, region: 'South' },
	{ t: 1, v: 8, region: 'South' }
]
const colors = new Map([
	['North', { fill: 'lightblue', stroke: 'darkblue' }],
	['South', { fill: 'lightred', stroke: 'darkred' }]
])

function fakePlot() {
	return {
		xScale: scaleLinear().domain([0, 1]).range([0, 100]),
		yScale: scaleLinear().domain([0, 20]).range([100, 0]),
		colors,
		chartPreset: defaultPreset,
		place: (x, y) => ({ x, y })
	}
}

describe('buildLineMarks', () => {
	it('one segment per color group, stroke from the color entry', () => {
		const segs = buildLineMarks({
			data,
			plot: fakePlot(),
			channels: { x: 't', y: 'v', color: 'region' },
			type: 'line'
		})
		expect(segs).toHaveLength(2)
		expect(segs.map((s) => s.stroke).sort()).toEqual(['darkblue', 'darkred'])
	})

	it('fill aliases color for line stroke', () => {
		const segs = buildLineMarks({
			data,
			plot: fakePlot(),
			channels: { x: 't', y: 'v', fill: 'region' },
			type: 'line'
		})
		expect(segs.map((s) => s.stroke).sort()).toEqual(['darkblue', 'darkred'])
	})

	it('applies alpha (default = preset.opacity.line = 1)', () => {
		const segs = buildLineMarks({
			data,
			plot: fakePlot(),
			channels: { x: 't', y: 'v', color: 'region' },
			type: 'line'
		})
		expect(segs[0].alpha).toBe(defaultPreset.opacity.line)
		const withAlpha = buildLineMarks({
			data,
			plot: fakePlot(),
			channels: { x: 't', y: 'v', color: 'region' },
			alpha: 0.4,
			type: 'line'
		})
		expect(withAlpha[0].alpha).toBe(0.4)
	})
})
