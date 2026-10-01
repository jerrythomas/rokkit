/* The cycles demo's HOST side (#166): it finds the strongly-connected components and sends each
 * as a collapsed group node, flagging the cheapest edge to cut. rokkit draws; the host computes.
 */
import { describe, it, expect } from 'vitest'
import { stronglyConnected, withCycleGroups } from '../../src/lib/koan/demos/graph/cycles'
import { datasets } from '../../src/lib/koan/demos/graph/datasets'

const E = (source: string, target: string, weight?: number) => ({ source, target, weight })

describe('stronglyConnected', () => {
	it('finds each cycle, and nothing for an acyclic graph', () => {
		const sccs = stronglyConnected(['a', 'b', 'c', 'd', 'e'], [E('a', 'b'), E('b', 'c'), E('c', 'a'), E('c', 'd'), E('d', 'e')])
		expect(sccs.map((s) => [...s].sort())).toEqual([['a', 'b', 'c']])
		expect(stronglyConnected(['a', 'b'], [E('a', 'b')])).toEqual([])
	})

	it('separates two cycles joined by a one-way edge', () => {
		const sccs = stronglyConnected(['a', 'b', 'c', 'd'], [E('a', 'b'), E('b', 'a'), E('b', 'c'), E('c', 'd'), E('d', 'c')])
		expect(sccs.map((s) => [...s].sort()).sort()).toEqual([['a', 'b'], ['c', 'd']])
	})
})

describe('withCycleGroups', () => {
	it('adds a collapsed group per cycle and flags its lightest internal edge as weakest', () => {
		const out = withCycleGroups(
			[{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'x' }],
			[E('a', 'b', 50), E('b', 'c', 9), E('c', 'a', 2), E('x', 'a', 1)]
		)
		const group = out.nodes.find((n) => 'members' in n) as { members: string[]; collapsed: boolean; label: string }
		expect([...group.members].sort()).toEqual(['a', 'b', 'c'])
		expect(group.collapsed).toBe(true)
		expect(group.label).toBe('3 components in a cycle')
		expect(out.edges.filter((e) => e.weakest)).toEqual([expect.objectContaining({ source: 'c', target: 'a' })])
	})

	it('finds a real cycle in rokkit’s own component imports — the demo has something to show', () => {
		const data = datasets.cycles
		expect((data.nodes as { members?: string[] }[]).some((n) => n.members && n.members.length > 1)).toBe(true)
	})
})
