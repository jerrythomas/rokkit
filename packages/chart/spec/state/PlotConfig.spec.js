import { describe, it, expect } from 'vitest'
import { PlotConfig, CONFIG_FIELDS, DEFAULT_MARGIN } from '../../src/state/PlotConfig.svelte.js'
import { defaultPreset } from '../../src/lib/preset.js'

describe('PlotConfig — the declarative keep/reset table', () => {
	it('names every field exactly once, each keep or reset', () => {
		const keys = CONFIG_FIELDS.map((f) => f.key)
		expect(new Set(keys).size).toBe(keys.length)
		for (const f of CONFIG_FIELDS) expect(['keep', 'reset'], f.key).toContain(f.whenOmitted)
	})

	it('resets exactly the override fields', () => {
		const reset = CONFIG_FIELDS.filter((f) => f.whenOmitted === 'reset').map((f) => f.key)
		expect(reset.sort()).toEqual(
			['axisOrigin', 'colorDomain', 'continuousCategory', 'margin', 'orientation', 'sort', 'xDomain', 'yDomain'].sort()
		)
	})
})

describe('PlotConfig — values', () => {
	it('applies defaults for everything omitted at construction', () => {
		const c = new PlotConfig()
		expect(c.data).toEqual([])
		expect(c.channels).toEqual({})
		expect(c.width).toBe(600)
		expect(c.height).toBe(400)
		expect(c.mode).toBe('light')
		expect(c.chartPreset.colors).toEqual(defaultPreset.colors)
		expect(c.selectable).toBe(false)
		expect(c.axisOffset).toBe(0)
		expect(c.axisOrigin).toEqual([undefined, undefined])
		expect(c.margin).toBeUndefined()
		expect(c.continuousCategory).toBe(false)
	})

	it('keeps a keep-field and resets a reset-field when update() omits them', () => {
		const c = new PlotConfig({ width: 900, margin: { top: 1, right: 1, bottom: 1, left: 1 } })
		c.update({})
		expect(c.width).toBe(900)
		expect(c.margin).toBeUndefined()
	})

	it('treats an explicit undefined as omitted', () => {
		const c = new PlotConfig({ mode: 'dark', xDomain: [0, 1] })
		c.update({ mode: undefined, xDomain: undefined })
		expect(c.mode).toBe('dark')
		expect(c.xDomain).toBeUndefined()
	})

	it('lets axisOrigin be set directly — a documented escape hatch', () => {
		const c = new PlotConfig()
		c.axisOrigin = [0, 0]
		expect(c.axisOrigin).toEqual([0, 0])
	})

	it('exposes the default margin for the frame to fall back on', () => {
		expect(DEFAULT_MARGIN).toEqual({ top: 20, right: 20, bottom: 40, left: 50 })
	})
})

describe('PlotConfig — helper resolution', () => {
	it('labels a field from the labels map, else the field name', () => {
		const c = new PlotConfig({ labels: { y: 'Why' } })
		expect(c.label('y')).toBe('Why')
		expect(c.label('x')).toBe('x')
	})

	it('resolves format, tooltip, geom components and presets through helpers', () => {
		const fmt = () => 'F'
		const tip = () => 'T'
		const Custom = () => null
		const c = new PlotConfig({ helpers: { format: { y: fmt }, tooltip: tip, geoms: { custom: Custom } } })
		expect(c.format('y')).toBe(fmt)
		expect(c.tooltip()).toBe(tip)
		expect(c.geomComponent('custom')).toBe(Custom)
		expect(c.resolvedPreset()).toBeTruthy()
	})
})
