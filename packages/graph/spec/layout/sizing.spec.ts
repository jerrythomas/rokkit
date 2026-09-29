/* How big a node is drawn when there is no room for a card.
 *
 * Shared by `points` and `radial`, so its contract is tested here once rather than inferred
 * from two layouts' pixel output.
 */

import { describe, it, expect } from 'vitest'
import { degreeOf, measureOf, normalise, sizeFor, nodeSizes } from '../../src/layout/sizing.js'
import { normalizeGraph } from '../../src/model/normalize.js'

const model = (nodes: string[], edges: [string, string][]) =>
	normalizeGraph(
		nodes.map((id) => ({ id, label: id })),
		edges.map(([source, target]) => ({ source, target }))
	)

describe('degreeOf', () => {
	it('counts both ends of an edge', () => {
		const d = degreeOf(model(['a', 'b'], [['a', 'b']]))

		expect([d.get('a'), d.get('b')]).toEqual([1, 1])
	})

	it('counts a self-loop once — it is one edge, not two', () => {
		expect(degreeOf(model(['a'], [['a', 'a']])).get('a')).toBe(1)
	})

	it('gives a disconnected node zero rather than nothing', () => {
		expect(degreeOf(model(['a', 'lonely'], [])).get('lonely')).toBe(0)
	})

	it('counts an edge whose far end is not a node', () => {
		// 59.6% of Sensei's edges have a null target. The call is real, so the caller's degree
		// is real; only the callee has no box.
		const m = normalizeGraph([{ id: 'a', label: 'a' }], [{ source: 'a', target: 'nope' }])
		const d = degreeOf(m)

		expect(d.get('a')).toBe(1)
		expect(d.get('nope')).toBe(1)
	})
})

describe('measureOf', () => {
	const node = { id: 'a', label: 'a', rows: [], meta: {}, weight: 7, measures: { lines: 40 } }

	it('reads the degree map', () => {
		expect(measureOf(node, new Map([['a', 3]]), 'degree')).toBe(3)
	})

	it('floors an unknown node at zero rather than producing NaN', () => {
		// A NaN reaches sqrt() and renders a card with no width at all — invisible, not wrong.
		expect(measureOf(node, new Map(), 'degree')).toBe(0)
	})

	it('reads the node weight', () => {
		expect(measureOf(node, new Map(), 'weight')).toBe(7)
	})

	it('floors a missing weight, which is normal in a partial index', () => {
		expect(measureOf({ ...node, weight: undefined }, new Map(), 'weight')).toBe(0)
	})

	it('reads a named measure, and floors one that is absent', () => {
		expect(measureOf(node, new Map(), 'lines')).toBe(40)
		expect(measureOf(node, new Map(), 'nope')).toBe(0)
	})
})

describe('normalise', () => {
	it('maps a value onto 0..1', () => {
		expect(normalise(5, 0, 10, 'linear')).toBe(0.5)
	})

	it('returns 0 for a flat measure rather than dividing by zero', () => {
		expect(normalise(4, 4, 4, 'linear')).toBe(0)
	})

	it('compresses a log scale, for a measure spanning orders of magnitude', () => {
		// Linear puts everything below the top few on the floor when the range is 1..1000.
		expect(normalise(100, 0, 1000, 'log')).toBeGreaterThan(normalise(100, 0, 1000, 'linear'))
	})
})

describe('sizeFor', () => {
	it('grows width as the square root, so ten reads as ten', () => {
		// AREA is linear in the measure. Making WIDTH linear makes ten look like a hundred.
		const small = sizeFor(0)
		const big = sizeFor(1)
		const areaRatio = (big.w * big.h) / (small.w * small.h)
		const widthRatio = big.w / small.w

		expect(widthRatio).toBeCloseTo(Math.sqrt(areaRatio), 5)
	})

	it('floors at a visible size rather than zero', () => {
		expect(sizeFor(0).w).toBeGreaterThan(0)
	})
})

describe('nodeSizes', () => {
	it('sizes every node in the model', () => {
		const sizes = nodeSizes(model(['a', 'b'], [['a', 'b']]), 'degree', 'linear')

		expect([...sizes.keys()].sort()).toEqual(['a', 'b'])
	})

	it('anchors the domain at 0, not at the smallest value PRESENT', () => {
		// Against the present minimum, whichever node happens to be smallest lands on the floor
		// in every graph — a module with 400 declarations rendering identically to one with 4,
		// purely because nothing in that graph was smaller.
		const sizes = nodeSizes(
			// Minimum degree here is 2, so against the present minimum `c` would floor.
			model(
				['a', 'b', 'c'],
				[
					['a', 'b'],
					['b', 'c'],
					['c', 'a']
				]
			),
			'degree',
			'linear'
		)
		const floor = sizeFor(0)

		expect(sizes.get('c')!.w).toBeGreaterThan(floor.w)
	})
})
