import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildWaterfallMarks } from '../../src/geoms/lib/marks/waterfall.js'

// y: -10..10 over 200..0 → value v sits at 100 - 10v
const plot = (steps) => ({
	xScale: scaleBand().domain(steps).range([0, 100]),
	yScale: scaleLinear().domain([-10, 10]).range([200, 0]),
	place: (x, y) => ({ x, y }),
	chartPreset: { opacity: {} }
})
const span = (mark) => [mark.y, mark.y + mark.height].map((v) => Math.round(v * 1e6) / 1e6)

describe('buildWaterfallMarks — bars span what the axis was sized to', () => {
	it('a negative total is drawn from 0 DOWN to the running total, not as a sliver at 0', () => {
		const data = [
			{ s: 'a', d: -6 },
			{ s: 't', d: 0, total: true }
		]
		const [, total] = buildWaterfallMarks({ data, plot: plot(['a', 't']), channels: { x: 's', y: 'd' }, options: { totalField: 'total' } })
		// 0 → y 100, -6 → y 160
		expect(span(total)).toEqual([100, 160])
	})

	it('a missing step value counts as 0 and does not poison the bars after it', () => {
		const data = [{ s: 'a', d: 3 }, { s: 'b' }, { s: 'c', d: 2 }]
		const marks = buildWaterfallMarks({ data, plot: plot(['a', 'b', 'c']), channels: { x: 's', y: 'd' } })
		for (const m of marks) expect(Number.isFinite(m.y), m.key).toBe(true)
		// c runs from 3 to 5 → y 70 .. 50
		expect(span(marks[2])).toEqual([50, 70])
	})

	it('still draws a positive total from 0 up', () => {
		const data = [
			{ s: 'a', d: 4 },
			{ s: 't', d: 0, total: true }
		]
		const [, total] = buildWaterfallMarks({ data, plot: plot(['a', 't']), channels: { x: 's', y: 'd' }, options: { totalField: 'total' } })
		expect(span(total)).toEqual([60, 100])
	})
})
