/**
 * The LOAD layer of the graph demo.
 *
 * Two datasets, and the second one is the point. `ecommerceSchema` is dbd-shaped, so it goes
 * through `SCHEMA_FIELDS` unchanged. `serviceCallGraph` is a deliberately different shape —
 * services with endpoints, calls with a transport — mapped by its own `fields`. If both render
 * from the same `<Graph>`, the contract is genuinely general rather than a SchemaModel wearing
 * a different name.
 */

import { SCHEMA_FIELDS } from '@rokkit/graph/schema'
import type { GraphFields } from '@rokkit/graph'

export type DatasetId = 'ecommerce' | 'service-calls'

/* ─── 1. dbd-shaped ──────────────────────────────────────────────────────────
   Three groups so the ramp wraps visibly, and every kind the preset names:
   table, view, matview, function, procedure, enum. */

const ecommerceTables = [
	{
		schema: 'public',
		name: 'users',
		kind: 'table',
		noteMd: 'Everyone who can sign in.\n\n- `email` is the login handle\n- soft-deleted, never purged',
		indexes: [{ def: 'btree(email)', unique: true, name: 'users_email_key' }],
		columns: [
			{ name: 'id', type: 'uuid', pk: true, nn: true, note: 'Primary key' },
			{ name: 'email', type: 'varchar(320)', nn: true },
			{ name: 'display_name', type: 'varchar(120)' },
			{ name: 'status', type: 'user_status', nn: true },
			{ name: 'created_at', type: 'timestamptz', nn: true }
		]
	},
	{
		schema: 'public',
		name: 'orders',
		kind: 'table',
		noteMd: 'One row per checkout.',
		indexes: [{ def: 'btree(user_id, placed_at)', name: 'orders_user_placed_idx' }],
		columns: [
			{ name: 'id', type: 'uuid', pk: true, nn: true },
			{ name: 'user_id', type: 'uuid', nn: true },
			{ name: 'status', type: 'order_status', nn: true },
			{ name: 'total_cents', type: 'numeric(12,2)', nn: true },
			{ name: 'placed_at', type: 'timestamptz', nn: true }
		]
	},
	{
		schema: 'public',
		name: 'order_lines',
		kind: 'table',
		columns: [
			{ name: 'id', type: 'uuid', pk: true, nn: true },
			{ name: 'order_id', type: 'uuid', nn: true },
			{ name: 'product_id', type: 'uuid', nn: true },
			{ name: 'quantity', type: 'integer', nn: true },
			{ name: 'unit_cents', type: 'numeric(12,2)', nn: true }
		]
	},
	{
		schema: 'public',
		name: 'products',
		kind: 'table',
		noteMd: 'Sellable items. Prices live on the order line, not here.',
		columns: [
			{ name: 'id', type: 'uuid', pk: true, nn: true },
			{ name: 'sku', type: 'varchar(64)', nn: true },
			{ name: 'title', type: 'text', nn: true },
			{ name: 'tags', type: 'text[]' }
		]
	},
	{
		schema: 'public',
		name: 'order_status',
		kind: 'enum',
		noteMd: 'placed → paid → shipped → delivered, or `cancelled` at any point.',
		columns: [
			{ name: 'placed', type: 'label' },
			{ name: 'paid', type: 'label' },
			{ name: 'shipped', type: 'label' },
			{ name: 'delivered', type: 'label' },
			{ name: 'cancelled', type: 'label' }
		]
	},
	{
		schema: 'public',
		name: 'user_status',
		kind: 'enum',
		columns: [
			{ name: 'active', type: 'label' },
			{ name: 'suspended', type: 'label' },
			{ name: 'closed', type: 'label' }
		]
	},
	{
		schema: 'public',
		name: 'active_orders',
		kind: 'view',
		noteMd: 'Orders not yet `delivered` or `cancelled`.',
		columns: [
			{ name: 'id', type: 'uuid' },
			{ name: 'user_id', type: 'uuid' },
			{ name: 'status', type: 'order_status' }
		]
	},
	{
		schema: 'public',
		name: 'place_order',
		kind: 'procedure',
		noteMd: 'Writes the order and its lines in one transaction.',
		columns: [
			{ name: 'p_user_id', type: 'uuid' },
			{ name: 'p_lines', type: 'jsonb' }
		]
	},
	{
		schema: 'billing',
		name: 'invoices',
		kind: 'table',
		columns: [
			{ name: 'id', type: 'uuid', pk: true, nn: true },
			{ name: 'order_id', type: 'uuid', nn: true },
			{ name: 'issued_at', type: 'timestamptz', nn: true },
			{ name: 'amount_cents', type: 'numeric(12,2)', nn: true }
		]
	},
	{
		schema: 'billing',
		name: 'payments',
		kind: 'table',
		columns: [
			{ name: 'id', type: 'uuid', pk: true, nn: true },
			{ name: 'invoice_id', type: 'uuid', nn: true },
			{ name: 'captured_at', type: 'timestamptz' }
		]
	},
	{
		schema: 'billing',
		name: 'revenue_daily',
		kind: 'matview',
		noteMd: 'Refreshed nightly. Do not join for live figures.',
		columns: [
			{ name: 'day', type: 'date' },
			{ name: 'gross_cents', type: 'numeric(14,2)' },
			{ name: 'orders', type: 'integer' }
		]
	},
	{
		schema: 'billing',
		name: 'invoice_total',
		kind: 'function',
		columns: [{ name: 'p_invoice_id', type: 'uuid' }]
	},
	{
		schema: 'audit',
		name: 'events',
		kind: 'table',
		noteMd: 'Append-only. Every mutation lands here.',
		columns: [
			{ name: 'id', type: 'bigint', pk: true, nn: true },
			{ name: 'actor_id', type: 'uuid' },
			{ name: 'entity', type: 'varchar(80)', nn: true },
			{ name: 'payload', type: 'jsonb' },
			{ name: 'at', type: 'timestamptz', nn: true }
		]
	},
	{
		schema: 'audit',
		name: 'retention',
		kind: 'table',
		columns: [
			{ name: 'entity', type: 'varchar(80)', pk: true, nn: true },
			{ name: 'keep_days', type: 'integer', nn: true }
		]
	}
]

