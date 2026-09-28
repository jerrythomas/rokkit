/* Characterization tests for cluster building/ordering/packing/flow, ported from dbd's
   layout-clusters.test.ts. Every numeric assertion is carried over unchanged — only the
   fixture SHAPE moves (LayoutData -> GraphModel) and `hue` becomes `groupIndex`. A failing
   number here means the port changed behaviour; fix the port, never the number. */

import { it, expect, describe } from 'vitest'
import {
	groupByGroup,
	buildAdjacency,
	buildClusters,
	pack,
	orderClusters,
	flow,
	barycenterPasses
} from '../../src/layout/clusters.js'
import type { Cards, Card, Cluster } from '../../src/layout/types.js'
import type { GraphEdge, GraphModel, GraphNode } from '../../src/types.js'

function node(id: string, group: string, label: string): GraphNode {
	return { id, label, group, rows: [], meta: {} }
}

function makeCard(x: number, y: number, w: number, h: number): Card {
	return { node: node('s.t', 's', 't'), vis: [], more: 0, w, h, x, y }
}

function edge(source: string, target: string): GraphEdge {
	return { id: `${source}->${target}`, source, target, kind: 'reference' }
}

/** A GraphModel literal — the analogue of the source suite's LayoutData fixtures. */
function model(nodes: GraphNode[], edges: GraphEdge[]): GraphModel {
	return {
		nodes,
		edges,
		byId: new Map(nodes.map((n) => [n.id, n])),
		neighbors: new Map()
	}
}

describe('groupByGroup', () => {
	it("groups nodes by group, preserving each group's original node order", () => {
		const grouped = groupByGroup([node('b.t1', 'b', 't1'), node('a.t2', 'a', 't2'), node('b.t3', 'b', 't3')])

		expect(Object.keys(grouped).sort()).toEqual(['a', 'b'])
		expect(grouped.b.map((t) => t.label)).toEqual(['t1', 't3'])
		expect(grouped.a.map((t) => t.label)).toEqual(['t2'])
	})

	it('files an ungrouped node under the empty-string group', () => {
		// New: the canonical model makes `group` optional, which LayoutData did not.
		const grouped = groupByGroup([{ id: 'solo', label: 'solo', rows: [], meta: {} }])

		expect(Object.keys(grouped)).toEqual([''])
	})
})

describe('buildAdjacency', () => {
	it('builds a bidirectional neighbor map and skips same-table (self) refs', () => {
		const nbrs = buildAdjacency([edge('a.x', 'a.x'), edge('a.x', 'b.y')])

		expect(nbrs.get('a.x')).toEqual(['b.y'])
		expect(nbrs.get('b.y')).toEqual(['a.x'])
	})
})

describe('buildAdjacency — multiplicity', () => {
	it('records a neighbour once per edge, so a doubly-linked pair appears twice', () => {
		// barycenter divides by the ARRAY LENGTH, so this duplicate is what makes a
		// twice-referenced neighbour pull twice as hard. De-duplicating changes the layout.
		const edges = [edge('a.x', 'b.y'), edge('a.x', 'b.y')]

		expect(buildAdjacency(edges).get('a.x')).toEqual(['b.y', 'b.y'])
	})

	it('skips a self-edge', () => {
		expect(buildAdjacency([edge('a.x', 'a.x')]).get('a.x')).toBeUndefined()
	})
})

describe('buildClusters', () => {
	it('sorts groups alphabetically, sorts each list, and assigns groupIndex by a-z position', () => {
		const byGroup: Record<string, GraphNode[]> = {
			zebra: [node('zebra.z1', 'zebra', 'z1')],
			apple: [node('apple.a2', 'apple', 'a2'), node('apple.a1', 'apple', 'a1')]
		}
		const clusters = buildClusters(byGroup)

		expect(clusters.map((c) => c.name)).toEqual(['apple', 'zebra'])
		expect(clusters[0].list.map((t) => t.label)).toEqual(['a1', 'a2'])
		expect(clusters[0].count).toBe(2)
		expect(clusters[0].groupIndex).toBe(0)
		expect(clusters[1].groupIndex).toBe(1)
	})
})

describe('pack', () => {
	it('masonry-packs a 3-table cluster into the shortest column each step', () => {
		const cluster: Cluster = {
			name: 's',
			list: [node('s.t1', 's', 't1'), node('s.t2', 's', 't2'), node('s.t3', 's', 't3')],
			count: 3,
			groupIndex: 0,
			x: 0,
			y: 0
		}
		const cards: Cards = {
			's.t1': makeCard(0, 0, 248, 100),
			's.t2': makeCard(0, 0, 248, 150),
			's.t3': makeCard(0, 0, 248, 80)
		}
		pack(cluster, cards)

		expect(cluster.pos).toEqual([
			{ key: 's.t1', dx: 0, dy: 0 },
			{ key: 's.t2', dx: 284, dy: 0 },
			{ key: 's.t3', dx: 0, dy: 130 }
		])
		expect(cluster.w).toBe(584)
		expect(cluster.h).toBe(278)
	})

	it('packs a single-table cluster into one column', () => {
		const cluster: Cluster = {
			name: 's',
			list: [node('s.t1', 's', 't1')],
			count: 1,
			groupIndex: 0,
			x: 0,
			y: 0
		}
		const cards: Cards = { 's.t1': makeCard(0, 0, 248, 100) }
		pack(cluster, cards)

		expect(cluster.pos).toEqual([{ key: 's.t1', dx: 0, dy: 0 }])
		expect(cluster.w).toBe(300)
		expect(cluster.h).toBe(168)
	})
})

