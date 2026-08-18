import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildBarMarks } from '../../src/geoms/lib/marks/bar.js'
import { defaultPreset } from '../../src/lib/preset.js'

const data = [
	{ cat: 'A', grp: 'g1', val: 3 },
	{ cat: 'A', grp: 'g2', val: 1 },
	{ cat: 'B', grp: 'g1', val: 2 },
	{ cat: 'B', grp: 'g2', val: 2 }
]
const colors = new Map([
	['g1', { fill: 'f1', stroke: 's1' }],
	['g2', { fill: 'f2', stroke: 's2' }]
])

function fakePlot(yDomain = [0, 10]) {
	const xScale = scaleBand().domain(['A', 'B']).range([0, 200]).padding(0.1)
	return {
		xScale,
		yScale: scaleLinear().domain(yDomain).range([200, 0]),
		colors,
		patterns: new Map(),
		innerHeight: 200,
		chartPreset: defaultPreset,
		place: (x, y) => ({ x, y }),
		continuousCategory: false,
		bandwidth: xScale.bandwidth()
	}
}

const aBars = (bars) => bars.filter((b) => b.data.cat === 'A')

describe('buildBarMarks — position', () => {
	it("dodge (default) places sub-series side-by-side (distinct x within a category)", () => {
		const plot = fakePlot()
		const bars = buildBarMarks({ data, plot, channels: { x: 'cat', y: 'val', fill: 'grp' }, options: { position: 'dodge' }, type: 'bar' })
		const xs = new Set(aBars(bars).map((b) => Math.round(b.x)))
		expect(xs.size).toBe(2)
		// each dodged bar is narrower than the full band
		expect(aBars(bars)[0].width).toBeLessThan(plot.bandwidth)
	})

	it('identity overlaps sub-series (same x, full band width)', () => {
		const plot = fakePlot()
		const bars = buildBarMarks({ data, plot, channels: { x: 'cat', y: 'val', fill: 'grp' }, options: { position: 'identity' }, type: 'bar' })
		const a = aBars(bars)
		const xs = new Set(a.map((b) => Math.round(b.x)))
		expect(xs.size).toBe(1)
		expect(a[0].width).toBeCloseTo(plot.bandwidth, 0)
	})

	it('stack places sub-series at the same x (stacked), heights proportional to values', () => {
		const plot = fakePlot()
		const bars = buildBarMarks({ data, plot, channels: { x: 'cat', y: 'val', fill: 'grp' }, options: { position: 'stack' }, type: 'bar' })
		const a = aBars(bars)
		expect(new Set(a.map((b) => Math.round(b.x))).size).toBe(1)
		// A column = 3 + 1 = 4 of a [0,10] domain → ~80px total, not the full 200
		const totalH = a.reduce((s, b) => s + b.height, 0)
		expect(totalH).toBeGreaterThan(60)
		expect(totalH).toBeLessThan(100)
	})

	it('stack transposes under a horizontal place() (band on y, value on width, stacks along x)', () => {
		// A transposing place() (x↔y) is how orientation='horizontal' flips the chart. A grouped
		// stack used to ignore place() and always draw vertically; it must now transpose too.
		const plot = { ...fakePlot(), place: (x, y) => ({ x: y, y: x }) }
		const bars = buildBarMarks({ data, plot, channels: { x: 'cat', y: 'val', fill: 'grp' }, options: { position: 'stack' }, type: 'bar' })
		const a = aBars(bars)
		expect(new Set(a.map((b) => Math.round(b.y))).size).toBe(1) // one band (shared y)
		expect(new Set(a.map((b) => Math.round(b.x))).size).toBe(2) // two segments stacked along x
		// value is now encoded on width; A column = 3 + 1 = 4 of [0,10] → ~80px total
		const totalW = a.reduce((s, b) => s + b.width, 0)
		expect(totalW).toBeGreaterThan(60)
		expect(totalW).toBeLessThan(100)
	})

	it('fill normalizes each column to 100% (spans the full value range)', () => {
		// fill sets the value domain to [0,1] (mirrors PlotState.#resolveStackDomain)
		const plot = fakePlot([0, 1])
		const bars = buildBarMarks({ data, plot, channels: { x: 'cat', y: 'val', fill: 'grp' }, options: { position: 'fill' }, type: 'bar' })
		const a = aBars(bars)
		const totalH = a.reduce((s, b) => s + b.height, 0)
		expect(totalH).toBeCloseTo(200, 0) // full inner height
	})

	it("options.stack: true maps to position 'stack'", () => {
		const plot = fakePlot()
		const bars = buildBarMarks({ data, plot, channels: { x: 'cat', y: 'val', fill: 'grp' }, options: { stack: true }, type: 'bar' })
		expect(new Set(aBars(bars).map((b) => Math.round(b.x))).size).toBe(1)
	})
})
