import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildPoints } from '../../src/lib/brewing/marks/points.js'
import { buildSwarm } from '../../src/lib/brewing/marks/swarm.js'
import { buildArcs } from '../../src/lib/brewing/marks/arcs.js'
import { buildBoxes } from '../../src/lib/brewing/marks/boxes.js'
import { buildViolins } from '../../src/lib/brewing/marks/violins.js'
import { buildBars } from '../../src/geoms/lib/bars.js'
import { buildHeatmapMarks } from '../../src/geoms/lib/marks/heatmap.js'
import { buildRibbonMarks } from '../../src/geoms/lib/marks/ribbon.js'

// #146: a literal color channel (var()/oklch()/#hex/currentColor) must paint every mark with
// that exact value — never grouped as a data field, never run through the shared palette scale
// (which holds one value across all geoms), and never the #888/#aaa fallback. The palette below
// is keyed by field values, so if a builder wrongly treats the literal as a field the lookup
// misses and it falls back; asserting the literal survives proves it's applied directly.
const LIT = 'var(--accent)'
const xBand = scaleBand().domain(['A', 'B']).range([0, 200]).padding(0.1)
const yLin = scaleLinear().domain([0, 100]).range([200, 0])
const palette = new Map([
	['A', { fill: 'red', stroke: 'darkred' }],
	['B', { fill: 'blue', stroke: 'darkblue' }]
])
const quartiles = [
	{ cat: 'A', q1: 20, median: 40, q3: 60, iqr_min: 5, iqr_max: 80 },
	{ cat: 'B', q1: 30, median: 50, q3: 70, iqr_min: 10, iqr_max: 90 }
]

describe('#146 — a literal color channel is applied directly across geoms', () => {
	it('Point honors a literal color', () => {
		const data = [{ x: 1, y: 50 }, { x: 5, y: 80 }]
		const xLin = scaleLinear().domain([0, 10]).range([0, 200])
		const pts = buildPoints(data, { x: 'x', y: 'y', color: LIT }, xLin, yLin, palette, null)
		expect(pts).toHaveLength(2)
		expect(pts.every((p) => p.fill === LIT && p.stroke === LIT)).toBe(true)
	})

	it('Jitter/swarm honors a literal fill', () => {
		const data = [{ cat: 'A', v: 10 }, { cat: 'A', v: 20 }, { cat: 'B', v: 15 }]
		const res = buildSwarm(data, { x: 'cat', y: 'v', fill: LIT }, xBand, yLin, palette)
		expect(res).toHaveLength(3)
		expect(res.every((r) => r.fill === LIT && r.stroke === LIT)).toBe(true)
	})

	it('Bar honors a literal color', () => {
		const data = [{ cat: 'A', val: 30 }, { cat: 'B', val: 50 }]
		const bars = buildBars(data, { x: 'cat', y: 'val', color: LIT }, xBand, yLin, palette, 200)
		expect(bars).toHaveLength(2)
		expect(bars.every((b) => b.fill === LIT && b.stroke === LIT)).toBe(true)
	})

	it('Arc/pie honors a literal color and keeps slices distinct', () => {
		const data = [{ label: 'A', value: 30 }, { label: 'B', value: 70 }]
		const arcs = buildArcs(data, { color: LIT, y: 'value' }, palette, 100, 100)
		expect(arcs.every((a) => a.fill === LIT && a.stroke === LIT)).toBe(true)
		expect(new Set(arcs.map((a) => a.key)).size).toBe(arcs.length)
	})

	it('Box honors a literal fill', () => {
		const boxes = buildBoxes(quartiles, { x: 'cat', fill: LIT }, xBand, yLin, palette)
		expect(boxes).toHaveLength(2)
		expect(boxes.every((b) => b.fill === LIT && b.stroke === LIT)).toBe(true)
	})

	it('Violin honors a literal fill', () => {
		const violins = buildViolins(quartiles, { x: 'cat', fill: LIT }, xBand, yLin, palette)
		expect(violins).toHaveLength(2)
		expect(violins.every((v) => v.fill === LIT && v.stroke === LIT)).toBe(true)
	})

	it('Heatmap honors a literal fill (skips the value scale)', () => {
		const data = [{ x: 'A', y: 'A', count: 3 }, { x: 'B', y: 'B', count: 9 }]
		const yBand = scaleBand().domain(['A', 'B']).range([0, 200]).padding(0)
		const marks = buildHeatmapMarks({
			data,
			plot: { xScale: xBand, yScale: yBand, colors: palette },
			channels: { x: 'x', y: 'y', fill: LIT }
		})
		expect(marks).toHaveLength(2)
		expect(marks.every((m) => m.fill === LIT)).toBe(true)
	})

	it('Ribbon honors a literal color on the links', () => {
		const data = [{ source: 'A', target: 'X', value: 5 }, { source: 'B', target: 'Y', value: 3 }]
		const out = buildRibbonMarks({
			data,
			plot: { colors: palette, innerHeight: 200, innerWidth: 300 },
			channels: { color: LIT },
			options: {}
		})
		expect(out.links).toHaveLength(2)
		expect(out.links.every((l) => l.fill === LIT)).toBe(true)
	})
})
