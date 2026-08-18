import { describe, it, expect } from 'vitest'
import { PlotState } from '../src/PlotState.svelte.js'
import { defaultPreset } from '../src/lib/preset.js'

const data = [
	{ region: 'North', product: 'A', v: 1 },
	{ region: 'South', product: 'B', v: 2 },
	{ region: 'North', product: 'C', v: 3 }
]

describe('PlotState — fill/color shared categorical scale (Phase 2)', () => {
	it('backward-compat: a single color field yields the same domain as before', () => {
		const s = new PlotState({ data, channels: { x: 'region', y: 'v', color: 'region' } })
		expect([...s.colors.keys()]).toEqual(['North', 'South'])
	})

	it('unions fill + color field values into one shared palette', () => {
		const s = new PlotState({
			data,
			channels: { x: 'region', y: 'v', color: 'region', fill: 'product' }
		})
		const keys = [...s.colors.keys()]
		expect(keys).toEqual(expect.arrayContaining(['North', 'South', 'A', 'B', 'C']))
	})

	it('merges a fill channel from a registered geom into the shared scale', () => {
		const s = new PlotState({ data, channels: { x: 'region', y: 'v' } })
		s.registerGeom({ type: 'area', channels: { x: 'region', y: 'v', fill: 'product' } })
		expect([...s.colors.keys()]).toEqual(expect.arrayContaining(['A', 'B', 'C']))
	})

	it('unions color fields across multiple geoms (multi-geom scale union)', () => {
		const s = new PlotState({ data, channels: { x: 'region', y: 'v' } })
		s.registerGeom({ type: 'bar', channels: { color: 'region' } })
		s.registerGeom({ type: 'point', channels: { color: 'product' } })
		expect([...s.colors.keys()]).toEqual(
			expect.arrayContaining(['North', 'South', 'A', 'B', 'C'])
		)
	})

	it('exposes fillField (parallel to colorField) from the effective channels', () => {
		const s = new PlotState({ data, channels: {} })
		s.registerGeom({ type: 'area', channels: { fill: 'product' } })
		expect(s.fillField).toBe('product')
	})

	it('fillField is null for a literal CSS color', () => {
		const s = new PlotState({ data, channels: { fill: '#4a90d9' } })
		expect(s.fillField).toBeNull()
	})

	it('passes a var(--token) color straight through to the mark (theme-reactive)', () => {
		const s = new PlotState({ data, channels: { x: 'region', y: 'v', color: 'var(--accent)' } })
		// Not treated as a data field...
		expect(s.colorField).toBeNull()
		// ...and every mark resolves to the literal token, so it stays [data-mode]-reactive.
		expect(s.colors.get(null)).toEqual({ fill: 'var(--accent)', stroke: 'var(--accent)' })
	})

	it('passes currentColor straight through to the mark', () => {
		const s = new PlotState({ data, channels: { x: 'region', y: 'v', color: 'currentColor' } })
		expect(s.colorField).toBeNull()
		expect(s.colors.get(null)).toEqual({ fill: 'currentColor', stroke: 'currentColor' })
	})
})

describe('preset.opacity covers every geom (Phase 2)', () => {
	it('has a numeric opacity default for all geoms', () => {
		const geoms = [
			'area', 'bar', 'line', 'point', 'arc', 'box', 'violin', 'jitter',
			'heatmap', 'candlestick', 'hexbin', 'ribbon', 'waterfall', 'rule'
		]
		for (const g of geoms) {
			expect(typeof defaultPreset.opacity[g], `opacity.${g}`).toBe('number')
		}
	})
})
