import { describe, it, expect } from 'vitest'
import { GraphConfig, CONFIG_FIELDS } from '../../src/state/GraphConfig.svelte.js'
import { defaultGraphPreset } from '../../src/preset.js'

describe('GraphConfig', () => {
	it('falls back to each field’s default when the config says nothing', () => {
		const c = new GraphConfig({})
		expect({
			nodes: c.nodes,
			edges: c.edges,
			fields: c.fields,
			layout: c.layout,
			focus: c.focus,
			density: c.density,
			arrange: c.arrange,
			groupBy: c.groupBy,
			nestBy: c.nestBy,
			groupTint: c.groupTint,
			sizeBy: c.sizeBy,
			sizeScale: c.sizeScale,
			depth: c.depth,
			focusPath: c.focusPath,
			levels: c.levels,
			root: c.root,
			bundleTension: c.bundleTension,
			radialMode: c.radialMode,
			edgeStyle: c.edgeStyle,
			mode: c.mode,
			label: c.label,
			onselect: c.onselect
		}).toEqual({
			nodes: [],
			edges: [],
			fields: {},
			layout: 'flow',
			focus: null,
			density: 'keys',
			arrange: 'untangle',
			groupBy: 'group',
			nestBy: null,
			groupTint: false,
			sizeBy: 'degree',
			sizeScale: 'linear',
			depth: 1,
			focusPath: [],
			levels: undefined,
			root: null,
			bundleTension: undefined,
			radialMode: 'tree',
			edgeStyle: 'curved',
			mode: 'light',
			label: undefined,
			onselect: undefined
		})
		expect(c.preset).toStrictEqual(defaultGraphPreset)
	})

	it('floors depth at 1 and levels at 1, leaving levels unset when unsaid', () => {
		expect(new GraphConfig({ depth: 0 }).depth).toBe(1)
		expect(new GraphConfig({ depth: 2.7 }).depth).toBe(2)
		expect(new GraphConfig({ levels: 0.5 }).levels).toBe(1)
		expect(new GraphConfig({ levels: 3.9 }).levels).toBe(3)
	})

	it('rejects a nest axis equal to the group axis', () => {
		expect(new GraphConfig({ nestBy: 'group' }).nestBy).toBeNull()
		expect(new GraphConfig({ groupBy: 'kind', nestBy: 'kind' }).nestBy).toBeNull()
		expect(new GraphConfig({ groupBy: 'kind', nestBy: 'group' }).nestBy).toBe('group')
	})

	it('re-applies fully on update, but merges on apply', () => {
		const c = new GraphConfig({ density: 'all', edgeStyle: 'straight' })
		c.update({ edgeStyle: 'straight' })
		expect(c.density).toBe('keys')
		c.update({ density: 'all', mode: 'dark' })
		c.apply({ edgeStyle: 'orthogonal' as never })
		expect([c.density, c.mode, c.edgeStyle]).toEqual(['all', 'dark', 'orthogonal'])
	})

	it('lets the component set density and grouping, with the same nest-axis rule', () => {
		const c = new GraphConfig({})
		c.setDensity('names')
		c.setGrouping('kind', 'kind')
		expect([c.density, c.groupBy, c.nestBy]).toEqual(['names', 'kind', null])
		c.setGrouping('kind', 'group')
		expect(c.nestBy).toBe('group')
		c.setGrouping('group')
		expect(c.nestBy).toBeNull()
	})

	it('declares every field once', () => {
		const keys = CONFIG_FIELDS.map((f) => f.key)
		expect(new Set(keys).size).toBe(keys.length)
	})
})

describe('GraphConfig — fields taken as given', () => {
	it('keeps a null levels / bundleTension / label rather than falling back', () => {
		const c = new GraphConfig({ levels: null as never, bundleTension: null as never, label: null as never })
		expect(c.levels).toBe(1)
		expect(c.bundleTension).toBeNull()
		expect(c.label).toBeNull()
	})
})

describe('GraphConfig — a change made from inside survives the next merge', () => {
	// `apply()` merges over the LAST FULL config. A setter changed only the live value, so the
	// next apply — any component writing its own options — quietly put the old one back: a drill
	// undone, a density reverted, a regrouping lost.
	it.each([
		['setFocusPath', (c: GraphConfig) => c.setFocusPath(['a', 'b']), (c: GraphConfig) => c.focusPath, ['a', 'b']],
		['setDensity', (c: GraphConfig) => c.setDensity('all'), (c: GraphConfig) => c.density, 'all'],
		['setGrouping', (c: GraphConfig) => c.setGrouping('kind', 'group'), (c: GraphConfig) => [c.groupBy, c.nestBy], ['kind', 'group']]
	] as const)('%s', (_name, change, read, expected) => {
		const c = new GraphConfig({ layout: 'world' })
		change(c)
		c.apply({ edgeStyle: 'straight' })
		expect(read(c)).toEqual(expected)
	})
})
