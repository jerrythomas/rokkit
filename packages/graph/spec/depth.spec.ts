/* Neighbourhood DEPTH (#162).
 *
 * One hop answers "what touches this". Two answers "what does changing this reach", which is
 * the question a reader of a call graph has before editing a function.
 *
 * Driven through GraphState so the whole case is provable from a dataset: which nodes are
 * placed, which ring claimed each, and where the columns sit. */

import { describe, it, expect } from 'vitest'
import { GraphState } from '../src/GraphState.svelte.js'
import { CALL_FIELDS, threeHop, twoHop } from './fixtures.js'

const state = (config = {}) =>
	new GraphState({
		nodes: twoHop.nodes,
		edges: twoHop.edges,
		fields: CALL_FIELDS,
		layout: 'neighborhood',
		focus: 'focus',
		...config
	})

const placed = (s: GraphState) => Object.keys(s.cards).sort()

describe('neighborhood depth', () => {
	it('is one hop by default, so no existing caller changes', () => {
		expect(placed(state())).toEqual(['callerL1', 'calleeL1', 'focus', 'shared'].sort())
	})

	it('reaches the second ring when asked', () => {
		expect(placed(state({ depth: 2 }))).toEqual(
			['callerL1', 'callerL2', 'calleeL1', 'calleeL2', 'focus', 'shared'].sort()
		)
	})

	it('never reaches an unconnected node, however deep', () => {
		expect(placed(state({ depth: 5 }))).not.toContain('unrelated')
	})

	it('claims a node at its NEAREST depth, and places it once', () => {
		// `shared` is reachable at depth 1 directly and at depth 2 via calleeL1. Placed twice
		// it would be two cards for one node; placed at the far ring it would read as further
		// away than it is.
		const s = state({ depth: 2 })
		const ids = Object.keys(s.cards).filter((id) => id === 'shared')

		expect(ids).toHaveLength(1)
		// Ring 1 sits nearer the focus than ring 2.
		expect(Math.abs(s.cards.shared.x - s.cards.focus.x)).toBeLessThan(
			Math.abs(s.cards.calleeL2.x - s.cards.focus.x)
		)
	})

	it('puts each ring in its own column, further out with depth', () => {
		const s = state({ depth: 2 })
		const dx = (id: string) => s.cards[id].x - s.cards.focus.x

		expect(dx('calleeL1')).toBeGreaterThan(0)
		expect(dx('calleeL2')).toBeGreaterThan(dx('calleeL1'))
		expect(dx('callerL1')).toBeLessThan(0)
		expect(dx('callerL2')).toBeLessThan(dx('callerL1'))
	})

	it('labels each column, or a five-column portrait cannot be read', () => {
		// Three columns get away with it because the focus is visibly central. Five do not.
		const s = state({ depth: 2 })

		expect(s.columns.map((c) => c.label)).toEqual([
			'callers of callers',
			'called by',
			'apply',
			'calls',
			'which call'
		])
	})

	it('reports no columns for a layout that has none', () => {
		expect(new GraphState({ nodes: twoHop.nodes, edges: [], fields: CALL_FIELDS }).columns).toEqual(
			[]
		)
	})

	it('routes an edge between two nodes in the outer ring', () => {
		// calleeL1 → calleeL2 touches neither the focus nor ring 1, and a 1-hop layout drops
		// exactly that kind of edge. At depth 2 both ends are on the canvas, so it must draw.
		const s = state({ depth: 2 })

		expect(s.routedEdges.some((e) => e.fromKey === 'calleeL1' && e.toKey === 'calleeL2')).toBe(
			true
		)
	})

	it('words a heading beyond the second ring generically', () => {
		// "callers of callers of callers" is not a phrase. Past the two named rings the heading
		// states the hop count instead of inventing English.
		const s = new GraphState({
			nodes: threeHop.nodes,
			edges: threeHop.edges,
			fields: CALL_FIELDS,
			layout: 'neighborhood',
			focus: 'focus',
			depth: 3
		})

		expect(s.columns.filter((c) => c.depth === 3)).toHaveLength(2)
		for (const col of s.columns.filter((c) => c.depth === 3)) {
			expect(col.label).toContain('3 hops')
		}
	})

	it('reaches a third ring on both sides', () => {
		const s = new GraphState({
			nodes: threeHop.nodes,
			edges: threeHop.edges,
			fields: CALL_FIELDS,
			layout: 'neighborhood',
			focus: 'focus',
			depth: 3
		})

		expect(Object.keys(s.cards).sort()).toEqual(
			['focus', 'in1', 'in2', 'in3', 'out1', 'out2', 'out3'].sort()
		)
	})

	it('exposes the measure settings it was configured with', () => {
		const s = state({ depth: 2, sizeBy: 'weight', sizeScale: 'log' })

		expect([s.depth, s.sizeBy, s.sizeScale]).toEqual([2, 'weight', 'log'])
	})

	it('floors a nonsense depth at one rather than rendering nothing', () => {
		// An empty canvas for `depth: 0` is indistinguishable from a broken focus.
		expect(Object.keys(state({ depth: 0 }).cards).length).toBeGreaterThan(1)
	})

	it('is deterministic', () => {
		expect(state({ depth: 2 }).cards).toEqual(state({ depth: 2 }).cards)
	})
})
