/* The structure view: a codebase as a radial dendrogram with its calls bundled through it.
 *
 * The layout `CallTree` could not be. A call graph's own spanning tree has hundreds of roots
 * over a real repo, so capping its depth prunes almost nothing and the rim comes out a grey
 * smear. A codebase's structure is CONTAINMENT — crate, module, file — and that is a real
 * tree with one root, which is what makes "show two levels, then drill" mean something.
 *
 * So the hierarchy here is `buildTree` over `path`, exactly the tree `world` and `sunburst`
 * use, and the calls are drawn ON it rather than defining it:
 *
 *   - every LEAF sits on one rim, so leaves are comparable and the rim can hold labels
 *   - each ancestor level gets an arc outside that rim, naming the region under it
 *   - an edge is routed up to the two ends' lowest common ancestor and back down, then
 *     relaxed toward the straight chord by `bundleTension`
 *
 * Bundling is the part that makes it readable at scale: edges travelling the same way through
 * the tree are pulled together, so a few hundred chords become visible flows between parts of
 * the structure instead of a solid disc of ink.
 *
 * Modelled on Sensei's Structure board (docs/mockups/Sensei, "Project window · Diagrams ·
 * Structure"), which is d3.cluster + lineRadial + curveBundle over the same hierarchy.
 */

import { carried } from './edges.js'
import { buildTree, findNode } from '../model/tree.js'
import type { TreeNode } from '../model/tree.js'
import { bundlePath, commonDepth } from './bundle.js'
import type { Point } from './bundle.js'
import { nodeSizes } from './sizing.js'
import { warnUnknownOptions } from './options.js'
import type { Cards, Cluster, LayoutFn, LayoutResult, RoutedEdge } from './types.js'
import type { GraphEdge, GraphModel, GraphNode } from '../types.js'

/** Smallest leaf rim. Everything inside is tree, everything outside is annotation. */
const MIN_RIM = 300
/**
 * Arc length reserved per leaf, which is what the rim's circumference has to satisfy.
 *
 * The rim GROWS with the leaf count rather than dividing a fixed circle into ever-thinner
 * slices — 470 modules on a 300px rim is four pixels each, which is the grey smear this
 * layout exists to replace.
 */
const LEAF_ARC = 22
/** Gap from the rim to the first band of ancestor arcs, leaving room for a leaf label. */
const BAND_GAP = 58
/** Thickness of one ancestor band. */
const BAND = 8
/** Space between bands, and the room a band's own label needs. */
const BAND_STEP = 26
/** Margin outside the outermost band. */
const PAD = 40

type Placed = { node: TreeNode; angle: number; radius: number }

/** Geometry every pass shares: the rim the leaves sit on, and where the centre is. */
type Ring = { rim: number; centre: number }

/**
 * Nodes by their joined PATH, which is how an ancestor chain is walked.
 *
 * Not by id: `buildTree` gives a synthesised box its joined path as an id, but a DECLARED node
 * keeps its own — so `repo/core/lexer/parse` and `a1` can be the same box, and looking an
 * ancestor chain up by joined path silently missed every declared leaf in it.
 */
type ByPath = Map<string, TreeNode>

/** What routing an edge needs: where every node sits, and how to find an ancestor. */
type Ctx = { placed: Map<string, Placed>; byPath: ByPath; centre: number }

/**
 * Cut the tree off at `limit`, making everything at that depth a leaf.
 *
 * This is what `levels` means here, and the thing that makes the view usable: the rim holds
 * whatever level you asked for, so 1 is a dozen crates you can read and 3 is every file. Left
 * uncut, a repo puts 470 leaves on one rim at a fraction of a degree each — unreadable at any
 * zoom, with a depth control that appeared to do nothing because it only drew rings.
 *
 * `buildTree` has already summed each subtree, so a cut node keeps the weight of everything
 * it now stands for.
 */
function truncate(node: TreeNode, limit: number): TreeNode {
	if (node.depth >= limit) return { ...node, children: [] }

	return { ...node, children: node.children.map((child) => truncate(child, limit)) }
}

/** Leaves in walk order, so a parent's children stay adjacent on the rim. */
function leavesOf(root: TreeNode): TreeNode[] {
	const out: TreeNode[] = []
	const visit = (n: TreeNode) => {
		if (n.children.length === 0) {
			out.push(n)

			return
		}
		for (const child of n.children) visit(child)
	}
	visit(root)

	return out
}

