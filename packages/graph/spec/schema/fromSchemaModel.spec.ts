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

	it('maps only badges dbd actually puts on a column', () => {
		// dbd's Column is { name, type, pk?, nn?, en?, def?, note? } — there is no `uq`.
		// Uniqueness lives on Index ({ def, unique?, name? }), which this view does not read.
		// Mapping a path that cannot exist looks correct and silently never fires, so the
		// absence is asserted rather than left to a reader to notice.
		expect(Object.keys(SCHEMA_FIELDS.rowBadges ?? {}).sort()).toEqual(['nn', 'pk'])
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
