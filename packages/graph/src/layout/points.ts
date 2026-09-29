/* Dense-graph layout: every node is a sized rounded RECT, shelf-packed into its group.

   Cards stop working long before the data does. Measured on a 1000-node call graph fitted
   into 1440x900, the `cluster` layout produces an 1780x18090 canvas at scale 0.047 — a 248px
   card renders 11.6px wide and a 12px label lands at 0.56px. The geometry is fine and the
   maths is fast; the CARD is what fails.

   So this layout drops the card. A node becomes a small rect sized by its degree, packed into
   its group's box, and groups are laid out in a grid ordered by size. Reading shifts from
   "what columns does this table have" to "which things are central, and which cluster do they
   live in" — the question you actually ask of a code index.

   WHY RECTS AND NOT DISCS. The first version spiral-packed circles, and it wasted most of its
   canvas: measured on the 7-node service graph, a declared 607x595 world held only 362x364 of
   actual dots — 36% fill. Two compounding causes, both intrinsic to the shape:

     1. One spiral step, derived from the LARGEST dot present, applied to every ring. A group
        holding one hub (r=26) and two leaves (r=5) stepped all three at 60.7px, giving a
        238px disc for three dots.
     2. A circular cluster throws away 1 - pi/4 = 21% of its bounding box before anything is
        placed in it, and the canvas is made of bounding boxes.

   Fit-to-container then frames all that emptiness, so the diagram opens zoomed further out
   than its content warrants and still clips. Rects remove both causes: shelf packing has no
   global step, and a rectangular group box is the area it occupies.

   Deterministic and DOM-free like every other LayoutFn: no physics, no simulation, no random
   seed. The same model always produces the same picture, so it is unit-testable to exact
   pixels and a re-render never reshuffles the diagram under the reader. */

import { buildEdges } from './edges.js'
import { warnUnknownOptions } from './options.js'
import type { Cards, Cluster, LayoutFn, LayoutResult } from './types.js'
type Scale = NonNullable<import('./types.js').LayoutOptions['sizeScale']>
import type { GraphModel, GraphNode } from '../types.js'

/**
 * Node geometry. AREA — not width — tracks degree, so ten edges reads as ten rather than as
 * a hundred. Areas are carried over from the disc version (pi*5^2 to pi*26^2) so the ink
 * weight of a diagram is unchanged; only the shape and the packing are different.
 */
const MIN_AREA = Math.PI * 5 * 5
const MAX_AREA = Math.PI * 26 * 26
/** Width:height. 2:1 reads as a "chip" and shelves well; a square wastes shelf height. */
const ASPECT = 2

const NODE_GAP = 6
const CLUSTER_PAD = 20
/** Room for the group's own label above its first shelf. */
const CLUSTER_TITLE = 26
const CLUSTER_GAP = 40
const CANVAS_PAD = 60

/**
 * How wide a group is allowed to get before it wraps, as a multiple of sqrt(total ink).
 * Above 1 the group box is wider than tall, which suits a label above it and tiles into a
 * grid of groups better than a tall column.
 */
const SHELF_ASPECT = 1.6

function degreeOf(model: GraphModel): Map<string, number> {
	const degree = new Map<string, number>()
	for (const node of model.nodes) degree.set(node.id, 0)

	for (const edge of model.edges) {
		degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1)
		if (edge.target !== edge.source) {
			degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1)
		}
	}

	return degree
}

type Sized = { node: GraphNode; w: number; h: number }

/**
 * Position of `value` between `min` and `max`, as 0..1.
 *
 * `log` is for a measure spanning orders of magnitude: declaration counts across a real repo
 * span three or four, and a linear map puts everything below the top few on the floor. `+1`
 * shifts the domain off zero, which has no logarithm.
 *
 * A flat measure — every node equal, so `max === min` — is 0, not a division by zero.
 */
