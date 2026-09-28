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
 * Props for the `Graph` canvas.
 *
 * Either hand it a `state` — for composition, or to drive selection from outside — or hand
 * it `nodes`/`edges`/`fields` and let it construct one. A supplied `state` must have STABLE
 * IDENTITY for the component's lifetime: drive the existing instance through its own methods
 * and `update()` rather than swapping instances, because context captures it once at init.
 */
export type GraphProps = {
	state?: import('./GraphState.svelte.js').GraphState
	nodes?: unknown[]
	edges?: unknown[]
	fields?: GraphFields
	layout?: string | import('./layout/types.js').LayoutFn
	density?: import('./layout/types.js').Density
	arrange?: import('./layout/types.js').Arrange
	edgeStyle?: import('./layout/types.js').EdgeStyle
	/** `neighborhood` only — the node the view centres on. Defaults to the selection. */
	focus?: string | null
	value?: string | null
	preset?: import('./preset.js').GraphPreset
	mode?: 'light' | 'dark'
	/**
	 * Multiplier on the fit-to-container scale. 1 fits the whole diagram; above 1 the canvas
	 * scrolls and drags rather than clipping. Bindable — the built-in controls drive it.
	 */
	zoom?: number
	/** Built-in zoom controls, ctrl/pinch-wheel zoom and drag-to-pan. Default true. */
	zoomable?: boolean
	/** Built-in names/keys/all detail toggle on the canvas. Default true. */
	densityToggle?: boolean
	/**
	 * Draw an arrowhead at each edge's target instead of a plain anchor dot. Default true —
	 * an edge is directed, and two identical dots discard that.
	 */
	arrows?: boolean
	label?: string
	onselect?: (id: string) => void
	/** Icon class per node kind and row badge, merged over the built-in map. */
	icons?: Record<string, string>
	class?: string
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
