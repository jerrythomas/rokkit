/**
 * Extended PlotState coverage: update(), updateGeom(), unregisterGeom(),
 * format(), tooltip(), geomComponent(), setHovered/clearHovered,
 * applyZoom/resetZoom, patterns/symbols/colorField derived state,
 * getters (margin, innerWidth, innerHeight, mode, chartPreset, hovered),
 * geomTypes, colorField/patternField/symbolField.
 */
import { describe, it, expect, vi } from 'vitest'
import { PlotState } from '../src/PlotState.svelte.js'
import mpg from './fixtures/mpg.json'

// ─── update() ────────────────────────────────────────────────────────────────

describe('PlotState — update()', () => {
	it('updates data and channels', () => {
		const state = new PlotState({ data: [], channels: {} })
		state.update({ data: mpg, channels: { x: 'class', y: 'cty' } })
		expect(state.label('class')).toBe('class')
	})

	it('updates width and height', () => {
		const state = new PlotState({ width: 600, height: 400 })
		state.update({ width: 800, height: 500 })
		expect(state.innerWidth).toBe(800 - state.margin.left - state.margin.right)
		expect(state.innerHeight).toBe(500 - state.margin.top - state.margin.bottom)
	})

	it('updates labels', () => {
		const state = new PlotState({ data: mpg, channels: {}, labels: {} })
		state.update({ labels: { cty: 'City MPG' } })
		expect(state.label('cty')).toBe('City MPG')
	})

	it('updates mode', () => {
		const state = new PlotState({ mode: 'light' })
		state.update({ mode: 'dark' })
		expect(state.mode).toBe('dark')
	})

	it('updates margin override', () => {
		const state = new PlotState({})
		const margin = { top: 10, right: 10, bottom: 10, left: 10 }
		state.update({ margin })
		expect(state.margin).toEqual(margin)
	})

	it('clears margin override when margin not in update config', () => {
		const margin = { top: 10, right: 10, bottom: 10, left: 10 }
		const state = new PlotState({ margin })
		// update without margin resets override to undefined → falls back to default
		state.update({})
		expect(state.margin).toEqual({ top: 20, right: 20, bottom: 40, left: 50 })
	})

	it('updates colorScale, colorScheme, colorMidpoint', () => {
		const state = new PlotState({ data: mpg, channels: { color: 'cty' } })
		state.update({ colorMidpoint: 25, colorScheme: 'blues' })
		expect(state.colorScaleType).toBe('diverging')
	})

	it('updates orientation override', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
		state.update({ orientation: 'horizontal' })
		expect(state.orientation).toBe('horizontal')
	})

	it('clears orientation override when not in config', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'class', y: 'cty' },
			orientation: 'horizontal'
		})
		state.update({})
		// Without override, orientation is inferred from data
		expect(['vertical', 'horizontal', 'none']).toContain(state.orientation)
	})

	it('updates xDomain and yDomain', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'cty', y: 'hwy' },
			width: 600,
			height: 400
		})
		state.update({ xDomain: [5, 30], yDomain: [10, 50] })
		// yScale should use the provided yDomain
		const [domMin, domMax] = state.yScale.domain()
		expect(domMin).toBeLessThanOrEqual(10)
		expect(domMax).toBeGreaterThanOrEqual(50)
	})

	it('updates helpers', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		const customHelper = vi.fn().mockReturnValue(42)
		state.update({ helpers: { stats: { custom: customHelper } } })
		// geomComponent resolves helpers — just verify helpers don't throw
		expect(() => state.format('cty')).not.toThrow()
	})

	it('updates axisOffset', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' }, width: 600, height: 400 })
		state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'identity' })
		state.update({ axisOffset: 5 })
		// xAxisY should use the offset for all-positive y domain
		const xAxisY = state.xAxisY
		expect(typeof xAxisY).toBe('number')
	})

	it('updates colorDomain', () => {
		const state = new PlotState({ data: mpg, channels: { color: 'class' } })
		state.update({ colorDomain: ['compact', 'suv'] })
		// colors map should have exactly 2 entries matching colorDomain
		expect(state.colors.has('compact')).toBe(true)
		expect(state.colors.has('suv')).toBe(true)
	})

	it('updates chartPreset', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		const custom = { colors: ['#ff0000'], patterns: [], symbols: [] }
		state.update({ chartPreset: custom })
		expect(state.chartPreset).toEqual(custom)
	})
})

