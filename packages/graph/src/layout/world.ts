/* The world view: containment as nested rectangles, area ∝ measure.
 *
 * Two rules do the work, and the second is the one that makes it survive real data.
 *
 * 1. A box's area is what it CONTAINS. That is the question the view answers — where is the
 *    mass — and it is why the tree sums subtrees rather than counting nodes.
 *
 * 2. Only `levels` are MATERIALISED. The cost of 1.18M nodes is in building them, not in
 *    packing them, so the layout refuses to build what it is not showing. Descending is a
 *    re-layout with a new root, not a zoom: `Graph`'s zoom is a scale transform over the whole
 *    canvas, and at that size every box is sub-pixel — the exact failure `points.ts` documents
 *    for cards.
 *
 * Rectangles rather than circles, decided in docs/design/24-world-view.md: a circular container
 * discards 1 - pi/4 = 21% of its bounding box before anything is placed in it, nesting
 * multiplies that per level, and a rect holds a legible label where a circle does not. You
 * have to be able to read what you are about to click.
 */

import { buildTree, findNode } from '../model/tree.js'
import type { TreeNode } from '../model/tree.js'
import { squarify } from './squarify.js'
import type { Rect } from './squarify.js'
import { warnUnknownOptions } from './options.js'
import type { Cluster, LayoutFn, LayoutResult } from './types.js'

/** Canvas the layout lays out into. Fit-to-container scales it; the ratios are what matter. */
const CANVAS = { w: 1200, h: 800 }
/** Inset of a container's children, leaving room for its own border. */
const PAD = 4
/** Room above a container's children for its label. */
const TITLE = 16
/**
 * Area floor, as a share of one child's EQUAL slice of its parent.
 *
 * Exact proportion gives a zero-measure node no box at all, which reads as missing rather than
 * as unmeasured — and "unmeasured" is a normal state in a partially-indexed graph: 79 of
 * rokkit's own 470 modules have degree 0.
 *
 * Measured against the equal slice rather than against the TOTAL, because the floor is applied
 * per child and so sums with the child count. A flat `total * k` is therefore self-defeating
 * exactly where it is needed: at two children it costs 2k of the canvas and leaves a 2px
 * hairline, and at 470 it claims 470k — nearly the whole canvas — and proportion stops reading
 * altogether. Against the equal slice the total floor is at most `k` whatever n is.
 */
const MIN_EQUAL_SHARE = 0.12

type Placed = { tree: TreeNode; rect: Rect; depth: number; parent?: string }

/** Walk the materialised levels, squarifying each container's children into its own rect. */
function place(
	node: TreeNode,
	rect: Rect,
	ctx: { levels: number; out: Placed[]; parent?: string; origin: number }
): void {
	const { levels, out, parent, origin } = ctx
	if (levels <= 0 || node.children.length === 0) return

	// Children are inset for the parent's border and label strip. Below that the box is all
	// chrome and no content, so it stops rather than rendering a frame around nothing.
	const inner: Rect = {
		x: rect.x + PAD,
		y: rect.y + PAD + TITLE,
		w: rect.w - PAD * 2,
		h: rect.h - PAD * 2 - TITLE
	}
	if (inner.w <= 0 || inner.h <= 0) return

	const total = node.children.reduce((sum, c) => sum + Math.max(c.value, 0), 0)
	const equal = total / node.children.length
	const placed = squarify(node.children, inner, equal * MIN_EQUAL_SHARE)

	for (const { item, rect: box } of placed) {
		// Depth is RELATIVE to the focus, so the outermost rendered box is always 0 whatever
		// the reader has drilled into. A renderer styles by "how deep in this view", not by
		// "how deep in the whole tree", and the same convention holds in `nested.ts`.
		out.push({ tree: item, rect: box, depth: node.path.length - origin, parent })
		place(item, box, { levels: levels - 1, out, parent: item.id, origin })
	}
}

/** Compact enough to sit in a label strip: 1200 reads as 1.2k. */
function compact(value: number): string {
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
	if (value >= 1000) return `${(value / 1000).toFixed(1)}k`

	return String(Math.round(value))
}

/**
 * Every placed box, leaf or region, as the SAME shape.
 *
 * A treemap is a hierarchy of one thing: a box with a label and an area. Emitting a leaf as a
 * node card and a region as a label box put two visual structures inside one nesting, which
 * reads as two unrelated kinds of object rather than as depth — and it dragged the card's
 * furniture along: icon, kind tag and a row count, where a codebase module has no rows and so
 * showed a literal `0` beside its name.
 *
 * A childless box keeps its node's id and kind, so uniform structure costs no identity: the
 * box is still selectable and still colours by what it is.
 */
function clusterOf(entry: Placed, groupIndex: number): Cluster {
	const leaf = entry.tree.children.length === 0 ? entry.tree.node : undefined

	return {
		name: entry.tree.label,
		// The measure, not the child count: this box's area IS its value, so that is the
		// number a reader should see beside it.
		caption: compact(entry.tree.value),
		parent: entry.parent,
		depth: entry.depth,
		nodeId: leaf?.id,
		kind: leaf?.kind,
		list: entry.tree.children.map((c) => c.node).filter((n) => n !== undefined),
		count: entry.tree.children.length,
		groupIndex,
		x: entry.rect.x,
		y: entry.rect.y,
		w: entry.rect.w,
		h: entry.rect.h
	}
}

/**
 * Containment as area.
 *
 * `focusPath` scopes the canvas to a subtree — the drill-down operation — and `levels` caps
 * how far below it is built. Every box is a cluster whatever its depth, so the outermost
 * materialised level is what a reader clicks.
 */
export const world: LayoutFn = (model, options): LayoutResult => {
	warnUnknownOptions(options, 'world')

	const tree = buildTree(model, { measure: options.sizeBy ?? 'weight' })
	const root = findNode(tree, options.focusPath ?? [])
	if (!root || root.children.length === 0) {
		return { clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } }
	}

	const placed: Placed[] = []
	place(root, { x: 0, y: 0, w: CANVAS.w, h: CANVAS.h }, {
		levels: options.levels ?? 2,
		out: placed,
		origin: root.path.length
	})

	// Edges are deliberately absent: containment IS the relationship here, and at world scale
	// the adjacency graph cannot be drawn. Cross-container aggregation is its own design.
	//
	// `cards` is empty by construction rather than by filtering — there is no box in this
	// layout that a card could represent.
	return {
		clusters: placed.map(clusterOf),
		cards: {},
		edges: [],
		size: CANVAS
	}
}
