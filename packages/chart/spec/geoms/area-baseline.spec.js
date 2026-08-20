import { describe, it, expect } from 'vitest'
import { scaleLinear } from 'd3-scale'
import { buildAreas } from '../../src/geoms/lib/areas.js'

const data = [
	{ x: 0, y: 5 },
	{ x: 1, y: -3 },
	{ x: 2, y: 4 }
]
const channels = { x: 'x', y: 'y' }
const xScale = scaleLinear().domain([0, 2]).range([0, 100])
const yScale = scaleLinear().domain([-5, 5]).range([50, 0])
const colors = new Map([[undefined, { fill: '#888', stroke: '#888' }]])

describe('buildAreas — baseline split', () => {
	it('returns a single unsigned segment when no baseline is given', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors)
		expect(segs).toHaveLength(1)
		expect(segs[0].sign).toBeUndefined()
	})

	it('splits into above and below segments when a baseline is given', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		expect(segs.map((s) => s.sign)).toEqual(['above', 'below'])
	})

	it('gives both segments a drawable path', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		for (const s of segs) {
			expect(s.d).toBeTruthy()
			expect(s.d).not.toContain('NaN')
		}
	})

	it('anchors both segments at the baseline pixel, not the chart bottom', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		const zeroPx = yScale(0)
		for (const s of segs) {
			expect(s.d).toContain(String(zeroPx))
		}
	})

	it('keeps the fill/stroke aesthetics it already resolved', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		expect(segs[0].fill).toBe('#888')
	})

	it('gives each emitted segment a distinct key', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		const keys = segs.map((s) => s.key)
		expect(new Set(keys).size).toBe(keys.length)
	})
})
