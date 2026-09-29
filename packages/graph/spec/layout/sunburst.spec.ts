/* The sunburst — the same containment question as the treemap, asked radially.
 *
 * A treemap spends its area well and makes depth hard to see: a box inside a box inside a box
 * all look like boxes. A sunburst puts depth on the RADIUS, so how deep a tree goes is the
 * first thing you read, and a wedge's ANGLE carries the same proportion the treemap's area
 * does. Shares the tree and the measure with `world`, so the two are the same data drawn twice.
 *
 * Asserted through GraphState, as every other layout spec is.
 */

import { describe, it, expect } from 'vitest'
import { GraphState } from '../../src/GraphState.svelte.js'
import { CALL_FIELDS, measured, nestedPath } from '../fixtures.js'

const FIELDS = { ...CALL_FIELDS, path: 'path', note: 'note', measures: 'm' }

const state = (config = {}) =>
	new GraphState({
		nodes: nestedPath.nodes,
		edges: nestedPath.edges,
		fields: FIELDS,
		layout: 'sunburst',
		...config
	})

/** Wedges, which is what a sunburst emits instead of cards. */
const wedges = (s: GraphState) => s.clusters

describe('sunburst layout', () => {
	it('emits a wedge per box, not a card', () => {
		// Same call as the treemap: one shape at every depth. A leaf is a wedge too.
		const s = state()

		expect(s.cards).toEqual({})
		expect(wedges(s).length).toBeGreaterThan(1)
	})

	it('gives every wedge the geometry a renderer needs', () => {
		const s = state()
		const w = wedges(s)[0]

		expect(w.wedge).toBeDefined()
		expect(w.wedge!.r1).toBeGreaterThan(w.wedge!.r0)
		expect(w.wedge!.a1).toBeGreaterThan(w.wedge!.a0)
	})

	it('reads depth as the radius, which is what a treemap cannot show', () => {
		const s = state({ levels: 3 })
		const outer = wedges(s).find((c) => (c.depth ?? 0) === 1)
		const inner = wedges(s).find((c) => (c.depth ?? 0) === 0)

		expect(outer!.wedge!.r0).toBeGreaterThanOrEqual(inner!.wedge!.r1 - 0.001)
	})

	it('makes a bigger measure a wider wedge', () => {
		const s = new GraphState({
			nodes: measured.nodes,
			edges: measured.edges,
			fields: FIELDS,
			layout: 'sunburst',
			sizeBy: 'declarations',
			levels: 2
		})
		const span = (name: string) => {
			const w = wedges(s).find((c) => c.name === name)!.wedge!

			return w.a1 - w.a0
		}

		// parser 900, lexer 300, util 60
		expect(span('parser')).toBeGreaterThan(span('lexer'))
		expect(span('lexer')).toBeGreaterThan(span('util'))
	})

	it('keeps the proportion, not merely the order', () => {
		const s = new GraphState({
			nodes: measured.nodes,
			edges: measured.edges,
			fields: FIELDS,
			layout: 'sunburst',
			sizeBy: 'declarations',
			levels: 2
		})
		const span = (name: string) => {
			const w = wedges(s).find((c) => c.name === name)!.wedge!

			return w.a1 - w.a0
		}
		const ratio = span('parser') / span('lexer')

		// 900 / 300 = 3, blurred by the floor under a zero measure.
		expect(ratio).toBeGreaterThan(2)
		expect(ratio).toBeLessThan(4.5)
	})

	it('fills the circle — sibling wedges tile one full turn', () => {
		const s = state()
		const top = wedges(s).filter((c) => (c.depth ?? 0) === 0)
		const covered = top.reduce((sum, c) => sum + (c.wedge!.a1 - c.wedge!.a0), 0)

		expect(covered).toBeCloseTo(Math.PI * 2, 3)
	})

	it('nests a child inside its parent’s angular span', () => {
		const s = state({ levels: 3 })
		const byName = new Map(wedges(s).map((c) => [c.name, c]))

		for (const w of wedges(s)) {
			const parent = w.parent ? byName.get(w.parent) : undefined
			if (!parent) continue
			expect(w.wedge!.a0, w.name).toBeGreaterThanOrEqual(parent.wedge!.a0 - 0.001)
			expect(w.wedge!.a1, w.name).toBeLessThanOrEqual(parent.wedge!.a1 + 0.001)
		}
	})

	it('captions a wedge with its measure, exactly as the treemap does', () => {
		const s = state({ sizeBy: 'weight' })

		expect(wedges(s).find((c) => c.name === 'dbd')?.caption).toBe('135')
	})

	it('carries the node id on a leaf, so it stays selectable', () => {
		const s = new GraphState({
			nodes: [
				{ id: 'a', label: 'parse', kind: 'module', path: ['dbd', 'parse'], weight: 40 },
				{ id: 'b', label: 'emit', kind: 'module', path: ['dbd', 'emit'], weight: 10 }
			],
			edges: [],
			fields: FIELDS,
			layout: 'sunburst',
			sizeBy: 'weight'
		})
		const leaf = wedges(s).find((c) => c.name === 'parse')

		expect(leaf?.nodeId).toBe('a')
		expect(leaf?.kind).toBe('module')
	})

	it('scopes to a subtree, which is what drilling renders', () => {
		const s = state({ focusPath: ['dbd', 'core'] })

		expect(wedges(s).map((c) => c.name)).not.toContain('dbd')
	})

	it('materialises only the levels it is asked for', () => {
		expect(state().clusters.every((c) => (c.depth ?? 0) < 2)).toBe(true)
	})

	it('inherits the outermost ancestor’s ramp key through the subtree', () => {
		// Looked up by its own name, every descendant falls through to the default colour —
		// which is how the outer ring came out uniformly grey under a correctly coloured inner
		// one. A package should read as one sector.
		const s = state({ levels: 3 })
		const dbd = wedges(s).find((c) => c.name === 'dbd')
		const inner = wedges(s).find((c) => c.parent === 'dbd')

		expect(dbd?.ramp).toBe('dbd')
		expect(inner?.ramp).toBe('dbd')
	})

	it('compacts a large caption, as the treemap does', () => {
		const huge = [
			{ id: 'a', label: 'a', path: ['p', 'a'], weight: 2_400_000 },
			{ id: 'b', label: 'b', path: ['p', 'b'], weight: 100_000 }
		]
		const s = new GraphState({
			nodes: huge,
			edges: [],
			fields: FIELDS,
			layout: 'sunburst',
			sizeBy: 'weight'
		})

		expect(wedges(s).find((c) => c.name === 'p')?.caption).toBe('2.5M')
	})

	it('splits evenly when nothing is measured, rather than drawing nothing', () => {
		// A codebase under `sizeBy: 'degree'` where no module imports another measures zero
		// everywhere. Returning early left a blank canvas, which reads as broken rather than as
		// unmeasured — and `squarify` already falls back this way for the treemap.
		const s = new GraphState({
			nodes: [
				{ id: 'a', label: 'a', path: ['p', 'a'] },
				{ id: 'b', label: 'b', path: ['p', 'b'] }
			],
			edges: [],
			fields: FIELDS,
			layout: 'sunburst',
			sizeBy: 'degree'
		})
		const leaves = wedges(s).filter((c) => c.nodeId)

		expect(leaves).toHaveLength(2)
		expect(leaves[0].wedge!.a1 - leaves[0].wedge!.a0).toBeCloseTo(Math.PI, 3)
	})

	it('draws no edges — containment is the relationship here', () => {
		expect(state().routedEdges).toEqual([])
	})

	it('is deterministic', () => {
		expect(state().clusters).toEqual(state().clusters)
	})

	it('handles an empty model', () => {
		const s = new GraphState({ nodes: [], edges: [], fields: FIELDS, layout: 'sunburst' })

		expect(s.clusters).toEqual([])
		expect(s.size).toEqual({ w: 0, h: 0 })
	})

	it('handles an unknown focusPath without throwing', () => {
		const s = state({ focusPath: ['nope'] })

		expect(s.clusters).toEqual([])
	})
})
