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
	['North', { fill: 'fN', stroke: 'sN' }],
	['South', { fill: 'fS', stroke: 'sS' }]
])

function fakePlot(yDomain = [0, 30]) {
	return {
		xScale: scaleLinear().domain([0, 1]).range([0, 100]),
		yScale: scaleLinear().domain(yDomain).range([200, 0]),
		colors,
		patterns: new Map(),
		chartPreset: defaultPreset,
		place: (x, y) => ({ x, y })
	}
}

const run = (position, plot = fakePlot()) =>
	buildAreaMarks({ data, plot, channels: { t: 't', x: 't', y: 'v', fill: 'region' }, options: { position }, type: 'area' })

describe('buildAreaMarks — position', () => {
	it('each position returns one segment per fill group, with alpha', () => {
		for (const p of ['identity', 'stack', 'fill']) {
			const segs = run(p)
			expect(segs, p).toHaveLength(2)
			expect(segs.every((s) => s.alpha === defaultPreset.opacity.area), p).toBe(true)
		}
	})

	it('stacking changes the geometry vs identity (overlap)', () => {
		const identity = run('identity')
		const stack = run('stack')
		// the South layer sits on top of North when stacked → different path
		const idSouth = identity.find((s) => s.key === 'South').d
		const stSouth = stack.find((s) => s.key === 'South').d
		expect(stSouth).not.toBe(idSouth)
	})

	it('fill (100%) differs from a plain stack', () => {
		const stack = run('stack')
		const fill = run('fill', fakePlot([0, 1]))
		const stSouth = stack.find((s) => s.key === 'South').d
		const fillSouth = fill.find((s) => s.key === 'South').d
		expect(fillSouth).not.toBe(stSouth)
	})
})
