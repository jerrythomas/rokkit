/**
 * The LOAD layer of the graph demo.
 *
 * Three datasets. `ecommerceSchema` is a dbd v2 `SchemaModel`, which splits a database into
 * TWO graphs and is rendered here as two examples:
 *
 * - **ER** — `tables` + `refs`. Entities and their foreign keys, and nothing else. A view is a
 *   derived projection and a routine is behaviour; neither is an entity, so neither belongs on
 *   an ER canvas. dbd says the same thing in its own doc comments: `tables` is "Tables only",
 *   `refs` is "Foreign keys only — the dependency graph is `deps`; an ER renderer wants these
 *   and a call-graph renderer wants those."
 * - **Dependencies** — `tables` + `entities` as nodes, `deps` as edges. What reads, writes,
 *   calls or belongs to what. The tables stay, because a view READS a table.
 *
 * `serviceCallGraph` is a deliberately different shape — services with endpoints, calls with a
 * transport — mapped by its own `fields`. If all three render from the same `<Graph>`, the
 * contract is genuinely general rather than a SchemaModel wearing a different name.
 */

import { toGraphInput } from '@rokkit/graph/schema'
import codebase from './codebase.json'
import architecture from '../chart/architecture.json'
import type { GraphFields } from '@rokkit/graph'

export type DatasetId =
	| 'ecommerce'
	| 'schema-deps'
	| 'service-calls'
	| 'codebase'
	| 'components'
	| 'cochange'

/* ─── 1. dbd v2-shaped ───────────────────────────────────────────────────────
   `tables` holds tables (plus the two enums — dbd flags an enum COLUMN via `Column.en`
   rather than emitting an enum node, but a domain is a legitimate ER participant and the
   package's `kind` is open, so the demo shows them). Views, matviews, functions, procedures
   and triggers live in `entities` below, with no columns, exactly as v2 defines them. */

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

/* v2 `entities`: everything that is not a table. No `columns` — dbd's EntityNode carries
   none ("A parsed routine has none, and a view's are not read — what it has is a body and the
   things it depends on"), and inventing some was what made these four render as orphan cards
   full of fake parameters in the ER diagram. */
const ecommerceEntities = [
	{
		schema: 'public',
		name: 'active_orders',
		kind: 'view',
		noteMd: 'Orders not yet `delivered` or `cancelled`.'
	},
	{
		schema: 'public',
		name: 'place_order',
		kind: 'procedure',
		noteMd: 'Writes the order and its lines in one transaction.'
	},
	{
		schema: 'billing',
		name: 'revenue_daily',
		kind: 'materialized_view',
		noteMd: 'Refreshed nightly. Do not join for live figures.'
	},
	{ schema: 'billing', name: 'invoice_total', kind: 'function' },
	{
		schema: 'audit',
		name: 'orders_audit',
		kind: 'trigger',
		noteMd: 'Fires on every write to `public.orders`.'
	},
	{
		schema: 'audit',
		name: 'purge_events',
		kind: 'procedure',
		noteMd: 'Nightly. Drops `events` rows older than the window `retention` sets.'
	}
]

/* v2 `deps`: what reads, writes, calls or belongs to what. This is the structure the four
   entities above were missing — in the ER diagram they had no foreign keys and so no edges at
   all, which is exactly the point that an ER diagram is the wrong canvas for them.

   `now` is deliberately unresolvable: a call to a built-in is a real edge whose endpoint is
   not placeable, and dbd flags the same case `unresolved`. It is dimmed, never dropped. */
const ecommerceDeps = [
	{ from: { s: 'public', n: 'active_orders' }, to: { s: 'public', n: 'orders' }, kind: 'reads' },
	{ from: { s: 'public', n: 'active_orders' }, to: { s: 'public', n: 'users' }, kind: 'reads' },
	{ from: { s: 'public', n: 'place_order' }, to: { s: 'public', n: 'orders' }, kind: 'writes' },
	{
		from: { s: 'public', n: 'place_order' },
		to: { s: 'public', n: 'order_lines' },
		kind: 'writes'
	},
	{ from: { s: 'public', n: 'place_order' }, to: { s: 'public', n: 'products' }, kind: 'reads' },
	{
		from: { s: 'public', n: 'place_order' },
		to: { s: 'billing', n: 'invoice_total' },
		kind: 'calls'
	},
	{
		from: { s: 'billing', n: 'invoice_total' },
		to: { s: 'billing', n: 'invoices' },
		kind: 'reads'
	},
	{ from: { s: 'billing', n: 'invoice_total' }, to: { s: '', n: 'round' }, kind: 'calls' },
	{
		from: { s: 'billing', n: 'revenue_daily' },
		to: { s: 'billing', n: 'payments' },
		kind: 'reads'
	},
	{
		from: { s: 'billing', n: 'revenue_daily' },
		to: { s: 'billing', n: 'invoices' },
		kind: 'reads'
	},
	{ from: { s: 'audit', n: 'orders_audit' }, to: { s: 'public', n: 'orders' }, kind: 'member' },
	{ from: { s: 'audit', n: 'orders_audit' }, to: { s: 'audit', n: 'events' }, kind: 'writes' },
	{ from: { s: 'audit', n: 'purge_events' }, to: { s: 'audit', n: 'retention' }, kind: 'reads' },
	{ from: { s: 'audit', n: 'purge_events' }, to: { s: 'audit', n: 'events' }, kind: 'writes' },

	/* A column's enum TYPE is a real dependency — Postgres records it in `pg_depend`, and you
	   cannot drop the type while a column uses it. Without these the enums sat in the
	   dependency view with nothing attached, which is the same orphan defect the ER/dependency
	   split exists to remove, just from the other side.

	   `uses` is this demo's own verb, not one dbd emits: `DepEdge.kind` is a String on the
	   wire, but dbd's `dep_kind()` only ever produces reads|writes|calls|member today. Carrying
	   it is exactly what `GraphEdge.relation` is for — an open vocabulary over a closed
	   `EdgeKind`. */
	{ from: { s: 'public', n: 'orders' }, to: { s: 'public', n: 'order_status' }, kind: 'uses' },
	{ from: { s: 'public', n: 'users' }, to: { s: 'public', n: 'user_status' }, kind: 'uses' }
]