/**
 * An angle for every node: leaves get equal slots, a parent sits at the mean of its children.
 *
 * The "cluster" in d3.cluster. Without the centring a parent sits at a fixed slot and every
 * edge routed through it crosses the neighbouring subtrees to get there — which defeats the
 * bundling, since the bundle follows exactly those parents.
 */
function place(root: TreeNode, step: number, rim: number): { placed: Map<string, Placed>; byPath: ByPath } {
	const placed = new Map<string, Placed>()
	const byPath: ByPath = new Map()
	const depth = maxDepthOf(root)

	const visit = (node: TreeNode, slot: { next: number }): number => {
		const leaf = node.children.length === 0
		let angle: number
		if (leaf) {
			angle = slot.next * step
			slot.next++
		} else {
			const kids = node.children.map((child) => visit(child, slot))
			angle = kids.reduce((sum, a) => sum + a, 0) / kids.length
		}

		// Every LEAF on the rim, whatever its depth — that is the dendrogram property, and what
		// makes leaves comparable and the rim able to hold labels. A folded single-child
		// wrapper leaves its leaf a level shallower than its neighbours, so a depth-derived
		// radius would put two files on different rings for a reason about the TREE rather
		// than about them. Ancestors sit proportionally inside, so a bundle bows inward.
		// No zero guard on `depth`: the layout returns early for a root with no children, so a
		// tree that reaches here is at least one level deep.
		const radius = leaf ? rim : (node.depth / depth) * rim
		placed.set(node.id, { node, angle, radius })
		byPath.set(node.path.join('/'), node)

		return angle
	}

	visit(root, { next: 0 })

	return { placed, byPath }
}

function maxDepthOf(root: TreeNode): number {
	let deepest = 0
	const visit = (n: TreeNode) => {
		deepest = Math.max(deepest, n.depth)
		for (const child of n.children) visit(child)
	}
	visit(root)

	return deepest
}

/** Polar to canvas coordinates. 0 is 12 o'clock, so the first leaf is at the top. */
function at(centre: number, angle: number, radius: number): Point {
	return {
		x: centre + Math.sin(angle) * radius,
		y: centre - Math.cos(angle) * radius
	}
}

/**
 * An ancestor band, drawn as a wedge outside the rim.
 *
 * Reuses `Cluster.wedge`, the same geometry a sunburst emits — so a renderer that can draw one
 * can draw these, and the theme does not learn a second vocabulary for the same shape.
 */
function band(node: TreeNode, ctx: BandCtx, index: number): Cluster {
	const leaves = leavesOf(node)
	const first = ctx.placed.get(leaves[0].id)!
	const last = ctx.placed.get(leaves[leaves.length - 1].id)!
	// Half a slot of padding at each end, so adjacent bands read as separate regions rather
	// than as one ring with hairlines in it.
	const half = ctx.step * 0.48
	// Depth RELATIVE to the focus, the same convention `world` and `sunburst` use: the
	// innermost band is always 0 whatever the reader has drilled into.
	const depth = node.depth - ctx.origin - 1
	const inner = ctx.rim + BAND_GAP + depth * BAND_STEP

	return {
		name: node.label,
		caption: String(leaves.length),
		depth,
		// The enclosing band's PATH, not its label. Two crates can each hold a module called
		// `lib`, and `clusterKey` is `depth:parent:name` — keyed by label alone that is a
		// duplicate key, Svelte throws `each_key_duplicate` and the whole render aborts, so
		// no band appears at all rather than one looking wrong.
		parent: node.path.slice(0, -1).join('/'),
		ramp: node.path[ctx.origin],
		// A band is a container by construction — its leaves are the node cards on the rim.
		path: node.address,
		leaf: false,
		declared: node.node?.id,
		count: node.children.length,
		list: node.children.map((c) => c.node).filter((n) => n !== undefined),
		groupIndex: index,
		wedge: { r0: inner, r1: inner + BAND, a0: first.angle - half, a1: last.angle + half },
		x: 0,
		y: 0,
		w: 0,
		h: 0
	}
}

type BandCtx = { placed: Map<string, Placed>; step: number; origin: number; rim: number }

