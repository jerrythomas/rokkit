/* The layers demo's HOST side (#167): rokkit's intended package layering, assigned by the demo
 * — the library computes no depth. Every cross-package import should point down; the spec
 * checks that the demo data says so honestly, and that the issue's sample has its one climb.
 */
import { describe, it, expect } from 'vitest'
import { PACKAGE_LAYERS, LAYER_LABELS, layerOfComponent } from '../../src/lib/koan/demos/graph/layers'
import { datasets } from '../../src/lib/koan/demos/graph/datasets'
import { normalizeGraph, layers } from '@rokkit/graph'

describe('rokkit’s intended package layers', () => {
	it('give every package a layer and every layer a label', () => {
		const packages = ['actions', 'app', 'blocks', 'chart', 'cli', 'core', 'data', 'forms', 'graph', 'helpers', 'states', 'themes', 'ui', 'unocss']
		for (const p of packages) expect(PACKAGE_LAYERS[p], p).toBeTypeOf('number')
		const used = new Set(Object.values(PACKAGE_LAYERS))
		for (const l of used) expect(LAYER_LABELS[l], `layer ${l}`).toBeTypeOf('string')
	})

	it('place a component in its package’s layer', () => {
		expect(layerOfComponent('ui/components')).toBe(PACKAGE_LAYERS.ui)
		expect(layerOfComponent('core')).toBe(PACKAGE_LAYERS.core)
	})

	it('are honoured by rokkit’s real imports — no import climbs a layer', () => {
		const data = datasets.layers
		const r = layers(normalizeGraph(data.nodes, data.edges, data.fields), {})
		expect(r.edges.filter((e) => e.conformance === 'up')).toEqual([])
		expect(r.edges.some((e) => e.conformance === 'down' || e.conformance === 'skip')).toBe(true)
	})
})

describe('the issue’s sample', () => {
	it('has exactly the one climbing edge #167 describes', () => {
		const data = datasets['layers-sample']
		const r = layers(normalizeGraph(data.nodes, data.edges, data.fields), {})
		expect(r.edges.filter((e) => e.conformance === 'up').map((e) => `${e.fromKey}>${e.toKey}`)).toEqual(['mod:db>mod:tasks'])
	})
})
