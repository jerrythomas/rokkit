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
}

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
	x1: number
	y1: number
	x2: number
	y2: number
	/** 1 = right side of the card, -1 = left. */
	s1: number
	s2: number
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
}

export type LayoutResult = {
	clusters: Cluster[]
	cards: Cards
	edges: RoutedEdge[]
	size: Size
}

/**
 * A layout is a pure function of the model and its options. DOM-free,
 * synchronous, deterministic: card heights come from row counts, nothing is
 * measured. That is what makes layouts unit-testable to exact pixels.
 */
export type LayoutFn = (model: GraphModel, options: LayoutOptions) => LayoutResult
