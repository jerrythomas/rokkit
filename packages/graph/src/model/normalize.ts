import { readPath } from './path.js'
import type {
	EdgeKind,
	GraphEdge,
	GraphFields,
	GraphModel,
	GraphNode,
	GraphRow,
	RowBadge
} from '../types.js'

const BADGE_ORDER: RowBadge[] = ['pk', 'fk', 'uq', 'nn']

function str(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined
}

/**
 * Named quantities, keeping only the finite numbers — a measure is a quantity, and a string
 * or a NaN reaching a size calculation produces a card with no width at all.
 */
function measures(value: unknown): Record<string, number> | undefined {
	if (value === null || typeof value !== 'object') return undefined

	const out: Record<string, number> = {}
	for (const [key, raw] of Object.entries(value)) {
		const n = num(raw)
		if (n !== undefined) out[key] = n
	}

	return Object.keys(out).length > 0 ? out : undefined
}

/**
 * A containment path, from either an array or a delimited string.
 *
 * A file path arrives as `'src/lib/parse.ts'`; requiring every consumer to split it is asking
 * for the same three lines everywhere. Empty segments are dropped, so a leading, trailing or
 * doubled separator is harmless rather than producing a nameless container.
 */
function segments(value: unknown, delimiter: string): string[] | undefined {
	const raw = typeof value === 'string' ? value.split(delimiter) : value
	if (!Array.isArray(raw)) return undefined

	const parts = raw.filter((v): v is string => typeof v === 'string' && v.length > 0)

	return parts.length > 0 ? parts : undefined
}

