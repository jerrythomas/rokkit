import { describe, it, expect } from 'vitest'
import { neighborhood } from '../../src/layout/neighborhood.js'
import { normalizeGraph } from '../../src/model/normalize.js'
import type { GraphFields } from '../../src/types.js'

const FIELDS: GraphFields = {
	label: 'name',
	group: 'schema',
	rows: 'columns',
	rowBadges: { pk: 'pk' },
	source: 'from.t',
	target: 'to.t',
	sourceGroup: 'from.s',
	targetGroup: 'to.s',
	sourceRow: 'from.c',
	targetRow: 'to.c'
}

const NODES = [
	{ schema: 'p', name: 'users', columns: [{ name: 'id', pk: true }, { name: 'email' }] },
	{ schema: 'p', name: 'orders', columns: [{ name: 'id', pk: true }, { name: 'user_id' }] },
	{ schema: 'p', name: 'profiles', columns: [{ name: 'id', pk: true }, { name: 'user_id' }] }
]

// orders -> users and profiles -> users: users is the target of both.
const EDGES = [
	{ from: { s: 'p', t: 'orders', c: 'user_id' }, to: { s: 'p', t: 'users', c: 'id' } },
	{ from: { s: 'p', t: 'profiles', c: 'user_id' }, to: { s: 'p', t: 'users', c: 'id' } }
]

const model = () => normalizeGraph(NODES, EDGES, FIELDS)

