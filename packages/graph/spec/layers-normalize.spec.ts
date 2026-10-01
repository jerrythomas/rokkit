/* #167 — a host-assigned layer per node, and each edge's conformance to the layering. */
import { describe, it, expect } from 'vitest'
import { normalizeGraph } from '../src/model/normalize.js'

const FIELDS = { id: 'id', label: 'name', source: 'source', target: 'target' }

describe('normalizeGraph — layers', () => {
	it('reads a node’s layer, keeps it out of meta, and adds nothing to a node without one', () => {
		const m = normalizeGraph([{ id: 'a', name: 'a', layer: 2 }, { id: 'b', name: 'b' }], [], FIELDS)
		expect(m.nodes[0].layer).toBe(2)
		expect(m.nodes[0].meta).toEqual({})
		expect(m.nodes[1]).not.toHaveProperty('layer')
	})

	it('reads an edge’s conformance, mapped through fields like any key', () => {
		const m = normalizeGraph(
			[{ id: 'a', name: 'a', tier: 0 }, { id: 'b', name: 'b', tier: 1 }],
			[{ source: 'a', target: 'b', rule: 'up' }, { source: 'b', target: 'a' }],
			{ ...FIELDS, layer: 'tier', conformance: 'rule' }
		)
		expect(m.nodes.map((n) => n.layer)).toEqual([0, 1])
		expect(m.edges[0].conformance).toBe('up')
		expect(m.edges[1]).not.toHaveProperty('conformance')
	})

	it('ignores a conformance outside the vocabulary rather than inventing a style hook', () => {
		const m = normalizeGraph([{ id: 'a', name: 'a' }, { id: 'b', name: 'b' }], [{ source: 'a', target: 'b', conformance: 'sideways' }], FIELDS)
		expect(m.edges[0]).not.toHaveProperty('conformance')
	})
})
