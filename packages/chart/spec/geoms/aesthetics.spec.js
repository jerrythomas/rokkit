import { describe, it, expect } from 'vitest'
import { resolveFillStroke, resolveAlpha } from '../../src/geoms/lib/aesthetics.js'

const colors = new Map([
	['North', { fill: 'lightblue', stroke: 'darkblue' }],
	['South', { fill: 'lightred', stroke: 'darkred' }],
	['A', { fill: 'lightgreen', stroke: 'darkgreen' }]
])

describe('resolveFillStroke — ggplot fill/color fallback', () => {
	it('color-only: fill AND stroke come from the color entry (backward compat)', () => {
		const r = resolveFillStroke({ region: 'North' }, { color: 'region' }, colors)
		expect(r).toEqual({ fill: 'lightblue', stroke: 'darkblue' })
	})

	it('fill-only: fill AND stroke come from the fill entry', () => {
		const r = resolveFillStroke({ region: 'South' }, { fill: 'region' }, colors)
		expect(r).toEqual({ fill: 'lightred', stroke: 'darkred' })
	})

	it('both: interior from fill value, outline from color value (independent fields)', () => {
		const r = resolveFillStroke(
			{ region: 'North', product: 'A' },
			{ fill: 'product', color: 'region' },
			colors
		)
		expect(r).toEqual({ fill: 'lightgreen', stroke: 'darkblue' })
	})

	it('neither: falls back to the first palette entry (single series)', () => {
		const r = resolveFillStroke({ v: 1 }, {}, colors)
		expect(r).toEqual({ fill: 'lightblue', stroke: 'darkblue' })
	})

	it('unknown key falls back to the first entry rather than crashing', () => {
		const r = resolveFillStroke({ region: 'West' }, { fill: 'region' }, colors)
		expect(r.fill).toBe('lightblue')
	})
})

describe('resolveAlpha — fixed value with per-geom preset default', () => {
	const preset = { opacity: { point: 0.8, bar: 1 } }
	it('uses an explicit alpha when given', () => {
		expect(resolveAlpha(0.3, 'point', preset)).toBe(0.3)
	})
	it('falls back to the per-geom preset opacity', () => {
		expect(resolveAlpha(undefined, 'point', preset)).toBe(0.8)
	})
	it('falls back to 1 when neither alpha nor preset key exists', () => {
		expect(resolveAlpha(undefined, 'mystery', preset)).toBe(1)
	})
})
