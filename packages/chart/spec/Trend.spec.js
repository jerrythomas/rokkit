import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Plot from '../src/Plot.svelte'

const data = Array.from({ length: 6 }, (_, i) => ({ day: i, v: i + 1 }))
const spec = { data, x: 'day', y: 'v', geoms: [{ type: 'line' }] }

const paths = (trend) =>
	render(Plot, {
		props: { spec, trend, grid: false, width: 400, height: 300 }
	}).container.querySelectorAll('[data-plot-trend]')

describe('Trend overlay', () => {
	it('a constant method renders one horizontal path', () => {
		const p = paths('avg')
		expect(p).toHaveLength(1)
		expect(p[0].getAttribute('data-plot-trend')).toBe('avg')
		const d = p[0].getAttribute('d')
		const m = d.match(/M[\d.]+,([\d.]+) L[\d.]+,([\d.]+)/)
		expect(Number(m[1])).toBeCloseTo(Number(m[2]), 6) // horizontal
	})
	it('a fitted method renders a path', () => {
		expect(paths('linear')).toHaveLength(1)
		expect(paths('ema')).toHaveLength(1)
	})
	it('an array renders one path per method', () => {
		expect(paths(['avg', 'max'])).toHaveLength(2)
	})
	it('renders nothing when trend is unset or degenerate', () => {
		expect(paths(undefined)).toHaveLength(0)
		expect(paths({ type: 'ma' })).toHaveLength(0) // ma without window → null
	})
	it('duplicate methods do not crash (index keying)', () => {
		expect(paths(['avg', 'avg'])).toHaveLength(2)
	})
	it("normalizes the 'mean' alias to 'avg' in the data attribute", () => {
		const p = paths('mean')
		expect(p).toHaveLength(1)
		expect(p[0].getAttribute('data-plot-trend')).toBe('avg')
	})
})
