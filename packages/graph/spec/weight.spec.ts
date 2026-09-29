/* A per-node MEASURE (#161, #164).
 *
 * Degree is a fine default and is not always what the picture is about: a 40-file module
 * with few cross-edges should not render smaller than a 2-file one that happens to be chatty.
 * The number already arrives — `normalizeGraph` passes unclaimed fields to `meta` — and
 * nothing read it.
 *
 * Asserted through GraphState, so the case is provable from a dataset with no render. */

import { describe, it, expect } from 'vitest'
import { GraphState } from '../src/GraphState.svelte.js'
import { normalizeGraph } from '../src/model/normalize.js'
import { CALL_FIELDS, weighted } from './fixtures.js'

const state = (config = {}) =>
	new GraphState({
		nodes: weighted.nodes,
		edges: weighted.edges,
		fields: CALL_FIELDS,
		layout: 'points',
		...config
	})

describe('node weight', () => {
	it('reads a mapped weight onto the canonical node', () => {
		const model = normalizeGraph(weighted.nodes, weighted.edges, CALL_FIELDS)

		expect(model.byId.get('bigModule')?.weight).toBe(50000)
		expect(model.byId.get('noWeight')?.weight).toBeUndefined()
	})

	it('does NOT leave the weight duplicated in meta', () => {
		// A claimed field in two places is two things that can disagree.
		const model = normalizeGraph(weighted.nodes, weighted.edges, CALL_FIELDS)

		expect(model.byId.get('bigModule')?.meta).not.toHaveProperty('weight')
	})

	it('sizes by degree by default, so every existing caller is unaffected', () => {
		const s = state()

		// bigModule and smallModule both have degree 1.
		expect(s.cards.bigModule.w).toBe(s.cards.smallModule.w)
	})

	it('sizes by the measure when asked, which is the whole point', () => {
		const s = state({ sizeBy: 'weight' })

		expect(s.cards.bigModule.w).toBeGreaterThan(s.cards.midModule.w)
		expect(s.cards.midModule.w).toBeGreaterThan(s.cards.smallModule.w)
	})

	it('keeps area proportional to the measure, not width', () => {
		// Width-proportional would make a 4x node 16x the ink and overstate it wildly.
		const s = state({ sizeBy: 'weight' })
		const areaOf = (id: string) => s.cards[id].w * s.cards[id].h

        // bigModule is 100x midModule by weight; its AREA must not be 100x the *width* ratio.
		expect(areaOf('bigModule') / areaOf('midModule')).toBeLessThan(
			(s.cards.bigModule.w / s.cards.midModule.w) ** 3
		)
	})

	it('floors a node with no weight instead of dropping or exploding it', () => {
		const s = state({ sizeBy: 'weight' })

		expect(s.cards.noWeight.w).toBeGreaterThan(0)
		expect(s.cards.noWeight.w).toBeLessThanOrEqual(s.cards.smallModule.w)
	})

	it('offers a log scale, because real measures span orders of magnitude', () => {
		// 3 → 50000 is four orders. Linear-in-area flattens everything below the top few onto
		// the minimum, which is the opposite of what the reader is looking for.
		const linear = state({ sizeBy: 'weight' })
		const log = state({ sizeBy: 'weight', sizeScale: 'log' })

		const linearSpread = linear.cards.midModule.w / linear.cards.smallModule.w
		const logSpread = log.cards.midModule.w / log.cards.smallModule.w

		expect(logSpread).toBeGreaterThan(linearSpread)
	})

	it('survives every node sharing one weight', () => {
		// max === min, so a naive (v - min) / (max - min) divides by zero.
		const flat = weighted.nodes.map((n) => ({ ...n, weight: 7 }))
		const s = new GraphState({
			nodes: flat,
			edges: weighted.edges,
			fields: CALL_FIELDS,
			layout: 'points',
			sizeBy: 'weight'
		})

		for (const card of Object.values(s.cards)) expect(Number.isFinite(card.w)).toBe(true)
	})
})