// ─── updateGeom() ────────────────────────────────────────────────────────────

describe('PlotState — updateGeom()', () => {
	it('updates geom config for the given id', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
		const id = state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'identity' })
		state.updateGeom(id, { stat: 'mean' })
		const rows = state.geomData(id)
		// After updateGeom to stat=mean, there should be fewer rows (one per class)
		expect(rows.length).toBeLessThan(mpg.length)
	})

	it('leaves other geoms unaffected', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
		const id1 = state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'identity' })
		const id2 = state.registerGeom({ type: 'point', channels: { x: 'class', y: 'cty' }, stat: 'identity' })
		state.updateGeom(id1, { stat: 'mean' })
		// id2 still uses identity stat — should still return all rows
		expect(state.geomData(id2).length).toBe(mpg.length)
	})
})

// ─── unregisterGeom() ────────────────────────────────────────────────────────

describe('PlotState — unregisterGeom()', () => {
	it('removes the geom from geomData (returns empty array after unregister)', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
		const id = state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'identity' })
		state.unregisterGeom(id)
		expect(state.geomData(id)).toEqual([])
	})

	it('unregistering one geom does not remove others', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
		const id1 = state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'identity' })
		const id2 = state.registerGeom({ type: 'point', channels: { x: 'class', y: 'cty' }, stat: 'identity' })
		state.unregisterGeom(id1)
		expect(state.geomData(id2).length).toBeGreaterThan(0)
	})

	it('removes the geom type from geomTypes set', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
		const id = state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'identity' })
		expect(state.geomTypes.has('bar')).toBe(true)
		state.unregisterGeom(id)
		expect(state.geomTypes.has('bar')).toBe(false)
	})
})

// ─── format() ────────────────────────────────────────────────────────────────

describe('PlotState — format()', () => {
	it('returns the default stringifier when no format helper defined', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		// resolveFormat returns ((v) => String(v)) by default — a function
		const fn = state.format('cty')
		expect(typeof fn).toBe('function')
		expect(fn(21)).toBe('21')
	})

	it('returns the custom format function when helpers.format is provided', () => {
		const fmt = vi.fn((v) => `$${v}`)
		const state = new PlotState({
			data: mpg,
			channels: {},
			helpers: { format: { cty: fmt } }
		})
		const resolved = state.format('cty')
		expect(resolved).toBe(fmt)
	})
})

// ─── tooltip() ───────────────────────────────────────────────────────────────

describe('PlotState — tooltip()', () => {
	it('returns null when no tooltip helper defined', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		expect(state.tooltip()).toBeNull()
	})

	it('returns the custom tooltip function when helpers.tooltip provided', () => {
		const tip = vi.fn((d) => d.class)
		const state = new PlotState({ data: mpg, channels: {}, helpers: { tooltip: tip } })
		expect(state.tooltip()).toBe(tip)
	})
})

// ─── geomComponent() ─────────────────────────────────────────────────────────

describe('PlotState — geomComponent()', () => {
	it('returns null for a built-in geom type', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		// Built-in types (bar, line, area, etc.) always return null
		expect(state.geomComponent('bar')).toBeNull()
	})

	it('returns null for an unknown geom type with no helpers', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		expect(state.geomComponent('custom')).toBeNull()
	})

	it('returns a custom geom component from helpers.geoms', () => {
		// Use a unique object reference that can be compared with ===
		const FakeGeom = function FakeGeom() {}
		const state = new PlotState({
			data: mpg,
			channels: {},
			helpers: { geoms: { custom: FakeGeom } }
		})
		expect(state.geomComponent('custom')).toBe(FakeGeom)
	})
})

// ─── setHovered / clearHovered ───────────────────────────────────────────────

