import { describe, it, expect } from 'vitest'
import { registry, chartTypes } from '../../src/lib/koan/demos/chart/registry'
import { datasets } from '../../src/lib/koan/demos/chart/datasets'
import { ChartExplorerStore } from '../../src/lib/koan/demos/chart/store.svelte'

describe('chart explorer — registry', () => {
	it('has all 14 types across the two groups', () => {
		expect(chartTypes).toHaveLength(14)
		const charts = chartTypes.filter((t) => t.group === 'Charts')
		const geoms = chartTypes.filter((t) => t.group === 'Geoms')
		expect(charts).toHaveLength(8)
		expect(geoms).toHaveLength(6)
	})

	it('every type points at an existing dataset and has non-empty applies + tips', () => {
		for (const t of chartTypes) {
			expect(datasets[t.dataset], `${t.id} dataset`).toBeDefined()
			expect(datasets[t.dataset].length, `${t.id} dataset rows`).toBeGreaterThan(0)
			expect(t.applies.length, `${t.id} applies`).toBeGreaterThan(0)
			expect(Array.isArray(t.tips), `${t.id} tips`).toBe(true)
		}
	})

	it('tip targets reference real types', () => {
		for (const t of chartTypes) {
			for (const tip of t.tips) {
				if (tip.to) expect(registry[tip.to], `${t.id} → ${tip.to}`).toBeDefined()
			}
		}
	})
})

describe('chart explorer — datasets shapes', () => {
	it('field mappings exist on the rows', () => {
		for (const t of chartTypes) {
			const row = datasets[t.dataset][0] as Record<string, unknown>
			for (const field of Object.values(t.fields)) {
				expect(field in row, `${t.id}: field "${field}" on ${t.dataset}`).toBe(true)
			}
		}
	})
})

describe('chart explorer — store', () => {
	it('defaults to a bar chart', () => {
		const s = new ChartExplorerStore()
		expect(s.type).toBe('bar')
		expect(s.config.label).toBe('Bar')
	})

	it('select() switches type and resets settings to that type’s defaults + fields', () => {
		const s = new ChartExplorerStore()
		s.set('position', 'stack') // dirty a bar-only setting
		s.select('area')
		expect(s.type).toBe('area')
		expect(s.settings.position).toBe('stack') // area default
		expect(s.settings.fill).toBe('product') // seeded from fields
		expect(s.settings.alpha).toBe(0.7) // area default
	})

	it('select() seeds color for color-based types and clears fill', () => {
		const s = new ChartExplorerStore()
		s.select('scatter')
		expect(s.settings.color).toBe('class')
		expect(s.settings.fill).toBe('')
	})

	it('applies() reflects the active type’s setting list', () => {
		const s = new ChartExplorerStore()
		s.select('bar')
		expect(s.applies('position')).toBe(true)
		expect(s.applies('innerRadius')).toBe(false)
		s.select('pie')
		expect(s.applies('innerRadius')).toBe(true)
		expect(s.applies('position')).toBe(false)
	})

	it('apply() follows a tip: switching type and/or setting values', () => {
		const s = new ChartExplorerStore()
		s.apply({ text: 'stack them', set: { position: 'stack' } })
		expect(s.settings.position).toBe('stack')
		s.apply({ text: 'see a violin', to: 'violin' })
		expect(s.type).toBe('violin')
	})

	it('toggleDrawer() opens and closes', () => {
		const s = new ChartExplorerStore()
		expect(s.drawerOpen).toBe(false)
		s.toggleDrawer()
		expect(s.drawerOpen).toBe(true)
		s.toggleDrawer(false)
		expect(s.drawerOpen).toBe(false)
	})
})