const ecommerceRefs = [
	{ from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } },
	{
		from: { s: 'public', t: 'orders', c: 'status' },
		to: { s: 'public', t: 'order_status', c: 'placed' }
	},
	{
		from: { s: 'public', t: 'users', c: 'status' },
		to: { s: 'public', t: 'user_status', c: 'active' }
	},
	{
		from: { s: 'public', t: 'order_lines', c: 'order_id' },
		to: { s: 'public', t: 'orders', c: 'id' },
		action: 'cascade'
	},
	{
		from: { s: 'public', t: 'order_lines', c: 'product_id' },
		to: { s: 'public', t: 'products', c: 'id' }
	},
	{
		from: { s: 'billing', t: 'invoices', c: 'order_id' },
		to: { s: 'public', t: 'orders', c: 'id' }
	},
	{
		from: { s: 'billing', t: 'payments', c: 'invoice_id' },
		to: { s: 'billing', t: 'invoices', c: 'id' },
		action: 'restrict'
	},
	{ from: { s: 'audit', t: 'events', c: 'actor_id' }, to: { s: 'public', t: 'users', c: 'id' } },
	{
		from: { s: 'audit', t: 'retention', c: 'entity' },
		to: { s: 'audit', t: 'events', c: 'entity' }
	}
]

export const ecommerceSchema = { tables: ecommerceTables, refs: ecommerceRefs }
export const ecommerceFields: GraphFields = SCHEMA_FIELDS

