import { describe, it, expect } from 'vitest'
import { scaleLinear } from 'd3-scale'
import { buildAreaMarks } from '../../src/geoms/lib/marks/area.js'
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
		patterns: new Map(),
		chartPreset: defaultPreset,
		place: (x, y) => ({ x, y })
	}
}

describe('buildAreaMarks', () => {
	it('groups/fills by fill (falling back to color), no border by default', () => {
		const segs = buildAreaMarks({
			data,
			plot: fakePlot(),
			channels: { x: 't', y: 'v', fill: 'region' },
			type: 'area'
		})
		expect(segs).toHaveLength(2)
		expect(segs.map((s) => s.fill).sort()).toEqual(['lightblue', 'lightred'])
		expect(segs.every((s) => s.stroke === 'none')).toBe(true)
	})

	it('backward-compat: color-only area fills by color with no border', () => {
		const segs = buildAreaMarks({
			data,
			plot: fakePlot(),
			channels: { x: 't', y: 'v', color: 'region' },
			type: 'area'
		})
		expect(segs.map((s) => s.fill).sort()).toEqual(['lightblue', 'lightred'])
		expect(segs.every((s) => s.stroke === 'none')).toBe(true)
	})

	it('draws a border (interior stroke shade) only when both fill and color are set', () => {
		const segs = buildAreaMarks({
			data,
			plot: fakePlot(),
			channels: { x: 't', y: 'v', fill: 'region', color: 'region' },
			type: 'area'
		})
		expect(segs.map((s) => s.stroke).sort()).toEqual(['darkblue', 'darkred'])
	})

	it('applies alpha (default = preset.opacity.area = 0.6)', () => {
		const segs = buildAreaMarks({
			data,
			plot: fakePlot(),
			channels: { x: 't', y: 'v', fill: 'region' },
			type: 'area'
		})
		expect(segs[0].alpha).toBe(defaultPreset.opacity.area)
	})
})
