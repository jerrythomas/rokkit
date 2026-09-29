import type { GraphModel, GraphNode, GraphRow } from '../types.js'

/** How much of each node's row list a card shows. */
export type Density = 'names' | 'keys' | 'full'

/** Cluster and in-cluster ordering strategy. */
export type Arrange = 'untangle' | 'a-z'

export type EdgeStyle = 'curved' | 'orthogonal'

/** A positioned node card. */
export type Card = {
	node: GraphNode
	/** The rows this card shows at the current density. */
	vis: GraphRow[]
	/** Count of rows hidden by the density. */
	more: number
	w: number
	h: number
	x: number
	y: number
	/**
	 * Position of the card's group in the sorted group list. Replaces dbd's
	 * `hue` — colour now comes from CSS plus the preset, never from a
	 * hardcoded oklch angle baked into the layout.
	 */
	groupIndex?: number
}

export type Cluster = {
	name: string
	list: GraphNode[]
	count: number
	groupIndex: number
	x: number
	y: number
	w?: number
	h?: number
	pos?: { key: string; dx: number; dy: number }[]
	/**
	 * 0 for an outer box, 1 for one nested inside it. Absent means the same as 0.
	 *
	 * Nesting needs no DOM tree: clusters are absolutely positioned boxes, so a flat list
	 * where the outer ones are larger and emitted FIRST renders correctly by paint order.
	 * Depth is what lets CSS tell the two apart — an inner box is a faint subdivision, not a
	 * second coloured region competing with the one containing it.
	 */
	depth?: number
	/** Name of the enclosing cluster, for a depth-1 box. */
	parent?: string
	/**
	 * What to show after the name, when the layout has something better than a child count.
	 *
	 * A number beside a box reads as the thing driving its size, so in a layout where AREA
	 * encodes a measure the count is actively misleading — `components · 63` was 63 files in a
	 * box sized by 63 declarations, and the two being equal was a coincidence. A layout that
	 * sizes by a measure says so here; one that does not leaves it unset and the count stands.
	 */
	caption?: string
	/**
	 * The node this box IS, when it is one. Set on a childless box in a containment layout;
	 * absent on a region, which is not selectable because it is not a thing.
	 *
	 * A treemap is a hierarchy of ONE shape — a box with a label and an area — so a leaf is a
	 * cluster too rather than a node card. Emitting the card put two structures in one nesting
	 * and dragged the card's furniture in with it: a codebase module has no rows, so every leaf
	 * rendered a literal `0` beside its name. Identity survives here instead.
	 */
	nodeId?: string
	/** The node's kind, for colour, when this box is a node. */
	kind?: string
	/**
	 * Which entry of the group ramp this box takes its colour from, when that is not its own
	 * name.
	 *
	 * A containment layout nests boxes many levels deep, and only the outermost ones are group
	 * names the ramp knows. Looked up by its own name, every descendant falls through to the
	 * default — which is how a sunburst's outer ring came out uniformly grey while the inner
	 * ring was correctly coloured. Inheriting the outermost ancestor's key makes a whole
	 * subtree read as one region, which is the thing the reader is tracing.
	 */
	ramp?: string
	/**
	 * Polar geometry, when the layout draws this box as a WEDGE rather than a rectangle.
	 *
	 * Angles are radians from 3 o'clock, radii are from the canvas centre. Kept as numbers
	 * rather than a path string so the layout stays DOM-free and unit-testable to exact
	 * radians — building the arc is the renderer's job.
	 */
	wedge?: { r0: number; r1: number; a0: number; a1: number }
}

/**
 * Which node property a layout groups on. Both already exist on `GraphNode`, so nesting
 * needs no new model field — only a choice of which is outer.
 */
export type NodeAxis = 'group' | 'kind'