/* ─── 2. deliberately NOT dbd-shaped ─────────────────────────────────────────
   Different key names at every level: `key` not schema+name, `team` not schema,
   `endpoints` not columns, `caller`/`callee` not from/to. Nothing about this shape
   is known to the package — only `serviceCallFields` connects the two. */

export const serviceCallGraph = {
	services: [
		{
			key: 'checkout',
			team: 'commerce',
			type: 'procedure',
			summary: 'Owns the cart → order transition.',
			endpoints: [
				{ label: 'POST /cart', kind: 'entry', primary: true },
				{ label: 'POST /checkout', kind: 'entry' },
				{ label: 'GET /cart/:id', kind: 'read' }
			]
		},
		{
			key: 'catalog',
			team: 'commerce',
			type: 'table',
			summary: 'Product search and detail.',
			endpoints: [
				{ label: 'GET /products', kind: 'read', primary: true },
				{ label: 'GET /products/:sku', kind: 'read' }
			]
		},
		{
			key: 'ledger',
			team: 'finance',
			type: 'table',
			summary: 'Double-entry book of record.',
			endpoints: [
				{ label: 'POST /entries', kind: 'entry', primary: true },
				{ label: 'GET /balance', kind: 'read' }
			]
		},
		{
			key: 'invoicing',
			team: 'finance',
			type: 'view',
			endpoints: [
				{ label: 'POST /invoices', kind: 'entry', primary: true },
				{ label: 'GET /invoices/:id', kind: 'read' }
			]
		},
		{
			key: 'identity',
			team: 'platform',
			type: 'function',
			summary: 'Tokens in, claims out.',
			endpoints: [
				{ label: 'POST /token', kind: 'entry', primary: true },
				{ label: 'GET /whoami', kind: 'read' }
			]
		},
		{
			key: 'notifier',
			team: 'platform',
			type: 'matview',
			endpoints: [{ label: 'POST /send', kind: 'entry', primary: true }]
		},
		{
			key: 'audit-log',
			team: 'platform',
			type: 'enum',
			endpoints: [{ label: 'POST /record', kind: 'entry', primary: true }]
		}
	],
	calls: [
		{ caller: 'checkout', callee: 'catalog', from: 'POST /checkout', to: 'GET /products' },
		{ caller: 'checkout', callee: 'identity', from: 'POST /cart', to: 'POST /token' },
		{ caller: 'checkout', callee: 'invoicing', from: 'POST /checkout', to: 'POST /invoices' },
		{ caller: 'invoicing', callee: 'ledger', from: 'POST /invoices', to: 'POST /entries' },
		{ caller: 'invoicing', callee: 'notifier', from: 'POST /invoices', to: 'POST /send' },
		{ caller: 'catalog', callee: 'identity', from: 'GET /products', to: 'GET /whoami' },
		{ caller: 'ledger', callee: 'audit-log', from: 'POST /entries', to: 'POST /record' },
		{ caller: 'checkout', callee: 'audit-log', from: 'POST /checkout', to: 'POST /record' }
	]
}

/**
 * The whole adapter. No transform step, no bespoke types — the shape above reaches the
 * canonical model through paths alone.
 */
export const serviceCallFields: GraphFields = {
	id: 'key',
	label: 'key',
	group: 'team',
	kind: 'type',
	note: 'summary',
	rows: 'endpoints',
	rowName: 'label',
	rowType: 'kind',
	rowBadges: { pk: 'primary' },
	source: 'caller',
	target: 'callee',
	sourceRow: 'from',
	targetRow: 'to'
}

export const datasets = {
	ecommerce: {
		id: 'ecommerce' as const,
		label: 'E-commerce schema',
		nodes: ecommerceSchema.tables as unknown[],
		edges: ecommerceSchema.refs as unknown[],
		fields: ecommerceFields
	},
	'service-calls': {
		id: 'service-calls' as const,
		label: 'Service call graph',
		nodes: serviceCallGraph.services as unknown[],
		edges: serviceCallGraph.calls as unknown[],
		fields: serviceCallFields
	}
}
