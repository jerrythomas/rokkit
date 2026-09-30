import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { scaleLinear } from 'd3-scale'
import TestHull from '../helpers/TestHull.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

const ROWS = [
	{ i: 0, a: 0, pkg: 'core' },
	{ i: 0.2, a: 0, pkg: 'core' },
	{ i: 0.1, a: 0.3, pkg: 'core' },
	{ i: 0.1, a: 0.1, pkg: 'core' }, // interior
	{ i: 0.8, a: 0.9, pkg: 'ui' },
	{ i: 0.9, a: 0.7, pkg: 'ui' },
	{ i: 0.5, a: 0.5, pkg: 'solo' }
]

const state = (rows = ROWS, overrides = {}) =>
	createMockState({
		xScale: scaleLinear().domain([0, 1]).range([0, 100]),
		yScale: scaleLinear().domain([0, 1]).range([100, 0]),
		geomData: () => rows,
		colors: new Map([
			['core', { fill: '#111', stroke: '#222' }],
			['ui', { fill: '#333', stroke: '#444' }],
			['solo', { fill: '#555', stroke: '#666' }]
		]),
		...overrides
	})

const hulls = (container) => [...container.querySelectorAll('[data-plot-element="hull"]')]

describe('Hull.svelte', () => {
	it('draws one outline per group of the fill/colour field', () => {
		const { container } = render(TestHull, {
			props: { state: state(), x: 'i', y: 'a', color: 'pkg' }
		})
		expect(hulls(container).map((h) => h.getAttribute('data-plot-hull'))).toEqual([
			'core',
			'ui',
			'solo'
		])
	})

	it('encloses only the hull corners, not interior points', () => {
		const { container } = render(TestHull, {
			props: { state: state(), x: 'i', y: 'a', color: 'pkg' }
		})
		const d = hulls(container)[0].getAttribute('d')
		// three corners (0,100) (20,100) (10,70); the interior (10,90) is not a vertex
		expect(d.match(/[ML]/g).length).toBe(3)
		expect(d).not.toContain('10,90')
	})

	it('colours each hull from the shared palette', () => {
		const { container } = render(TestHull, {
			props: { state: state(), x: 'i', y: 'a', fill: 'pkg' }
		})
		const [core] = hulls(container)
		expect(core.getAttribute('fill')).toBe('#111')
		expect(core.getAttribute('stroke')).toBe('#111')
	})

	it('pads by stroking the outline 2×padding wide with round joins', () => {
		const { container } = render(TestHull, {
			props: { state: state(), x: 'i', y: 'a', color: 'pkg', padding: 9 }
		})
		const [core] = hulls(container)
		expect(core.getAttribute('stroke-width')).toBe('18')
		expect(core.getAttribute('stroke-linejoin')).toBe('round')
		expect(core.getAttribute('stroke-linecap')).toBe('round')
	})

	it('still marks a one-point group, as a padded dot', () => {
		const { container } = render(TestHull, {
			props: { state: state(), x: 'i', y: 'a', color: 'pkg' }
		})
		expect(hulls(container)[2].getAttribute('d')).toBe('M50,50Z')
	})

	it('uses element opacity so fill and padded stroke do not double up', () => {
		const { container } = render(TestHull, {
			props: { state: state(), x: 'i', y: 'a', color: 'pkg', alpha: 0.2 }
		})
		const [core] = hulls(container)
		expect(core.getAttribute('opacity')).toBe('0.2')
		expect(core.getAttribute('fill-opacity')).toBeNull()
	})

	it('draws a single hull over everything without a group field', () => {
		const { container } = render(TestHull, { props: { state: state(), x: 'i', y: 'a' } })
		expect(hulls(container).length).toBe(1)
	})

	it('skips rows with a missing coordinate', () => {
		const rows = [...ROWS, { i: null, a: 0.5, pkg: 'ui' }, { i: 'n/a', a: 0.5, pkg: 'ui' }]
		const { container } = render(TestHull, {
			props: { state: state(rows), x: 'i', y: 'a', color: 'pkg' }
		})
		expect(hulls(container)[1].getAttribute('d').match(/[ML]/g).length).toBe(2)
	})

	it('labels each hull when label is set', () => {
		const { container } = render(TestHull, {
			props: { state: state(), x: 'i', y: 'a', color: 'pkg', label: true }
		})
		const labels = [...container.querySelectorAll('[data-plot-element="hull-label"]')].map(
			(t) => t.textContent
		)
		expect(labels).toEqual(['core', 'ui', 'solo'])
	})

	it('transposes under flip', () => {
		const flipped = state(ROWS, { isFlipped: true, place: (u, v) => ({ x: v, y: u }) })
		const { container } = render(TestHull, {
			props: { state: flipped, x: 'i', y: 'a', color: 'pkg' }
		})
		expect(hulls(container)[2].getAttribute('d')).toBe('M50,50Z')
		expect(hulls(container)[0].getAttribute('d')).toContain('100,0')
	})

	it('renders nothing with no data', () => {
		const { container } = render(TestHull, { props: { state: state([]), x: 'i', y: 'a' } })
		expect(container.querySelector('[data-plot-geom="hull"]')).toBeNull()
	})
})