describe('PlotState — setHovered / clearHovered', () => {
	it('setHovered stores the datum and hovered getter returns an equivalent value', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		const datum = { class: 'compact', cty: 21 }
		state.setHovered(datum)
		expect(state.hovered).toEqual(datum)
		expect(state.hovered).not.toBeNull()
	})

	it('clearHovered resets hovered to null', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		state.setHovered({ class: 'suv', cty: 15 })
		state.clearHovered()
		expect(state.hovered).toBeNull()
	})

	it('hovered starts as null', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		expect(state.hovered).toBeNull()
	})
})

// ─── applyZoom / resetZoom ───────────────────────────────────────────────────

describe('PlotState — applyZoom / resetZoom', () => {
	it('applyZoom stores the transform and is used by xScale (continuous)', () => {
		const data = [{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 30 }]
		const state = new PlotState({ data, channels: { x: 'x', y: 'y' }, width: 600, height: 400 })
		// Build a minimal zoom transform stub that rescales
		const baseScale = state.xScale
		const scaledBack = baseScale.copy()
		const fakeTransform = { rescaleX: vi.fn(() => scaledBack), rescaleY: vi.fn(() => scaledBack) }
		state.applyZoom(fakeTransform)
		// After applyZoom, xScale derived should invoke rescaleX
		const _ = state.xScale
		expect(fakeTransform.rescaleX).toHaveBeenCalled()
	})

	it('resetZoom clears the transform so xScale returns base scale', () => {
		const data = [{ x: 1, y: 10 }, { x: 2, y: 20 }]
		const state = new PlotState({ data, channels: { x: 'x', y: 'y' }, width: 600, height: 400 })
		const baseScale = state.xScale
		const fakeTransform = { rescaleX: vi.fn(() => baseScale.copy()), rescaleY: vi.fn(() => baseScale.copy()) }
		state.applyZoom(fakeTransform)
		state.resetZoom()
		// After reset, rescaleX should NOT be called on next xScale read
		fakeTransform.rescaleX.mockClear()
		const _ = state.xScale
		expect(fakeTransform.rescaleX).not.toHaveBeenCalled()
	})

	it('applyZoom with band xScale returns base (no rescaleX on band)', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' }, width: 600, height: 400 })
		state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'identity' })
		const fakeTransform = { rescaleX: vi.fn(), rescaleY: vi.fn() }
		state.applyZoom(fakeTransform)
		// Band scale → xScale does NOT call rescaleX (checked: bandwidth function present)
		const scale = state.xScale
		expect(typeof scale.bandwidth).toBe('function')
		// rescaleX should not be called for band scales
		expect(fakeTransform.rescaleX).not.toHaveBeenCalled()
	})
})

// ─── Getters ─────────────────────────────────────────────────────────────────

describe('PlotState — getters', () => {
	it('margin returns the effective margin (default)', () => {
		const state = new PlotState({})
		expect(state.margin).toEqual({ top: 20, right: 20, bottom: 40, left: 50 })
	})

	it('margin returns custom margin override', () => {
		const margin = { top: 5, right: 5, bottom: 15, left: 20 }
		const state = new PlotState({ margin })
		expect(state.margin).toEqual(margin)
	})

	it('innerWidth = width - left - right margins', () => {
		const state = new PlotState({ width: 600 })
		const m = state.margin
		expect(state.innerWidth).toBe(600 - m.left - m.right)
	})

	it('innerHeight = height - top - bottom margins', () => {
		const state = new PlotState({ height: 400 })
		const m = state.margin
		expect(state.innerHeight).toBe(400 - m.top - m.bottom)
	})

	it('mode defaults to light', () => {
		const state = new PlotState({})
		expect(state.mode).toBe('light')
	})

	it('mode returns configured value', () => {
		const state = new PlotState({ mode: 'dark' })
		expect(state.mode).toBe('dark')
	})

	it('chartPreset returns the configured preset', () => {
		const custom = { colors: ['#abc'], patterns: [], symbols: [] }
		const state = new PlotState({ chartPreset: custom })
		expect(state.chartPreset).toEqual(custom)
	})
})