describe('neighborhood layout', () => {
	it('lays out the focus node and its direct neighbours only', () => {
		const result = neighborhood(model(), { focus: 'p.users' })

		expect(Object.keys(result.cards).sort()).toEqual(['p.orders', 'p.profiles', 'p.users'])
	})

	it('excludes a node that is not adjacent to the focus', () => {
		const detached = [
			...NODES,
			{ schema: 'p', name: 'settings', columns: [{ name: 'id', pk: true }] }
		]
		const result = neighborhood(normalizeGraph(detached, EDGES, FIELDS), { focus: 'p.users' })

		expect(Object.keys(result.cards)).not.toContain('p.settings')
	})

	it('centres the focus node horizontally between the two neighbour columns', () => {
		const result = neighborhood(model(), { focus: 'p.users' })
		const focus = result.cards['p.users']
		const inbound = result.cards['p.orders']

		expect(focus.x).toBeGreaterThan(inbound.x)
	})

	it('puts nodes that reference the focus on the left', () => {
		const result = neighborhood(model(), { focus: 'p.users' })

		expect(result.cards['p.orders'].x).toBeLessThan(result.cards['p.users'].x)
		expect(result.cards['p.profiles'].x).toBeLessThan(result.cards['p.users'].x)
	})

	it('puts nodes the focus references on the right', () => {
		const result = neighborhood(model(), { focus: 'p.orders' })

		expect(result.cards['p.users'].x).toBeGreaterThan(result.cards['p.orders'].x)
	})

	it('drops the left column entirely when nothing references the focus', () => {
		// The focus sits at x=0 rather than being indented past an empty column.
		const result = neighborhood(model(), { focus: 'p.orders' })

		expect(result.cards['p.orders'].x).toBe(0)
	})

	it('stacks two same-side neighbours without overlapping', () => {
		const result = neighborhood(model(), { focus: 'p.users' })
		const a = result.cards['p.orders']
		const b = result.cards['p.profiles']
		const [upper, lower] = a.y <= b.y ? [a, b] : [b, a]

		expect(upper.y + upper.h).toBeLessThanOrEqual(lower.y)
	})

	it('routes one edge per reference touching the focus', () => {
		const result = neighborhood(model(), { focus: 'p.users' })

		expect(result.edges).toHaveLength(2)
	})

	it('ignores an edge between two neighbours that does not touch the focus', () => {
		// profiles -> users does not touch orders, so focusing orders must not route it even
		// though buildEdges would happily connect any two laid-out cards.
		const result = neighborhood(model(), { focus: 'p.orders' })

		expect(result.edges).toHaveLength(1)
		expect(result.edges[0]).toMatchObject({ fromKey: 'p.orders', toKey: 'p.users' })
	})

	it('skips an unplaced edge rather than laying out a phantom neighbour', () => {
		// An unplaced endpoint is kept in the MODEL (dropping it would hide the relationship)
		// but it is not a node, so it has no card. Laying it out crashed on a missing card.
		const withGhost = [
			...EDGES,
			{ from: { s: 'p', t: 'nowhere', c: 'x' }, to: { s: 'p', t: 'users', c: 'id' } }
		]
		const model = normalizeGraph(NODES, withGhost, FIELDS)

		expect(model.edges.some((e) => e.unplaced)).toBe(true)
		expect(() => neighborhood(model, { focus: 'p.users' })).not.toThrow()
		expect(Object.keys(neighborhood(model, { focus: 'p.users' }).cards)).not.toContain('nowhere')
	})

	it('reports no clusters — neighbourhood is ungrouped by design', () => {
		const result = neighborhood(model(), { focus: 'p.users' })

		expect(result.clusters).toEqual([])
	})

	it('lays out the focus alone when it has no neighbours', () => {
		const result = neighborhood(normalizeGraph(NODES, [], FIELDS), { focus: 'p.users' })

		expect(Object.keys(result.cards)).toEqual(['p.users'])
		expect(result.edges).toEqual([])
	})

	it('returns an empty result when the focus is unknown', () => {
		const result = neighborhood(model(), { focus: 'p.nope' })

		expect(result.cards).toEqual({})
		expect(result.edges).toEqual([])
	})

	it('returns an empty result when no focus is given', () => {
		const result = neighborhood(model(), {})

		expect(result.cards).toEqual({})
	})

	it('keeps a self-reference on the focus card', () => {
		const selfRef = [{ from: { s: 'p', t: 'users', c: 'email' }, to: { s: 'p', t: 'users', c: 'id' } }]
		const result = neighborhood(normalizeGraph(NODES, selfRef, FIELDS), { focus: 'p.users' })

		expect(result.edges).toHaveLength(1)
		expect(result.edges[0].self).toBe(true)
	})

	it('shows a neighbour only its key and referenced rows, not every row', () => {
		const result = neighborhood(model(), { focus: 'p.users' })

		expect(result.cards['p.orders'].vis.map((r) => r.name).sort()).toEqual(['id', 'user_id'])
	})

	it('still counts a neighbour’s hidden rows in its more-count', () => {
		// A neighbour shows key + referenced rows only, but dbd's "+N more" counted against
		// the FULL column list. A card showing 1 of 4 must read "+3 more", not "+0".
		const wide = [
			{ schema: 'p', name: 'users', columns: [{ name: 'id', pk: true }] },
			{
				schema: 'p',
				name: 'orders',
				columns: [
					{ name: 'user_id' },
					{ name: 'total' },
					{ name: 'status' },
					{ name: 'created_at' }
				]
			}
		]
		const result = neighborhood(normalizeGraph(wide, EDGES, FIELDS), { focus: 'p.users' })

		expect(result.cards['p.orders'].vis.map((r) => r.name)).toEqual(['user_id'])
		expect(result.cards['p.orders'].more).toBe(3)
	})

	it('shows all 16 rows of a 16-column focus node, matching dbd', () => {
		// The cluster layout caps 'full' at 14. Routing the focus card through that default
		// would hide two real columns behind "+2 more" on any 15- or 16-column table.
		const wide = [
			{
				schema: 'p',
				name: 'wide',
				columns: Array.from({ length: 16 }, (_, i) => ({ name: `c${i}` }))
			}
		]
		const result = neighborhood(normalizeGraph(wide, [], FIELDS), { focus: 'p.wide' })

		expect(result.cards['p.wide'].vis).toHaveLength(16)
		expect(result.cards['p.wide'].more).toBe(0)
	})

	it('reports a canvas that contains every card', () => {
		const result = neighborhood(model(), { focus: 'p.users' })

		for (const card of Object.values(result.cards)) {
			expect(result.size.w).toBeGreaterThanOrEqual(card.x + card.w)
			expect(result.size.h).toBeGreaterThanOrEqual(card.y + card.h)
		}
	})

	it('keeps a minimum canvas height for a small neighbourhood', () => {
		// dbd floored the height at 120 + 20 so a one-row card does not produce a sliver.
		const result = neighborhood(normalizeGraph(NODES, [], FIELDS), { focus: 'p.users' })

		expect(result.size.h).toBe(140)
	})

	it('is deterministic', () => {
		expect(neighborhood(model(), { focus: 'p.users' })).toEqual(
			neighborhood(model(), { focus: 'p.users' })
		)
	})
})
