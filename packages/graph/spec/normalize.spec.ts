import { describe, it, expect } from 'vitest'
import { normalizeGraph } from '../src/model/normalize.js'
import type { GraphFields } from '../src/types.js'

const TABLES = [
	{
		schema: 'public',
		name: 'users',
		kind: 'table',
		note: 'People',
		columns: [
			{ name: 'id', type: 'uuid', pk: true },
			{ name: 'email', type: 'text', nn: true }
		]
	},
	{
		schema: 'public',
		name: 'orders',
		kind: 'table',
		columns: [
			{ name: 'id', type: 'uuid', pk: true },
			{ name: 'user_id', type: 'uuid' }
		]
	}
]

const REFS = [
	{ from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
]

const FIELDS: GraphFields = {
	label: 'name',
	group: 'schema',
	kind: 'kind',
	rows: 'columns',
	rowName: 'name',
	rowType: 'type',
	rowBadges: { pk: 'pk', nn: 'nn' },
	source: 'from.t',
	target: 'to.t',
	sourceGroup: 'from.s',
	targetGroup: 'to.s',
	sourceRow: 'from.c',
	targetRow: 'to.c'
}

/** FIELDS with every group path removed — node ids then key on bare labels. */
function ungrouped(): GraphFields {
	const fields = { ...FIELDS }
	delete fields.sourceGroup
	delete fields.targetGroup
	delete fields.group
	return fields
}

describe('normalizeGraph', () => {
	it('derives node ids as group.label', () => {
		const model = normalizeGraph(TABLES, REFS, FIELDS)

		expect(model.nodes.map((n) => n.id)).toEqual(['public.users', 'public.orders'])
	})

	it('falls back to the label as id when no group is mapped', () => {
		const model = normalizeGraph([{ name: 'solo', columns: [] }], [], {
			label: 'name',
			rows: 'columns'
		})

		expect(model.nodes[0].id).toBe('solo')
	})

	it('maps rows and their badges', () => {
		const model = normalizeGraph(TABLES, REFS, FIELDS)

		expect(model.nodes[0].rows).toEqual([
			{ name: 'id', type: 'uuid', badges: ['pk'], note: undefined },
			{ name: 'email', type: 'text', badges: ['nn'], note: undefined }
		])
	})

	it('DERIVES fk on the source row of every reference edge', () => {
		// dbd's toLayoutData did this; it belongs in the normalizer so dbd#24
		// shipping fk natively is a change to this file alone.
		const model = normalizeGraph(TABLES, REFS, FIELDS)
		const orders = model.byId.get('public.orders')

		expect(orders?.rows.find((r) => r.name === 'user_id')?.badges).toEqual(['fk'])
	})

	it('does not mark a target row as fk', () => {
		const model = normalizeGraph(TABLES, REFS, FIELDS)
		const users = model.byId.get('public.users')

		expect(users?.rows.find((r) => r.name === 'id')?.badges).toEqual(['pk'])
	})

	it('keeps a mapped badge and a derived fk together on one row', () => {
		const model = normalizeGraph(
			TABLES,
			[{ from: { s: 'public', t: 'orders', c: 'id' }, to: { s: 'public', t: 'users', c: 'id' } }],
			FIELDS
		)

		expect(model.byId.get('public.orders')?.rows[0].badges).toEqual(['pk', 'fk'])
	})

	it('resolves edge endpoints to node ids and defaults kind to reference', () => {
		const model = normalizeGraph(TABLES, REFS, FIELDS)

		expect(model.edges).toEqual([
			{
				id: 'reference:public.orders:user_id->public.users:id',
				source: 'public.orders',
				target: 'public.users',
				sourceRow: 'user_id',
				targetRow: 'id',
				kind: 'reference',
				cardinality: undefined,
				action: undefined
			}
		])
	})

	it('maps cardinality and action when the source carries them', () => {
		// The only coverage these had was asserting they default to undefined — which a
		// normalizer that ignored the fields entirely would also satisfy.
		const edges = [
			{
				from: { s: 'public', t: 'orders', c: 'user_id' },
				to: { s: 'public', t: 'users', c: 'id' },
				cardinality: '1:N',
				action: 'cascade'
			}
		]
		const model = normalizeGraph(TABLES, edges, FIELDS)

		expect(model.edges[0]).toMatchObject({ cardinality: '1:N', action: 'cascade' })
	})

	it('reads an explicit edge kind when mapped', () => {
		const model = normalizeGraph(
			TABLES,
			[
				{
					from: { s: 'public', t: 'orders', c: 'id' },
					to: { s: 'public', t: 'users', c: 'id' },
					rel: 'dependency'
				}
			],
			{ ...FIELDS, edgeKind: 'rel' }
		)

		expect(model.edges[0].kind).toBe('dependency')
	})

	it('KEEPS an edge whose endpoint is not a known node, marked unplaced', () => {
		// Never dropped. Sensei's code graph reports 59.6% of 4.08M edges with a null target:
		// the call is real, the callee simply is not indexed. Dropping those would make the
		// graph look far more complete than it is — the most misleading thing it could do.
		const model = normalizeGraph(
			TABLES,
			[{ from: { s: 'public', t: 'ghost', c: 'id' }, to: { s: 'public', t: 'users', c: 'id' } }],
			FIELDS
		)

		expect(model.edges).toHaveLength(1)
		expect(model.edges[0].unplaced).toBe('source')
		// The raw value survives, so the edge still says what was written at the use site.
		expect(model.edges[0].source).toBe('ghost')
	})

	it('marks which END is unplaced, not merely that one is', () => {
		const model = normalizeGraph(
			TABLES,
			[
				{ from: { s: 'public', t: 'orders', c: 'x' }, to: { s: 'public', t: 'ghost', c: 'id' } },
				{ from: { s: 'p', t: 'ghost1', c: 'x' }, to: { s: 'p', t: 'ghost2', c: 'id' } }
			],
			FIELDS
		)

		expect(model.edges.map((e) => e.unplaced)).toEqual(['target', 'both'])
	})

	it('leaves a fully resolved edge unmarked', () => {
		expect(normalizeGraph(TABLES, REFS, FIELDS).edges[0].unplaced).toBeUndefined()
	})

	it('keeps an unplaced endpoint OUT of the neighbour map', () => {
		// `related` drives the dim/highlight states, so it must only ever name something the
		// reader can actually click.
		const model = normalizeGraph(
			TABLES,
			[{ from: { s: 'public', t: 'orders', c: 'x' }, to: { s: 'public', t: 'ghost', c: 'id' } }],
			FIELDS
		)

		expect(model.neighbors.get('public.orders')).toBeUndefined()
	})

	it('still derives fk when only the TARGET is unplaced', () => {
		// The reference is real and the source row IS a foreign key; only its destination is
		// unknown. Suppressing the badge would lose information the data actually has.
		const model = normalizeGraph(
			TABLES,
			[{ from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'p', t: 'ghost', c: 'id' } }],
			FIELDS
		)

		expect(model.byId.get('public.orders')?.rows.find((r) => r.name === 'user_id')?.badges).toEqual(
			['fk']
		)
	})

	it('builds undirected adjacency and excludes self-edges', () => {
		const model = normalizeGraph(
			TABLES,
			[
				...REFS,
				{ from: { s: 'public', t: 'users', c: 'id' }, to: { s: 'public', t: 'users', c: 'id' } }
			],
			FIELDS
		)

		expect([...(model.neighbors.get('public.users') ?? [])]).toEqual(['public.orders'])
		expect([...(model.neighbors.get('public.orders') ?? [])]).toEqual(['public.users'])
	})

	it('collects unmapped source fields into meta', () => {
		const model = normalizeGraph(
			[{ ...TABLES[0], rls: true, indexes: [{ def: 'btree(email)' }] }],
			[],
			FIELDS
		)

		expect(model.nodes[0].meta).toEqual({ rls: true, indexes: [{ def: 'btree(email)' }] })
	})

	it('does NOT duplicate a claimed field into meta', () => {
		// `note` is read into node.note, so leaving it in meta would put the same
		// value in two places and let the two drift.
		const model = normalizeGraph(TABLES, REFS, FIELDS)

		expect(model.nodes[0].note).toBe('People')
		expect(model.nodes[0].meta).not.toHaveProperty('note')
	})

	it('accepts a source already shaped like the canonical model, with no map', () => {
		const model = normalizeGraph(
			[{ id: 'a', label: 'a', rows: [{ name: 'x' }] }],
			[{ source: 'a', target: 'a' }],
			{}
		)

		expect(model.nodes[0]).toMatchObject({ id: 'a', label: 'a' })
		expect(model.nodes[0].rows[0]).toMatchObject({ name: 'x', badges: [] })
	})

	it('returns an empty model for empty input', () => {
		const model = normalizeGraph([], [], FIELDS)

		expect(model.nodes).toEqual([])
		expect(model.edges).toEqual([])
		expect(model.byId.size).toBe(0)
	})

	it('gives each edge a distinct id when two refs join the same pair via different rows', () => {
		const model = normalizeGraph(
			TABLES,
			[
				{
					from: { s: 'public', t: 'orders', c: 'user_id' },
					to: { s: 'public', t: 'users', c: 'id' }
				},
				{ from: { s: 'public', t: 'orders', c: 'id' }, to: { s: 'public', t: 'users', c: 'id' } }
			],
			FIELDS
		)

		expect(new Set(model.edges.map((e) => e.id)).size).toBe(2)
	})

	it('gives each edge a distinct id when two ROW-LESS edges join the same pair', () => {
		// The case endpoints-plus-rows cannot key: a dependency edge has no column anchors, so
		// both would be `dependency:p.a:->p.b:`. A procedure calling a function twice, or a view
		// reaching a table by two paths, produces exactly this.
		const nodes = [
			{ schema: 'p', name: 'a', columns: [] },
			{ schema: 'p', name: 'b', columns: [] }
		]
		const edges = [
			{ from: { s: 'p', t: 'a' }, to: { s: 'p', t: 'b' }, rel: 'dependency' },
			{ from: { s: 'p', t: 'a' }, to: { s: 'p', t: 'b' }, rel: 'dependency' }
		]
		const model = normalizeGraph(nodes, edges, { ...FIELDS, edgeKind: 'rel' })

		expect(model.edges).toHaveLength(2)
		expect(new Set(model.edges.map((e) => e.id)).size).toBe(2)
	})

	it('distinguishes a reference edge from a dependency edge on the same pair and rows', () => {
		const edges = [
			{
				from: { s: 'public', t: 'orders', c: 'user_id' },
				to: { s: 'public', t: 'users', c: 'id' }
			},
			{
				from: { s: 'public', t: 'orders', c: 'user_id' },
				to: { s: 'public', t: 'users', c: 'id' },
				rel: 'dependency'
			}
		]
		const model = normalizeGraph(TABLES, edges, { ...FIELDS, edgeKind: 'rel' })

		expect(new Set(model.edges.map((e) => e.id)).size).toBe(2)
	})

	it('never GUESSES a coincidental node for an unresolvable endpoint', () => {
		// `staging.orders` does not exist, but `legacy.orders` does. A resolver that swept every
		// sibling field for a match would attach the edge to `legacy.orders` and draw a
		// relationship between two entities that have none. Keeping the edge unplaced is the
		// honest outcome; inventing an endpoint is not.
		const nodes = [
			{ schema: 'legacy', name: 'orders', columns: [{ name: 'id' }] },
			{ schema: 'public', name: 'users', columns: [{ name: 'id' }] }
		]
		const edges = [
			{ from: { s: 'staging', t: 'orders', c: 'legacy' }, to: { s: 'public', t: 'users', c: 'id' } }
		]
		const model = normalizeGraph(nodes, edges, FIELDS)

		expect(model.edges[0].unplaced).toBe('source')
		expect(model.edges[0].source).not.toBe('legacy.orders')
	})

	it('gives a node no rows when the mapped rows path is absent or not an array', () => {
		// A function or an enum has no columns at all, and a source may carry a scalar
		// where the map expects a list. Neither may throw — the node just has no rows.
		const model = normalizeGraph(
			[
				{ schema: 'p', name: 'absent' },
				{ schema: 'p', name: 'scalar', columns: 'nope' }
			],
			[],
			FIELDS
		)

		expect(model.nodes.map((n) => n.rows)).toEqual([[], []])
	})

	it('falls back to an empty string for a nameless node or row, never the text "undefined"', () => {
		// String(undefined) is 'undefined', which would render as a visible label reading
		// "undefined" and key a node by that string. The ?? '' guard is what prevents it.
		const model = normalizeGraph([{ schema: 'p', columns: [{ type: 'uuid' }] }], [], FIELDS)

		expect(model.nodes[0].label).toBe('')
		expect(model.nodes[0].id).toBe('p.')
		expect(model.nodes[0].rows[0].name).toBe('')
	})

	it('survives a non-object node source with an empty meta', () => {
		const model = normalizeGraph([null, 'nope'], [], FIELDS)

		expect(model.nodes.map((n) => n.meta)).toEqual([{}, {}])
	})

	it('prefers an explicitly mapped id over the derived group.label', () => {
		const model = normalizeGraph([{ key: 'custom', schema: 'p', name: 'a', columns: [] }], [], {
			...FIELDS,
			id: 'key'
		})

		expect(model.nodes[0].id).toBe('custom')
	})

	it('drops an edge whose endpoint field is missing entirely', () => {
		const model = normalizeGraph(TABLES, [{ to: { s: 'public', t: 'users', c: 'id' } }], FIELDS)

		expect(model.edges).toEqual([])
	})

	it('resolves a bare-label endpoint directly when no group is mapped anywhere', () => {
		// With no `group` path the node ids ARE the bare labels, so strategy 1 hits and the
		// edge resolves without ever needing to qualify it. Nothing is dropped here.
		const model = normalizeGraph(TABLES, REFS, ungrouped())

		expect(model.nodes.map((n) => n.id)).toEqual(['users', 'orders'])
		expect(model.edges).toMatchObject([{ source: 'orders', target: 'users' }])
	})

	it('marks an unknown endpoint unplaced when no group path is left to qualify it', () => {
		// The other side of the branch above: strategy 1 misses and there is no declared group
		// path to try, so the endpoint stays unresolved — and the edge stays.
		const model = normalizeGraph(
			TABLES,
			[{ from: { s: 'public', t: 'ghost', c: 'id' }, to: { s: 'public', t: 'users', c: 'id' } }],
			ungrouped()
		)

		expect(model.edges[0].unplaced).toBe('source')
	})

	it('marks BOTH ends unplaced when no group path resolves on the edge object', () => {
		// `group: 'schema'` is a path on a NODE. Read against dbd's edge shape
		// (`{ from: { s, t, c } }`) it finds nothing, so the bare label `orders` cannot be
		// qualified and the edge is dropped. This is why SCHEMA_FIELDS declares
		// sourceGroup/targetGroup explicitly — see fromSchemaModel.
		const withoutEndpointGroups = { ...FIELDS }
		delete withoutEndpointGroups.sourceGroup
		delete withoutEndpointGroups.targetGroup

		expect(normalizeGraph(TABLES, REFS, withoutEndpointGroups).edges[0].unplaced).toBe('both')
	})
})
