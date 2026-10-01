/* The dual arc diagram (#169): two relations over one shared, ordered axis.
 *
 * Items stand in one column, each a labelled box. The coupling the code declares (imports) arcs
 * out of the boxes' left edges, and the coupling the history reveals (shared commits) out of
 * their right edges. The finding is a pair with an arc on one side and none on the other — the
 * host flags a co-change pair with no import `hidden`, and `showEdges: 'hidden'` keeps only those.
 *
 * Vertical, so ~50 item labels read horizontally, one per row. Each side normalises its weights
 * on its own — an import count and a commit count are different units, and one shared maximum
 * would draw a whole side hairline — and to its 95th percentile, not its maximum, so one
 * outlying pair does not flatten the rest.
 */
import { carried, keepsEdge } from './edges.js'
import { warnUnknownOptions } from './options.js'
import { capOf } from './percentile.js'
import type { Cluster, LayoutFn, LayoutOptions, LayoutResult, RoutedEdge } from './types.js'
import type { GraphEdge, GraphModel, GraphNode } from '../types.js'

const BOX_W = 168
const BOX_H = 16
const ROW = 20
const PAD = 16
/** An arc's horizontal reach as a share of half its span: flatter than a semicircle, so the
 *  longest arcs do not push the canvas twice as wide as it is tall. */
const BULGE = 0.5

/** By group, in the order groups first appear; within a group, as given. */
function axisOrder(nodes: GraphNode[]): GraphNode[] {
	const rank = new Map<string, number>()
	for (const n of nodes) if (!rank.has(n.group ?? '')) rank.set(n.group ?? '', rank.size)
	return nodes
		.map((node, i) => ({ node, i }))
		.sort((a, b) => rank.get(a.node.group ?? '')! - rank.get(b.node.group ?? '')! || a.i - b.i)
		.map(({ node }) => node)
}

/** Which side an edge belongs on: the named relation's when `above` is given, else overlays. */
const sideOf = (edge: GraphEdge, above: string | undefined): 'above' | 'below' =>
	(above === undefined ? edge.overlay : edge.relation === above) ? 'above' : 'below'

type Placed = { node: GraphNode; y: number }

/** Where an arc meets the axis: the box edge it leaves from, and the two rows' centres. */
type Anchor = { x: number; y1: number; y2: number }

/** An arc between two rows, out of the left edge (below) or the right edge (above). */
function arc(edge: GraphEdge, i: number, side: 'above' | 'below', { x, y1, y2 }: Anchor): RoutedEdge {
	const [top, bottom] = y1 < y2 ? [y1, y2] : [y2, y1]
	const ry = (bottom - top) / 2
	// Drawn top to bottom: sweep 0 bends it left, 1 right.
	const sweep = side === 'below' ? 0 : 1
	const s = side === 'below' ? -1 : 1
	return {
		i,
		id: edge.id,
		fromKey: edge.source,
		toKey: edge.target,
		kind: edge.kind,
		...(edge.relation ? { relation: edge.relation } : {}),
		...carried(edge),
		side,
		self: false,
		x1: x,
		y1,
		x2: x,
		y2,
		s1: s,
		s2: s,
		path: `M ${x} ${top} A ${ry * BULGE} ${ry} 0 0 ${sweep} ${x} ${bottom}`
	}
}

/** Each side's weights as 0..1 of that side's 95th percentile, clamped past it. */
function strengthen(edges: RoutedEdge[]): void {
	for (const side of ['above', 'below'] as const) {
		const mine = edges.filter((e) => e.side === side && e.weight !== undefined)
		const cap = capOf(mine.map((e) => e.weight))
		for (const e of mine) e.strength = Math.min(1, Math.max(0, e.weight! / cap))
	}
}

function route(model: GraphModel, placed: Map<string, Placed>, x0: number, options: LayoutOptions): RoutedEdge[] {
	const routed: RoutedEdge[] = []
	for (const edge of [...model.edges, ...model.overlays]) {
		const from = placed.get(edge.source)
		const to = placed.get(edge.target)
		if (!from || !to || from === to) continue
		const side = sideOf(edge, options.above)
		const x = side === 'below' ? x0 : x0 + BOX_W
		routed.push(arc(edge, routed.length, side, { x, y1: from.y + BOX_H / 2, y2: to.y + BOX_H / 2 }))
	}
	// Strength first, so filtering to the hidden pairs does not re-scale what is left.
	strengthen(routed)
	return routed.filter((e) => keepsEdge(options.showEdges ?? 'all', e))
}

/** How far the widest arc on each side reaches past the box column. */
function reach(model: GraphModel, placed: Map<string, Placed>, above: string | undefined) {
	const out = { above: 0, below: 0 }
	for (const edge of [...model.edges, ...model.overlays]) {
		const from = placed.get(edge.source)
		const to = placed.get(edge.target)
		if (!from || !to) continue
		const side = sideOf(edge, above)
		out[side] = Math.max(out[side], (Math.abs(to.y - from.y) / 2) * BULGE)
	}
	return out
}

function degrees(model: GraphModel): Map<string, number> {
	const count = new Map<string, number>()
	for (const e of [...model.edges, ...model.overlays]) {
		if (e.source === e.target) continue
		count.set(e.source, (count.get(e.source) ?? 0) + 1)
		count.set(e.target, (count.get(e.target) ?? 0) + 1)
	}
	return count
}

/** The items on one axis, imports arcing left and shared commits right. */
export const arcs: LayoutFn = (model, options): LayoutResult => {
	warnUnknownOptions(options, 'arcs')
	if (model.nodes.length === 0) return { clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } }

	const order = axisOrder(model.nodes)
	const placed = new Map(order.map((node, row) => [node.id, { node, y: PAD + row * ROW }]))
	// The axis is fixed by the items alone, so filtering edges never moves a box.
	const { above, below } = reach(model, placed, options.above)
	const x0 = PAD + below
	const degree = degrees(model)
	const clusters: Cluster[] = order.map((node) => ({
		name: node.label,
		list: [],
		count: degree.get(node.id) ?? 0,
		groupIndex: 0,
		x: x0,
		y: placed.get(node.id)!.y,
		w: BOX_W,
		h: BOX_H,
		depth: 0,
		nodeId: node.id,
		kind: node.kind,
		declared: node.id,
		...(node.group ? { ramp: node.group } : {})
	}))
	return {
		clusters,
		cards: {},
		edges: route(model, placed, x0, options),
		size: { w: x0 + BOX_W + above + PAD, h: PAD * 2 + (order.length - 1) * ROW + BOX_H }
	}
}
