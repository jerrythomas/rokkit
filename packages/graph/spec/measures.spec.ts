/* Named measures (#164, design step 2).
 *
 * `weight` (#161) is one number and drives size. A shade channel needs a SECOND, independent
 * one — declarations are absolute and 0..10⁵, a share is 0..1 — and the control that motivates
 * this switches between three shares at runtime.
 *
 * A bag rather than a second field, because switching a named key re-runs the layout over an
 * unchanged model, where re-mapping `fields` would re-normalize 1.18M nodes per click. */

import { describe, it, expect } from 'vitest'
import { GraphState } from '../src/GraphState.svelte.js'
import { normalizeGraph } from '../src/model/normalize.js'
import { buildTree, findNode } from '../src/model/tree.js'
import { CALL_FIELDS, measured } from './fixtures.js'

const FIELDS = { ...CALL_FIELDS, path: 'path', measures: 'm' }
const model = () => normalizeGraph(measured.nodes, measured.edges, FIELDS)

const state = (config = {}) =>
	new GraphState({
		nodes: measured.nodes,
		edges: measured.edges,
		fields: FIELDS,
		layout: 'points',
		...config
	})

describe('measures', () => {
	it('reads a named bag onto the canonical node', () => {
		expect(model().byId.get('parser')?.measures).toEqual({
			declarations: 900,
			unresolved: 0.9,
			tests: 0.1
		})
	})

	it('keeps only finite numbers — a measure is a quantity', () => {
		const junk = [{ id: 'x', label: 'x', m: { good: 1, bad: 'nope', worse: NaN } }]

		expect(normalizeGraph(junk, [], FIELDS).nodes[0].measures).toEqual({ good: 1 })
	})

	it('does not duplicate the bag into meta', () => {
		expect(model().byId.get('parser')?.meta).not.toHaveProperty('m')
	})

	it('sizes by a named measure', () => {
		const s = state({ sizeBy: 'declarations' })

		expect(s.cards.parser.w).toBeGreaterThan(s.cards.lexer.w)
		expect(s.cards.lexer.w).toBeGreaterThan(s.cards.util.w)
	})

	it('still accepts the built-in names, so #161 does not churn', () => {
		expect(state({ sizeBy: 'degree' }).cards.parser.w).toBeGreaterThan(0)
		expect(state({ sizeBy: 'weight' }).cards.parser.w).toBeGreaterThan(0)
	})

	it('floors a node the measure says nothing about', () => {
		const s = state({ sizeBy: 'declarations' })

		expect(s.cards.bare.w).toBeGreaterThan(0)
		expect(s.cards.bare.w).toBeLessThanOrEqual(s.cards.util.w)
	})

	it('switches the measure WITHOUT re-mapping fields', () => {
		// The whole reason for a bag: the same model, a different key, a layout re-run.
		const byDecls = state({ sizeBy: 'declarations' })
		const byTests = state({ sizeBy: 'tests' })

		// parser has the most declarations and the FEWEST tests, so the order inverts.
		expect(byDecls.cards.parser.w).toBeGreaterThan(byDecls.cards.lexer.w)
		expect(byTests.cards.parser.w).toBeLessThan(byTests.cards.lexer.w)
	})

	it('sums a named measure up the containment tree', () => {
		// A container's area is what it CONTAINS.
		const t = buildTree(model(), { measure: 'declarations' })

		expect(findNode(t, ['src'])?.value).toBe(1260)
	})

	it('defaults the tree to weight, so the earlier behaviour is unchanged', () => {
		// Two leaves, or `p` is a wrapper and folds away before it can be asserted on.
		const weighted = [
			{ id: 'a', label: 'a', path: ['p', 'a'], weight: 7 },
			{ id: 'b', label: 'b', path: ['p', 'b'], weight: 3 }
		]
		const t = buildTree(normalizeGraph(weighted, [], FIELDS))

		expect(findNode(t, ['p'])?.value).toBe(10)
	})
})
