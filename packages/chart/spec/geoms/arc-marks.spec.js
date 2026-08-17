import { describe, it, expect } from 'vitest'
import { buildArcMarks } from '../../src/geoms/lib/marks/arc.js'
import { defaultPreset } from '../../src/lib/preset.js'

const data = [
	{ label: 'A', value: 30 },
	{ label: 'B', value: 70 }
]
const colors = new Map([
	['A', { fill: 'g1', stroke: 'g1d' }],
	['B', { fill: 'g2', stroke: 'g2d' }]
])

function fakePlot() {
	return {
		colors,
		patterns: new Map(),
		innerWidth: 200,
		innerHeight: 200,
		chartPreset: defaultPreset
	}
}

describe('buildArcMarks', () => {
	it('builds one slice per row with fill/stroke from fill (aliasing color)', () => {
		const arcs = buildArcMarks({
			data,
			plot: fakePlot(),
			channels: { y: 'value', fill: 'label' },
			type: 'arc'
		})
		expect(arcs).toHaveLength(2)
		expect(arcs.map((a) => a.fill).sort()).toEqual(['g1', 'g2'])
	})

	it('color aliases fill when fill is absent', () => {
		const arcs = buildArcMarks({
			data,
			plot: fakePlot(),
			channels: { y: 'value', color: 'label' },
			type: 'arc'
		})
		expect(arcs.map((a) => a.fill).sort()).toEqual(['g1', 'g2'])
	})

	it('applies alpha (explicit over preset default)', () => {
		const arcs = buildArcMarks({
			data,
			plot: fakePlot(),
			channels: { y: 'value', fill: 'label' },
			alpha: 0.5,
			type: 'arc'
		})
		expect(arcs.every((a) => a.alpha === 0.5)).toBe(true)
	})

	it('skips (empty) when the fill field is not yet present on the rows', () => {
		const arcs = buildArcMarks({
			data,
			plot: fakePlot(),
			channels: { y: 'value', fill: 'missing' },
			type: 'arc'
		})
		expect(arcs).toEqual([])
	})
})
