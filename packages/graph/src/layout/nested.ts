/* Two-level clustering: an outer box per value of one axis, subdivided by a second.

   Schema is the right grouping for an ER diagram and a poor one for a dependency graph — a
   single schema holds a table, a trigger and a procedure, while the question there is usually
   "what are the routines, and what do they touch". Nesting shows both facts at once rather
   than trading one for the other, and which axis is OUTER is the reader's choice.

   Nesting needs no DOM tree. Clusters are absolutely positioned boxes, so a FLAT list with the
   outer boxes emitted first renders correctly by paint order; `depth` is what lets CSS draw an
   inner box as a faint subdivision rather than a second coloured region fighting the one
   around it.

   This is a separate module, and `nestBy` is strictly opt-in, because `clusters.ts` carries 20
   characterization tests ported from dbd with exact pixel assertions. Single-level layout must
   keep running the original code path untouched. */

import { CL_GAP_X, CL_GAP_Y, CL_PAD, CL_TITLE, MAX_ROW_W } from './constants.js'
import { pack } from './clusters.js'
import type { Cards, Cluster, NodeAxis, Size } from './types.js'
import type { GraphNode } from '../types.js'

/** Gap between two inner boxes inside one outer box. Tighter than the canvas-level gap. */
const INNER_GAP = 14
/** An inner box gets a shorter label strip than an outer one — it is a subdivision. */
const INNER_TITLE = 20

/** The axis value a node buckets under. '' when it has none, which is a bucket, not a drop. */
function axisOf(node: GraphNode, axis: NodeAxis): string {
	return (axis === 'kind' ? node.kind : node.group) ?? ''
}

/** Stable, alphabetical bucketing so a re-render never reshuffles the boxes. */
function bucket(nodes: GraphNode[], axis: NodeAxis): Map<string, GraphNode[]> {
	const by = new Map<string, GraphNode[]>()
	for (const node of nodes) {
		const key = axisOf(node, axis)
		const list = by.get(key) ?? []
		list.push(node)
		by.set(key, list)
	}

	return new Map([...by.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

type Inner = { cluster: Cluster; w: number; h: number }

/**
 * One inner box: its nodes masonry-packed by the SAME `pack` the single-level layout uses, so
 * card geometry inside a subdivision is identical to card geometry inside a plain cluster.
 */
function packInner(name: string, parent: string, nodes: GraphNode[], cards: Cards): Inner {
	const inner: Cluster = {
		name,
		parent,
		depth: 1,
		list: [...nodes].sort((a, b) => a.label.localeCompare(b.label)),
		count: nodes.length,
		groupIndex: 0,
		x: 0,
		y: 0
	}
	pack(inner, cards)

	// `pack` sizes for a top-level cluster (CL_PAD + CL_TITLE). An inner box carries a shorter
	// strip, so the height is re-derived rather than inherited.
	const h = (inner.h ?? 0) - CL_TITLE + INNER_TITLE

	return { cluster: { ...inner, h }, w: inner.w ?? 0, h }
}

/** Flow inner boxes into wrapping rows inside one outer box. Returns the content extent. */
function flowInner(inners: Inner[], limit: number): Size {
	let x = 0
	let y = 0
	let rowHeight = 0
	let widest = 0

	for (const item of inners) {
		if (x > 0 && x + item.w > limit) {
			y += rowHeight + INNER_GAP
			x = 0
			rowHeight = 0
		}

		item.cluster.x = x
		item.cluster.y = y
		x += item.w + INNER_GAP
		rowHeight = Math.max(rowHeight, item.h)
		widest = Math.max(widest, x - INNER_GAP)
	}

	return { w: widest, h: y + rowHeight }
}

/** Shift an inner box and its cards from outer-relative to canvas coordinates. */
function translate(item: Inner, originX: number, originY: number, cards: Cards): void {
	const x = originX + item.cluster.x
	const y = originY + item.cluster.y
	item.cluster.x = x
	item.cluster.y = y

	for (const p of item.cluster.pos ?? []) {
		const card = cards[p.key]
		card.x = x + CL_PAD + p.dx
		card.y = y + INNER_TITLE + p.dy
	}
}

type Outer = { cluster: Cluster; inners: Inner[] }

/** Build one outer box: bucket by the inner axis, pack each, flow them, size the container. */
function buildOuter(name: string, nodes: GraphNode[], inner: NodeAxis, cards: Cards): Outer {
	const inners = [...bucket(nodes, inner).entries()].map(([key, list]) =>
		packInner(key, name, list, cards)
	)

	// Wide enough for the widest subdivision, so an inner box is never forced to overflow.
	const limit = Math.max(...inners.map((i) => i.w), MAX_ROW_W / 3)
	const extent = flowInner(inners, limit)

	return {
		cluster: {
			name,
			depth: 0,
			list: [...nodes].sort((a, b) => a.label.localeCompare(b.label)),
			count: nodes.length,
			groupIndex: 0,
			x: 0,
			y: 0,
			w: extent.w + CL_PAD * 2,
			h: extent.h + CL_PAD * 2 + CL_TITLE
		},
		inners
	}
}

/** Flow outer boxes into wrapping rows, then translate everything they contain. */
function placeOuters(outers: Outer[], cards: Cards): Size {
	let x = 0
	let y = 0
	let rowHeight = 0

	for (const outer of outers) {
		const w = outer.cluster.w ?? 0
		if (x > 0 && x + w > MAX_ROW_W) {
			y += rowHeight + CL_GAP_Y
			x = 0
			rowHeight = 0
		}

		outer.cluster.x = x
		outer.cluster.y = y
		for (const item of outer.inners) {
			translate(item, x + CL_PAD, y + CL_PAD + CL_TITLE, cards)
		}

		x += w + CL_GAP_X
		rowHeight = Math.max(rowHeight, outer.cluster.h ?? 0)
	}

	return {
		w: Math.max(...outers.map((o) => o.cluster.x + (o.cluster.w ?? 0))) + 60,
		h: y + rowHeight + 60
	}
}

/**
 * Two-level clusters over already-built cards.
 *
 * Returns a FLAT list, every outer box before every inner one — absolutely positioned
 * siblings paint in document order, so an outer box emitted later would cover the
 * subdivisions inside it.
 */
export function nestedClusters(
	nodes: GraphNode[],
	cards: Cards,
	outerAxis: NodeAxis,
	innerAxis: NodeAxis
): { clusters: Cluster[]; size: Size } {
	if (nodes.length === 0) return { clusters: [], size: { w: 0, h: 0 } }

	const outers = [...bucket(nodes, outerAxis).entries()].map(([name, list]) =>
		buildOuter(name, list, innerAxis, cards)
	)

	// Alphabetical index so a box keeps its colour however the rows happened to wrap — the
	// stability rule `resolveGroupStyles` follows.
	const names = outers.map((o) => o.cluster.name)
	outers.forEach((o) => (o.cluster.groupIndex = names.indexOf(o.cluster.name)))

	const size = placeOuters(outers, cards)

	return {
		clusters: [...outers.map((o) => o.cluster), ...outers.flatMap((o) => o.inners.map((i) => i.cluster))],
		size
	}
}
