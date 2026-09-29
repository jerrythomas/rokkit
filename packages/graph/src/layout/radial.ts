/* The radial layout: a call graph as a tidy tree, or a dendrogram, around a circle.
 *
 * `points` shelf-packs a call graph into group boxes, and at seven services it already reads
 * as a stack — tiny rects with each label colliding with the row beneath. Packing answers
 * "how much is there"; a call graph's question is "who calls whom, and how deep does it go",
 * and that is a SHAPE. Angle separates the subtrees, radius carries the depth.
 *
 * Two modes, because they answer different questions:
 *   - `tree` (default) puts radius = depth, so the rings ARE the call depth.
 *   - `dendrogram` puts every leaf on the rim, so leaves are compared against each other and
 *     the internal structure stretches to reach them.
 *
 * A call graph is not a tree — see `hierarchy.ts`. The spanning tree decides position; the
 * edges it could not use are still drawn, marked `back`, because "b also calls this" is
 * exactly what a reader is looking for.
 */

import { childrenIn, hierarchy } from './hierarchy.js'
import type { Hierarchy } from './hierarchy.js'
import { nodeSizes } from './sizing.js'
import type { Sized } from './sizing.js'
import { warnUnknownOptions } from './options.js'
import type { Cards, LayoutFn, LayoutResult, RoutedEdge, Size } from './types.js'
import type { GraphEdge, GraphModel } from '../types.js'

/** Gap between rings. Wide enough that a node plus its label clears the ring inside it. */
const RING = 130
/** Arc length reserved per leaf. The outer ring's circumference is derived from this. */
const LEAF_ARC = 92
/**
 * Margin outside the widest ring.
 *
 * Just over half the largest node (sqrt(MAX_AREA * ASPECT) / 2 is ~33px), so a node on the rim
 * clears the canvas edge with a little air for its label — and no more. Every pixel here is
 * dead space that the fit-to-container scale then divides the whole diagram by.
 */
const PAD = 48

type Angles = Map<string, number>

/**
 * A map read with a floor.
 *
 * Every pass below keys on the same node set, so a miss should not happen — but a node
 * rendered at NaN coordinates disappears silently, and one rendered at the centre is at least
 * visible and clickable. One helper rather than a `??` at each of three use sites.
 */
export function read<T>(map: Map<string, T>, id: string, fallback: T): T {
	return map.get(id) ?? fallback
}

/**
 * One angular slot per leaf, then every parent centred on its children.
 *
 * Centring is the "tidy" part: without it a parent sits at a fixed slot and its links cross
 * the neighbouring subtrees to reach their own children. Computed bottom-up, so a parent sees
 * children that are already placed.
 */
function angles(h: Hierarchy, step: number): Angles {
	const angle: Angles = new Map()
	h.leaves.forEach((id, i) => angle.set(id, i * step))

	const place = (id: string): number => {
		const cached = angle.get(id)
		if (cached !== undefined) return cached

		const kids = childrenIn(h, id)
		const mean = kids.reduce((sum, kid) => sum + place(kid), 0) / kids.length
		angle.set(id, mean)

		return mean
	}

	for (const root of h.roots) place(root)

	return angle
}

/**
 * How far out each node sits.
 *
 * `tree` reads radius as depth. `dendrogram` pins leaves to the outermost ring and lifts an
 * internal node to just inside its deepest descendant, which is what makes leaves comparable.
 */
function radii(h: Hierarchy, mode: 'tree' | 'dendrogram', maxDepth: number): Map<string, number> {
	const radius = new Map<string, number>()
	if (mode === 'tree') {
		for (const [id, depth] of h.depthOf) radius.set(id, depth * RING)

		return radius
	}

	// Deepest descendant, bottom-up: a leaf is its own, and a parent sits one ring inside its
	// deepest child so the tree still reads outward.
	const deepest = (id: string): number => {
		const kids = childrenIn(h, id)
		if (kids.length === 0) return maxDepth

		return Math.min(...kids.map((kid) => deepest(kid))) - 1
	}

	for (const id of h.depthOf.keys()) radius.set(id, Math.max(0, deepest(id)) * RING)

	return radius
}

/**
 * The circle the tree has to fit in.
 *
 * The rim's circumference has to hold every leaf plus its label, so it follows from the LEAF
 * COUNT rather than dividing a fixed circle into ever-thinner slices — which is how a radial
 * layout turns into the same unreadable stack it was meant to replace.
 */
