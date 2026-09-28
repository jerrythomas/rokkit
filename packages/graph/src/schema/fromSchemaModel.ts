import { normalizeGraph } from '../model/normalize.js'
import type { GraphFields, GraphModel } from '../types.js'

/**
 * Field map from a dbd `SchemaModel` to the canonical model.
 *
 * Exported so a consumer can hand it straight to `<Graph fields={SCHEMA_FIELDS}>`
 * and skip the transform entirely.
 *
 * Note what is NOT here: dbd's `SchemaModel` type. The package never imports it,
 * so the hand-written TS mirror of `schema_model.rs` stays dbd's concern and this
 * package is not a third definition to keep in step.
 *
 * Two canonical fields are deliberately unmapped, because dbd's shape does not
 * carry them and a path that cannot resolve looks correct while silently never
 * firing:
 *
 * - `rowBadges.uq` — dbd's `Column` is `{ name, type, pk?, nn?, en?, def?, note? }`.
 *   Uniqueness lives on `Index` (`{ def, unique?, name? }`), which this view does not
 *   read. Add it here if a later dbd puts the flag on the column.
 * - `cardinality` — dbd's `Ref` is `{ from, to, action? }`.
 */
export const SCHEMA_FIELDS: GraphFields = {
	label: 'name',
	group: 'schema',
	kind: 'kind',
	rows: 'columns',
	note: 'noteMd',
	rowName: 'name',
	rowType: 'type',
	rowNote: 'note',
	rowBadges: { pk: 'pk', nn: 'nn' },
	source: 'from.t',
	target: 'to.t',
	sourceGroup: 'from.s',
	targetGroup: 'to.s',
	sourceRow: 'from.c',
	targetRow: 'to.c',
	action: 'action'
}

/** Convenience wrapper over `normalizeGraph` for dbd-shaped schema JSON. */
export function fromSchemaModel(model: { tables: unknown[]; refs: unknown[] }): GraphModel {
	return normalizeGraph(model.tables, model.refs, SCHEMA_FIELDS)
}
