import { describe, it, expect } from 'vitest'
import { cluster } from '../../src/layout/cluster.js'
import { normalizeGraph } from '../../src/model/normalize.js'
import type { GraphFields } from '../../src/types.js'

const FIELDS: GraphFields = {
	label: 'name',
	group: 'schema',
	rows: 'columns',
	source: 'from.t',
	target: 'to.t',
	sourceGroup: 'from.s',
	targetGroup: 'to.s',
	sourceRow: 'from.c',
	targetRow: 'to.c'
}

const NODES = [
	{ schema: 'public', name: 'users', columns: [{ name: 'id', type: 'uuid' }] },
	{ schema: 'public', name: 'orders', columns: [{ name: 'user_id', type: 'uuid' }] },
	{ schema: 'audit', name: 'log', columns: [{ name: 'id', type: 'uuid' }] }
]

const EDGES = [
	{ from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
]

const model = () => normalizeGraph(NODES, EDGES, FIELDS)

describe('cluster layout', () => {
	it('returns one cluster per group', () => {
		const result = cluster(model(), {})

		expect(result.clusters.map((c) => c.name).sort()).toEqual(['audit', 'public'])
	})

	it('returns a positioned card for every node', () => {
		const result = cluster(model(), {})

		expect(Object.keys(result.cards).sort()).toEqual(['audit.log', 'public.orders', 'public.users'])
	})

	it('routes every edge whose endpoints are laid out', () => {
		const result = cluster(model(), {})

		expect(result.edges).toHaveLength(1)
		expect(result.edges[0]).toMatchObject({ fromKey: 'public.orders', toKey: 'public.users' })
	})

	it('reports a canvas size large enough to contain every cluster', () => {
		const result = cluster(model(), {})

		for (const c of result.clusters) {
			expect(result.size.w).toBeGreaterThanOrEqual(c.x + (c.w ?? 0))
			expect(result.size.h).toBeGreaterThanOrEqual(c.y + (c.h ?? 0))
		}
	})

	it('defaults to density keys', () => {
		const result = cluster(model(), {})
		const explicit = cluster(model(), { density: 'keys' })

		expect(result.cards['public.users'].h).toBe(explicit.cards['public.users'].h)
	})

	it('produces taller cards at density full than at names', () => {
		const full = cluster(model(), { density: 'full' })
		const names = cluster(model(), { density: 'names' })

		expect(full.cards['public.users'].h).toBeGreaterThan(names.cards['public.users'].h)
	})

	it('is deterministic — same input, same output', () => {
		expect(cluster(model(), {})).toEqual(cluster(model(), {}))
	})

	it('assigns each card its cluster groupIndex', () => {
		const result = cluster(model(), {})

		// audit sorts before public, so audit is index 0.
		expect(result.cards['audit.log'].groupIndex).toBe(0)
		expect(result.cards['public.users'].groupIndex).toBe(1)
	})

	it('handles an empty model without throwing', () => {
		const result = cluster(normalizeGraph([], [], FIELDS), {})

		expect(result.clusters).toEqual([])
		expect(result.cards).toEqual({})
		expect(result.edges).toEqual([])
	})

	it('reports a finite zero size for an empty model', () => {
		// `Math.max(...[])` is -Infinity, so an unguarded flow reports a canvas of
		// -Infinity + 60. That renders as an SVG with a NaN/negative viewBox rather than an
		// empty one, and the assertions above would not notice.
		const { size } = cluster(normalizeGraph([], [], FIELDS), {})

		expect(Number.isFinite(size.w)).toBe(true)
		expect(size).toEqual({ w: 0, h: 0 })
	})

	it('threads arrange through to the cluster ordering, not just tolerating it', () => {
		// `.not.toThrow()` alone would pass against an implementation that ignored the option.
		//
		// The fixture has to be built for this. With only two clusters, untangle's chain IS
		// area order (seed = largest, one candidate left), so the strategies agree by
		// construction and the test proves nothing. Here `b` is the largest and `a` the
		// smallest, but `a` is strongly linked to `b` and `c` is weakly linked — so area
		// order is b,c,a while the untangle chain is b,a,c.
		const nodes: { schema: string; name: string; columns: [] }[] = []
		const add = (schema: string, n: number) => {
			for (let i = 0; i < n; i++) nodes.push({ schema, name: `t${i}`, columns: [] })
		}
		add('b', 4)
		add('c', 3)
		add('a', 2)

		const link = (s1: string, s2: string, n: number) =>
			Array.from({ length: n }, (_, i) => ({
				from: { s: s1, t: `t${i}`, c: 'id' },
				to: { s: s2, t: `t${i}`, c: 'id' }
			}))
		const edges = [...link('a', 'b', 2), ...link('c', 'b', 1)]

		const built = () => normalizeGraph(nodes, edges, FIELDS)
		const order = (arrange: 'untangle' | 'a-z') =>
			cluster(built(), { arrange }).clusters.map((c) => c.name)

		expect(order('a-z')).toEqual(['b', 'c', 'a'])
		expect(order('untangle')).toEqual(['b', 'a', 'c'])
	})

	it('orders clusters by descending area under a-z', () => {
		const result = cluster(model(), { arrange: 'a-z' })
		const areas = result.clusters.map((c) => (c.w ?? 0) * (c.h ?? 0))

		expect([...areas].sort((a, b) => b - a)).toEqual(areas)
	})

	it('defaults the edge anchors to the rows the density actually shows', () => {
		// At density 'names' no row is visible, so an edge must fall back to the head centre
		// rather than anchoring to a row the card is not drawing.
		const names = cluster(model(), { density: 'names' })
		const full = cluster(model(), { density: 'full' })

		expect(names.edges[0].y1).not.toBe(full.edges[0].y1)
	})
})
