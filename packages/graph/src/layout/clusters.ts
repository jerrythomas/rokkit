/* ============================================================
   Cluster building, ordering, packing, flow — the core of the layout
   algorithm. Groups become clusters, clusters are ordered to minimise edge
   crossings, and each cluster's nodes are masonry-packed then flowed into
   wrapping rows.

   Ported from dbd's layout-clusters.ts. The geometry is unchanged; only the
   model shape moved (LayoutData -> GraphNode[]/GraphEdge[]) and `hue` became
   `groupIndex`, because colour now comes from CSS and the preset.
   ============================================================ */

import {
	CARD_W,
	GAP_X,
	GAP_Y,
	CL_PAD,
	CL_TITLE,
	CL_GAP_X,
	CL_GAP_Y,
	MAX_ROW_W
} from './constants.js'
import type { Cluster, Cards, Size, Arrange, NodeAxis } from './types.js'
import type { GraphEdge, GraphModel, GraphNode } from '../types.js'

/**
 * Group nodes by an axis. A node with no value on it files under ''.
 *
 * `axis` defaults to `group`, so every existing caller — and the ported characterization
 * tests — keep their exact behaviour. It exists because the single-axis case is NOT a special
 * case of nesting: `groupBy: 'kind'` with no `nestBy` has to regroup the flat layout too, and
 * without it the control moved while the picture did not.
 */
export function groupByGroup(
	nodes: GraphNode[],
	axis: NodeAxis = 'group'
): Record<string, GraphNode[]> {
	const byGroup: Record<string, GraphNode[]> = {}
	for (const node of nodes) {
		const key = (axis === 'kind' ? node.kind : node.group) ?? ''
		;(byGroup[key] = byGroup[key] || []).push(node)
	}
	return byGroup
}

/**
 * Undirected node adjacency (cross-node edges) for barycenter ordering.
 *
 * Pushes once PER EDGE, so two edges between the same pair list the neighbour
 * twice. That is deliberate: `barycenter` divides by the array length, so a
 * twice-referenced neighbour is weighted 2x and pulls the node twice as hard.
 * Two FKs to one table is routine (`orders.created_by` and `orders.approved_by`
 * both -> `users.id`), so collapsing this to a Set would silently relayout every
 * multi-FK schema.
 *
 * `GraphModel.neighbors` is a Set and stays one — it answers "is X related to Y",
 * where multiplicity is meaningless. This answers "how strongly is X pulled
 * toward Y", where multiplicity is the whole point. Different questions.
 */
export function buildAdjacency(edges: GraphEdge[]): Map<string, string[]> {
	const nbrs = new Map<string, string[]>()

	const link = (a: string, b: string) => {
		const list = nbrs.get(a) ?? []
		list.push(b)
		nbrs.set(a, list)
	}

	for (const edge of edges) {
		// An unplaced endpoint has no card, and `barycenter` reads a card's y to average
		// positions — so including one crashes on the lookup. The relationship is real and
		// still in the model; it simply has no POSITION to contribute.
		if (edge.unplaced || edge.source === edge.target) continue
		link(edge.source, edge.target)
		link(edge.target, edge.source)
	}

	return nbrs
}

/** One cluster per group; groupIndex assigned by alphabetical position (stable across arranges). */
export function buildClusters(byGroup: Record<string, GraphNode[]>): Cluster[] {
	return Object.keys(byGroup)
		.sort()
		.map((name, i) => ({
			name,
			list: byGroup[name].slice().sort((a, b) => a.label.localeCompare(b.label)),
			count: byGroup[name].length,
			groupIndex: i,
			x: 0,
			y: 0
		}))
}

/** Index of the shortest column so far (first one wins on a tie). */
function shortestColumn(colH: number[]): number {
	let ci = 0
	for (let i = 1; i < colH.length; i++) if (colH[i] < colH[ci]) ci = i
	return ci
}

/** Masonry-pack one cluster from its current list order (sets c.pos/w/h). */
export function pack(c: Cluster, cards: Cards): void {
	const n = c.list.length
	const ncols = Math.max(1, Math.min(6, Math.round(Math.sqrt(n * 1.15))))
	const colH = new Array<number>(ncols).fill(0)
	c.pos = []

	for (const node of c.list) {
		const card = cards[node.id]
		const ci = shortestColumn(colH)
		c.pos.push({ key: node.id, dx: ci * (CARD_W + GAP_X), dy: colH[ci] })
		colH[ci] += card.h + GAP_Y
	}

	c.w = ncols * CARD_W + (ncols - 1) * GAP_X + CL_PAD * 2
	c.h = Math.max(...colH) - GAP_Y + CL_PAD * 2 + CL_TITLE
}

const byArea = (a: Cluster, b: Cluster) => (b.w ?? 0) * (b.h ?? 0) - (a.w ?? 0) * (a.h ?? 0)

/**
 * Count inter-group edge links (symmetric), keyed 'groupA|groupB'.
 *
 * Groups come from the model's `byId` rather than from splitting the node id: an
 * id is opaque once the normalizer has built it, and re-parsing it into parts is
 * exactly the coupling the canonical model removes.
 */
