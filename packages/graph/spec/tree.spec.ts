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
import { CALL_FIELDS, delimitedPath, nestedPath } from './fixtures.js'

const FIELDS = { ...CALL_FIELDS, path: 'path', note: 'note' }
const model = () => normalizeGraph(nestedPath.nodes, nestedPath.edges, FIELDS)
const tree = () => buildTree(model())

/** Child labels at one path, for readable assertions. */
const childrenAt = (segments: string[]) =>
	findNode(tree(), segments)?.children.map((c) => c.label).sort()

describe('path on the canonical model', () => {
	it('reads a mapped path onto the node', () => {
		expect(model().byId.get('a')?.path).toEqual(['dbd', 'core', 'lexer', 'parse'])
	})

	it('splits a DELIMITED string into the same path', () => {
		// A file path arrives as a string. Requiring the consumer to split it is asking them
		// to write the same three lines every time.
		const m = normalizeGraph(delimitedPath.nodes, delimitedPath.edges, FIELDS)

		expect(m.byId.get('a')?.path).toEqual(['dbd', 'core', 'lexer', 'parse'])
	})

	it('builds the SAME tree from either form', () => {
		const fromArray = buildTree(normalizeGraph(nestedPath.nodes, [], FIELDS))
		const fromString = buildTree(normalizeGraph(delimitedPath.nodes, [], FIELDS))

		expect(fromString).toEqual(fromArray)
	})

	it('ignores empty segments, so a leading or doubled slash is harmless', () => {
		const m = normalizeGraph([{ id: 'x', label: 'x', path: '/a//b/' }], [], FIELDS)

		expect(m.byId.get('x')?.path).toEqual(['a', 'b'])
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

	it('makes a real node the container when other paths extend past it', () => {
		// `mod_42` sits AT dbd/core/lexer while parse and tokenize sit under it. No id
		// convention: containment is prefix, so the container keeps its own id, label and note
		// and can carry edges like any other node.
		const lexer = findNode(tree(), ['dbd', 'core', 'lexer'])

		expect(lexer?.label).toBe('Lexer')
		expect(lexer?.node?.id).toBe('mod_42')
		expect(lexer?.node?.note).toBe('Tokeniser.')
		expect(lexer?.children.map((c) => c.label).sort()).toEqual(['parse', 'tokenize'])
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

	it('never folds a container the data actually declares', () => {
		// A declared node carries its own id, label, note and edges — folding it would drop
		// them. The rule is "a wrapper is not a level", and a thing the data names is not a
		// wrapper. `pkg` gets a second child so it is not itself a wrapper, which isolates the
		// declaration rule from the folding rule rather than testing both at once.
		const single = [
			{ id: 'only', label: 'solo', path: ['pkg', 'mod', 'solo'], weight: 1 },
			{ id: 'mod_1', label: 'Module', path: ['pkg', 'mod'], note: 'Has its own meaning.' },
			{ id: 'sibling', label: 'sibling', path: ['pkg', 'sibling'], weight: 1 }
		]
		const t = buildTree(normalizeGraph(single, [], FIELDS))
		const mod = findNode(t, ['pkg', 'mod'])

		expect(mod?.label).toBe('Module')
		expect(mod?.node?.id).toBe('mod_1')
		expect(mod?.children.map((c) => c.label)).toEqual(['solo'])
	})

	it('gives a declared container its OWN measure on top of its children', () => {
		// A module can hold declarations of its own — a file has top-level code as well as the
		// functions inside it — so a container's value is its subtree PLUS itself.
		// `other` keeps `pkg` from being a single-child wrapper, so the assertion is about the
		// container's own measure and not about folding.
		const own = [
			{ id: 'm', label: 'mod', path: ['pkg', 'mod'], weight: 5 },
			{ id: 'x', label: 'x', path: ['pkg', 'mod', 'x'], weight: 10 },
			{ id: 'y', label: 'y', path: ['pkg', 'mod', 'y'], weight: 20 },
			{ id: 'other', label: 'other', path: ['pkg', 'other'], weight: 1 }
		]
		const t = buildTree(normalizeGraph(own, [], FIELDS))

		expect(findNode(t, ['pkg', 'mod'])?.value).toBe(35)
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
			{ id: 'x', label: 'x', path: ['p', 'x'], weight: 10 },
			{ id: 'y', label: 'y', path: ['p', 'y'] }
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
