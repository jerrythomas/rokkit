/** A flag rendered as a badge on a node row. */
export type RowBadge = 'pk' | 'fk' | 'uq' | 'nn'

/** One row inside a node — a column, a parameter, a field. */
export type GraphRow = {
	name: string
	type?: string
	badges: RowBadge[]
	note?: string
}

/**
 * Whether an edge expresses a data reference (a foreign key) or a dependency
 * (a view reading a table, a procedure calling a function). Layouts branch on
 * this rather than on any schema-specific notion.
 */
export type EdgeKind = 'reference' | 'dependency'

export type GraphNode = {
	/** Stable key. `${group}.${label}` when a group is present, else `label`. */
	id: string
	label: string
	/** Open vocabulary — a schema name. Drives cluster grouping and group colour. */
	group?: string
	/** Closed vocabulary — table | view | matview | function | procedure | enum. */
	kind?: string
	rows: GraphRow[]
	note?: string
	/** Source fields the map did not claim, passed through untouched. */
	meta: Record<string, unknown>
}

export type GraphEdge = {
	id: string
	/** GraphNode.id */
	source: string
	/** GraphNode.id */
	target: string
	/** GraphRow.name — the anchor row on the source card. */
	sourceRow?: string
	/** GraphRow.name — the anchor row on the target card. */
	targetRow?: string
	kind: EdgeKind
	cardinality?: string
	action?: string
}

export type GraphModel = {
	nodes: GraphNode[]
	edges: GraphEdge[]
	byId: Map<string, GraphNode>
	/** Undirected adjacency, self-edges excluded. */
	neighbors: Map<string, Set<string>>
}

/**
 * Field map from a consumer's shape to the canonical model. Every entry is a
 * dotted path read with `readPath`. Anything omitted falls back to the
 * same-named key, so a source already shaped like the canonical model needs no map.
 */
export type GraphFields = {
	id?: string
	label?: string
	group?: string
	kind?: string
	rows?: string
	note?: string
	/** Row-level paths, read against each entry of the `rows` array. */
	rowName?: string
	rowType?: string
	rowNote?: string
	/** Row badge flags — each names a truthy path on the row. */
	rowBadges?: Partial<Record<RowBadge, string>>
	/** Edge-level paths. */
	source?: string
	target?: string
	/**
	 * Where each endpoint's GROUP is read from, when the endpoint value is a bare label.
	 * Declared explicitly rather than guessed: dbd's refs nest as `from: { s, t, c }`, so the
	 * group is `from.s`. Falls back to `group` (the node-level path) when unset.
	 */
	sourceGroup?: string
	targetGroup?: string
	sourceRow?: string
	targetRow?: string
	edgeKind?: string
	cardinality?: string
	action?: string
}