describe('orderClusters', () => {
	const A: Cluster = { name: 'A', list: [], count: 0, groupIndex: 0, x: 0, y: 0, w: 5, h: 2 }
	const B: Cluster = { name: 'B', list: [], count: 0, groupIndex: 0, x: 0, y: 0, w: 10, h: 10 }
	const C: Cluster = { name: 'C', list: [], count: 0, groupIndex: 0, x: 0, y: 0, w: 10, h: 5 }

	it('sorts by area (biggest first) for any arrange other than untangle', () => {
		const ordered = orderClusters([A, B, C], model([], []), 'a-z')

		expect(ordered.map((c) => c.name)).toEqual(['B', 'C', 'A'])
	})

	it('sorts by area for untangle when there is only one cluster (no chaining possible)', () => {
		const ordered = orderClusters([A], model([], []), 'untangle')

		expect(ordered.map((c) => c.name)).toEqual(['A'])
	})

	it('greedily chains groups by inter-group link weight for untangle', () => {
		const nodes: GraphNode[] = []
		const edges: GraphEdge[] = []
		const push = (s1: string, s2: string, n: number) => {
			for (let i = 0; i < n; i++) {
				const from = node(`${s1}.t${i}${s1}${s2}`, s1, `t${i}${s1}${s2}`)
				const to = node(`${s2}.u${i}${s1}${s2}`, s2, `u${i}${s1}${s2}`)
				nodes.push(from, to)
				edges.push(edge(from.id, to.id))
			}
		}
		push('A', 'B', 5) // strong A-B link
		push('C', 'B', 1) // weak C-B link
		push('C', 'A', 2) // medium C-A link

		// Seed = largest by area (B). Then greedily picks the best-linked remaining
		// cluster at each step (A beats C against {B}; C is then appended).
		const ordered = orderClusters([A, B, C], model(nodes, edges), 'untangle')

		expect(ordered.map((c) => c.name)).toEqual(['B', 'A', 'C'])
	})

	it('ignores intra-group edges and unknown endpoints when weighting the chain', () => {
		// New: the ported fixture is all clean cross-group edges, so nothing exercised the
		// skip. Real schemas are mostly INTRA-group FKs, and only cross-group links should
		// steer cluster order — an intra-group edge says nothing about which clusters
		// belong side by side. An endpoint the model does not know is skipped for the same
		// reason: it has no group to attribute the link to.
		const nodes: GraphNode[] = []
		const edges: GraphEdge[] = []
		const push = (s1: string, s2: string, n: number) => {
			for (let i = 0; i < n; i++) {
				const from = node(`${s1}.t${i}${s1}${s2}`, s1, `t${i}${s1}${s2}`)
				const to = node(`${s2}.u${i}${s1}${s2}`, s2, `u${i}${s1}${s2}`)
				nodes.push(from, to)
				edges.push(edge(from.id, to.id))
			}
		}
		push('A', 'B', 5)
		push('C', 'B', 1)
		push('C', 'A', 2)

		// Noise: an intra-group pair, and an edge to a node the model has never heard of.
		const a1 = node('A.solo1', 'A', 'solo1')
		const a2 = node('A.solo2', 'A', 'solo2')
		nodes.push(a1, a2)
		edges.push(edge(a1.id, a2.id), edge(a1.id, a2.id), edge(a1.id, 'nowhere.ghost'))

		const ordered = orderClusters([A, B, C], model(nodes, edges), 'untangle')

		expect(ordered.map((c) => c.name)).toEqual(['B', 'A', 'C'])
	})
})

