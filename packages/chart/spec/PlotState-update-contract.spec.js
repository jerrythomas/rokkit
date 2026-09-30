/**
 * The update() contract, field by field — pinned before PlotState is decomposed.
 *
 * update() treats its fields two ways, and nothing in the code says which is which:
 *  - KEEP: omitting the field leaves the previous value (data, width, mode…)
 *  - RESET: omitting it restores the default (margin, xDomain, orientation…) — these are
 *    overrides, and an override the caller stopped passing must stop applying.
 * PlotConfig turns this into a declarative table; this spec is what proves the table
 * reproduces today's behaviour exactly.
 */
import { describe, it, expect } from 'vitest'
import { PlotState } from '../src/PlotState.svelte.js'
import { createChartPreset } from '../src/lib/preset.js'

const data = [
	{ x: 1, y: 10, g: 'a' },
	{ x: 2, y: 20, g: 'b' },
	{ x: 3, y: 5, g: 'a' }
]
const base = { data, channels: { x: 'x', y: 'y', color: 'g' } }
const onselect = () => {}
const custom = createChartPreset({ colors: ['rose', 'teal'] })

/**
 * [field, a value that differs from the default, how to observe it, KEEP | RESET].
 * `observe` reads only public surface, so the table survives the refactor unchanged.
 */
const CASES = [
	['data', [{ x: 9, y: 9, g: 'z' }], (s) => s.data.length, 'keep'],
	['channels', { x: 'y', y: 'x' }, (s) => s.channels.x, 'keep'],
	['labels', { y: 'Why' }, (s) => s.label('y'), 'keep'],
	['helpers', { format: { y: () => 'F' } }, (s) => s.format('y')?.(1), 'keep'],
	['preset', 'print', (s) => JSON.stringify(s.preset()), 'keep'],
	['colorMidpoint', 12, (s) => s.colorScaleType, 'keep', { channels: { x: 'x', y: 'y', color: 'y' } }],
	['colorScale', 'diverging', (s) => s.colorScaleType, 'keep', { channels: { x: 'x', y: 'y', color: 'y' } }],
	['colorScheme', 'reds', (s) => s.continuousColorScale?.scale?.(10), 'keep', { channels: { x: 'x', y: 'y', color: 'y' } }],
	['colorDomain', ['b'], (s) => [...s.colors.keys()].join(','), 'reset'],
	['xDomain', [0, 100], (s) => s.xScale.domain().join(','), 'reset'],
	['yDomain', [0, 100], (s) => s.yScale.domain().join(','), 'reset'],
	['width', 900, (s) => s.innerWidth, 'keep'],
	['height', 700, (s) => s.innerHeight, 'keep'],
	['mode', 'dark', (s) => s.mode, 'keep'],
	['chartPreset', custom, (s) => s.chartPreset.colors.join(','), 'keep'],
	['onselect', onselect, (s) => s.interactive, 'keep'],
	['selectable', true, (s) => s.interactive, 'keep'],
	['axisOffset', 7, (s) => s.xAxisY, 'keep'],
	['axisOrigin', [2, 10], (s) => s.axisOrigin.join(','), 'reset'],
	['margin', { top: 1, right: 2, bottom: 3, left: 4 }, (s) => JSON.stringify(s.margin), 'reset'],
	['orientation', 'horizontal', (s) => s.orientation, 'reset'],
	['continuousCategory', true, (s) => s.continuousCategory, 'reset'],
	['sort', 'desc', (s) => s.xScale.domain().join(','), 'reset', { geoms: [{ type: 'bar' }] }]
]

const make = (extra = {}) => {
	const { geoms = [], ...config } = extra
	const state = new PlotState({ ...base, ...config })
	for (const g of geoms) state.registerGeom({ channels: {}, ...g })
	return state
}

describe('PlotState update() — keep or reset, per field', () => {
	it.each(CASES.map(([field, , , rule]) => [field, rule]))(
		'the table covers %s (%s)',
		(field, rule) => {
			expect(['keep', 'reset']).toContain(rule)
		}
	)

	it.each(CASES)('%s: setting it changes what the chart shows', (field, value, observe, _rule, extra = {}) => {
		const state = make(extra)
		const before = observe(state)
		state.update({ ...base, ...extra, [field]: value })
		expect(observe(state), field).not.toEqual(before)
	})

	it.each(CASES)('%s: omitted on the next update → %s', (field, value, observe, rule, extra = {}) => {
		const { geoms: _g, ...configExtra } = extra
		const state = make(extra)
		const fresh = observe(state)
		state.update({ ...base, ...configExtra, [field]: value })
		const set = observe(state)
		// The next update names nothing but the base config, so `field` is omitted.
		state.update({ ...base, ...configExtra, [field]: undefined })
		const { [field]: _omit, ...withoutField } = { ...base, ...configExtra }
		state.update(withoutField)
		expect(observe(state), field).toEqual(rule === 'keep' ? set : fresh)
	})
})

describe('PlotState — row identity the geoms rely on', () => {
	it('data and an identity geom’s rows are the same objects', () => {
		// Geoms look a row up with plotState.data.indexOf(row); a copy would find nothing.
		const state = new PlotState(base)
		const id = state.registerGeom({ type: 'point', channels: {} })
		expect(state.geomData(id)[0]).toBe(state.data[0])
	})
})