export type RoutedEdge = {
	i: number
	/** GraphEdge.id */
	id: string
	fromKey: string
	toKey: string
	kind: GraphModel['edges'][number]['kind']
	/** GraphEdge.relation — the consumer's own verb, carried through for theming. */
	relation?: string
	self: boolean
	/**
	 * Set when a layered layout had to reverse this edge to rank the graph — a mutual foreign
	 * key, which a real schema has. It is still drawn, and still leaves right and enters left,
	 * so it is the one connector that visibly doubles back. A theme distinguishes it rather
	 * than the reader wondering why one link behaves differently.
	 */
	back?: boolean
	x1: number
	y1: number
	x2: number
	y2: number
	/** 1 = right side of the card, -1 = left. */
	s1: number
	s2: number
}

/**
 * One column of a multi-column layout, with the heading it needs to be readable.
 *
 * Three columns get away with none — the focus is visibly central, so the sides are obvious.
 * Five do not: without headings a depth-2 portrait is ambiguous about which direction is
 * which, and the reader has to trace an arrow to find out.
 */
export type Column = {
	x: number
	/** Carried here so the view needs no layout constant to size a heading. */
	w: number
	depth: number
	/** `in` = things that reach the focus, `out` = things it reaches, `focus` = the centre. */
	side: 'in' | 'out' | 'focus'
	label: string
}

export type Cards = Record<string, Card>
export type Size = { w: number; h: number }

export type LayoutOptions = {
	density?: Density
	arrange?: Arrange
	edgeStyle?: EdgeStyle
	/** `neighborhood` only — the node the view centres on. */
	focus?: string | null
	/**
	 * Node ids shown at FULL detail regardless of `density`, and uncapped.
	 * "+3 more" on a card is otherwise a statement with no corresponding action.
	 */
	expanded?: ReadonlySet<string>
	/**
	 * Outer grouping axis. Defaults to `group`, which is every existing caller's behaviour.
	 *
	 * Schema is the right axis for an ER diagram and a poor one for a dependency graph, where
	 * a single schema holds a table, a trigger and a procedure and the question is usually
	 * "what are the routines and what do they touch".
	 */
	groupBy?: NodeAxis
	/**
	 * Subdivide each outer cluster by this second axis. Unset (the default) means one level,
	 * and the layout runs its original single-level path untouched.
	 */
	nestBy?: NodeAxis
	/**
	 * What `points` sizes a node by. `degree` (the default) counts edges; `weight` reads
	 * `GraphNode.weight`.
	 *
	 * Degree is a good default and is not always the measure the reader is asking about — a
	 * 40-file module with few cross-edges should not render smaller than a 2-file one that
	 * happens to be chatty.
	 */
	sizeBy?: string
	/**
	 * How the measure maps onto area. `linear` (the default), or `log` for a measure spanning
	 * orders of magnitude — declaration counts across a real repo span three or four, and
	 * linear flattens everything below the top few onto the minimum.
	 */
	sizeScale?: 'linear' | 'log'
	/**
	 * `neighborhood` only — how many hops out from the focus. Defaults to 1.
	 *
	 * One hop answers "what touches this". Two answers "what does changing this reach", which
	 * is the question a reader has before editing something.
	 */
	depth?: number
	/**
	 * `world` only — the subtree to render as the whole canvas. `[]` is the root.
	 *
	 * This is DRILLING, not zooming: it re-runs the layout with a new root so the subtree gets
	 * the full canvas and its own children become visible. Zoom magnifies what is already
	 * there, which at world scale is a field of sub-pixel boxes.
	 */
	focusPath?: string[]
	/** `world` only — how many levels below the focus to MATERIALISE. Defaults to 2. */
	levels?: number
	/**
	 * `radial` only — `tree` (the default) reads radius as DEPTH; `dendrogram` pins every
	 * leaf to the rim so leaves are compared against each other.
	 */
	radialMode?: 'tree' | 'dendrogram'
}

export type LayoutResult = {
	clusters: Cluster[]
	cards: Cards
	edges: RoutedEdge[]
	/** Column headings, when the layout has columns. Empty for the grid layouts. */
	columns?: Column[]
	size: Size
}

/**
 * A layout is a pure function of the model and its options. DOM-free,
 * synchronous, deterministic: card heights come from row counts, nothing is
 * measured. That is what makes layouts unit-testable to exact pixels.
 */
export type LayoutFn = (model: GraphModel, options: LayoutOptions) => LayoutResult
