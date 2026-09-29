/* Turning a call GRAPH into a tree, which is what a radial layout can actually draw.
 *
 * A call graph is not a tree: a shared helper has several callers, and recursion makes cycles.
 * A spanning tree picks one parent per node and reports the edges it could not use, so the
 * view can still draw them rather than pretending they are not there.
 */

import { describe, it, expect } from 'vitest'
import { childrenIn, hierarchy } from '../../src/layout/hierarchy.js'
import { normalizeGraph } from '../../src/model/normalize.js'

const model = (nodes: string[], edges: [string, string][]) =>
	normalizeGraph(
		nodes.map((id) => ({ id, label: id })),
		edges.map(([source, target]) => ({ source, target }))
	)

describe('hierarchy', () => {
	it('roots at the nodes nothing calls', () => {
		const h = hierarchy(model(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']]))

		expect(h.roots).toEqual(['a'])
	})

	it('gives each node the depth of its shortest path from a root', () => {
		const h = hierarchy(model(['a', 'b', 'c'], [['a', 'b'], ['b', 'c'], ['a', 'c']]))

		// Nearest wins: `c` is one hop from `a` directly, even though b→c also reaches it.
		expect(h.depthOf.get('c')).toBe(1)
	})

	it('claims a shared callee ONCE, so it draws in one place', () => {
		// Two callers, one helper. A tree gives it one parent; the other call is a non-tree
		// edge, which the view still draws — it just does not define position.
		const h = hierarchy(model(['a', 'b', 'shared'], [['a', 'shared'], ['b', 'shared']]))
		const parents = [...h.childrenOf.values()].flat().filter((id) => id === 'shared')

		expect(parents).toHaveLength(1)
	})

	it('reports the edges the tree could not use', () => {
		const h = hierarchy(model(['a', 'b', 'shared'], [['a', 'shared'], ['b', 'shared']]))

		expect(h.extra.size).toBe(1)
	})

	it('terminates on a cycle and still places every node', () => {
		const h = hierarchy(model(['a', 'b', 'c'], [['a', 'b'], ['b', 'c'], ['c', 'a']]))

		expect(h.depthOf.size).toBe(3)
	})

	it('roots a pure cycle somewhere rather than returning nothing', () => {
		// Every node has an incoming edge, so there is no natural root. Picking one in model
		// order beats rendering an empty canvas for a graph that plainly has nodes.
		const h = hierarchy(model(['a', 'b'], [['a', 'b'], ['b', 'a']]))

		expect(h.roots).toEqual(['a'])
		expect(h.depthOf.size).toBe(2)
	})

	it('reaches a cycle no root can get to', () => {
		// `x` is the only natural root and its walk covers `y`. `a` and `b` reference each
		// other, so neither is a root and neither is reachable — without a second pass they
		// would be absent from the diagram entirely, which looks like missing DATA.
		const h = hierarchy(
			model(
				['x', 'y', 'a', 'b'],
				[
					['x', 'y'],
					['a', 'b'],
					['b', 'a']
				]
			)
		)

		expect(h.depthOf.size).toBe(4)
		expect(h.roots).toContain('a')
	})

	it('treats a disconnected node as its own root', () => {
		const h = hierarchy(model(['a', 'b', 'lonely'], [['a', 'b']]))

		expect(h.roots).toContain('lonely')
		expect(h.depthOf.get('lonely')).toBe(0)
	})

	it('ignores a self-loop, which cannot be its own parent', () => {
		const h = hierarchy(model(['a'], [['a', 'a']]))

		expect(h.roots).toEqual(['a'])
		expect(h.childrenOf.get('a') ?? []).toEqual([])
	})

	it('ignores an unplaced edge, whose far end has no node', () => {
		const m = normalizeGraph([{ id: 'a', label: 'a' }], [{ source: 'a', target: 'nope' }])
		const h = hierarchy(m)

		expect(h.roots).toEqual(['a'])
		expect(h.depthOf.size).toBe(1)
	})

	it('lists leaves in the order they are reached, left to right', () => {
		const h = hierarchy(
			model(['r', 'x', 'y', 'z'], [['r', 'x'], ['r', 'y'], ['y', 'z']])
		)

		// `x` is a leaf; `y` is not; `z` is. Order follows the walk, which is what keeps a
		// parent's children adjacent on the rim.
		expect(h.leaves).toEqual(['x', 'z'])
	})

	it('is deterministic', () => {
		const m = model(['a', 'b', 'c', 'd'], [['a', 'b'], ['a', 'c'], ['b', 'd'], ['c', 'd']])

		expect(hierarchy(m).leaves).toEqual(hierarchy(m).leaves)
	})

	it('handles an empty model', () => {
		const h = hierarchy(model([], []))

		expect(h.roots).toEqual([])
		expect(h.leaves).toEqual([])
	})

	describe('childrenIn', () => {
		it('returns the tree children of a parent', () => {
			const h = hierarchy(model(['r', 'a'], [['r', 'a']]))

			expect(childrenIn(h, 'r')).toEqual(['a'])
		})

		it('returns an empty list for a leaf, which has no entry at all', () => {
			// Every caller wants a list rather than an `undefined` to guard, and saying so once
			// beats the same `?? []` at each use site.
			const h = hierarchy(model(['r', 'a'], [['r', 'a']]))

			expect(childrenIn(h, 'a')).toEqual([])
		})
	})
})
