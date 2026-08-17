import { describe, it, expect } from 'vitest'
import { scaleLinear } from 'd3-scale'
import { buildPointMarks } from '../../src/geoms/lib/marks/point.js'
import { defaultPreset } from '../../src/lib/preset.js'

const data = [
	{ gdp: 1, life: 50, region: 'North', product: 'A' },
	{ gdp: 5, life: 80, region: 'South', product: 'B' }
]

const colors = new Map([
	['North', { fill: 'lightblue', stroke: 'darkblue' }],
	['South', { fill: 'lightred', stroke: 'darkred' }],
	['A', { fill: 'g1', stroke: 'g1d' }],
	['B', { fill: 'g2', stroke: 'g2d' }]
])

function fakePlot(overrides = {}) {
	return {
		xScale: scaleLinear().domain([0, 10]).range([0, 100]),
		yScale: scaleLinear().domain([0, 100]).range([100, 0]),
		colors,
		symbols: new Map(),
		chartPreset: defaultPreset,
		isFlipped: false,
		place: (x, y) => ({ x, y }),
		...overrides
	}
}

describe('buildPointMarks', () => {
	it('returns one renderable mark per row with geometry + aesthetics', () => {
		const marks = buildPointMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'gdp', y: 'life', color: 'region' },
			type: 'point'
		})
		expect(marks).toHaveLength(2)
		const m = marks[0]
		for (const key of ['cx', 'cy', 'r', 'fill', 'stroke', 'alpha', 'value', 'display', 'key']) {
			expect(m, `mark.${key}`).toHaveProperty(key)
		}
	})

	it('color-only resolves fill+stroke from the color entry (backward compat)', () => {
		const [m] = buildPointMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'gdp', y: 'life', color: 'region' },
			type: 'point'
		})
		expect(m.fill).toBe('lightblue')
		expect(m.stroke).toBe('darkblue')
	})

	it('fill + color map interior and outline to different fields', () => {
		const [m] = buildPointMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'gdp', y: 'life', fill: 'product', color: 'region' },
			type: 'point'
		})
		expect(m.fill).toBe('g1') // product A interior
		expect(m.stroke).toBe('darkblue') // region North outline
	})

	it('applies alpha (explicit over preset default)', () => {
		const [m] = buildPointMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'gdp', y: 'life', color: 'region' },
			alpha: 0.25,
			type: 'point'
		})
		expect(m.alpha).toBe(0.25)
	})

	it('defaults alpha to the per-geom preset opacity (point = 0.8)', () => {
		const [m] = buildPointMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'gdp', y: 'life', color: 'region' },
			type: 'point'
		})
		expect(m.alpha).toBe(defaultPreset.opacity.point)
	})

	it('carries value + display from the y channel', () => {
		const [m] = buildPointMarks({
			data,
			plot: fakePlot(),
			channels: { x: 'gdp', y: 'life', color: 'region' },
			type: 'point'
		})
		expect(m.value).toBe(50)
		expect(m.display).toBe('50')
	})
})