function normalise(value: number, min: number, max: number, scale: Scale): number {
	if (max <= min) return 0
	if (scale === 'log') {
		return Math.log(value - min + 1) / Math.log(max - min + 1)
	}

	return (value - min) / (max - min)
}

/** Area is LINEAR in the measure, so width grows as its square root — ten reads as ten. */
function sizeFor(t: number): { w: number; h: number } {
	const area = MIN_AREA + (MAX_AREA - MIN_AREA) * t

	return { w: Math.sqrt(area * ASPECT), h: Math.sqrt(area / ASPECT) }
}

/**
 * The number each node is sized by.
 *
 * A node with no weight under `sizeBy: 'weight'` floors rather than vanishing or exploding —
 * "unknown" is a normal state in a partially-indexed graph, and the alternative is a NaN
 * width that renders as nothing at all.
 */
function measureOf(node: GraphNode, degree: Map<string, number>, sizeBy: string): number {
	if (sizeBy === 'degree') return degree.get(node.id) ?? 0
	if (sizeBy === 'weight') return node.weight ?? 0

	return node.measures?.[sizeBy] ?? 0
}

type Packed = { nodes: { node: GraphNode; w: number; h: number; dx: number; dy: number }[]; w: number; h: number }

/**
 * Shelf-pack one group (first-fit decreasing height).
 *
 * Tallest first, so each shelf is set by its first member and later rows never have to grow —
 * that is what keeps the wasted band under each node small. It also puts the hubs top-left,
 * which is where the eye starts, matching the disc version's "hubs at the centre" intent.
 *
 * `dx`/`dy` are the node's CENTRE, the convention `buildDots` and the cluster `pos` share.
 */
function packGroup(members: Sized[]): Packed {
	const ordered = [...members].sort(
		(a, b) => b.h - a.h || b.w - a.w || a.node.id.localeCompare(b.node.id)
	)

	const ink = ordered.reduce((sum, m) => sum + (m.w + NODE_GAP) * (m.h + NODE_GAP), 0)
	// At least one node wide, or a single oversized hub would wrap onto its own shelf forever.
	const limit = Math.max(ordered[0].w, Math.sqrt(ink * SHELF_ASPECT))

	const nodes: Packed['nodes'] = []
	let x = 0
	let y = 0
	let shelfHeight = 0
	let widest = 0

	for (const member of ordered) {
		if (x > 0 && x + member.w > limit) {
			y += shelfHeight + NODE_GAP
			x = 0
			shelfHeight = 0
		}

		nodes.push({ ...member, dx: x + member.w / 2, dy: y + member.h / 2 })
		x += member.w + NODE_GAP
		shelfHeight = Math.max(shelfHeight, member.h)
		widest = Math.max(widest, x - NODE_GAP)
	}

	return { nodes, w: widest, h: y + shelfHeight }
}

type Placement = { name: string; pack: Packed }

function clusterFrom(entry: Placement, x: number, y: number): Cluster {
	return {
		name: entry.name,
		list: entry.pack.nodes.map((n) => n.node),
		count: entry.pack.nodes.length,
		groupIndex: 0,
		x,
		y,
		w: entry.pack.w + CLUSTER_PAD * 2,
		h: entry.pack.h + CLUSTER_PAD * 2 + CLUSTER_TITLE,
		pos: entry.pack.nodes.map((n) => ({
			key: n.node.id,
			dx: CLUSTER_PAD + n.dx,
			dy: CLUSTER_PAD + CLUSTER_TITLE + n.dy
		}))
	}
}