/** A dbd v2 `SchemaModel` — two graphs in one payload, selected by `toGraphInput`. */
export const ecommerceSchema = {
	version: 2,
	tables: ecommerceTables,
	refs: ecommerceRefs,
	entities: ecommerceEntities,
	deps: ecommerceDeps
}

const er = toGraphInput(ecommerceSchema, 'er')
const deps = toGraphInput(ecommerceSchema, 'dependencies')

export const ecommerceFields: GraphFields = er.fields

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
	targetRow: 'to',
	// A call is not a foreign key. Every edge in this list is a dependency and there is no
	// per-row field saying so, which is exactly what `defaultEdgeKind` is for.
	defaultEdgeKind: 'dependency'
}

/* ─── 3. this repository ─────────────────────────────────────────────────────
   Generated from every package's `src` by `scripts/build-codebase-graph.mjs`: 470 modules
   and 801 imports, with real containment (rokkit › package › folder › module) and a measure
   per module. Committed rather than scanned at build time so the demo works offline; re-run
   the script when the shape of the repo changes enough to matter.

   This is the dataset the `world` layout exists for. The other three are flat or two deep;
   a codebase is containment several levels down with a quantity at every level, which is
   what a treemap answers and a node-link diagram cannot. */

export const codebaseFields: GraphFields = {
	id: 'id',
	label: 'label',
	kind: 'kind',
	path: 'path',
	measures: 'm',
	source: 'source',
	target: 'target',
	// Every edge here is an import. There is no per-row field saying so, which is what
	// `defaultEdgeKind` is for.
	defaultEdgeKind: 'dependency',
	relation: 'kind'
}

/* ─── 4. this repository, one level up ──────────────────────────────────────
   The same code at COMPONENT grain — a top-level folder under a package's `src/` — measured
   by `scripts/build-architecture-metrics.mjs`, which the chart demo's Architecture recipes
   also read. 40 components rather than 470 files is what keeps a dependency matrix readable:
   every node is a row AND a column, so the drawing grows with the square.

   `cochange` adds the pairs that change in the same commit, mined from git history. The ones
   with no import between them are hidden coupling, and they arrive as OVERLAY edges: drawn,
   weighted by how often they co-changed, and never allowed to re-rank the layout — which
   would put them side by side and hide the coupling the overlay is there to show. */

const componentNodes = architecture.components.map((c) => ({
	id: c.component,
	label: c.component,
	group: c.package,
	kind: 'module',
	weight: c.loc
}))
const componentImports = architecture.imports.map((e) => ({
	source: e.source,
	target: e.target,
	weight: e.count
}))
const hiddenCoupling = architecture.cochange
	.filter((e) => !e.imported)
	.map((e) => ({ source: e.source, target: e.target, weight: e.count, overlay: true, relation: 'co-change' }))

export const componentFields: GraphFields = {
	id: 'id',
	label: 'label',
	group: 'group',
	kind: 'kind',
	source: 'source',
	target: 'target',
	defaultEdgeKind: 'dependency'
}

export const datasets = {
	ecommerce: {
		id: 'ecommerce' as const,
		label: 'E-commerce ER',
		nodes: er.nodes,
		edges: er.edges,
		fields: er.fields
	},
	'schema-deps': {
		id: 'schema-deps' as const,
		label: 'Schema dependencies',
		nodes: deps.nodes,
		edges: deps.edges,
		fields: deps.fields
	},
	'service-calls': {
		id: 'service-calls' as const,
		label: 'Service call graph',
		nodes: serviceCallGraph.services as unknown[],
		edges: serviceCallGraph.calls as unknown[],
		fields: serviceCallFields
	},
	codebase: {
		id: 'codebase' as const,
		label: 'This codebase',
		nodes: codebase.nodes as unknown[],
		edges: codebase.edges as unknown[],
		fields: codebaseFields
	},
	components: {
		id: 'components' as const,
		label: 'This codebase, by component',
		nodes: componentNodes as unknown[],
		edges: componentImports as unknown[],
		fields: componentFields
	},
	cochange: {
		id: 'cochange' as const,
		label: 'This codebase — imports and hidden co-change',
		nodes: componentNodes as unknown[],
		edges: [...componentImports, ...hiddenCoupling] as unknown[],
		fields: componentFields
	}
}
