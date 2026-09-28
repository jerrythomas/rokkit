/* Dense-graph layout: every node is a sized DOT, grouped into packed clusters.

   Cards stop working long before the data does. Measured on a 1000-node call graph fitted
   into 1440x900, the `cluster` layout produces an 1780x18090 canvas at scale 0.047 — a 248px
   card renders 11.6px wide and a 12px label lands at 0.56px. The geometry is fine and the
   maths is fast (30ms end to end); the CARD is what fails.

   So this layout drops the card. A node becomes a dot sized by its degree, positioned in a
   spiral inside its group's disc, and groups are laid out in a grid ordered by size. Reading
   shifts from "what columns does this table have" to "which things are central, and which
   cluster do they live in" — which is the question you actually ask of a code index.

   Deterministic and DOM-free like every other LayoutFn: no physics, no simulation, no random
   seed. The same model always produces the same picture, so it is unit-testable to exact
   pixels and a re-render never reshuffles the diagram under the reader. */

import { buildEdges } from './edges.js'
import type { Cards, Cluster, LayoutFn, LayoutResult } from './types.js'
import type { GraphModel, GraphNode } from '../types.js'

/** Dot geometry. A node's area — not its radius — tracks degree, so ten edges reads as ten. */
const MIN_R = 5
const MAX_R = 26
const NODE_GAP = 6
const CLUSTER_PAD = 28
const CLUSTER_GAP = 48
const CANVAS_PAD = 60

/** Golden-angle spiral: even packing with no overlap test and no iteration. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

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

/** Radius by degree, on a square-root scale so AREA is proportional rather than radius. */
function radiusFor(degree: number, maxDegree: number): number {
	if (maxDegree <= 0) return MIN_R
	const t = Math.sqrt(degree / maxDegree)
	return MIN_R + (MAX_R - MIN_R) * t
}

type Packed = { nodes: { node: GraphNode; r: number; dx: number; dy: number }[]; radius: number }

/**
 * Spiral-pack one group's nodes, biggest first so the hubs land at the centre — the thing
 * you look for in a dense graph is the thing nearest the middle.
 */
function packGroup(members: { node: GraphNode; r: number }[]): Packed {
	const ordered = [...members].sort((a, b) => b.r - a.r || a.node.id.localeCompare(b.node.id))

	// Derived from the LARGEST dot actually present, not from the average. On a Vogel spiral
	// with r = step*sqrt(i) the nearest-neighbour distance tends to ~0.95*step, so two
	// max-radius dots need step >= 2*maxR/0.95. Averaging the radii packed tighter and let
	// the two biggest dots overlap — which the packing test caught.
	const maxR = Math.max(MIN_R, ...ordered.map((m) => m.r))
	const step = (2 * maxR) / 0.95 + NODE_GAP

	let extent = 0
	const nodes = ordered.map((member, i) => {
		// sqrt(i) keeps the areal density even as the spiral grows outward.
		const distance = i === 0 ? 0 : step * Math.sqrt(i)
		const angle = i * GOLDEN_ANGLE
		const dx = Math.cos(angle) * distance
		const dy = Math.sin(angle) * distance
		extent = Math.max(extent, distance + member.r)
		return { node: member.node, r: member.r, dx, dy }
	})

	return { nodes, radius: extent + CLUSTER_PAD }
}

type Placement = { name: string; pack: Packed }

function clusterFrom(entry: Placement, x: number, y: number): Cluster {
	const size = entry.pack.radius * 2

	return {
		name: entry.name,
		list: entry.pack.nodes.map((n) => n.node),
		count: entry.pack.nodes.length,
		groupIndex: 0,
		x,
		y,
		w: size,
		h: size,
		pos: entry.pack.nodes.map((n) => ({
			key: n.node.id,
			dx: entry.pack.radius + n.dx,
			dy: entry.pack.radius + n.dy
		}))
	}
}

/** Lay the packed groups out in a grid, biggest first, wrapping to keep the canvas squarish. */
function placeGroups(packs: Placement[]): Cluster[] {
	const ordered = [...packs].sort(
		(a, b) => b.pack.radius - a.pack.radius || a.name.localeCompare(b.name)
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

/** Nodes bucketed by group, each carrying the radius its degree earns it. */
function sizeByGroup(model: GraphModel): Map<string, { node: GraphNode; r: number }[]> {
	const degree = degreeOf(model)
	const maxDegree = Math.max(0, ...degree.values())
	const byGroup = new Map<string, { node: GraphNode; r: number }[]>()

	for (const node of model.nodes) {
		const key = node.group ?? ''
		const list = byGroup.get(key) ?? []
		list.push({ node, r: radiusFor(degree.get(node.id) ?? 0, maxDegree) })
		byGroup.set(key, list)
	}

	return byGroup
}

/** One square card per placed dot. `pos` holds the CENTRE; a card is positioned top-left. */
function buildDots(
	model: GraphModel,
	clusters: Cluster[],
	radiusOf: Map<string, number>
): Cards {
	const cards: Cards = {}

	for (const cluster of clusters) {
		for (const p of cluster.pos ?? []) {
			const node = model.byId.get(p.key) as GraphNode
			const r = radiusOf.get(p.key) ?? MIN_R

			cards[p.key] = {
				node,
				vis: [],
				more: node.rows.length,
				w: r * 2,
				h: r * 2,
				x: cluster.x + p.dx - r,
				y: cluster.y + p.dy - r,
				groupIndex: cluster.groupIndex
			}
		}
	}

	return cards
}

/**
 * Dot layout for dense graphs. `density` is ignored on purpose — a dot has no rows — and
 * `arrange` is ignored because placement is fully determined by degree and group.
 */
export const points: LayoutFn = (model, _options): LayoutResult => {
	if (model.nodes.length === 0) {
		return { clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } }
	}

	const byGroup = sizeByGroup(model)

	const packs = [...byGroup.entries()].map(([name, members]) => ({
		name,
		pack: packGroup(members)
	}))
	const clusters = placeGroups(packs)

	// Alphabetical group index so a group keeps its colour regardless of how the grid ordered
	// it by size — the same stability rule resolveGroupStyles follows.
	const alphabetical = [...byGroup.keys()].sort()
	for (const cluster of clusters) cluster.groupIndex = alphabetical.indexOf(cluster.name)

	const radiusOf = new Map<string, number>()
	for (const { pack } of packs) for (const n of pack.nodes) radiusOf.set(n.node.id, n.r)

	const cards = buildDots(model, clusters, radiusOf)

	const width = Math.max(...clusters.map((c) => c.x + (c.w ?? 0))) + CANVAS_PAD
	const height = Math.max(...clusters.map((c) => c.y + (c.h ?? 0))) + CANVAS_PAD

	return { clusters, cards, edges: buildEdges(model.edges, cards), size: { w: width, h: height } }
}
