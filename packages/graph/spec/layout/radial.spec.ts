/* The radial layout — a call graph as a tidy tree or a dendrogram around a circle.
 *
 * `points` shelf-packs a call graph into group boxes, and at seven services it already reads
 * as a stack: tiny rects with labels colliding with the row beneath. A call graph has a
 * SHAPE — who calls whom, and how deep it goes — and a radial tree is the arrangement that
 * shows it. Asserted through GraphState, as every other layout spec is.
 */

import { describe, it, expect } from 'vitest'
import { GraphState } from '../../src/GraphState.svelte.js'
import { read } from '../../src/layout/radial.js'

const nodes = (...ids: string[]) => ids.map((id) => ({ id, label: id }))
const edges = (...pairs: [string, string][]) =>
	pairs.map(([source, target]) => ({ source, target }))

const state = (n: unknown[], e: unknown[], config = {}) =>
	new GraphState({ nodes: n, edges: e, fields: {}, layout: 'radial', ...config })

/** Distance from the centre of the reported canvas. */
const radiusOf = (s: GraphState, id: string) => {
	const c = s.cards[id]
	const cx = s.size.w / 2
	const cy = s.size.h / 2

	return Math.hypot(c.x + c.w / 2 - cx, c.y + c.h / 2 - cy)
}