/** A finite number, or nothing. NaN and Infinity are not measures. */
function num(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function pick(row: unknown, path: string | undefined, fallbackKey: string): unknown {
	return readPath(row, path ?? fallbackKey)
}

function buildRows(source: unknown, fields: GraphFields): GraphRow[] {
	const raw = pick(source, fields.rows, 'rows')
	if (!Array.isArray(raw)) return []

	const badgePaths = fields.rowBadges ?? {}

	return raw.map((entry) => {
		const badges = BADGE_ORDER.filter((badge) => {
			const path = badgePaths[badge]
			return path ? Boolean(readPath(entry, path)) : false
		})

		return {
			name: String(pick(entry, fields.rowName, 'name') ?? ''),
			type: str(pick(entry, fields.rowType, 'type')),
			badges,
			note: str(pick(entry, fields.rowNote, 'note'))
		}
	})
}

// Every node-level field the canonical model reads. A claimed key must NOT also
// land in `meta`, or the same value sits in two places and the two can drift.
const CLAIMED_NODE_KEYS = [
	'id',
	'label',
	'group',
	'kind',
	'weight',
	'path',
	'measures',
	'rows',
	'note'
] as const

function buildMeta(source: unknown, fields: GraphFields): Record<string, unknown> {
	if (source === null || typeof source !== 'object') return {}

	const claimed = new Set<string>()
	for (const key of CLAIMED_NODE_KEYS) {
		// Only the FIRST segment is claimed: a map of `from.t` claims `from`.
		claimed.add((fields[key] ?? key).split('.')[0])
	}

	const meta: Record<string, unknown> = {}
	for (const [key, value] of Object.entries(source)) {
		if (!claimed.has(key)) meta[key] = value
	}

	return meta
}

function buildNode(source: unknown, fields: GraphFields): GraphNode {
	const label = String(pick(source, fields.label, 'label') ?? '')
	const group = str(pick(source, fields.group, 'group'))
	const explicitId = str(pick(source, fields.id, 'id'))

	return {
		id: explicitId ?? (group ? `${group}.${label}` : label),
		label,
		group,
		kind: str(pick(source, fields.kind, 'kind')),
		weight: num(pick(source, fields.weight, 'weight')),
		path: segments(pick(source, fields.path, 'path'), fields.pathDelimiter ?? '/'),
		measures: measures(pick(source, fields.measures, 'measures')),
		rows: buildRows(source, fields),
		note: str(pick(source, fields.note, 'note')),
		meta: buildMeta(source, fields)
	}
}

/**
 * Resolves an edge endpoint to a node id.
 *
 * Exactly two strategies, both explicit:
 *   1. the raw value already IS a node id
 *   2. `${group}.${raw}` where the group comes from a DECLARED path
 *
 * There is deliberately no third "try every sibling field and take the first hit"
 * fallback. That shape guesses: for `{ from: { s: 'staging', t: 'orders', c: 'legacy' } }`
 * where `staging.orders` does not exist but `legacy.orders` does, it would resolve the
 * endpoint to `legacy.orders` — silently drawing a relationship between two entities
 * that have none. An unresolvable endpoint stays unresolved rather than landing on a
 * coincidental match; `resolveEndpoints` then marks the edge unplaced and keeps it.
 */
type EndpointSpec = {
	/** Mapped path to the endpoint value on the edge source. */
	path: string | undefined
	/** Canonical key used when the map omits `path`. */
	fallbackKey: string
	/** Declared path to the endpoint's group, or undefined when none is declared. */
	groupPath: string | undefined
}

function resolveEndpoint(
	source: unknown,
	spec: EndpointSpec,
	byId: Map<string, GraphNode>
): string | undefined {
	const raw = str(pick(source, spec.path, spec.fallbackKey))
	if (raw === undefined) return undefined
	if (byId.has(raw)) return raw

	const group = spec.groupPath ? str(readPath(source, spec.groupPath)) : undefined
	if (group && byId.has(`${group}.${raw}`)) return `${group}.${raw}`

	return undefined
}

/**
 * Both endpoints, each flagged when the map could not resolve it to a node.
 *
 * Deliberately NOT "resolve or drop". Refusing to GUESS is still right — see resolveEndpoint
 * — but discarding is a different decision, and a wrong one: an endpoint that cannot be
 * placed is the normal case at scale, and dropping the edge hides that the relationship
 * exists at all.
 */
function resolveEndpoints(
	source: unknown,
	fields: GraphFields,
	byId: Map<string, GraphNode>
): { from: string; to: string; unplaced?: 'source' | 'target' | 'both' } | null {
	const from = resolveEndpoint(
		source,
		{
			path: fields.source,
			fallbackKey: 'source',
			groupPath: fields.sourceGroup ?? fields.group
		},
		byId
	)
	const to = resolveEndpoint(
		source,
		{
			path: fields.target,
			fallbackKey: 'target',
			groupPath: fields.targetGroup ?? fields.group
		},
		byId
	)

	// The raw value is kept when it does not resolve, so an unplaced edge still carries the
	// name written at the use site rather than becoming anonymous.
	const rawFrom = str(pick(source, fields.source, 'source'))
	const rawTo = str(pick(source, fields.target, 'target'))
	if (rawFrom === undefined || rawTo === undefined) return null

	return { from: from ?? rawFrom, to: to ?? rawTo, unplaced: whichUnplaced(from, to) }
}

/** Which end (if either) the map could not resolve. */
function whichUnplaced(
	from: string | undefined,
	to: string | undefined
): 'source' | 'target' | 'both' | undefined {
	if (from && to) return undefined
	if (!from && !to) return 'both'
	return from ? 'target' : 'source'
}

/**
 * Makes `base` unique within one normalize pass.
 *
 * `kind` is already in `base`, and this counter breaks the remaining ties. Endpoints plus row
 * names are NOT unique on their own: two dependency edges between the same pair (a procedure
 * calling a function twice, a view reaching a table by two paths) carry no row anchors at all,
 * so they would both key as `a:->b:`. A duplicate id silently breaks every id-keyed use —
 * `{#each … as e (e.id)}` first among them.
 */
function uniqueEdgeId(base: string, seen: Map<string, number>): string {
	const seq = seen.get(base) ?? 0
	seen.set(base, seq + 1)

	return seq === 0 ? base : `${base}#${seq}`
}

/**
 * The coarse edge kind: what the row declares, else the map's default, else a reference.
 *
 * Only the two canonical values are accepted from the data. A row carrying dbd v2's verb
 * (`reads`) would otherwise fall through to `reference` and draw a view's dependency as a
 * foreign key — which is why `defaultEdgeKind` exists for a list that is wholly one kind.
 */
function edgeKindOf(source: unknown, fields: GraphFields): EdgeKind {
	const declared = str(pick(source, fields.edgeKind, 'kind'))
	if (declared === 'dependency' || declared === 'reference') return declared

	return fields.defaultEdgeKind ?? 'reference'
}

function buildEdge(
	source: unknown,
	fields: GraphFields,
	byId: Map<string, GraphNode>,
	seen: Map<string, number>
): GraphEdge | null {
	const endpoints = resolveEndpoints(source, fields, byId)
	if (!endpoints) return null

	const { from, to, unplaced } = endpoints
	const sourceRow = str(pick(source, fields.sourceRow, 'sourceRow'))
	const targetRow = str(pick(source, fields.targetRow, 'targetRow'))
	const kind = edgeKindOf(source, fields)
	const relation = str(pick(source, fields.relation, 'relation'))

	// `relation` joins the id because it is what separates otherwise-identical edges: a
	// procedure that both reads AND writes one table produces two dep edges with the same
	// endpoints and no row anchors, which would key identically and lose one to `{#each}`.
	//
	// Appended only when present, so every edge id a v1 consumer already has stays
	// byte-identical — these are `{#each}` keys, and churning them relayouts for no reason.
	const verb = relation ? `${kind}/${relation}` : kind
	const base = `${verb}:${from}:${sourceRow ?? ''}->${to}:${targetRow ?? ''}`

	return {
		id: uniqueEdgeId(base, seen),
		source: from,
		target: to,
		sourceRow,
		targetRow,
		kind,
		relation,
		cardinality: str(pick(source, fields.cardinality, 'cardinality')),
		action: str(pick(source, fields.action, 'action')),
		unplaced,
		...edgeExtras(source, fields)
	}
}

/**
 * `overlay` and `weight`, added only when present so every edge a v1 consumer already has
 * stays key-for-key identical — `toEqual` on an edge is a contract downstream specs rely on.
 */
function edgeExtras(source: unknown, fields: GraphFields): Pick<GraphEdge, 'overlay' | 'weight'> {
	const extras: Pick<GraphEdge, 'overlay' | 'weight'> = {}
	if (pick(source, fields.overlay, 'overlay')) extras.overlay = true
	const weight = num(pick(source, fields.edgeWeight, 'weight'))
	if (weight !== undefined) extras.weight = weight
	return extras
}

/**
 * The source row an edge makes a foreign key, if any.
 *
 * An unplaced TARGET still qualifies — the reference is real, only its destination is
 * unknown. An unplaced SOURCE has no row to mark.
 */
function foreignKeyRow(byId: Map<string, GraphNode>, edge: GraphEdge): GraphRow | undefined {
	if (edge.unplaced === 'source' || edge.unplaced === 'both') return undefined
	if (edge.kind !== 'reference' || !edge.sourceRow) return undefined

	return byId.get(edge.source)?.rows.find((r) => r.name === edge.sourceRow)
}

/** Adds the derived `fk` badge to each reference edge's source row. */
function markForeignKeys(byId: Map<string, GraphNode>, edges: GraphEdge[]): void {
	for (const edge of edges) {
		const row = foreignKeyRow(byId, edge)
		if (row && !row.badges.includes('fk')) {
			row.badges = BADGE_ORDER.filter((b) => b === 'fk' || row.badges.includes(b))
		}
	}
}

function buildNeighbors(edges: GraphEdge[]): Map<string, Set<string>> {
	const neighbors = new Map<string, Set<string>>()

	const link = (a: string, b: string) => {
		const set = neighbors.get(a) ?? new Set<string>()
		set.add(b)
		neighbors.set(a, set)
	}

	for (const edge of edges) {
		// An unplaced endpoint is not a node, so it cannot be a neighbour. `related` and the
		// dim/highlight states must only ever name things the reader can actually click.
		if (edge.unplaced || edge.source === edge.target) continue
		link(edge.source, edge.target)
		link(edge.target, edge.source)
	}

	return neighbors
}

/**
 * Resolves a consumer's `nodes`/`edges`/`fields` into the canonical model — ONCE.
 * Everything downstream (layouts, routing, components) sees concrete types, so no
 * field mapping leaks past this function.
 */
export function normalizeGraph(
	nodes: unknown[],
	edges: unknown[],
	fields: GraphFields = {}
): GraphModel {
	const built = nodes.map((source) => buildNode(source, fields))
	const byId = new Map(built.map((node) => [node.id, node]))

	const seen = new Map<string, number>()
	const resolved = edges
		.map((source) => buildEdge(source, fields, byId, seen))
		.filter((edge): edge is GraphEdge => edge !== null)

	const structural = resolved.filter((edge) => !edge.overlay)
	const overlays = resolved.filter((edge) => edge.overlay)
	markForeignKeys(byId, structural)

	return { nodes: built, edges: structural, overlays, byId, neighbors: buildNeighbors(structural) }
}
