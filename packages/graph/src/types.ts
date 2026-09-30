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
	/**
	 * A quantity this node carries — declarations in a module, rows in a table, bytes in a
	 * bundle. Drives size in `points` (`sizeBy: 'weight'`) and the sequential colour channel.
	 *
	 * Optional because most graphs have no such number, and degree stays the default so no
	 * existing caller changes. A node without one sizes at the floor rather than vanishing.
	 */
	weight?: number
	/**
	 * Named quantities this node carries — `{ declarations: 900, unresolved: 0.9 }`.
	 *
	 * A bag rather than more fields because size and shade are INDEPENDENT measures with
	 * different ranges, and the control that motivates them switches between several at
	 * runtime: naming a key re-runs the layout, where re-mapping `fields` would re-normalize
	 * the whole model on every toggle. `weight` remains the named default for size.
	 */
	measures?: Record<string, number>
	/**
	 * This node's OWN full path, outermost first and INCLUDING itself —
	 * `['dbd', 'core', 'lexer', 'parse']`.
	 *
	 * `group` is one flat key and a codebase is containment six deep: project › repository ›
	 * folder › module › file › symbol. A path needs nothing to exist that does not, and cannot
	 * dangle the way a `parent` id can. A node without one sits at the root.
	 *
	 * **Containment is PREFIX**, which is what makes a container an ordinary node: anything
	 * whose path extends past this one is inside it. A container therefore keeps its own id,
	 * label, note, measures and edges — there is no id convention to satisfy and no second
	 * kind of node. A prefix nothing declares is synthesised, so the easy case still needs
	 * only leaves.
	 *
	 * Accepts a delimited STRING too (`'dbd/core/lexer/parse'`), since that is how a file path
	 * arrives. See `GraphFields.pathDelimiter`.
	 */
	path?: string[]
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
	/**
	 * The consumer's own word for the relationship, when it has one — dbd v2's `DepEdge.kind`
	 * is `reads | writes | calls | member`.
	 *
	 * Open vocabulary, deliberately. `kind` stays the two-value discriminator that layouts
	 * branch on; widening THAT to hold four SQL verbs would teach a generic graph package
	 * what a stored procedure is. This carries the word so the renderer can label and theme
	 * it (`data-edge-relation`) without the coupling.
	 */
	relation?: string
	cardinality?: string
	action?: string
	/**
	 * Endpoints the field map could not resolve to a node, with the raw value left in place
	 * on `source`/`target` so it is still readable.
	 *
	 * An unresolvable endpoint is a NORMAL state, not a defect. Sensei's code graph reports
	 * 59.6% of 4.08M edges with a null target: the call is real, the callee is simply not
	 * indexed. Dropping those would make the graph look far more complete than it is, so the
	 * edge is kept and marked, and it is the renderer's job to dim it.
	 */
	unplaced?: 'source' | 'target' | 'both'
	/**
	 * Drawn over the picture but never allowed to shape it — a co-change pair, a layering
	 * rule broken, a suggested dependency.
	 *
	 * Such an edge is exactly what the reader wants to see and exactly what must not re-rank a
	 * layered layout or pull a cluster ordering: files that change together with no import
	 * between them would otherwise be drawn next to each other, hiding the very coupling the
	 * overlay exists to expose. So they never enter `GraphModel.edges`; they live in
	 * `GraphModel.overlays` and are routed after the layout has run.
	 */
	overlay?: boolean
	/** A strength this edge carries — co-change count, call frequency. Drives stroke width. */
	weight?: number
}

export type GraphModel = {
	nodes: GraphNode[]
	/** Structural edges — the ones layouts, neighbours and relationships see. */
	edges: GraphEdge[]
	/** Overlay edges (`GraphEdge.overlay`) — routed after layout, never shaping it. */
	overlays: GraphEdge[]
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
	/** Outer grouping axis — `group` (default) or `kind`. */
	groupBy?: import('./layout/types.js').NodeAxis
	/** Paint each card with its group's ramp — schema stays visible in a clusterless layout. */
	groupTint?: boolean
	/** Subdivide each cluster by a second axis. Omit for one level. */
	nestBy?: import('./layout/types.js').NodeAxis
	/**
	 * `points` only — what a node's size encodes. `degree` (default) counts edges, `weight`
	 * reads `GraphNode.weight`, and any other string names a key in `GraphNode.measures`.
	 */
	sizeBy?: string
	/** How the measure maps onto area — `linear` (default) or `log`. */
	sizeScale?: 'linear' | 'log'
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
	/** Ctrl/pinch-wheel zoom and drag-to-pan. The BUTTON bar is `ZoomControl`, placed by you. */
	zoomable?: boolean
	/**
	 * Draw an arrowhead at each edge's target instead of a plain anchor dot. Default true —
	 * an edge is directed, and two identical dots discard that.
	 */
	arrows?: boolean
	label?: string
	/** Fires on selection AND on clear, where it receives `null`. */
	onselect?: (id: string | null) => void
	/**
	 * The containment subtree drawn as the whole canvas (`world`, `sunburst`, `structure`).
	 * Bindable: drilling moves it. `[]` is the root.
	 */
	focusPath?: string[]
	/** The reader drilled into a box — see `GraphStateConfig.ondrill`. */
	ondrill?: (path: string[], node: GraphNode | null) => void | Promise<void>
	/** The reader drilled out — see `GraphStateConfig.ondrillup`. */
	ondrillup?: (path: string[]) => void | Promise<void>
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
	/** Path to a per-node quantity — see `GraphNode.weight`. */
	weight?: string
	/** Path to a containment chain — see `GraphNode.path`. */
	path?: string
	/** Separator when `path` resolves to a STRING rather than an array. Defaults to `/`. */
	pathDelimiter?: string
	/** Path to an object of named quantities — see `GraphNode.measures`. */
	measures?: string
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
	/**
	 * Kind for an edge whose `edgeKind` path yields nothing. Defaults to `'reference'`.
	 *
	 * For a dataset that is ENTIRELY dependencies — dbd v2's `deps`, or a call graph — the
	 * kind is a property of the list, not of each row, and there is no path to point at.
	 * Without this the consumer has to rewrite every edge object just to tag it, or accept
	 * every call being drawn as a foreign key.
	 */
	defaultEdgeKind?: EdgeKind
	/** Path to the consumer's own relationship word — see `GraphEdge.relation`. */
	relation?: string
	/** Path to a truthy flag marking an overlay edge — see `GraphEdge.overlay`. */
	overlay?: string
	/** Path to an edge's strength — see `GraphEdge.weight`. */
	edgeWeight?: string
	cardinality?: string
	action?: string
}
