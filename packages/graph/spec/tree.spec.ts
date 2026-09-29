/* Containment (#163, design step 1).
 *
 * `group` is one flat key; a codebase is containment six deep. `path` carries the chain, and
 * the tree is DERIVED from it — synthesising the containers the data implies but does not
 * state, folding away the ones that add no level, and summing each subtree's measure.
 *
 * Pure. No geometry, no render — which is the point: the whole of containment is provable
 * from a dataset before a single box is drawn. */

import { describe, it, expect } from 'vitest'
import { buildTree, findNode } from '../src/model/tree.js'
import { normalizeGraph } from '../src/model/normalize.js'
import { CALL_FIELDS, nestedPath } from './fixtures.js'

const FIELDS = { ...CALL_FIELDS, path: 'path', note: 'note' }
const model = () => normalizeGraph(nestedPath.nodes, nestedPath.edges, FIELDS)
const tree = () => buildTree(model())

/** Child labels at one path, for readable assertions. */
const childrenAt = (segments: string[]) =>
	findNode(tree(), segments)?.children.map((c) => c.label).sort()

describe('path on the canonical model', () => {
	it('reads a mapped path onto the node', () => {
		expect(model().byId.get('a')?.path).toEqual(['dbd', 'core', 'lexer'])
	})

	it('leaves a node with no path at the root', () => {
		expect(model().byId.get('e')?.path).toBeUndefined()
	})

	it('does not duplicate the path into meta', () => {
		expect(model().byId.get('a')?.meta).not.toHaveProperty('path')
	})
})

describe('buildTree', () => {
	it('synthesises the containers the data implies but never states', () => {
		// Nothing in the input declares `dbd` or `dbd/core`; both are implied by the paths.
		expect(findNode(tree(), ['dbd'])).toBeDefined()
		expect(findNode(tree(), ['dbd', 'core'])).toBeDefined()
	})

	it('puts a node with no path at the root', () => {
		expect(tree().children.map((c) => c.label).sort()).toEqual(['dbd', 'orphan'])
	})

	it('nests leaves under their own container', () => {
		expect(childrenAt(['dbd', 'core', 'lexer'])).toEqual(['parse', 'tokenize'])
	})

	it('lets a REAL node claim its container, carrying its own label and note', () => {
		// `dbd/core/lexer` exists as a node. Without claiming, its label and note would be
		// dropped and the box would be titled with the bare path segment.
		const lexer = findNode(tree(), ['dbd', 'core', 'lexer'])

		expect(lexer?.label).toBe('Lexer')
		expect(lexer?.node?.note).toBe('Tokeniser and parser.')
	})

	it('titles an unclaimed container with its path segment', () => {
		expect(findNode(tree(), ['dbd', 'core'])?.label).toBe('core')
		expect(findNode(tree(), ['dbd', 'core'])?.node).toBeUndefined()
	})

	it('folds away a container that adds no level', () => {
		// `dbd/core/apply` holds exactly one leaf and nothing claims it. Three boxes for one
		// function is not a hierarchy, it is punctuation.
		expect(findNode(tree(), ['dbd', 'core', 'apply'])).toBeUndefined()
		expect(childrenAt(['dbd', 'core'])).toEqual(['Lexer', 'plan'])
	})

	it('folds a CHAIN of wrappers, not just one', () => {
		// dbd/site/ui/view holds one leaf; so does each level above it.
		expect(childrenAt(['dbd'])).toEqual(['core', 'render'])
	})

	it('never folds a container a real node claims', () => {
		// It is an entity with its own data, not a wrapper — folding it would drop that data.
		// `pkg` gets a second child so it is not itself a wrapper — this isolates the claim
		// rule from the folding rule rather than testing both at once.
		const single = [
			{ id: 'only', label: 'solo', path: ['pkg', 'mod'], weight: 1 },
			{ id: 'pkg/mod', label: 'Module', note: 'Has its own meaning.' },
			{ id: 'sibling', label: 'sibling', path: ['pkg'], weight: 1 }
		]
		const t = buildTree(normalizeGraph(single, [], FIELDS))
		const mod = findNode(t, ['pkg', 'mod'])

		expect(mod?.label).toBe('Module')
		expect(mod?.children.map((c) => c.label)).toEqual(['solo'])
	})

	it('sums each subtree’s measure, including its own leaves', () => {
		const t = tree()

		expect(findNode(t, ['dbd', 'core', 'lexer'])?.value).toBe(100)
		// core = lexer(100) + plan(25)
		expect(findNode(t, ['dbd', 'core'])?.value).toBe(125)
		// dbd = core(125) + render(10)
		expect(findNode(t, ['dbd'])?.value).toBe(135)
		// root = dbd(135) + orphan(5)
		expect(t.value).toBe(140)
	})

	it('treats a missing weight as zero rather than breaking the sum', () => {
		const some = [
			{ id: 'x', label: 'x', path: ['p'], weight: 10 },
			{ id: 'y', label: 'y', path: ['p'] }
		]
		const t = buildTree(normalizeGraph(some, [], FIELDS))

		expect(findNode(t, ['p'])?.value).toBe(10)
	})

	it('reports the depth of every node, so a layout can materialise N levels', () => {
		expect(tree().depth).toBe(0)
		expect(findNode(tree(), ['dbd'])?.depth).toBe(1)
		expect(findNode(tree(), ['dbd', 'core'])?.depth).toBe(2)
	})

	it('orders children stably, so a re-render never reshuffles the picture', () => {
		expect(buildTree(model())).toEqual(buildTree(model()))
	})

	it('handles a model with no paths at all — every node at the root', () => {
		const flat = [
			{ id: 'a', label: 'a', weight: 1 },
			{ id: 'b', label: 'b', weight: 2 }
		]
		const t = buildTree(normalizeGraph(flat, [], FIELDS))

		expect(t.children.map((c) => c.label)).toEqual(['a', 'b'])
		expect(t.value).toBe(3)
	})

	it('handles an empty model', () => {
		const t = buildTree(normalizeGraph([], [], FIELDS))

		expect(t.children).toEqual([])
		expect(t.value).toBe(0)
	})
})
