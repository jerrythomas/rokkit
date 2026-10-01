/* #168 — containment given as `parent` ids, the shape many hosts send, becomes a `path`. */
import { describe, it, expect } from 'vitest'
import { normalizeGraph } from '../src/model/normalize.js'
import { buildTree, findNode } from '../src/model/tree.js'

const FIELDS = { id: 'id', label: 'name', source: 'source', target: 'target' }
const NODES = [
	{ id: 'crate:senseid', name: 'senseid', parent: null },
	{ id: 'mod:indexer', name: 'indexer', parent: 'crate:senseid' },
	{ id: 'file:resolve', name: 'resolve.rs', parent: 'mod:indexer' },
	{ id: 'file:fqn', name: 'fqn.rs', parent: 'mod:indexer' }
]

describe('normalizeGraph — parent ids', () => {
	it('derives each node’s path from its parent chain, as ids', () => {
		const m = normalizeGraph(NODES, [], FIELDS)
		expect(m.byId.get('file:resolve')?.path).toEqual(['crate:senseid', 'mod:indexer', 'file:resolve'])
		expect(m.byId.get('crate:senseid')?.path).toEqual(['crate:senseid'])
	})

	it('keeps parent out of meta', () => {
		expect(normalizeGraph(NODES, [], FIELDS).byId.get('mod:indexer')?.meta).toEqual({})
	})

	it('builds the containment tree the host meant, labelled by the declared nodes', () => {
		const tree = buildTree(normalizeGraph(NODES, [], FIELDS))
		const indexer = findNode(tree, ['crate:senseid', 'mod:indexer'])
		expect(indexer?.label).toBe('indexer')
		expect(indexer?.children.map((c) => c.label).sort()).toEqual(['fqn.rs', 'resolve.rs'])
	})

	it('lets an explicit path win over a parent', () => {
		const m = normalizeGraph([{ id: 'a', name: 'a', path: ['x', 'a'], parent: 'b' }, { id: 'b', name: 'b' }], [], FIELDS)
		expect(m.byId.get('a')?.path).toEqual(['x', 'a'])
	})

	it('keeps a dangling parent as the container it names — something not indexed', () => {
		const m = normalizeGraph([{ id: 'a', name: 'a', parent: 'ghost' }], [], FIELDS)
		expect(m.byId.get('a')?.path).toEqual(['ghost', 'a'])
	})

	it('cuts a parent cycle where it closes instead of looping', () => {
		const m = normalizeGraph(
			[
				{ id: 'a', name: 'a', parent: 'b' },
				{ id: 'b', name: 'b', parent: 'a' }
			],
			[],
			FIELDS
		)
		expect(m.byId.get('a')?.path).toEqual(['b', 'a'])
		expect(m.byId.get('b')?.path).toEqual(['a', 'b'])
	})

	it('maps parent through fields, and leaves a node with neither alone', () => {
		const m = normalizeGraph([{ id: 'a', name: 'a', up: 'b' }, { id: 'b', name: 'b' }, { id: 'c', name: 'c' }], [], { ...FIELDS, parent: 'up' })
		expect(m.byId.get('a')?.path).toEqual(['b', 'a'])
		expect(m.byId.get('c')).not.toHaveProperty('path', expect.anything())
	})
})
