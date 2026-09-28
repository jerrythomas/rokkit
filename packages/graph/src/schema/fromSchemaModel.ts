import { normalizeGraph } from '../model/normalize.js'
import type { GraphFields, GraphModel } from '../types.js'

/**
 * Field map from a dbd `SchemaModel`'s ER half to the canonical model.
 *
 * Exported so a consumer can hand it straight to `<Graph fields={SCHEMA_FIELDS}>`
 * and skip the transform entirely.
 *
 * Note what is NOT here: dbd's `SchemaModel` type. The package never imports it,
 * so the hand-written TS mirror of `schema_model.rs` stays dbd's concern and this
 * package is not a third definition to keep in step.
 *
 * One canonical field stays deliberately unmapped, because dbd's shape does not carry it and
 * a path that cannot resolve looks correct while silently never firing:
 *
 * - `cardinality` — dbd's `Ref` is `{ from, to, action? }`.
 */
export const SCHEMA_FIELDS: GraphFields = {
	// Identity must NOT be derived from the group, or regrouping re-keys every node. `id`
	// defaults to `${group}.${label}`, so a consumer switching the axis to `kind` would turn
	// `public.orders` into `table.orders` and every dep edge — which resolves
	// `${from.s}.${name}` — would stop matching and the graph would render entirely unplaced.
	// Safe for a consumer passing raw dbd rows too: a row with no `id` falls back as before.
	id: 'id',
	label: 'name',
	group: 'schema',
	kind: 'kind',
	rows: 'columns',
	note: 'noteMd',
	rowName: 'name',
	rowType: 'type',
	rowNote: 'note',
	// v2 (2026-09-27) added `fk` and `uq` to `Column`. `fk` is ALSO derived from the resolved
	// refs; both are kept because they answer different questions — dbd resolved the
	// constraint against the whole database, so a column referencing a table outside a scoped
	// model is still honestly a foreign key even though no edge in this model proves it.
	rowBadges: { pk: 'pk', nn: 'nn', fk: 'fk', uq: 'uq' },
	source: 'from.t',
	target: 'to.t',
	sourceGroup: 'from.s',
	targetGroup: 'to.s',
	sourceRow: 'from.c',
	targetRow: 'to.c',
	action: 'action'
}

/**
 * Field map for a dbd v2 `DepEdge` — `{ from: { s, n }, to: { s, n }, kind, unresolved }`.
 *
 * `n` not `t`, and no `c`: a dependency links whole objects, not columns. `kind` is the VERB
 * (`reads | writes | calls | member`), which is why it maps to `relation` and the edge kind
 * comes from `defaultEdgeKind` instead — every entry in `deps` is a dependency by definition.
 */
export const DEPS_FIELDS: GraphFields = {
	...SCHEMA_FIELDS,
	source: 'from.n',
	target: 'to.n',
	sourceGroup: 'from.s',
	targetGroup: 'to.s',
	sourceRow: undefined,
	targetRow: undefined,
	action: undefined,
	relation: 'kind',
	defaultEdgeKind: 'dependency'
}

/**
 * Which of a `SchemaModel`'s two graphs to build.
 *
 * dbd v2 splits the database in two and says so in its own doc comments: `tables` is "Tables
 * only", `refs` is "Foreign keys only — the dependency graph is `deps`; an ER renderer wants
 * these and a call-graph renderer wants those".
 *
 * That split is a modelling fact, not a rendering preference. An ER diagram is entities and
 * their relationships; a view is a derived projection and a routine is behaviour, so neither
 * is an entity and putting them on an ER canvas is a category error — they have no keys, no
 * relationships, and (in v2) no columns, so they render as orphan cards with nothing in them.
 *
 * - `er` — `tables` + `refs`. The default, so a v1 caller reading a v2 model is unaffected.
 * - `dependencies` — `tables` + `entities` as nodes, `deps` as edges. Tables stay because a
 *   view READS a table; dropping them would leave every dependency dangling.
 */
export type SchemaScope = 'er' | 'dependencies'

/** A dbd node row, with the canonical id made explicit so the grouping axis stays free. */
function identified(rows: unknown[]): unknown[] {
	return rows.map((row) => {
		const r = (row ?? {}) as { schema?: string; name?: string }
		return { ...r, id: r.schema ? `${r.schema}.${r.name}` : String(r.name ?? '') }
	})
}

/** The minimum of dbd's `SchemaModel` this view reads. v2 fields are optional. */
type SchemaModelInput = {
	tables: unknown[]
	refs: unknown[]
	entities?: unknown[]
	deps?: unknown[]
}

/**
 * Consumer-side input for one scope: `nodes`, `edges` and the matching field map.
 *
 * Returned separately from `fromSchemaModel` because `<Graph>` takes `nodes`/`edges`/`fields`
 * directly — a consumer binding the component does not want a pre-normalized model, and
 * making them unpack one would mean normalizing twice.
 */
export function toGraphInput(
	model: SchemaModelInput,
	scope: SchemaScope = 'er'
): { nodes: unknown[]; edges: unknown[]; fields: GraphFields } {
	if (scope === 'er') {
		return { nodes: identified(model.tables), edges: model.refs, fields: SCHEMA_FIELDS }
	}

	return {
		nodes: identified([...model.tables, ...(model.entities ?? [])]),
		edges: model.deps ?? [],
		fields: DEPS_FIELDS
	}
}

/** Convenience wrapper over `normalizeGraph` for dbd-shaped schema JSON. */
export function fromSchemaModel(
	model: SchemaModelInput,
	options: { as?: SchemaScope } = {}
): GraphModel {
	const { nodes, edges, fields } = toGraphInput(model, options.as ?? 'er')

	return normalizeGraph(nodes, edges, fields)
}