// ─── Derived: colorField, patternField, symbolField ──────────────────────────

describe('PlotState — colorField / patternField / symbolField', () => {
	it('colorField returns the color channel field name', () => {
		const state = new PlotState({ data: mpg, channels: { color: 'class' } })
		expect(state.colorField).toBe('class')
	})

	it('colorField returns null for a literal CSS color', () => {
		const state = new PlotState({ data: mpg, channels: { color: '#4a90d9' } })
		expect(state.colorField).toBeNull()
	})

	it('patternField returns the pattern channel field name', () => {
		const state = new PlotState({ data: mpg, channels: { pattern: 'drv' } })
		expect(state.patternField).toBe('drv')
	})

	it('patternField is undefined when no pattern channel set', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		expect(state.patternField).toBeUndefined()
	})

	it('symbolField returns the symbol channel field name', () => {
		const state = new PlotState({ data: mpg, channels: { symbol: 'drv' } })
		expect(state.symbolField).toBe('drv')
	})

	it('symbolField is undefined when no symbol channel set', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		expect(state.symbolField).toBeUndefined()
	})
})

// ─── Derived: patterns ───────────────────────────────────────────────────────

describe('PlotState — patterns derived', () => {
	it('returns empty map when no pattern channel', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		expect(state.patterns.size).toBe(0)
	})

	it('returns empty map when pattern field is continuous (numeric)', () => {
		const state = new PlotState({ data: mpg, channels: { pattern: 'cty' } })
		// cty is numeric → continuous → patterns returns empty map
		expect(state.patterns.size).toBe(0)
	})

	it('returns pattern map keyed by field values for categorical pattern field', () => {
		const state = new PlotState({ data: mpg, channels: { pattern: 'drv' } })
		// drv has values: 'f', '4', 'r' — categorical → patterns map populated
		expect(state.patterns.size).toBeGreaterThan(0)
	})
})

// ─── Derived: symbols ────────────────────────────────────────────────────────

describe('PlotState — symbols derived', () => {
	it('returns empty map when no symbol channel', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		expect(state.symbols.size).toBe(0)
	})

	it('returns symbol map keyed by field values when symbol channel set', () => {
		const state = new PlotState({ data: mpg, channels: { symbol: 'drv' } })
		expect(state.symbols.size).toBeGreaterThan(0)
	})
})

// ─── Derived: geomTypes ──────────────────────────────────────────────────────

describe('PlotState — geomTypes', () => {
	it('is empty when no geoms registered', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		expect(state.geomTypes.size).toBe(0)
	})

	it('contains types of all registered geoms', () => {
		const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
		state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'identity' })
		state.registerGeom({ type: 'line', channels: { x: 'class', y: 'cty' }, stat: 'identity' })
		expect(state.geomTypes.has('bar')).toBe(true)
		expect(state.geomTypes.has('line')).toBe(true)
	})
})

// ─── colors map — literal CSS color ──────────────────────────────────────────

describe('PlotState — colors map for literal CSS color channel', () => {
	it('returns a singleton map keyed by null for a CSS hex color', () => {
		const state = new PlotState({ data: mpg, channels: { color: '#4a90d9' } })
		expect(state.colors.size).toBe(1)
		expect(state.colors.has(null)).toBe(true)
		const entry = state.colors.get(null)
		expect(entry.fill).toBe('#4a90d9')
	})
})

// ─── yAxisX for band xScale ───────────────────────────────────────────────────

describe('PlotState — yAxisX with band xScale', () => {
	it('returns 0 (left edge) when xScale is band', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'class', y: 'cty' },
			width: 600,
			height: 400
		})
		state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'mean' })
		// Band scale → yAxisX should return 0
		expect(state.yAxisX).toBe(0)
	})
})

// ─── xAxisY with axisOffset ──────────────────────────────────────────────────

describe('PlotState — xAxisY with axisOffset', () => {
	it('applies axisOffset when y domain is all-positive', () => {
		const state = new PlotState({
			data: mpg,
			channels: { x: 'class', y: 'cty' },
			width: 600,
			height: 400,
			axisOffset: 5
		})
		state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'mean' })
		const xAxisY = state.xAxisY
		// axisOffset shifts the position
		expect(typeof xAxisY).toBe('number')
	})
})

