import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Plot from '../src/Plot.svelte'

// Continuous x (numeric day) + line geom → drives a point/linear x-scale.
const data = Array.from({ length: 8 }, (_, i) => ({ day: i, v: (i % 3) + 1 }))
const spec = { data, x: 'day', y: 'v', geoms: [{ type: 'line' }] }

function grid(gridProp) {
	const { container } = render(Plot, {
		props: { spec, grid: gridProp, width: 400, height: 300 }
	})
	return {
		x: container.querySelectorAll('[data-plot-grid-line="x"]').length,
		y: container.querySelectorAll('[data-plot-grid-line="y"]').length
	}
}

describe('Grid axis control', () => {
	it("'both' adds vertical lines on a continuous x-scale", () => {
		const g = grid('both')
		expect(g.x).toBeGreaterThan(0)
		expect(g.y).toBeGreaterThan(0)
	})
	it('true (auto) draws horizontals only on a continuous x-scale', () => {
		const g = grid(true)
		expect(g.x).toBe(0)
		expect(g.y).toBeGreaterThan(0)
	})
	it("'x' draws verticals only; 'y' draws horizontals only", () => {
		expect(grid('x').y).toBe(0)
		expect(grid('x').x).toBeGreaterThan(0)
		expect(grid('y').x).toBe(0)
		expect(grid('y').y).toBeGreaterThan(0)
	})
	it('false renders no grid lines', () => {
		expect(grid(false)).toEqual({ x: 0, y: 0 })
	})
})