/** Lay the packed groups out in a grid, biggest first, wrapping to keep the canvas squarish. */
function placeGroups(packs: Placement[]): Cluster[] {
	const ordered = [...packs].sort(
		(a, b) => b.pack.w * b.pack.h - a.pack.w * a.pack.h || a.name.localeCompare(b.name)
	)
	const columns = Math.max(1, Math.ceil(Math.sqrt(ordered.length)))

	const clusters: Cluster[] = []
	const cursor = { x: CANVAS_PAD, top: CANVAS_PAD, rowHeight: 0 }

	ordered.forEach((entry, i) => {
		if (i > 0 && i % columns === 0) {
			cursor.x = CANVAS_PAD
			cursor.top += cursor.rowHeight + CLUSTER_GAP
			cursor.rowHeight = 0
		}

		const cluster = clusterFrom(entry, cursor.x, cursor.top)
		clusters.push(cluster)
		cursor.x += (cluster.w ?? 0) + CLUSTER_GAP
		cursor.rowHeight = Math.max(cursor.rowHeight, cluster.h ?? 0)
	})

	return clusters
}

/** Nodes bucketed by group, each carrying the size its measure earns it. */
function sizeByGroup(model: GraphModel, sizeBy: string, scale: Scale): Map<string, Sized[]> {
	const degree = degreeOf(model)
	const measures = model.nodes.map((n) => measureOf(n, degree, sizeBy))
	// Normalised against the range PRESENT, not against zero: a graph whose smallest module
	// holds 400 declarations should still show its internal spread, not one flat block.
	const min = Math.min(0, ...measures)
	const max = Math.max(0, ...measures)

	const byGroup = new Map<string, Sized[]>()

	model.nodes.forEach((node, i) => {
		const key = node.group ?? ''
		const list = byGroup.get(key) ?? []
		list.push({ node, ...sizeFor(normalise(measures[i], min, max, scale)) })
		byGroup.set(key, list)
	})

	return byGroup
}

/** One rect card for a placed node. `pos` holds the CENTRE; a card is positioned top-left. */
function dotFor(
	node: GraphNode,
	cluster: Cluster,
	p: { dx: number; dy: number },
	size: Sized | undefined
) {
	const w = size?.w ?? 1
	const h = size?.h ?? 1

	return {
		node,
		vis: [],
		more: node.rows.length,
		w,
		h,
		x: cluster.x + p.dx - w / 2,
		y: cluster.y + p.dy - h / 2,
		groupIndex: cluster.groupIndex
	}
}

/** One rect card per placed node. */
function buildDots(model: GraphModel, clusters: Cluster[], sizeOf: Map<string, Sized>): Cards {
	const cards: Cards = {}

	for (const cluster of clusters) {
		for (const p of cluster.pos ?? []) {
			const node = model.byId.get(p.key) as GraphNode
			cards[p.key] = dotFor(node, cluster, p, sizeOf.get(p.key))
		}
	}

	return cards
}

/**
 * Rect layout for dense graphs. `density` is ignored on purpose — a dot has no rows — and
 * `arrange` is ignored because placement is fully determined by degree and group.
 */
export const points: LayoutFn = (model, _options): LayoutResult => {
	warnUnknownOptions(_options, 'points')
	if (model.nodes.length === 0) {
		return { clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } }
	}

	const byGroup = sizeByGroup(model, _options.sizeBy ?? 'degree', _options.sizeScale ?? 'linear')

	const packs = [...byGroup.entries()].map(([name, members]) => ({
		name,
		pack: packGroup(members)
	}))
	const clusters = placeGroups(packs)

	// Alphabetical group index so a group keeps its colour regardless of how the grid ordered
	// it by size — the same stability rule resolveGroupStyles follows.
	const alphabetical = [...byGroup.keys()].sort()
	for (const cluster of clusters) cluster.groupIndex = alphabetical.indexOf(cluster.name)

	const sizeOf = new Map<string, Sized>()
	for (const { pack } of packs) for (const n of pack.nodes) sizeOf.set(n.node.id, n)

	const cards = buildDots(model, clusters, sizeOf)

	const width = Math.max(...clusters.map((c) => c.x + (c.w ?? 0))) + CANVAS_PAD
	const height = Math.max(...clusters.map((c) => c.y + (c.h ?? 0))) + CANVAS_PAD

	return { clusters, cards, edges: buildEdges(model.edges, cards), size: { w: width, h: height } }
}