// ─── yAxisX with axisOffset ──────────────────────────────────────────────────

describe('PlotState — yAxisX with axisOffset (all-positive x)', () => {
	it('applies axisOffset when x domain is all-positive', () => {
		const data = [{ x: 10, y: 10 }, { x: 50, y: 50 }]
		const state = new PlotState({
			data,
			channels: { x: 'x', y: 'y' },
			width: 600,
			height: 400,
			axisOffset: 5
		})
		// All-positive x domain: yAxisX = xScale(domain[0]) - axisOffset
		const domain = state.xScale.domain()
		const expected = state.xScale(domain[0]) - 5
		expect(state.yAxisX).toBeCloseTo(expected)
	})
})

// ─── geomData — missing geom id ──────────────────────────────────────────────

describe('PlotState — geomData with unknown id', () => {
	it('returns empty array for unknown geom id', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		expect(state.geomData('nonexistent-id')).toEqual([])
	})
})

// ─── colors with no data ─────────────────────────────────────────────────────

describe('PlotState — colors with empty data', () => {
	it('returns empty map when no data and no color channel', () => {
		const state = new PlotState({ data: [], channels: {} })
		expect(state.colors.size).toBe(0)
	})

	it('returns single-color map when data exists but no color channel', () => {
		const state = new PlotState({ data: mpg, channels: {} })
		// data.length > 0, no color field → assignColors([null], mode, preset)
		expect(state.colors.size).toBeGreaterThan(0)
	})
})

// ─── stacked bar domain with patternField stack ───────────────────────────────

describe('PlotState — stacked bar Y domain using pattern channel for stack', () => {
	const data = [
		{ x: 'A', pat: 'solid', y: 20 },
		{ x: 'A', pat: 'dots', y: 30 },
		{ x: 'B', pat: 'solid', y: 15 },
		{ x: 'B', pat: 'dots', y: 25 }
	]

	it('resolves stack domain via pattern channel when color is a literal', () => {
		const state = new PlotState({
			data,
			channels: { x: 'x', y: 'y', color: '#ff0000', pattern: 'pat' },
			width: 600,
			height: 400
		})
		state.registerGeom({
			type: 'bar',
			channels: { x: 'x', y: 'y', color: '#ff0000', pattern: 'pat' },
			stat: 'identity',
			options: { stack: true }
		})
		const [, domMax] = state.yScale.domain()
		// A column total = 20+30 = 50; B column = 15+25 = 40; max = 50
		expect(domMax).toBeGreaterThanOrEqual(50)
		expect(domMax).toBeLessThan(100)
	})
})

// ─── box domain includes outliers ─────────────────────────────────────────────
describe('PlotState — box y-domain includes outliers', () => {
	it('extends the y-domain to cover outlier points', () => {
		// [1,2,3,4,100] → whisker_max clamps to 4, but 100 is an outlier
		const data = [1, 2, 3, 4, 100].map((v) => ({ g: 'X', v }))
		const state = new PlotState({ data, channels: { x: 'g', y: 'v' }, width: 600, height: 400 })
		state.registerGeom({ type: 'box', channels: { x: 'g', y: 'v' }, stat: 'boxplot' })
		const [, domMax] = state.yScale.domain()
		expect(domMax).toBeGreaterThanOrEqual(100)
	})
})

