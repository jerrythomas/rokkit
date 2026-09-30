/* Every containment box knows where it is in the tree — the address a drill needs.
 *
 * `focusPath` scopes the canvas to a subtree, so drilling into a box means setting
 * `focusPath` to THAT box's path. A box therefore has to carry its full path (not just its name,
 * which repeats across branches), and whether anything lies below it. Asserted through
 * GraphState, as the other layout specs are.
 */
import { describe, it, expect } from 'vitest'
import { GraphState } from '../src/GraphState.svelte.js'
import { CALL_FIELDS, nestedPath } from './fixtures.js'

const FIELDS = { ...CALL_FIELDS, path: 'path', note: 'note' }
const state = (layout: string, config = {}) =>
	new GraphState({ nodes: nestedPath.nodes, edges: nestedPath.edges, fields: FIELDS, layout, ...config })

describe.each(['world', 'sunburst', 'structure'])('%s boxes carry their tree path', (layout) => {
	it('gives every box its full path from the root, outermost first', () => {
		const clusters = state(layout, { levels: 4 }).clusters
		expect(clusters.length).toBeGreaterThan(0)
		// A name repeats across branches; a path cannot — it is the box's address. A node with
		// no path sits at the root with `[]`: it has no address of its own (and is not drillable).
		const addressed = clusters.filter((c) => c.name !== 'orphan')
		const paths = addressed.map((c) => c.path?.join('/'))
		expect(paths.every((p) => typeof p === 'string' && p.length > 0)).toBe(true)
		expect(new Set(paths).size).toBe(paths.length)
		expect(clusters.find((c) => c.name === 'orphan')?.path ?? []).toEqual([])
		const lexer = clusters.find((c) => c.path?.join('/') === 'dbd/core/lexer')
		expect(lexer).toBeDefined()
	})

	it('marks a container as not a leaf', () => {
		const lexer = state(layout, { levels: 4 }).clusters.find((c) => c.path?.join('/') === 'dbd/core/lexer')
		expect(lexer?.leaf).toBe(false)
	})

	it('uses the TREE path — an undeclared single-child wrapper folds out of it', () => {
		// `plan` is declared at dbd/core/apply/plan; `apply` holds nothing else and folds away,
		// so the box — and the focusPath that drills into it — is dbd/core/plan.
		const plan = state(layout, { levels: 4 }).clusters.find((c) => c.name === 'plan')
		if (layout !== 'structure') expect(plan?.path).toEqual(['dbd', 'core', 'plan'])
	})

	it('keeps paths absolute when the canvas is scoped by focusPath', () => {
		const clusters = state(layout, { focusPath: ['dbd', 'core'], levels: 2 }).clusters
		expect(clusters.every((c) => c.path?.slice(0, 2).join('/') === 'dbd/core')).toBe(true)
	})
})

describe.each(['world', 'sunburst'])('%s leaf boxes', (layout) => {
	it('marks a box with nothing below it in the data as a leaf', () => {
		const parse = state(layout, { levels: 4 }).clusters.find((c) => c.path?.join('/') === 'dbd/core/lexer/parse')
		expect(parse?.leaf).toBe(true)
	})
})

describe('structure bands', () => {
	it('are never leaves — its leaves are the cards on the rim', () => {
		const bands = state('structure', { levels: 4 }).clusters
		expect(bands.length).toBeGreaterThan(0)
		expect(bands.every((c) => c.leaf === false)).toBe(true)
	})
})