describe('flow', () => {
	it('lays out clusters left-to-right in a row and places their cards (no wrap)', () => {
		const c1: Cluster = {
			name: 'a',
			list: [],
			count: 0,
			groupIndex: 0,
			x: 0,
			y: 0,
			w: 500,
			h: 300,
			pos: [{ key: 'a.t1', dx: 0, dy: 0 }]
		}
		const c2: Cluster = {
			name: 'b',
			list: [],
			count: 0,
			groupIndex: 0,
			x: 0,
			y: 0,
			w: 400,
			h: 200,
			pos: [{ key: 'b.t1', dx: 10, dy: 20 }]
		}
		const cards: Cards = { 'a.t1': makeCard(0, 0, 248, 100), 'b.t1': makeCard(0, 0, 248, 100) }
		const size = flow([c1, c2], cards)

		expect(c1.x).toBe(0)
		expect(c1.y).toBe(0)
		expect(c2.x).toBe(610)
		expect(c2.y).toBe(0)
		expect(cards['a.t1']).toMatchObject({ x: 26, y: 42, groupIndex: 0 })
		expect(cards['b.t1']).toMatchObject({ x: 646, y: 62, groupIndex: 0 })
		expect(size).toEqual({ w: 1070, h: 360 })
	})

	it('wraps to a new row when a cluster would exceed MAX_ROW_W', () => {
		const c1: Cluster = {
			name: 'a',
			list: [],
			count: 0,
			groupIndex: 0,
			x: 0,
			y: 0,
			w: 2000,
			h: 100,
			pos: []
		}
		const c2: Cluster = {
			name: 'b',
			list: [],
			count: 0,
			groupIndex: 0,
			x: 0,
			y: 0,
			w: 2000,
			h: 50,
			pos: []
		}
		const size = flow([c1, c2], {})

		expect(c1.x).toBe(0)
		expect(c1.y).toBe(0)
		expect(c2.x).toBe(0)
		expect(c2.y).toBe(210) // wrapped below row 1 (100 + CL_GAP_Y 110)
		expect(size).toEqual({ w: 2060, h: 320 })
	})

	it('treats a cluster with no packed positions as placeable', () => {
		// New: `pos` is optional on Cluster, and flow is called on clusters that have not
		// been packed (orderClusters can hand back an unpacked cluster). It must place the
		// cluster origin and skip the card loop rather than throw.
		const c: Cluster = { name: 'a', list: [], count: 0, groupIndex: 0, x: 0, y: 0, w: 100, h: 50 }

		expect(flow([c], {})).toEqual({ w: 160, h: 110 })
		expect(c.x).toBe(0)
	})
})

describe('barycenterPasses', () => {
	it("reorders a cluster's tables toward their neighbors' positions over two passes", () => {
		const byGroup: Record<string, GraphNode[]> = {
			s: [node('s.t1', 's', 't1'), node('s.t2', 's', 't2'), node('s.t3', 's', 't3')]
		}
		const clusters = buildClusters(byGroup)
		const cards: Cards = {
			's.t1': makeCard(0, 0, 248, 60),
			's.t2': makeCard(0, 0, 248, 120),
			's.t3': makeCard(0, 0, 248, 90),
			'anchor.hi': makeCard(0, 500, 248, 40),
			'anchor.lo': makeCard(0, 10, 248, 40)
		}
		// t1 is pulled toward a low-positioned neighbor (high y), t3 toward a
		// high-positioned neighbor (low y); t2 has no neighbors (self-anchored).
		const nbrs = new Map<string, string[]>([
			['s.t1', ['anchor.hi']],
			['s.t3', ['anchor.lo']]
		])

		clusters.forEach((c) => pack(c, cards))
		const size = barycenterPasses(clusters, cards, nbrs)

		expect(clusters[0].list.map((t) => t.label)).toEqual(['t3', 't2', 't1'])
		expect(clusters[0].pos).toEqual([
			{ key: 's.t3', dx: 0, dy: 0 },
			{ key: 's.t2', dx: 284, dy: 0 },
			{ key: 's.t1', dx: 0, dy: 120 }
		])
		expect(cards['s.t3']).toMatchObject({ x: 26, y: 42 })
		expect(cards['s.t2']).toMatchObject({ x: 310, y: 42 })
		expect(cards['s.t1']).toMatchObject({ x: 26, y: 162 })
		expect(size).toEqual({ w: 644, h: 308 })
	})

	it('self-anchors a node whose neighbour list is present but empty', () => {
		// Distinct from t2 above, which has NO entry. An empty array reaches the same
		// self-anchoring path by the other side of the guard.
		const clusters = buildClusters({ s: [node('s.t1', 's', 't1')] })
		const cards: Cards = { 's.t1': makeCard(0, 0, 248, 60) }

		clusters.forEach((c) => pack(c, cards))
		barycenterPasses(clusters, cards, new Map([['s.t1', []]]))

		expect(clusters[0].list.map((t) => t.label)).toEqual(['t1'])
	})
})

describe('barycenterPasses — multiplicity weighting', () => {
	it('pulls a table further toward a neighbour it references twice', () => {
		const twice = buildAdjacency([edge('s.t', 's.hi'), edge('s.t', 's.hi'), edge('s.t', 's.lo')])
		const once = buildAdjacency([edge('s.t', 's.hi'), edge('s.t', 's.lo')])

		// (520 + 520 + 30) / 3 ≈ 356.67 vs (520 + 30) / 2 = 275 — a real divergence, and the
		// one a Set-based adjacency map would silently erase.
		expect(twice.get('s.t')).toHaveLength(3)
		expect(once.get('s.t')).toHaveLength(2)
	})
})