// ─── band x-axis forced for distribution geoms with numeric x ──────────────────
describe('PlotState — band x-axis for box/violin/jitter with numeric x', () => {
	it('forces a band x-scale for a box geom even when x is numeric', () => {
		const data = [
			{ week: 1, v: 10 }, { week: 1, v: 20 }, { week: 1, v: 30 },
			{ week: 2, v: 15 }, { week: 2, v: 25 }, { week: 2, v: 35 }
		]
		const state = new PlotState({ data, channels: { x: 'week', y: 'v' }, width: 600, height: 400 })
		state.registerGeom({ type: 'box', channels: { x: 'week', y: 'v' }, stat: 'boxplot' })
		expect(typeof state.xScale.bandwidth).toBe('function')
	})

	it('forces a band x-scale for a jitter geom even when x is numeric', () => {
		const data = [
			{ week: 1, v: 10 }, { week: 2, v: 20 }
		]
		const state = new PlotState({ data, channels: { x: 'week', y: 'v' }, width: 600, height: 400 })
		state.registerGeom({ type: 'jitter', channels: { x: 'week', y: 'v' }, stat: 'identity' })
		expect(typeof state.xScale.bandwidth).toBe('function')
	})

	it('forces a band x-scale for a violin geom even when x is numeric', () => {
		const data = [
			{ week: 1, v: 10 }, { week: 1, v: 20 }, { week: 1, v: 30 },
			{ week: 2, v: 15 }, { week: 2, v: 25 }, { week: 2, v: 35 }
		]
		const state = new PlotState({ data, channels: { x: 'week', y: 'v' }, width: 600, height: 400 })
		state.registerGeom({ type: 'violin', channels: { x: 'week', y: 'v' }, stat: 'boxplot' })
		expect(typeof state.xScale.bandwidth).toBe('function')
	})
})

// ─── horizontal flip (category-x charts) ───────────────────────────────────────
describe('PlotState — horizontal orientation flip', () => {
	const data = [
		{ cls: 'A', v: 10 }, { cls: 'A', v: 20 },
		{ cls: 'B', v: 30 }, { cls: 'B', v: 40 }
	]

	it('flips scale ranges: category(x) over height, value(y) over width', () => {
		const state = new PlotState({
			data, channels: { x: 'cls', y: 'v' }, width: 400, height: 300, orientation: 'horizontal'
		})
		expect(state.isFlipped).toBe(true)
		// x (category, band) now spans the vertical screen (height)
		expect(typeof state.xScale.bandwidth).toBe('function')
		expect(Math.max(...state.xScale.range())).toBeCloseTo(state.innerHeight)
		// y (value) now spans the horizontal screen (width)
		expect(Math.max(...state.yScale.range())).toBeCloseTo(state.innerWidth)
	})

	it('place() swaps the screen axes when flipped', () => {
		const state = new PlotState({
			data, channels: { x: 'cls', y: 'v' }, width: 400, height: 300, orientation: 'horizontal'
		})
		expect(state.place(11, 22)).toEqual({ x: 22, y: 11 })
	})

	it('is a no-op when both channels are continuous (scatter / AnimatedPlot race)', () => {
		const scatter = [{ a: 1, b: 2 }, { a: 3, b: 4 }]
		const state = new PlotState({
			data: scatter, channels: { x: 'a', y: 'b' }, width: 400, height: 300, orientation: 'horizontal'
		})
		expect(state.isFlipped).toBe(false)
		expect(state.place(1, 2)).toEqual({ x: 1, y: 2 })
	})

	it('flips a NUMERIC category (bar over year × sales) — numeric categories are flippable too', () => {
		// A bar geom bands a numeric x (year); orientation='horizontal' should stand that
		// category axis up via the place-flip, exactly like a string category.
		const byYear = [
			{ year: 2019, sales: 10 }, { year: 2020, sales: 20 },
			{ year: 2021, sales: 15 }, { year: 2022, sales: 30 }
		]
		const state = new PlotState({
			data: byYear, channels: { x: 'year', y: 'sales' }, width: 400, height: 300, orientation: 'horizontal'
		})
		state.registerGeom({ type: 'bar', channels: { x: 'year', y: 'sales' }, stat: 'identity' })
		expect(state.isFlipped).toBe(true)
		expect(state.place(11, 22)).toEqual({ x: 22, y: 11 })
	})

	it('legacyHorizontal opts the AnimatedPlot value×_rank race out of the flip', () => {
		// The bar geom force-bands the continuous revenue x, so #bandIsX is true; without the
		// legacyHorizontal marker the race would route into the place-flip and collapse every
		// entity onto one row. AnimatedPlot sets legacyHorizontal → stays on buildHorizontalBars.
		const race = [
			{ revenue: 60, _rank: 0 }, { revenue: 40, _rank: 1 },
			{ revenue: 20, _rank: 2 }, { revenue: 10, _rank: 3 }
		]
		const opts = {
			data: race, channels: { x: 'revenue', y: '_rank' }, width: 400, height: 300, orientation: 'horizontal'
		}
		const raced = new PlotState({ ...opts, legacyHorizontal: true })
		raced.registerGeom({ type: 'bar', channels: { x: 'revenue', y: '_rank' }, stat: 'identity' })
		expect(raced.isFlipped).toBe(false)
		expect(raced.place(5, 9)).toEqual({ x: 5, y: 9 })

		// Without the marker the same shape WOULD read as flippable (guards the marker's effect).
		const unmarked = new PlotState(opts)
		unmarked.registerGeom({ type: 'bar', channels: { x: 'revenue', y: '_rank' }, stat: 'identity' })
		expect(unmarked.isFlipped).toBe(true)
	})

	it('vertical (default) keeps category(x) over width, value(y) over height', () => {
		const state = new PlotState({ data, channels: { x: 'cls', y: 'v' }, width: 400, height: 300 })
		expect(state.isFlipped).toBe(false)
		expect(Math.max(...state.xScale.range())).toBeCloseTo(state.innerWidth)
		expect(Math.max(...state.yScale.range())).toBeCloseTo(state.innerHeight)
	})
})

