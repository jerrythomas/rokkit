/* #166 — condensation as a pure step between the model and the layout.
 *
 * A collapsed group stands in for its members: they are hidden, every edge touching one
 * reroutes to the group, edges inside the group vanish, and parallel edges that rerouting
 * creates fold into one (weights summed, a count kept). Expanded, the group gives way to its
 * members. The whole thing is decidable from a model and a set of ids, so it is tested here
 * with no layout and no render.
 */
import { describe, it, expect } from 'vitest'
import { normalizeGraph } from '../src/model/normalize.js'
import { condense, groupsOf } from '../src/model/condense.js'

const FIELDS = { id: 'id', label: 'name', source: 'source', target: 'target', edgeWeight: 'w' }
const NODES = [
	{ id: 'api', name: 'api' },
	{ id: 'db', name: 'db' },
	{ id: 'scc', name: '3 in a cycle', members: ['tasks', 'indexer', 'watcher'], collapsed: true },
	{ id: 'tasks', name: 'tasks' },
	{ id: 'indexer', name: 'indexer' },
	{ id: 'watcher', name: 'watcher' }
]
const EDGES = [
	{ source: 'api', target: 'tasks', w: 300 },
	{ source: 'api', target: 'indexer', w: 20 },
	{ source: 'indexer', target: 'db', w: 1840 },
	{ source: 'tasks', target: 'indexer', w: 1840 },
	{ source: 'indexer', target: 'watcher', w: 96 },
	{ source: 'watcher', target: 'tasks', w: 4, weakest: true }
]
const model = normalizeGraph(NODES, EDGES, FIELDS)
const ids = (m: { nodes: { id: string }[] }) => m.nodes.map((n) => n.id).sort()
const pairs = (m: { edges: { source: string; target: string }[] }) => m.edges.map((e) => `${e.source}>${e.target}`).sort()

describe('groupsOf', () => {
	it('is every node with members, mapped to the members that exist', () => {
		expect([...groupsOf(model).entries()]).toEqual([['scc', ['tasks', 'indexer', 'watcher']]])
	})
})

describe('condense — a collapsed group', () => {
	const view = condense(model, new Set(['scc']))

	it('hides the members and keeps the group', () => {
		expect(ids(view)).toEqual(['api', 'db', 'scc'])
	})

	it('reroutes every edge touching a member to the group, and drops the ones inside it', () => {
		expect(pairs(view)).toEqual(['api>scc', 'scc>db'])
	})

	it('folds parallel edges into one, summing weights and counting what it stands for', () => {
		const into = view.edges.find((e) => e.target === 'scc')!
		expect(into.weight).toBe(320)
		expect(into.count).toBe(2)
		const out = view.edges.find((e) => e.source === 'scc')!
		expect(out.count).toBeUndefined()
		expect(out.weight).toBe(1840)
	})

	it('rebuilds lookups and neighbours for what is on screen', () => {
		expect(view.byId.has('tasks')).toBe(false)
		expect([...(view.neighbors.get('scc') ?? [])].sort()).toEqual(['api', 'db'])
	})
})

describe('condense — an expanded group', () => {
	it('gives way to its members and their internal edges, weakest flag intact', () => {
		const view = condense(model, new Set())
		expect(ids(view)).toEqual(['api', 'db', 'indexer', 'tasks', 'watcher'])
		expect(pairs(view)).toEqual(['api>indexer', 'api>tasks', 'indexer>db', 'indexer>watcher', 'tasks>indexer', 'watcher>tasks'])
		expect(view.edges.find((e) => e.weakest)?.source).toBe('watcher')
	})

	it('drops a pre-aggregated edge to the group once its members are shown', () => {
		const m = normalizeGraph(NODES, [...EDGES, { source: 'api', target: 'scc', w: 320 }], FIELDS)
		expect(pairs(condense(m, new Set()))).not.toContain('api>scc')
	})

	it('stays as itself while its members have not arrived — there is nothing to show yet', () => {
		const m = normalizeGraph([NODES[0], NODES[2]], [{ source: 'api', target: 'scc' }], FIELDS)
		const view = condense(m, new Set())
		expect(ids(view)).toEqual(['api', 'scc'])
		expect(pairs(view)).toEqual(['api>scc'])
	})
})

describe('condense — beyond one group', () => {
	it('reroutes an edge between two collapsed groups group-to-group', () => {
		const m = normalizeGraph(
			[
				{ id: 'g1', name: 'g1', members: ['a'] },
				{ id: 'g2', name: 'g2', members: ['b'] },
				{ id: 'a', name: 'a' },
				{ id: 'b', name: 'b' }
			],
			[{ source: 'a', target: 'b' }],
			FIELDS
		)
		expect(pairs(condense(m, new Set(['g1', 'g2'])))).toEqual(['g1>g2'])
	})

	it('returns the model itself when there is nothing to condense', () => {
		const plain = normalizeGraph([{ id: 'a', name: 'a' }], [], FIELDS)
		expect(condense(plain, new Set())).toBe(plain)
	})
})
