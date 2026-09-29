/* The `flow` layout — direction you can read off the geometry, links you can trace.
 *
 * Raised from the ER diagram: incoming should always enter on the LEFT and outgoing always
 * leave from the RIGHT, and the boxes should be arranged so links are not buried behind
 * entities. Those are one feature, not two — fixed ports on an arrangement where a target is
 * as likely to be left of its source as right make a connector sweep back across everything
 * in between. See docs/design/25-flow-layout.md.
 *
 * Asserted through GraphState, as every other layout spec is.
 */

import { describe, it, expect } from 'vitest'
import { GraphState } from '../../src/GraphState.svelte.js'

const nodes = (...ids: string[]) => ids.map((id) => ({ id, label: id }))
const edges = (...pairs: [string, string][]) =>
	pairs.map(([source, target]) => ({ source, target }))

const state = (n: unknown[], e: unknown[], config = {}) =>
	new GraphState({ nodes: n, edges: e, fields: {}, layout: 'flow', ...config })

describe('flow layout', () => {
	describe('ports are fixed, so direction is readable without following an arrow', () => {
		it('leaves the source on the RIGHT and enters the target on the LEFT', () => {
			const s = state(nodes('a', 'b'), edges(['a', 'b']))
			const [edge] = s.routedEdges

			expect(edge.s1).toBe(1)
			expect(edge.s2).toBe(-1)
		})

		it('anchors the endpoints on those same two sides', () => {
			const s = state(nodes('a', 'b'), edges(['a', 'b']))
			const [edge] = s.routedEdges
			const a = s.cards.a
			const b = s.cards.b

			expect(edge.x1).toBeCloseTo(a.x + a.w, 5)
			expect(edge.x2).toBeCloseTo(b.x, 5)
		})

		it('anchors on the ROW an edge names, not the card head', () => {
			// A foreign key joins two columns, and landing both ends on the head throws away
			// which ones. `edges.ts` anchors this way and the two must agree, or the same edge
			// moves when the layout changes.
			const withRows = [
				{
					id: 'orders',
					label: 'orders',
					rows: [{ name: 'id' }, { name: 'user_id' }]
				},
				{ id: 'users', label: 'users', rows: [{ name: 'id' }] }
			]
			const s = state(
				withRows,
				[{ source: 'orders', target: 'users', sourceRow: 'user_id', targetRow: 'id' }],
				{ density: 'full' }
			)
			const [edge] = s.routedEdges

			// Below the head, since `user_id` is the second row rather than the first.
			expect(edge.y1).toBeGreaterThan(s.cards.orders.y + 40)
			expect(edge.y1).not.toBe(edge.y2)
		})

		it('keeps a self-loop between the two rows it names', () => {
			// A parent_id pointing at the same table's id is a real shape, and collapsing both
			// ends onto one point turns the loop into a dot.
			const s = state(
				[
					{
						id: 'tree',
						label: 'tree',
						rows: [{ name: 'id' }, { name: 'parent_id' }]
					}
				],
				[{ source: 'tree', target: 'tree', sourceRow: 'parent_id', targetRow: 'id' }],
				{ density: 'full' }
			)
			const [edge] = s.routedEdges

			expect(edge.self).toBe(true)
			expect(edge.y1).not.toBe(edge.y2)
		})

		it('keeps the ports fixed even for a BACK edge, whose target is to the left', () => {
			// The one case where a fixed port costs a visible sweep. Paying it for the minority
			// is the point of breaking cycles rather than letting them dictate the arrangement.
			const s = state(nodes('a', 'b'), edges(['a', 'b'], ['b', 'a']))
			const backEdge = s.routedEdges.find((e) => e.fromKey === 'b')!

			expect(backEdge.s1).toBe(1)
			expect(backEdge.s2).toBe(-1)
		})
	})

	describe('columns encode direction', () => {
		it('places a referenced table to the right of the one referencing it', () => {
			const s = state(nodes('a', 'b'), edges(['a', 'b']))

			expect(s.cards.b.x).toBeGreaterThan(s.cards.a.x)
		})

		it('gives a chain one column per step', () => {
			const s = state(nodes('a', 'b', 'c'), edges(['a', 'b'], ['b', 'c']))

			expect(s.cards.a.x).toBeLessThan(s.cards.b.x)
			expect(s.cards.b.x).toBeLessThan(s.cards.c.x)
		})

		it('never overlaps two boxes', () => {
			const s = state(
				nodes('a', 'b', 'c', 'd', 'e'),
				edges(['a', 'c'], ['b', 'c'], ['c', 'd'], ['c', 'e'])
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
	})

	describe('what it does NOT do', () => {
		it('emits no clusters — ranking and schema grouping want the same axis', () => {
			// A box cannot be both "in the public box" and "in column 3". `cluster` keeps the
			// schema view; this is the fourth layout a reader chooses instead.
			const s = state(
				[
					{ id: 'a', label: 'a', group: 'public' },
					{ id: 'b', label: 'b', group: 'audit' }
				],
				edges(['a', 'b'])
			)

			expect(s.clusters).toEqual([])
		})
	})

	describe('real-schema shapes', () => {
		it('places a disconnected table rather than dropping it', () => {
			const s = state(nodes('a', 'b', 'lonely'), edges(['a', 'b']))

			expect(s.cards.lonely).toBeDefined()
			expect(s.cards.lonely.w).toBeGreaterThan(0)
		})

		it('renders every edge of a mutual reference', () => {
			const s = state(nodes('a', 'b'), edges(['a', 'b'], ['b', 'a']))

			expect(s.routedEdges).toHaveLength(2)
		})

		it('keeps a self-loop a loop, not a column span', () => {
			const s = state(nodes('a'), edges(['a', 'a']))

			expect(s.routedEdges[0].self).toBe(true)
		})

		it('keeps an unplaced edge out of the geometry without dropping the node', () => {
			const s = state(nodes('a'), [{ source: 'a', target: 'not_indexed' }])

			expect(s.cards.a).toBeDefined()
			expect(s.routedEdges).toEqual([])
		})

		it('handles an empty model', () => {
			const s = state([], [])

			expect(s.cards).toEqual({})
			expect(s.size).toEqual({ w: 0, h: 0 })
		})

		it('is deterministic', () => {
			const n = nodes('a', 'b', 'c', 'd')
			const e = edges(['a', 'c'], ['b', 'd'], ['a', 'd'])

			expect(state(n, e).cards).toEqual(state(n, e).cards)
		})
	})

	describe('crossing reduction actually reaches the geometry', () => {
		it('orders a column so two edges that would cross do not', () => {
			// a→d and b→c declared in an order that crosses them. If ordering reached the
			// layout, the vertical order of c and d is swapped relative to the declaration.
			const s = state(nodes('a', 'b', 'c', 'd'), edges(['a', 'd'], ['b', 'c']))

			// a above b, so d must end up above c for the edges to run parallel.
			expect(s.cards.a.y).toBeLessThan(s.cards.b.y)
			expect(s.cards.d.y).toBeLessThan(s.cards.c.y)
		})
	})

	describe('the size it reports', () => {
		it('covers every card it placed', () => {
			const s = state(nodes('a', 'b', 'c'), edges(['a', 'b'], ['b', 'c']))

			for (const card of Object.values(s.cards)) {
				expect(card.x + card.w).toBeLessThanOrEqual(s.size.w)
				expect(card.y + card.h).toBeLessThanOrEqual(s.size.h)
			}
		})
	})
})