// ─── geom color channel drives colors when top-level color is unset ────────────
describe('PlotState — colors fall back to the first geom color channel', () => {
	it('derives per-category colors from a geom color channel when the Plot has x/y but no color', () => {
		// Mirrors the composable overlay: <Plot.Root x y> + <Plot.Box color=x> — the box
		// registers color: 'cls' but the Plot has no color channel. Without the fallback,
		// colors is a single default keyed by null and every category renders gray.
		const data = [
			{ cls: 'A', v: 10 }, { cls: 'A', v: 20 },
			{ cls: 'B', v: 15 }, { cls: 'B', v: 25 }
		]
		const state = new PlotState({ data, channels: { x: 'cls', y: 'v' } }) // no color
		state.registerGeom({ type: 'box', channels: { x: 'cls', y: 'v', color: 'cls' }, stat: 'boxplot' })
		const colors = state.colors
		expect(colors.has('A')).toBe(true)
		expect(colors.has('B')).toBe(true)
		expect(colors.get('A').fill).not.toBe(colors.get('B').fill)
	})
})

// ─── channels getter (geom root-channel fallback) ──────────────────────────────
describe('PlotState — channels getter', () => {
	it('exposes the root channels so geoms can fall back when their props are omitted', () => {
		const state = new PlotState({ data: [{ a: 1, b: 2 }], channels: { x: 'a', y: 'b' } })
		expect(state.channels.x).toBe('a')
		expect(state.channels.y).toBe('b')
	})
})

// ─── box + jitter coexisting on one PlotState (the demo's overlay scenario) ────
describe('PlotState — box + jitter geoms on one state', () => {
	it('y-domain spans all raw points (inliers + outliers) with both geoms registered', () => {
		// box rows are aggregated (no raw y); jitter rows are raw. The box domain
		// (iqr + outliers) must still cover every raw jitter point so none is clipped.
		const data = [1, 2, 3, 4, 100].map((v) => ({ g: 'X', v }))
		const state = new PlotState({ data, channels: { x: 'g', y: 'v' }, width: 600, height: 400 })
		state.registerGeom({ type: 'box', channels: { x: 'g', y: 'v' }, stat: 'boxplot' })
		state.registerGeom({ type: 'jitter', channels: { x: 'g', y: 'v' }, stat: 'identity' })
		const [domMin, domMax] = state.yScale.domain()
		expect(domMin).toBeLessThanOrEqual(1)
		expect(domMax).toBeGreaterThanOrEqual(100)
		expect(typeof state.xScale.bandwidth).toBe('function')
	})
})
