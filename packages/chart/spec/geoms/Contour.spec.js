import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { scaleLinear } from 'd3-scale'
import TestContour from '../helpers/TestContour.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'
import { multiPolygonPath } from '../../src/geoms/lib/marks/contour.js'

// Two tight clusters — one near the origin, one near (0.8, 0.8) — deterministic.
const cluster = (cx, cy, group) =>
	Array.from({ length: 25 }, (_, k) => ({
		i: cx + ((k % 5) - 2) * 0.01,
		a: cy + (Math.floor(k / 5) - 2) * 0.01,
		g: group
	}))
const ROWS = [...cluster(0.1, 0.1, 'core'), ...cluster(0.8, 0.8, 'ui')]

const state = (rows = ROWS, overrides = {}) =>
	createMockState({
		xScale: scaleLinear().domain([0, 1]).range([0, 300]),
		yScale: scaleLinear().domain([0, 1]).range([200, 0]),
		geomData: () => rows,
		colors: new Map([
			['core', { fill: '#111', stroke: '#222' }],
			['ui', { fill: '#333', stroke: '#444' }]
		]),
		...overrides
	})

const levels = (container) => [...container.querySelectorAll('[data-plot-element="contour"]')]

describe('Contour.svelte', () => {
	it('draws density contour lines over the points', () => {
		const { container } = render(TestContour, { props: { state: state(), x: 'i', y: 'a' } })
		const paths = levels(container)
		expect(paths.length).toBeGreaterThan(0)
		for (const p of paths) expect(p.getAttribute('d')).toMatch(/^M/)
		// lines by default — no fill
		expect(paths[0].getAttribute('fill')).toBe('none')
	})

	it('numbers levels from the outermost (0) inward', () => {
		const { container } = render(TestContour, {
			props: { state: state(), x: 'i', y: 'a', thresholds: 4 }
		})
		const idx = levels(container).map((p) => Number(p.getAttribute('data-plot-contour-level')))
		expect(idx[0]).toBe(0)
		expect(idx).toEqual([...idx].sort((m, n) => m - n))
	})

	it('contours each group separately in its palette colour', () => {
		const { container } = render(TestContour, {
			props: { state: state(), x: 'i', y: 'a', color: 'g' }
		})
		const groups = new Set(levels(container).map((p) => p.getAttribute('data-plot-contour')))
		expect(groups).toEqual(new Set(['core', 'ui']))
		const core = levels(container).find((p) => p.getAttribute('data-plot-contour') === 'core')
		expect(core.getAttribute('stroke')).toBe('#222')
	})

	it('fills bands with rising opacity when filled', () => {
		const { container } = render(TestContour, {
			props: { state: state(), x: 'i', y: 'a', fill: 'g', filled: true, alpha: 0.6 }
		})
		const core = levels(container).filter((p) => p.getAttribute('data-plot-contour') === 'core')
		expect(core[0].getAttribute('fill')).toBe('#111')
		const ops = core.map((p) => Number(p.getAttribute('fill-opacity')))
		expect(ops[ops.length - 1]).toBeCloseTo(0.6, 5)
		expect(ops[0]).toBeLessThan(ops[ops.length - 1])
	})

	it('a wider bandwidth smooths into fewer separate rings', () => {
		const narrow = render(TestContour, {
			props: { state: state(), x: 'i', y: 'a', bandwidth: 5, thresholds: 1 }
		})
		const wide = render(TestContour, {
			props: { state: state(), x: 'i', y: 'a', bandwidth: 120, thresholds: 1 }
		})
		const rings = (c) => (levels(c)[0]?.getAttribute('d').match(/M/g) ?? []).length
		expect(rings(narrow.container)).toBeGreaterThan(rings(wide.container))
	})

	it('applies alpha to the rings when stroked', () => {
		const { container } = render(TestContour, {
			props: { state: state(), x: 'i', y: 'a', alpha: 0.4 }
		})
		expect(levels(container)[0].getAttribute('stroke-opacity')).toBe('0.4')
	})

	it('ignores rows without a usable coordinate', () => {
		const rows = [...ROWS, { i: null, a: 0.5 }, { i: 'x', a: 0.5 }]
		const { container } = render(TestContour, { props: { state: state(rows), x: 'i', y: 'a' } })
		expect(levels(container).length).toBeGreaterThan(0)
	})

	it('clips to the plot area — a density ring must not spill across the axes', () => {
		const { container } = render(TestContour, { props: { state: state(), x: 'i', y: 'a' } })
		const clip = container.querySelector('clipPath rect')
		expect([clip.getAttribute('width'), clip.getAttribute('height')]).toEqual(['300', '200'])
		const group = container.querySelector('[data-plot-geom="contour"]')
		expect(group.getAttribute('clip-path')).toBe(`url(#${container.querySelector('clipPath').id})`)
	})

	it('renders nothing with no data', () => {
		const { container } = render(TestContour, { props: { state: state([]), x: 'i', y: 'a' } })
		expect(container.querySelector('[data-plot-geom="contour"]')).toBeNull()
	})
})

describe('multiPolygonPath', () => {
	it('joins every ring of every polygon as a closed subpath', () => {
		const d = multiPolygonPath([
			[
				[
					[0, 0],
					[1, 0],
					[1, 1]
				]
			],
			[
				[
					[5, 5],
					[6, 5],
					[6, 6]
				]
			]
		])
		expect(d).toBe('M0,0L1,0L1,1ZM5,5L6,5L6,6Z')
	})
})