/** Every ancestor level below the focus, outermost band last. */
function bands(root: TreeNode, ctx: BandCtx, levels: number): Cluster[] {
	const out: Cluster[] = []
	const limit = ctx.origin + levels

	const visit = (node: TreeNode) => {
		if (node.depth > ctx.origin && node.children.length > 0 && node.depth <= limit) {
			out.push(band(node, ctx, out.length))
		}
		if (node.depth < limit) for (const child of node.children) visit(child)
	}
	visit(root)

	return out
}

/** The route an edge takes through the tree: up to the common ancestor, then back down. */
function route(a: TreeNode, b: TreeNode, ctx: Ctx): Point[] {
	const shared = commonDepth(a.path, b.path)
	const spot = (path: string[]): Point | undefined => {
		const node = ctx.byPath.get(path.join('/'))
		const p = node && ctx.placed.get(node.id)

		return p ? at(ctx.centre, p.angle, p.radius) : undefined
	}

	const up: Point[] = []
	const down: Point[] = []
	for (let d = a.path.length; d >= shared; d--) {
		const p = spot(a.path.slice(0, d))
		if (p) up.push(p)
	}
	for (let d = shared + 1; d <= b.path.length; d++) {
		const p = spot(b.path.slice(0, d))
		if (p) down.push(p)
	}

	return [...up, ...down]
}

/**
 * How far an edge travels in the TREE, which is what a reader filters on.
 *
 * `local` stays inside one module, `crate` crosses modules within a package, `cross` leaves
 * the package. The same three the Sensei board toggles, and the reason is the same: "which
 * calls leave this crate" is a different question from "how chatty is this module".
 */
function reach(a: TreeNode, b: TreeNode): string {
	const shared = commonDepth(a.path, b.path)
	// Measured against each end's OWN depth rather than against a fixed level, because the
	// tree folds single-child wrappers — `repo/site/ui/render` and `repo/ui/render` are the
	// same file, and a rule counting absolute depth would classify it differently depending on
	// how many siblings its module happened to have.
	const sameParent = shared >= a.path.length - 1 && shared >= b.path.length - 1
	const sameGrandparent = shared >= a.path.length - 2 && shared >= b.path.length - 2
	if (sameParent) return 'local'

	return sameGrandparent ? 'crate' : 'cross'
}

function leafIndex(root: TreeNode, model: GraphModel): Map<string, TreeNode> {
	const byNode = new Map<string, TreeNode>()
	const leaves = leavesOf(root)
	// By PATH, not by node: after a cut, a file's own node is no longer a leaf — the region
	// standing for it is. An edge between two files in the same crate becomes an edge from
	// that crate to itself, which is then dropped as a self-link. That is the aggregation
	// that makes a cut view readable: only calls that actually cross the boundary survive.
	const byPathKey = new Map(leaves.map((leaf) => [leaf.path.join('/'), leaf]))

	for (const node of model.nodes) {
		const path = node.path ?? []
		for (let d = path.length; d >= 0; d--) {
			const leaf = byPathKey.get(path.slice(0, d).join('/'))
			if (leaf) {
				byNode.set(node.id, leaf)
				break
			}
		}
	}

	return byNode
}

function routeAll(model: GraphModel, root: TreeNode, ctx: Ctx, tension: number): RoutedEdge[] {
	const byNode = leafIndex(root, model)
	const routed: RoutedEdge[] = []

	model.edges.forEach((edge: GraphEdge, i) => {
		const a = byNode.get(edge.source)
		const b = byNode.get(edge.target)
		// A self-call has no route through the tree, and an endpoint outside the materialised
		// levels has no point to start from. Both are dropped rather than drawn to the centre.
		if (!a || !b || a === b) return

		// At least two points by construction: distinct leaves contribute one each, whatever
		// the chain between them, so there is no degenerate route to guard against.
		const points = route(a, b, ctx)
		const from = points[0]
		const to = points[points.length - 1]
		routed.push({
			i,
			id: edge.id,
			fromKey: edge.source,
			toKey: edge.target,
			kind: edge.kind,
			relation: edge.relation ?? reach(a, b),
			...carried(edge),
			self: false,
			x1: from.x,
			y1: from.y,
			x2: to.x,
			y2: to.y,
			s1: 1,
			s2: -1,
			// Pre-built, because the shape depends on the whole tree route rather than on the
			// two endpoints — `edgePath` only ever sees the ends.
			path: bundlePath(points, tension)
		})
	})

	return routed
}

/**
 * How a label sits at this angle on the rim.
 *
 * Tangential, and flipped through the left half so nothing reads upside down — the same rule
 * the Sensei board uses. Degrees, because that is what a CSS rotation takes.
 */
