/* #166 — a collapsed group node, as the model reads it.
 *
 * The host computes the strongly-connected components and sends each as a node with `members`;
 * rokkit computes no graph algorithm. The edge with the fewest occurrences — the cheapest link
 * to cut — arrives flagged `weakest`.
 */
import { describe, it, expect } from 'vitest'
import { normalizeGraph } from '../src/model/normalize.js'

const FIELDS = { id: 'id', label: 'name', group: 'group', source: 'source', target: 'target' }

describe('normalizeGraph — groups', () => {
	it('reads a group’s members and its collapsed flag, and keeps them out of meta', () => {
		const m = normalizeGraph(
			[{ id: 'scc:1', name: '3 in a cycle', members: ['a', 'b', 'c'], collapsed: true, extra: 1 }],
			[],
			FIELDS
		)
		expect(m.nodes[0]).toMatchObject({ members: ['a', 'b', 'c'], collapsed: true })
		expect(m.nodes[0].meta).toEqual({ extra: 1 })
	})

	it('maps them through fields like any other key', () => {
		const m = normalizeGraph([{ id: 'g', name: 'G', parts: ['a'], folded: false }], [], {
			...FIELDS,
			members: 'parts',
			collapsed: 'folded'
		})
		expect(m.nodes[0]).toMatchObject({ members: ['a'], collapsed: false })
	})

	it('adds nothing to an ordinary node — existing node shapes stay key-for-key identical', () => {
		const m = normalizeGraph([{ id: 'a', name: 'A' }], [], FIELDS)
		expect(m.nodes[0]).not.toHaveProperty('members')
		expect(m.nodes[0]).not.toHaveProperty('collapsed')
	})

	it('flags the weakest edge, and only that one', () => {
		const m = normalizeGraph(
			[{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
			[
				{ source: 'a', target: 'b', weakest: true },
				{ source: 'b', target: 'a' }
			],
			FIELDS
		)
		expect(m.edges.map((e) => e.weakest)).toEqual([true, undefined])
		expect(m.edges[1]).not.toHaveProperty('weakest')
	})
})