describe('radial layout', () => {
	describe('depth is the radius', () => {
		it('puts a root at the centre', () => {
			const s = state(nodes('root', 'a'), edges(['root', 'a']))

			expect(radiusOf(s, 'root')).toBeLessThan(1)
		})

		it('pushes each level further out', () => {
			const s = state(nodes('r', 'a', 'b'), edges(['r', 'a'], ['a', 'b']))

			expect(radiusOf(s, 'a')).toBeGreaterThan(radiusOf(s, 'r'))
			expect(radiusOf(s, 'b')).toBeGreaterThan(radiusOf(s, 'a'))
		})

		it('puts siblings at the SAME radius, which is what makes depth readable', () => {
			const s = state(nodes('r', 'a', 'b'), edges(['r', 'a'], ['r', 'b']))

			expect(radiusOf(s, 'a')).toBeCloseTo(radiusOf(s, 'b'), 5)
		})
	})

	describe('dendrogram mode puts every leaf on the rim', () => {
		it('lines the leaves up at one radius whatever their depth', () => {
			// The difference from a tidy tree: a dendrogram compares LEAVES, so they share a
			// rim and the internal structure stretches to reach it.
			const s = state(
				nodes('r', 'shallow', 'a', 'deep'),
				edges(['r', 'shallow'], ['r', 'a'], ['a', 'deep']),
				{ radialMode: 'dendrogram' }
			)

			expect(radiusOf(s, 'shallow')).toBeCloseTo(radiusOf(s, 'deep'), 5)
		})

		it('still puts an internal node inside the rim', () => {
			const s = state(
				nodes('r', 'shallow', 'a', 'deep'),
				edges(['r', 'shallow'], ['r', 'a'], ['a', 'deep']),
				{ radialMode: 'dendrogram' }
			)

			expect(radiusOf(s, 'a')).toBeLessThan(radiusOf(s, 'deep'))
		})

		it('differs from the default tidy tree, which ranks by depth', () => {
			const args = [
				nodes('r', 'shallow', 'a', 'deep'),
				edges(['r', 'shallow'], ['r', 'a'], ['a', 'deep'])
			] as const

			const tidy = state(...args)
			expect(radiusOf(tidy, 'shallow')).toBeLessThan(radiusOf(tidy, 'deep'))
		})
	})

	describe('angles keep a subtree together', () => {
		it('sits a parent between its own children, not over a stranger', () => {
			// The "tidy" in tidy tree. Without it a parent sits at a fixed slot and its edges
			// cross the neighbouring subtrees to reach their children.
			const s = state(
				nodes('r', 'p', 'x', 'y'),
				edges(['r', 'p'], ['p', 'x'], ['p', 'y'])
			)
			const angle = (id: string) => {
				const c = s.cards[id]

				return Math.atan2(c.y + c.h / 2 - s.size.h / 2, c.x + c.w / 2 - s.size.w / 2)
			}
			const [px, py, pp] = [angle('x'), angle('y'), angle('p')]

			expect(pp).toBeGreaterThanOrEqual(Math.min(px, py) - 1e-9)
			expect(pp).toBeLessThanOrEqual(Math.max(px, py) + 1e-9)
		})

		it('never puts two nodes in the same place', () => {
			const s = state(
				nodes('r', 'a', 'b', 'c', 'd'),
				edges(['r', 'a'], ['r', 'b'], ['r', 'c'], ['r', 'd'])
			)
			const spots = Object.values(s.cards).map((c) => `${c.x.toFixed(3)},${c.y.toFixed(3)}`)

			expect(new Set(spots).size).toBe(spots.length)
		})
	})

	describe('a call graph is not a tree, and it still has to draw', () => {
		it('draws an edge the tree could not use', () => {
			// Two callers, one helper. The second call is real and a reader is looking for it.
			const s = state(
				nodes('a', 'b', 'shared'),
				edges(['a', 'shared'], ['b', 'shared'])
			)

			expect(s.routedEdges).toHaveLength(2)
		})

		it('marks the non-tree edge so a theme can draw it differently', () => {
			const s = state(
				nodes('a', 'b', 'shared'),
				edges(['a', 'shared'], ['b', 'shared'])
			)

			expect(s.routedEdges.filter((e) => e.back).length).toBe(1)
		})

		it('renders a cycle without hanging', () => {
			const s = state(nodes('a', 'b', 'c'), edges(['a', 'b'], ['b', 'c'], ['c', 'a']))

			expect(Object.keys(s.cards)).toHaveLength(3)
			expect(s.routedEdges).toHaveLength(3)
		})

		it('places a disconnected node instead of dropping it', () => {
			const s = state(nodes('a', 'b', 'lonely'), edges(['a', 'b']))

			expect(s.cards.lonely).toBeDefined()
		})

		it('keeps an unplaced edge out of the geometry without dropping the node', () => {
			// 59.6% of Sensei's edges have a null target: the call is real, the callee simply has
			// no box. There is nothing to draw a line TO, and inventing a node for the raw string
			// would put a box on the canvas that is not in the data.
			const s = state(nodes('a'), [{ source: 'a', target: 'not_indexed' }])

			expect(s.cards.a).toBeDefined()
			expect(s.routedEdges).toEqual([])
		})

		it('keeps a self-loop a loop', () => {
			const s = state(nodes('a'), edges(['a', 'a']))

			expect(s.routedEdges[0].self).toBe(true)
		})
	})

	describe('it does not stack', () => {
		it('never overlaps two nodes — the defect that made `points` unusable here', () => {
			const s = state(
				nodes('r', 'a', 'b', 'c', 'd', 'e', 'f'),
				edges(['r', 'a'], ['r', 'b'], ['r', 'c'], ['a', 'd'], ['b', 'e'], ['c', 'f'])
			)
			const cards = Object.values(s.cards)

			for (let i = 0; i < cards.length; i++) {
				for (let j = i + 1; j < cards.length; j++) {
					const a = cards[i]
					const b = cards[j]
					const apart =
						a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y
					expect(apart, `${i} vs ${j}`).toBe(true)
				}
			}
		})

		it('grows the canvas with the leaf count rather than crowding one circle', () => {
			const few = state(nodes('r', 'a', 'b'), edges(['r', 'a'], ['r', 'b']))
			const many = state(
				nodes('r', ...Array.from({ length: 40 }, (_, i) => `n${i}`)),
				Array.from({ length: 40 }, (_, i) => ({ source: 'r', target: `n${i}` }))
			)

			expect(many.size.w).toBeGreaterThan(few.size.w)
		})
	})

	describe('depth and drilling — a dendrogram of dendrograms', () => {
		/* A radial dendrogram over a whole codebase puts every leaf on one rim, each a fraction
		 * of a degree wide, and nothing is legible. Depth is what makes it readable: show the
		 * crates, then drill into one. `levels` caps how far DOWN, `focus` moves where you
		 * START — the same idea from two directions. */

		const deep = () =>
			state(
				nodes('crate', 'mod', 'file', 'fn'),
				edges(['crate', 'mod'], ['mod', 'file'], ['file', 'fn'])
			)

		it('shows the whole chain when nothing caps it', () => {
			expect(Object.keys(deep({}).cards).sort()).toEqual(['crate', 'file', 'fn', 'mod'])
		})

		it('materialises only the levels it is asked for', () => {
			const s = state(
				nodes('crate', 'mod', 'file', 'fn'),
				edges(['crate', 'mod'], ['mod', 'file'], ['file', 'fn']),
				{ levels: 2 }
			)

			expect(Object.keys(s.cards).sort()).toEqual(['crate', 'mod'])
		})

		it('keeps the root when asked for a single level', () => {
			const s = state(nodes('crate', 'mod'), edges(['crate', 'mod']), { levels: 1 })

			expect(Object.keys(s.cards)).toEqual(['crate'])
		})

		it('re-roots on a focus, which is what drilling into a crate does', () => {
			const s = state(
				nodes('crate', 'mod', 'file', 'other'),
				edges(['crate', 'mod'], ['mod', 'file'], ['crate', 'other']),
				{ root: 'mod' }
			)

			expect(Object.keys(s.cards).sort()).toEqual(['file', 'mod'])
		})

		it('puts the focused node at the centre', () => {
			const s = state(
				nodes('crate', 'mod', 'file'),
				edges(['crate', 'mod'], ['mod', 'file']),
				{ root: 'mod' }
			)

			expect(radiusOf(s, 'mod')).toBeLessThan(1)
		})

		it('combines the two — drill in, then cap the depth', () => {
			const s = state(
				nodes('crate', 'mod', 'file', 'fn'),
				edges(['crate', 'mod'], ['mod', 'file'], ['file', 'fn']),
				{ root: 'mod', levels: 2 }
			)

			expect(Object.keys(s.cards).sort()).toEqual(['file', 'mod'])
		})

		it('renders the whole graph when the focus names nothing', () => {
			// A stale drill target must not blank the canvas.
			const s = state(nodes('a', 'b'), edges(['a', 'b']), { root: 'gone' })

			expect(Object.keys(s.cards).sort()).toEqual(['a', 'b'])
		})

		it('drops the edges of nodes it did not materialise', () => {
			// An edge to a node with no card has nothing to join, and drawing it to a phantom
			// point is worse than not drawing it.
			const s = state(
				nodes('crate', 'mod', 'file'),
				edges(['crate', 'mod'], ['mod', 'file']),
				{ levels: 2 }
			)

			expect(s.routedEdges).toHaveLength(1)
		})
	})

	describe('the usual contracts', () => {
		it('emits no clusters', () => {
			const s = state(nodes('a', 'b'), edges(['a', 'b']))

			expect(s.clusters).toEqual([])
		})

		it('is deterministic', () => {
			const n = nodes('r', 'a', 'b', 'c')
			const e = edges(['r', 'a'], ['r', 'b'], ['a', 'c'])

			expect(state(n, e).cards).toEqual(state(n, e).cards)
		})

		it('handles an empty model', () => {
			const s = state([], [])

			expect(s.cards).toEqual({})
			expect(s.size).toEqual({ w: 0, h: 0 })
		})

		it('keeps every card inside the canvas it reports', () => {
			const s = state(
				nodes('r', 'a', 'b', 'c'),
				edges(['r', 'a'], ['r', 'b'], ['a', 'c'])
			)

			for (const card of Object.values(s.cards)) {
				expect(card.x).toBeGreaterThanOrEqual(0)
				expect(card.y).toBeGreaterThanOrEqual(0)
				expect(card.x + card.w).toBeLessThanOrEqual(s.size.w)
				expect(card.y + card.h).toBeLessThanOrEqual(s.size.h)
			}
		})
	})

	describe('read', () => {
		/* Every pass keys on the same node set, so a miss should not happen — but a node
		 * rendered at NaN coordinates disappears silently, where one at the centre is at least
		 * visible and clickable. */

		it('returns what the map holds', () => {
			expect(read(new Map([['a', 5]]), 'a', 0)).toBe(5)
		})

		it('falls back rather than producing undefined arithmetic', () => {
			expect(read(new Map<string, number>(), 'missing', 0)).toBe(0)
		})
	})
})
