import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { defaultPreset } from '../../src/lib/preset.js'
import { buildHeatmapMarks } from '../../src/geoms/lib/marks/heatmap.js'
import { buildHexbinMarks } from '../../src/geoms/lib/marks/hexbin.js'
import { buildCandleMarks } from '../../src/geoms/lib/marks/candlestick.js'
import { buildWaterfallMarks } from '../../src/geoms/lib/marks/waterfall.js'
import { buildRibbonMarks } from '../../src/geoms/lib/marks/ribbon.js'

const place = (x, y) => ({ x, y })

describe('buildHeatmapMarks', () => {
	const plot = {
		xScale: scaleBand().domain(['a', 'b']).range([0, 100]),
		yScale: scaleBand().domain(['p', 'q']).range([0, 100]),
		colors: new Map([[1, { fill: 'c1', stroke: 's1' }]]),
		continuousColorScale: null,
		chartPreset: defaultPreset
	}
	it('one cell per row, alpha defaults to preset (1) and honors override', () => {
		const data = [{ gx: 'a', gy: 'p', v: 1 }]
		const cells = buildHeatmapMarks({ data, plot, channels: { x: 'gx', y: 'gy', color: 'v' }, type: 'heatmap' })
		expect(cells).toHaveLength(1)
		expect(cells[0].alpha).toBe(defaultPreset.opacity.heatmap)
		const dimmed = buildHeatmapMarks({ data, plot, channels: { x: 'gx', y: 'gy', color: 'v' }, alpha: 0.4, type: 'heatmap' })
		expect(dimmed[0].alpha).toBe(0.4)
	})
})

describe('buildHexbinMarks', () => {
	const plot = {
		xScale: scaleLinear().domain([0, 10]).range([0, 100]),
		yScale: scaleLinear().domain([0, 10]).range([100, 0]),
		continuousColorScale: null,
		chartPreset: defaultPreset
	}
	it('bins points and applies alpha', () => {
		const data = Array.from({ length: 6 }, (_, i) => ({ x: i, y: i }))
		const hexes = buildHexbinMarks({ data, plot, channels: { x: 'x', y: 'y' }, options: { radius: 20 }, alpha: 0.7, type: 'hexbin' })
		expect(hexes.length).toBeGreaterThan(0)
		expect(hexes.every((h) => h.alpha === 0.7)).toBe(true)
	})
})

describe('buildCandleMarks', () => {
	const plot = {
		xScale: scaleBand().domain(['d1', 'd2']).range([0, 100]),
		yScale: scaleLinear().domain([0, 100]).range([100, 0]),
		place,
		chartPreset: defaultPreset
	}
	const data = [
		{ day: 'd1', open: 10, high: 20, low: 5, close: 15 },
		{ day: 'd2', open: 15, high: 18, low: 8, close: 9 }
	]
	it('up/down fill by close vs open, with alpha', () => {
		const candles = buildCandleMarks({ data, plot, channels: { x: 'day', y: 'high' }, alpha: 0.9, type: 'candlestick' })
		expect(candles).toHaveLength(2)
		expect(candles[0].fill).toBe('#22c55e') // up (close >= open)
		expect(candles[1].fill).toBe('#ef4444') // down
		expect(candles.every((c) => c.alpha === 0.9)).toBe(true)
	})
})

describe('buildWaterfallMarks', () => {
	const plot = {
		xScale: scaleBand().domain(['a', 'b']).range([0, 100]),
		yScale: scaleLinear().domain([0, 100]).range([100, 0]),
		place,
		chartPreset: defaultPreset
	}
	it('positive/negative fill + alpha', () => {
		const data = [{ k: 'a', v: 10 }, { k: 'b', v: -4 }]
		const bars = buildWaterfallMarks({ data, plot, channels: { x: 'k', y: 'v' }, alpha: 0.6, type: 'waterfall' })
		expect(bars).toHaveLength(2)
		expect(bars[0].fill).toBe('#22c55e')
		expect(bars[1].fill).toBe('#ef4444')
		expect(bars.every((b) => b.alpha === 0.6)).toBe(true)
	})
})

describe('buildRibbonMarks', () => {
	const plot = {
		colors: new Map([['X', { fill: 'fx', stroke: 'sx' }]]),
		innerHeight: 200,
		innerWidth: 300,
		chartPreset: defaultPreset
	}
	it('returns links/nodes with alpha (default = preset.ribbon = 0.5)', () => {
		const data = [
			{ source: 'X', target: 'Y', value: 5 },
			{ source: 'X', target: 'Z', value: 3 }
		]
		const out = buildRibbonMarks({ data, plot, channels: {}, type: 'ribbon' })
		expect(out.links).toHaveLength(2)
		expect(out.sourceNodes.length).toBeGreaterThan(0)
		expect(out.links.every((l) => l.alpha === defaultPreset.opacity.ribbon)).toBe(true)
	})
	it('empty data returns empty links/nodes', () => {
		const out = buildRibbonMarks({ data: [], plot, channels: {}, type: 'ribbon' })
		expect(out).toEqual({ links: [], sourceNodes: [], targetNodes: [] })
	})
})