function labelAt(angle: number): { labelAngle: number; labelSide: 'start' | 'end' } {
	const degrees = (angle * 180) / Math.PI
	const onLeft = degrees % 360 > 180

	return {
		labelAngle: onLeft ? degrees + 90 : degrees - 90,
		labelSide: onLeft ? 'end' : 'start'
	}
}

/** A stand-in node for a cut leaf, which is a region rather than anything declared. */
function region(leaf: TreeNode): GraphNode {
	return { id: leaf.id, label: leaf.label, rows: [], meta: {}, kind: 'module' }
}

/**
 * How big a region's dot is.
 *
 * A cut leaf has no entry in the measure map — it is not a node anyone declared — so it takes
 * a size from what it CONTAINS, which is the same question the measure answers for a real one.
 */
function sizeFor(leaf: TreeNode, ring: Ring): { w: number; h: number } {
	const scaled = Math.min(18, 5 + Math.sqrt(Math.max(0, leaf.value)) * 0.8)

	return { w: scaled, h: scaled * (ring.rim > 0 ? 1 : 1) }
}

/** One dot per leaf, on the rim. Sized by the measure, as `points` and `radial` size theirs. */
function dots(
	leaves: TreeNode[],
	ring: Ring,
	ctx: { placed: Map<string, Placed>; model: GraphModel; sizeBy?: string; sizeScale?: 'linear' | 'log' }
): Cards {
	const { placed, model } = ctx
	const sizeOf = nodeSizes(model, ctx.sizeBy ?? 'degree', ctx.sizeScale ?? 'linear')
	const cards: Cards = {}

	for (const leaf of leaves) {
		// A CUT leaf is often a region rather than a declared node — `core` standing for the
		// forty files under it. It still needs a dot and a label, so one is synthesised for
		// it; the box IS the thing at this level.
		const node = leaf.node ?? region(leaf)
		const spot = placed.get(leaf.id)!
		const size = sizeOf.get(node.id) ?? sizeFor(leaf, ring)
		const point = at(ring.centre, spot.angle, spot.radius)
		const label = labelAt(spot.angle)

		cards[node.id] = {
			node,
			vis: [],
			more: node.rows.length,
			w: size.w,
			h: size.h,
			x: point.x - size.w / 2,
			y: point.y - size.h / 2,
			groupIndex: 0,
			...label
		}
	}

	return cards
}

/**
 * A codebase as a radial dendrogram, with its calls bundled through the structure.
 *
 * `levels` caps how many ancestor bands are drawn; `focusPath` scopes the whole canvas to a
 * subtree, which is drilling. Both mean exactly what they mean in `world` and `sunburst`, so
 * switching between the three views keeps your place.
 */
export const structure: LayoutFn = (model, options): LayoutResult => {
	warnUnknownOptions(options, 'structure')

	const tree = buildTree(model, { measure: options.sizeBy ?? 'weight', keep: options.focusPath })
	const root = findNode(tree, options.focusPath ?? [])
	if (!root || root.children.length === 0) {
		return { clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } }
	}

	const origin = root.path.length
	const levels = Math.max(1, options.levels ?? 2)
	// `levels` decides what sits ON the rim: 1 is a dozen crates, 3 is every file. The bands
	// are then the levels ABOVE it, so at 1 there are none and the leaves label themselves.
	const cut = truncate(root, origin + levels)
	const leaves = leavesOf(cut)
	const step = (Math.PI * 2) / Math.max(1, leaves.length)
	const bandCount = Math.max(0, levels - 1)

	const rim = Math.max(MIN_RIM, (LEAF_ARC * leaves.length) / (Math.PI * 2))
	const extent = rim + BAND_GAP + Math.max(0, bandCount - 1) * BAND_STEP + BAND + PAD
	const ring: Ring = { rim, centre: extent }

	const { placed, byPath } = place(cut, step, rim)
	const ctx: Ctx = { placed, byPath, centre: ring.centre }

	return {
		clusters: bands(cut, { placed, step, origin, rim }, bandCount),
		cards: dots(leaves, ring, { placed, model, sizeBy: options.sizeBy, sizeScale: options.sizeScale }),
		edges: routeAll(model, cut, ctx, options.bundleTension ?? 0.85),
		size: { w: extent * 2, h: extent * 2 }
	}
}
