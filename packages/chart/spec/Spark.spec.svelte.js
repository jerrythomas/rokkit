import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SparkHarness from './helpers/SparkHarness.svelte'

/**
 * `Spark` is the first container to actually drive a real geom off `SparkState` — the
 * conformance test (`spec/spark-contract.spec.js`) only proves the two states have the same
 * shape, not that a live geom renders correctly through one. `SparkHarness` composes a real
 * `<Line />` inside `<Spark>`, so these tests are the integration check that closes that gap.
 *
 * Pixel values below are chosen so they're hand-computable and exact — not just "truthy" —
 * per the plan's test-quality rule: assert the value the feature computes, not a property
 * that would also hold if the feature were broken.
 */

const rows = [
	{ day: 0, sales: 10 },
	{ day: 1, sales: 20 },
	{ day: 2, sales: 30 }
]

// Pulls the last `M`/`L` coordinate pair out of an SVG path's `d` attribute, e.g. the last
// point of "M0,40L50,20L100,0" is {x: 100, y: 0}. Used to prove the geom's rendered geometry
// — not merely its presence — reflects the current props.
function lastPoint(d) {
	const matches = [...d.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)]
	const [, x, y] = matches[matches.length - 1]
	return { x: Number(x), y: Number(y) }
}

function linePath(container) {
	return container.querySelector('[data-plot-geom="line"] path[data-plot-element="line"]')
}

describe('Spark container — dimensions', () => {
	it('renders an svg at the given width and height', () => {
		const { container } = render(SparkHarness, { data: rows, width: 120, height: 32 })
		const svg = container.querySelector('svg')
		expect(svg.getAttribute('width')).toBe('120')
		expect(svg.getAttribute('height')).toBe('32')
	})

	it('defaults to 80x24 when width/height are not given', () => {
		const { container } = render(SparkHarness, { data: rows })
		const svg = container.querySelector('svg')
		expect(svg.getAttribute('width')).toBe('80')
		expect(svg.getAttribute('height')).toBe('24')
	})
})

describe('Spark container — no chrome', () => {
	it('renders no axes, grid, or legend', () => {
		const { container } = render(SparkHarness, { data: rows })
		expect(container.querySelector('[data-plot-axis]')).toBeNull()
		expect(container.querySelector('[data-plot-grid]')).toBeNull()
		expect(container.querySelector('[data-plot-legend]')).toBeNull()
	})
})

describe('Spark container — geom composition (the real integration check)', () => {
	it('provides working context so a real child geom renders actual geometry', () => {
		const { container } = render(SparkHarness, { data: rows, width: 100, height: 40 })
		const g = container.querySelector('[data-plot-geom="line"]')
		expect(g).toBeTruthy()
		const path = linePath(container)
		expect(path).toBeTruthy()
		const d = path.getAttribute('d')
		expect(d).toBeTruthy()
		expect(d).not.toContain('NaN')
		// xScale domain [0,2] range [0,100] (nice:false) → the last row (day 2) maps to x=100
		// exactly; yScale domain [10,30] range [40,0] → sales=30 (the max) maps to y=0 exactly.
		// A stubbed/broken context (e.g. no xScale/yScale) could not produce this exact pair.
		expect(lastPoint(d)).toEqual({ x: 100, y: 0 })
	})
})

describe('Spark container — pattern defs', () => {
	it('renders the pattern-defs container so pattern fills can resolve, same as PlotSurface', () => {
		const { container } = render(SparkHarness, { data: rows })
		// SparkState.patterns is always an empty Map (a spark never sets a pattern channel), so
		// no <pattern> ever actually appears — but the <defs>/<DefinePatterns/> wiring itself
		// must be present so a consumer's pattern channel resolves the moment one is composed.
		expect(container.querySelector('defs')).toBeTruthy()
	})
})

describe('Spark container — baseline', () => {
	it('omits the baseline line when no baseline is given', () => {
		const { container } = render(SparkHarness, { data: rows, width: 100, height: 40 })
		expect(container.querySelector('[data-plot-baseline]')).toBeNull()
	})

	it('draws the baseline line at the exact scaled pixel, not a hardcoded position', () => {
		const { container } = render(SparkHarness, {
			data: rows,
			width: 100,
			height: 40,
			baseline: 20
		})
		const line = container.querySelector('[data-plot-baseline]')
		expect(line).toBeTruthy()
		// yScale domain [10,30] range [40,0] (nice:false) → yScale(20) = 40 - 0.5*40 = 20 exactly.
		// A hardcoded y=0 (or any value other than the scaled pixel) fails this.
		expect(line.getAttribute('y1')).toBe('20')
		expect(line.getAttribute('y2')).toBe('20')
		expect(line.getAttribute('x1')).toBe('0')
		expect(line.getAttribute('x2')).toBe('100')
	})
})

describe('Spark container — live prop updates', () => {
	it('flows a width change through the $effect to both the svg and the rendered geometry', async () => {
		const { container, rerender } = render(SparkHarness, { data: rows, width: 100, height: 40 })
		const svg = container.querySelector('svg')

		const before = lastPoint(linePath(container).getAttribute('d'))
		expect(before.x).toBe(100) // xScale range [0,100] → last point at x=100

		await rerender({ data: rows, width: 200, height: 40 })

		expect(svg.getAttribute('width')).toBe('200')
		const after = lastPoint(linePath(container).getAttribute('d'))
		// If the $effect didn't re-run state.update(), xScale's range would still be [0,100]
		// and this would still read 100 even though the svg's own width attribute changed.
		expect(after.x).toBe(200)
	})

	it('flows a baseline prop change through to the reference line pixel', async () => {
		const { container, rerender } = render(SparkHarness, {
			data: rows,
			width: 100,
			height: 40,
			baseline: 20
		})
		expect(container.querySelector('[data-plot-baseline]').getAttribute('y1')).toBe('20')

		// yScale domain [10,30] range [40,0] → yScale(10) = 40 exactly.
		await rerender({ data: rows, width: 100, height: 40, baseline: 10 })
		expect(container.querySelector('[data-plot-baseline]').getAttribute('y1')).toBe('40')
	})
})
