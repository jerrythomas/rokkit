/* Ranking — which column a node lands in, and which edges had to be broken to get there.
 *
 * Pure graph work with no geometry, tested directly rather than through GraphState: a rank is
 * the input to placement, and a placement bug and a ranking bug look identical once they are
 * pixels.
 */

import { describe, it, expect } from 'vitest'
import { rank } from '../../src/layout/rank.js'
import { normalizeGraph } from '../../src/model/normalize.js'

const model = (nodes: string[], edges: [string, string][]) =>
	normalizeGraph(
		nodes.map((id) => ({ id, label: id })),
		edges.map(([source, target]) => ({ source, target }))
	)

describe('rank', () => {
	it('puts a referenced node to the RIGHT of the one referencing it', () => {
		// An edge leaves the source's right and enters the target's left, so the target must
		// sit further right or the connector doubles back over everything between.
		const { ranks } = rank(model(['a', 'b'], [['a', 'b']]))

		expect(ranks.get('a')).toBe(0)
		expect(ranks.get('b')).toBe(1)
	})

	it('uses the LONGEST path, so no edge spans backwards', () => {
		// a→b→c and a→c. Ranking c at 1 would leave b→c pointing left.
		const { ranks } = rank(
			model(
				['a', 'b', 'c'],
				[
					['a', 'b'],
					['b', 'c'],
					['a', 'c']
				]
			)
		)

		expect(ranks.get('c')).toBe(2)
	})

	it('gives a disconnected node a rank rather than dropping it', () => {
		const { ranks } = rank(model(['a', 'b', 'lonely'], [['a', 'b']]))

		expect(ranks.get('lonely')).toBe(0)
	})

	it('ranks a cycle instead of looping forever', () => {
		// Mutual foreign keys are normal in a real schema. Breaking the cycle is what makes a
		// rank exist at all; refusing to rank it would take the whole diagram down.
		const { ranks } = rank(
			model(
				['a', 'b'],
				[
					['a', 'b'],
					['b', 'a']
				]
			)
		)

		expect(ranks.get('a')).toBe(0)
		expect(ranks.get('b')).toBe(1)
	})

	it('reports exactly which edges it had to break', () => {
		const { back } = rank(
			model(
				['a', 'b'],
				[
					['a', 'b'],
					['b', 'a']
				]
			)
		)

		expect(back.size).toBe(1)
		expect([...back][0]).toContain('b')
	})

	it('breaks nothing on an acyclic graph', () => {
		const { back } = rank(
			model(
				['a', 'b', 'c'],
				[
					['a', 'b'],
					['b', 'c']
				]
			)
		)

		expect(back.size).toBe(0)
	})

	it('survives a three-node cycle', () => {
		const { ranks, back } = rank(
			model(
				['a', 'b', 'c'],
				[
					['a', 'b'],
					['b', 'c'],
					['c', 'a']
				]
			)
		)

		expect(back.size).toBe(1)
		// Every node still placed, and the two kept edges still point rightward.
		expect(ranks.get('a')).toBe(0)
		expect(ranks.get('b')).toBe(1)
		expect(ranks.get('c')).toBe(2)
	})

	it('ignores a self-loop, which cannot span columns', () => {
		const { ranks, back } = rank(model(['a'], [['a', 'a']]))

		expect(ranks.get('a')).toBe(0)
		expect(back.size).toBe(0)
	})

	it('ignores an unplaced edge, whose far end is not a node', () => {
		// 59.6% of Sensei's edges have a null target. An endpoint with no card cannot constrain
		// a column, and treating the raw string as a node would invent one.
		const m = normalizeGraph(
			[{ id: 'a', label: 'a' }],
			[{ source: 'a', target: 'not_indexed' }]
		)
		const { ranks } = rank(m)

		expect(ranks.get('a')).toBe(0)
		expect(ranks.has('not_indexed')).toBe(false)
	})

	it('is deterministic', () => {
		const m = model(
			['a', 'b', 'c', 'd'],
			[
				['a', 'b'],
				['b', 'c'],
				['c', 'd'],
				['d', 'b']
			]
		)

		expect([...rank(m).ranks]).toEqual([...rank(m).ranks])
	})
})
