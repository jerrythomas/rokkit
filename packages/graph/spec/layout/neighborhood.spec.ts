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

	it('places a MUTUAL neighbour by its dominant direction, not just "has an out edge"', () => {
		// #160. `out.length > 0` won outright, so a node with edges BOTH ways landed right and
		// its inbound edge was drawn right-to-left — against the convention the layout states.
		// Routine in a call graph: mutual recursion, a callback registered with its invoker, a
		// visitor dispatching back into its walker.
		const FIELDS2: GraphFields = { source: 'source', target: 'target' }
		const nodes = [
			{ id: 'focus', label: 'resolve_edges' },
			{ id: 'mostlyCaller', label: 'walk_scope' },
			{ id: 'mostlyCallee', label: 'lookup_fqn' }
		]
		const edges = [
			// mostlyCaller: 2 in, 1 out → left
			{ source: 'mostlyCaller', target: 'focus' },
			{ source: 'mostlyCaller', target: 'focus' },
			{ source: 'focus', target: 'mostlyCaller' },
			// mostlyCallee: 1 in, 2 out → right
			{ source: 'focus', target: 'mostlyCallee' },
			{ source: 'focus', target: 'mostlyCallee' },
			{ source: 'mostlyCallee', target: 'focus' }
		]
		const result = neighborhood(normalizeGraph(nodes, edges, FIELDS2), { focus: 'focus' })

		expect(result.cards.mostlyCaller.x).toBeLessThan(result.cards.focus.x)
		expect(result.cards.mostlyCallee.x).toBeGreaterThan(result.cards.focus.x)
	})

	it('puts an evenly bidirectional neighbour on the LEFT, reading it as a caller', () => {
		// A tie has no dominant direction, so one of its two edges must run backwards whatever
		// we pick — one card per node is the constraint. Left is the deliberate choice: the
		// column reads "things that reach this", which is what a reader scans for first.
		const FIELDS2: GraphFields = { source: 'source', target: 'target' }
		const nodes = [{ id: 'focus', label: 'a' }, { id: 'partner', label: 'b' }]
		const edges = [
			{ source: 'focus', target: 'partner' },
			{ source: 'partner', target: 'focus' }
		]
		const result = neighborhood(normalizeGraph(nodes, edges, FIELDS2), { focus: 'focus' })

		expect(result.cards.partner.x).toBeLessThan(result.cards.focus.x)
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
