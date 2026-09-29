/* Ordering within a column — the crossing-reduction half of a layered layout.
 *
 * Asserted against the COUNT of crossings rather than against a particular permutation: the
 * goal is fewer crossings, and pinning the exact order would fail on any improvement to the
 * heuristic while telling us nothing about whether the picture got better.
 */

import { describe, it, expect } from 'vitest'
import { order, countCrossings } from '../../src/layout/order.js'
import { rank } from '../../src/layout/rank.js'
import { normalizeGraph } from '../../src/model/normalize.js'

const model = (nodes: string[], edges: [string, string][]) =>
	normalizeGraph(
		nodes.map((id) => ({ id, label: id })),
		edges.map(([source, target]) => ({ source, target }))
	)

/** Layers in the order the model declares them, i.e. with no reduction applied. */
function unordered(m: ReturnType<typeof model>, ranks: Map<string, number>): string[][] {
	const layers: string[][] = []
	for (const node of m.nodes) {
		const r = ranks.get(node.id)!
		;(layers[r] ??= []).push(node.id)
	}

	return layers
}

describe('order', () => {
	it('puts every node in the layer its rank names', () => {
		const m = model(
			['a', 'b', 'c'],
			[
				['a', 'b'],
				['b', 'c']
			]
		)
		const { ranks, back } = rank(m)

		expect(order(m, ranks, back)).toEqual([['a'], ['b'], ['c']])
	})

	it('reduces crossings on a graph whose declared order guarantees them', () => {
		// a→d and b→c, declared so the two edges cross. Swapping either layer uncrosses them.
		const m = model(
			['a', 'b', 'c', 'd'],
			[
				['a', 'd'],
				['b', 'c']
			]
		)
		const { ranks, back } = rank(m)

		const before = countCrossings(unordered(m, ranks), m, back)
		const after = countCrossings(order(m, ranks, back), m, back)

		expect(before).toBeGreaterThan(0)
		expect(after).toBeLessThan(before)
	})

	it('never makes a graph worse than its declared order', () => {
		// The sweep keeps the best arrangement it has seen, so a fixture the heuristic cannot
		// improve comes back no worse rather than churned.
		const m = model(
			['a', 'b', 'c', 'd', 'e', 'f'],
			[
				['a', 'd'],
				['b', 'e'],
				['c', 'f'],
				['a', 'e'],
				['c', 'd']
			]
		)
		const { ranks, back } = rank(m)

		expect(countCrossings(order(m, ranks, back), m, back)).toBeLessThanOrEqual(
			countCrossings(unordered(m, ranks), m, back)
		)
	})

	it('keeps every node exactly once', () => {
		const m = model(
			['a', 'b', 'c', 'd', 'e'],
			[
				['a', 'c'],
				['b', 'c'],
				['c', 'd'],
				['c', 'e']
			]
		)
		const { ranks, back } = rank(m)
		const flat = order(m, ranks, back).flat()

		expect(flat.sort()).toEqual(['a', 'b', 'c', 'd', 'e'])
	})

	it('places a disconnected node without dropping it', () => {
		const m = model(['a', 'b', 'lonely'], [['a', 'b']])
		const { ranks, back } = rank(m)

		expect(order(m, ranks, back).flat()).toContain('lonely')
	})

	it('is deterministic', () => {
		const m = model(
			['a', 'b', 'c', 'd', 'e', 'f'],
			[
				['a', 'e'],
				['b', 'd'],
				['c', 'f'],
				['a', 'f']
			]
		)
		const { ranks, back } = rank(m)

		expect(order(m, ranks, back)).toEqual(order(m, ranks, back))
	})

	it('handles an empty model', () => {
		const m = model([], [])
		const { ranks, back } = rank(m)

		expect(order(m, ranks, back)).toEqual([])
	})
})

describe('countCrossings', () => {
	it('counts a crossing pair', () => {
		const m = model(
			['a', 'b', 'c', 'd'],
			[
				['a', 'd'],
				['b', 'c']
			]
		)
		const { back } = rank(m)

		expect(countCrossings([['a', 'b'], ['c', 'd']], m, back)).toBe(1)
	})

	it('counts nothing when the same edges do not cross', () => {
		const m = model(
			['a', 'b', 'c', 'd'],
			[
				['a', 'd'],
				['b', 'c']
			]
		)
		const { back } = rank(m)

		expect(countCrossings([['a', 'b'], ['d', 'c']], m, back)).toBe(0)
	})

	it('ignores a back edge, which is not drawn between adjacent layers', () => {
		const m = model(
			['a', 'b'],
			[
				['a', 'b'],
				['b', 'a']
			]
		)
		const { back } = rank(m)

		expect(back.size).toBe(1)
		expect(countCrossings([['a'], ['b']], m, back)).toBe(0)
	})
})
