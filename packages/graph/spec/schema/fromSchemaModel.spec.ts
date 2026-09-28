import { describe, it, expect } from 'vitest'
import { SCHEMA_FIELDS, fromSchemaModel } from '../../src/schema/fromSchemaModel.js'

const MODEL = {
	project: { name: 'demo', db: 'postgres' },
	schemas: [{ name: 'public', tables: 2, enums: 0 }],
	tables: [
		{
			schema: 'public',
			name: 'users',
			kind: 'table',
			noteMd: 'People',
			columns: [{ name: 'id', type: 'uuid', pk: true, nn: true }]
		},
		{
			schema: 'public',
			name: 'orders',
			kind: 'table',
			columns: [{ name: 'user_id', type: 'uuid' }]
		}
	],
	refs: [
		{ from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
	]
}

describe('fromSchemaModel', () => {
	it('produces canonical node ids from schema and table name', () => {
		expect(fromSchemaModel(MODEL).nodes.map((n) => n.id)).toEqual(['public.users', 'public.orders'])
	})

	it('carries the table kind through', () => {
		expect(fromSchemaModel(MODEL).nodes[0].kind).toBe('table')
	})

	it('maps pk and nn flags to badges', () => {
		expect(fromSchemaModel(MODEL).nodes[0].rows[0].badges).toEqual(['pk', 'nn'])
	})

	it('derives fk on the referencing column', () => {
		const model = fromSchemaModel(MODEL)

		expect(model.byId.get('public.orders')?.rows[0].badges).toEqual(['fk'])
	})

	it('resolves refs to canonical edges', () => {
		expect(fromSchemaModel(MODEL).edges[0]).toMatchObject({
			source: 'public.orders',
			target: 'public.users',
			kind: 'reference'
		})
	})

	it('carries noteMd through as the node note', () => {
		expect(fromSchemaModel(MODEL).nodes[0].note).toBe('People')
	})

	it('maps a column note to the row note', () => {
		const withNote = {
			...MODEL,
			tables: [
				{
					schema: 'public',
					name: 'users',
					kind: 'table',
					columns: [{ name: 'id', type: 'uuid', note: 'the key' }]
				}
			],
			refs: []
		}

		expect(fromSchemaModel(withNote).nodes[0].rows[0].note).toBe('the key')
	})

	it('carries a ref action through', () => {
		const withAction = {
			...MODEL,
			refs: [{ ...MODEL.refs[0], action: 'cascade' }]
		}

		expect(fromSchemaModel(withAction).edges[0].action).toBe('cascade')
	})

	it('exports the field map so a consumer can pass it to Graph directly', () => {
		expect(SCHEMA_FIELDS.source).toBe('from.t')
		expect(SCHEMA_FIELDS.target).toBe('to.t')
	})

	it('maps every badge dbd v2 actually puts on a column', () => {
		// v1's Column was { name, type, pk?, nn?, en?, def?, note? } and uniqueness lived on
		// Index, so `uq` was deliberately unmapped. v2 (2026-09-27) added `fk` and `uq`
		// directly to Column — mapping a path that cannot exist silently never fires, and so
		// does NOT mapping one that now does.
		expect(Object.keys(SCHEMA_FIELDS.rowBadges ?? {}).sort()).toEqual(['fk', 'nn', 'pk', 'uq'])
	})

	it('trusts a declared fk flag even where no ref edge was resolved', () => {
		// The derived fk needs BOTH ends in the model. dbd resolved the constraint against the
		// whole database, so a ref to a table outside the scoped model still leaves fk:true on
		// the column — and that is the truthful badge.
		const declared = {
			...MODEL,
			tables: [
				{
					schema: 'public',
					name: 'orders',
					kind: 'table',
					columns: [{ name: 'tenant_id', type: 'uuid', fk: true }]
				}
			],
			refs: []
		}

		expect(fromSchemaModel(declared).nodes[0].rows[0].badges).toEqual(['fk'])
	})

	it('does not claim a cardinality path dbd does not carry', () => {
		// dbd's Ref is { from, to, action? }. `cardinality` is part of the canonical edge for
		// other producers, but mapping it here would assert a shape dbd does not have.
		expect(SCHEMA_FIELDS.cardinality).toBeUndefined()
	})

	it('handles a model with no tables or refs', () => {
		const model = fromSchemaModel({ ...MODEL, tables: [], refs: [] })

		expect(model.nodes).toEqual([])
		expect(model.edges).toEqual([])
	})
})

/* dbd's v2 SchemaModel splits the database into two graphs and says so in its own doc
   comments: `tables`/`refs` are "Tables only" and "Foreign keys only — the dependency graph
   is `deps`; an ER renderer wants these and a call-graph renderer wants those", while
   `entities`/`deps` hold views, matviews, functions, procedures and triggers plus what reads,
   writes or calls what.

   An ER diagram is entities and their relationships. A view is a derived projection and a
   routine is behaviour — neither is an entity, and drawing them on an ER canvas is a category
   error. These tests pin the two scopes apart. */

const V2 = {
	...MODEL,
	version: 2,
	entities: [
		{ schema: 'public', name: 'active_orders', kind: 'view', noteMd: 'Undelivered orders.' },
		{ schema: 'public', name: 'place_order', kind: 'procedure' },
		{ schema: 'billing', name: 'revenue_daily', kind: 'materialized_view' },
		{ schema: 'billing', name: 'invoice_total', kind: 'function' },
		{ schema: 'audit', name: 'orders_audit', kind: 'trigger' }
	],
	deps: [
		{ from: { s: 'public', n: 'active_orders' }, to: { s: 'public', n: 'orders' }, kind: 'reads' },
		{ from: { s: 'public', n: 'place_order' }, to: { s: 'public', n: 'orders' }, kind: 'writes' },
		{
			from: { s: 'public', n: 'place_order' },
			to: { s: 'billing', n: 'invoice_total' },
			kind: 'calls'
		},
		{ from: { s: 'audit', n: 'orders_audit' }, to: { s: 'public', n: 'orders' }, kind: 'member' },
		{ from: { s: 'billing', n: 'invoice_total' }, to: { s: '', n: 'now' }, kind: 'calls' }
	]
}

describe('fromSchemaModel — ER scope', () => {
	it('defaults to ER, so a v1 caller reading a v2 model is unaffected', () => {
		expect(fromSchemaModel(V2).nodes.map((n) => n.id)).toEqual(fromSchemaModel(MODEL).nodes.map((n) => n.id))
	})

	it('admits NO view, matview, function, procedure or trigger', () => {
		// The whole point. An ER diagram is table entities and their foreign keys.
		const kinds = new Set(fromSchemaModel(V2, { as: 'er' }).nodes.map((n) => n.kind))

		expect([...kinds]).toEqual(['table'])
	})

	it('admits no dependency edges', () => {
		const model = fromSchemaModel(V2, { as: 'er' })

		expect(model.edges.every((e) => e.kind === 'reference')).toBe(true)
	})
})

describe('fromSchemaModel — dependency scope', () => {
	it('includes the non-table entities the ER scope excludes', () => {
		const ids = fromSchemaModel(V2, { as: 'dependencies' }).nodes.map((n) => n.id)

		expect(ids).toContain('public.active_orders')
		expect(ids).toContain('billing.invoice_total')
		expect(ids).toContain('audit.orders_audit')
	})

	it('keeps the tables too, or every dependency would dangle', () => {
		// A view reads a TABLE. Dropping tables from this scope would leave the view pointing
		// at nothing and render as an orphan — the exact defect this split exists to fix.
		expect(fromSchemaModel(V2, { as: 'dependencies' }).nodes.map((n) => n.id)).toContain(
			'public.orders'
		)
	})

	it('classifies every dep as a dependency edge, not a foreign key', () => {
		const model = fromSchemaModel(V2, { as: 'dependencies' })

		expect(model.edges.every((e) => e.kind === 'dependency')).toBe(true)
	})

	it('carries dbd’s verb through as the relation', () => {
		const model = fromSchemaModel(V2, { as: 'dependencies' })
		const byRelation = (r: string) => model.edges.filter((e) => e.relation === r).length

		expect(byRelation('reads')).toBe(1)
		expect(byRelation('writes')).toBe(1)
		expect(byRelation('calls')).toBe(2)
		expect(byRelation('member')).toBe(1)
	})

	it('excludes the foreign keys — those are the OTHER graph', () => {
		const model = fromSchemaModel(V2, { as: 'dependencies' })

		expect(model.edges.some((e) => e.sourceRow === 'user_id')).toBe(false)
	})

	it('marks a call to a built-in as unplaced rather than dropping it', () => {
		// `now()` resolves to nothing — dbd flags it `unresolved`, and the same edge fails to
		// resolve here for the same reason. Kept and dimmed, never dropped.
		const model = fromSchemaModel(V2, { as: 'dependencies' })

		expect(model.edges.filter((e) => e.unplaced).map((e) => e.target)).toEqual(['now'])
	})

	it('gives an entity no rows, because dbd v2 says it has none', () => {
		// EntityNode: "No columns. A parsed routine has none, and a view's are not read."
		const view = fromSchemaModel(V2, { as: 'dependencies' }).byId.get('public.active_orders')

		expect(view?.rows).toEqual([])
	})

	it('still carries an entity’s note', () => {
		const view = fromSchemaModel(V2, { as: 'dependencies' }).byId.get('public.active_orders')

		expect(view?.note).toBe('Undelivered orders.')
	})

	it('handles a v1 model asked for dependencies — no entities, no deps, no crash', () => {
		const model = fromSchemaModel(MODEL, { as: 'dependencies' })

		expect(model.edges).toEqual([])
		expect(model.nodes.map((n) => n.id)).toEqual(['public.users', 'public.orders'])
	})
})