function bumpLink(links: Record<string, number>, a: string, b: string): void {
	links[`${a}|${b}`] = (links[`${a}|${b}`] || 0) + 1
}

function countGroupLinks(model: GraphModel): Record<string, number> {
	const links: Record<string, number> = {}

	for (const edge of model.edges) {
		const from = model.byId.get(edge.source)?.group
		const to = model.byId.get(edge.target)?.group
		if (from === undefined || to === undefined || from === to) continue

		bumpLink(links, from, to)
		bumpLink(links, to, from)
	}

	return links
}

/** Remove + return the `left` cluster most strongly linked to the already-`ordered` ones. */
function pickNextLinked(
	left: Cluster[],
	ordered: Cluster[],
	links: Record<string, number>
): Cluster {
	const lk = (a: Cluster, b: Cluster) => links[`${a.name}|${b.name}`] || 0
	let best = 0
	let bestScore = -1

	for (let i = 0; i < left.length; i++) {
		let score = 0
		for (let j = 0; j < ordered.length; j++) score += lk(left[i], ordered[j]) * (j + 1)
		if (score > bestScore) {
			bestScore = score
			best = i
		}
	}

	return left.splice(best, 1)[0]
}

/**
 * Order clusters. 'untangle' greedily chains groups so heavily-linked ones stay
 * adjacent (seeded by the largest cluster); otherwise sort by area, biggest first.
 */
export function orderClusters(
	clusters: Cluster[],
	model: GraphModel,
	arrange: Arrange
): Cluster[] {
	if (arrange !== 'untangle' || clusters.length <= 1) {
		return clusters.sort(byArea)
	}

	const links = countGroupLinks(model)
	const left = clusters.slice().sort(byArea)
	const ordered: Cluster[] = [left.shift() as Cluster]
	while (left.length) ordered.push(pickNextLinked(left, ordered, links))

	return ordered
}

type FlowCursor = { x: number; y: number; rowH: number }

/** Start a new row when the cluster would overflow the current one. */
function wrapIfNeeded(cursor: FlowCursor, width: number): void {
	if (cursor.x === 0 || cursor.x + width <= MAX_ROW_W) return

	cursor.x = 0
	cursor.y += cursor.rowH + CL_GAP_Y
	cursor.rowH = 0
}

/** Place one cluster's origin (wrapping the row first if it would overflow), then its cards. */
function placeCluster(c: Cluster, cursor: FlowCursor, cards: Cards): void {
	const width = c.w ?? 0
	wrapIfNeeded(cursor, width)

	c.x = cursor.x
	c.y = cursor.y
	cursor.x += width + CL_GAP_X
	cursor.rowH = Math.max(cursor.rowH, c.h ?? 0)

	for (const p of c.pos ?? []) {
		const card = cards[p.key]
		card.x = c.x + CL_PAD + p.dx
		card.y = c.y + CL_PAD + CL_TITLE + p.dy
		card.groupIndex = c.groupIndex
	}
}

/** Flow clusters into rows (wrapping at MAX_ROW_W), place each card, return canvas size. */
export function flow(clusters: Cluster[], cards: Cards): Size {
	// `Math.max(...[])` is -Infinity, which would report a canvas of -Infinity + 60 and render
	// as an SVG with a negative viewBox. An empty model has no canvas, not a backwards one.
	if (clusters.length === 0) return { w: 0, h: 0 }

	const cursor: FlowCursor = { x: 0, y: 0, rowH: 0 }
	for (const c of clusters) placeCluster(c, cursor, cards)

	return {
		w: Math.max(...clusters.map((c) => c.x + (c.w ?? 0))) + 60,
		h: cursor.y + cursor.rowH + 60
	}
}

/** Barycenter mean of a node's neighbors (its own center when it has none). */
function barycenter(key: string, nbrs: Map<string, string[]>, cards: Cards): number {
	const card = cards[key]
	const ns = nbrs.get(key)
	if (!ns || !ns.length) return card.y + card.h / 2

	let sum = 0
	for (const nk of ns) {
		const nc = cards[nk]
		sum += nc.y + nc.h / 2
	}

	return sum / ns.length
}

/** Reorder one cluster's nodes toward their neighbors' barycenters, then re-pack it. */
function reorderTowardNeighbors(c: Cluster, cards: Cards, nbrs: Map<string, string[]>): void {
	const score: Record<string, number> = {}
	for (const node of c.list) score[node.id] = barycenter(node.id, nbrs, cards)

	c.list = c.list.slice().sort((a, b) => score[a.id] - score[b.id])
	pack(c, cards)
}

/** Two barycenter passes: reorder each cluster's nodes toward neighbors, re-pack, re-flow. */
export function barycenterPasses(
	clusters: Cluster[],
	cards: Cards,
	nbrs: Map<string, string[]>
): Size {
	let size: Size = { w: 0, h: 0 }

	for (let iter = 0; iter < 2; iter++) {
		for (const c of clusters) reorderTowardNeighbors(c, cards, nbrs)
		size = flow(clusters, cards)
	}

	return size
}
