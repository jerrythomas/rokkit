import { describe, it, expect } from 'vitest'
import { resolveFillStroke, resolveAlpha, resolveLabel } from '../../src/geoms/lib/aesthetics.js'

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

describe('resolveLabel — shared label resolution for every geom', () => {
	const row = { region: 'North', count: 42, empty: null }

	it('returns null when the label prop is off', () => {
		expect(resolveLabel(false, row, 'count')).toBe(null)
		expect(resolveLabel(undefined, row, 'count')).toBe(null)
	})

	it('label=true reads the default field (the geom’s value channel)', () => {
		expect(resolveLabel(true, row, 'count')).toBe('42')
	})

	it('label=true with no default field yields an empty string', () => {
		expect(resolveLabel(true, row, undefined)).toBe('')
	})

	it('label=true on a nullish field yields an empty string, not "null"', () => {
		expect(resolveLabel(true, row, 'empty')).toBe('')
	})

	it('a function label is called with the row and stringified', () => {
		expect(resolveLabel((d) => `${d.region}: ${d.count}`, row, 'count')).toBe('North: 42')
	})

	it('a function returning nullish yields an empty string', () => {
		expect(resolveLabel(() => undefined, row, 'count')).toBe('')
	})

	it('a string label reads that field off the row', () => {
		expect(resolveLabel('region', row, 'count')).toBe('North')
	})

	it('a string label naming a missing field yields an empty string', () => {
		expect(resolveLabel('missing', row, 'count')).toBe('')
	})

	it('returns null for a label that is neither boolean, string nor function', () => {
		expect(resolveLabel(123, row, 'count')).toBe(null)
	})
})
