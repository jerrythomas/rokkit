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
const CLAIMED_NODE_KEYS = ['id', 'label', 'group', 'kind', 'rows', 'note'] as const

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
 * that have none. An unresolvable endpoint must drop the edge, not land on a
 * coincidental match.
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

/** Both endpoints, or null when either fails to resolve — an edge needs both. */
function resolveEndpoints(
	source: unknown,
	fields: GraphFields,
	byId: Map<string, GraphNode>
): { from: string; to: string } | null {
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

	return from && to ? { from, to } : null
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

function buildEdge(
	source: unknown,
	fields: GraphFields,
	byId: Map<string, GraphNode>,
	seen: Map<string, number>
): GraphEdge | null {
	const endpoints = resolveEndpoints(source, fields, byId)
	if (!endpoints) return null

	const { from, to } = endpoints
	const sourceRow = str(pick(source, fields.sourceRow, 'sourceRow'))
	const targetRow = str(pick(source, fields.targetRow, 'targetRow'))
	const kind: EdgeKind =
		str(pick(source, fields.edgeKind, 'kind')) === 'dependency' ? 'dependency' : 'reference'

	return {
		id: uniqueEdgeId(`${kind}:${from}:${sourceRow ?? ''}->${to}:${targetRow ?? ''}`, seen),
		source: from,
		target: to,
		sourceRow,
		targetRow,
		kind,
		cardinality: str(pick(source, fields.cardinality, 'cardinality')),
		action: str(pick(source, fields.action, 'action'))
	}
}

/** Adds the derived `fk` badge to each reference edge's source row. */
function markForeignKeys(byId: Map<string, GraphNode>, edges: GraphEdge[]): void {
	for (const edge of edges) {
		if (edge.kind !== 'reference' || !edge.sourceRow) continue

		const row = byId.get(edge.source)?.rows.find((r) => r.name === edge.sourceRow)
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
		if (edge.source === edge.target) continue
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

	markForeignKeys(byId, resolved)

	return { nodes: built, edges: resolved, byId, neighbors: buildNeighbors(resolved) }
}