function geometry(h: Hierarchy) {
	const leafCount = Math.max(1, h.leaves.length)
	const maxDepth = Math.max(0, ...h.depthOf.values())
	const outer = Math.max(RING, (LEAF_ARC * leafCount) / (Math.PI * 2))

	return {
		step: (Math.PI * 2) / leafCount,
		maxDepth,
		outer,
		// Rings spaced to reach the rim the leaf count demands, so a wide tree spreads rather
		// than piling every level on top of the last.
		spacing: maxDepth > 0 ? outer / maxDepth : 0,
		extent: outer + PAD
	}
}

/** Centre-out placement, converted to top-left card coordinates. */
function place(
	h: Hierarchy,
	sizeOf: Map<string, Sized>,
	mode: 'tree' | 'dendrogram',
	model: GraphModel
): { cards: Cards; size: Size } {
	const { step, maxDepth, spacing, extent } = geometry(h)
	const angle = angles(h, step)
	const radius = radii(h, mode, maxDepth)
	const cards: Cards = {}

	for (const node of model.nodes) {
		const size = read(sizeOf, node.id, { w: 1, h: 1 })
		const r = (read(radius, node.id, 0) / RING) * spacing
		const a = read(angle, node.id, 0)

		cards[node.id] = {
			node,
			vis: [],
			more: node.rows.length,
			w: size.w,
			h: size.h,
			x: extent + Math.cos(a) * r - size.w / 2,
			y: extent + Math.sin(a) * r - size.h / 2,
			groupIndex: 0
		}
	}

	return { cards, size: { w: extent * 2, h: extent * 2 } }
}

/** Identity half of a routed edge — everything that is not geometry. */
function identity(edge: GraphEdge, i: number) {
	return {
		i,
		id: edge.id,
		fromKey: edge.source,
		toKey: edge.target,
		kind: edge.kind,
		relation: edge.relation
	}
}

/**
 * Centre-to-centre links.
 *
 * `s1`/`s2` are derived from which way the link actually points rather than fixed: on a circle
 * "the right side" is meaningless, and a curve control point pushed the wrong way loops back
 * through the node it came from.
 */
function route(edge: GraphEdge, i: number, cards: Cards, extra: Set<string>): RoutedEdge | null {
	const a = cards[edge.source]
	const b = cards[edge.target]
	if (!a || !b) return null

	const [ax, ay] = [a.x + a.w / 2, a.y + a.h / 2]
	const [bx, by] = [b.x + b.w / 2, b.y + b.h / 2]

	if (a === b) {
		return {
			...identity(edge, i),
			self: true,
			x1: a.x + a.w,
			y1: ay,
			x2: a.x + a.w,
			y2: ay + 14,
			s1: 1,
			s2: 1
		}
	}

	return {
		...identity(edge, i),
		// Not a broken cycle here but the same idea: a relationship the tree could not express,
		// still drawn. A theme distinguishes it rather than the reader wondering why one link
		// ignores the rings.
		back: extra.has(edge.id) || undefined,
		self: false,
		x1: ax,
		y1: ay,
		x2: bx,
		y2: by,
		s1: bx >= ax ? 1 : -1,
		s2: bx >= ax ? -1 : 1
	}
}

function routeAll(model: GraphModel, cards: Cards, extra: Set<string>): RoutedEdge[] {
	const routed: RoutedEdge[] = []
	model.edges.forEach((edge, i) => {
		const e = route(edge, i, cards, extra)
		if (e) routed.push(e)
	})

	return routed
}

/**
 * A call graph around a circle.
 *
 * No clusters: the rings already carry structure, and a group box drawn over a radial
 * arrangement cuts across every one of them.
 */
export const radial: LayoutFn = (model, options): LayoutResult => {
	warnUnknownOptions(options, 'radial')
	if (model.nodes.length === 0) {
		return { clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } }
	}

	const h = hierarchy(model)
	const sizeOf = nodeSizes(model, options.sizeBy ?? 'degree', options.sizeScale ?? 'linear')
	const { cards, size } = place(h, sizeOf, options.radialMode ?? 'tree', model)

	return { clusters: [], cards, edges: routeAll(model, cards, h.extra), size }
}
