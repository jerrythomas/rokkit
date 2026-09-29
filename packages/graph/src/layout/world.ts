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
import type { Cards, Cluster, LayoutFn, LayoutResult } from './types.js'

/** Canvas the layout lays out into. Fit-to-container scales it; the ratios are what matter. */
const CANVAS = { w: 1200, h: 800 }
/** Inset of a container's children, leaving room for its own border. */
const PAD = 4
/** Room above a container's children for its label. */
const TITLE = 16
/**
 * Area floor, as a share of the total.
 *
 * Exact proportion gives a zero-measure node no box at all, which reads as missing rather than
 * as unmeasured — and "unmeasured" is a normal state in a partially-indexed graph.
 */
const MIN_SHARE = 0.002

type Placed = { tree: TreeNode; rect: Rect; depth: number; parent?: string }

/** Walk the materialised levels, squarifying each container's children into its own rect. */
function place(
	node: TreeNode,
	rect: Rect,
	ctx: { levels: number; out: Placed[]; parent?: string }
): void {
	const { levels, out, parent } = ctx
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
	const placed = squarify(node.children, inner, total * MIN_SHARE)

	for (const { item, rect: box } of placed) {
		out.push({ tree: item, rect: box, depth: node.path.length, parent })
		place(item, box, { levels: levels - 1, out, parent: item.id })
	}
}

function clusterOf(entry: Placed, groupIndex: number): Cluster {
	return {
		name: entry.tree.label,
		parent: entry.parent,
		depth: entry.depth,
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
 * A box with children is a region; one without is the thing itself, and the thing is what
 * carries a node, a kind and a click. A childless box always has a node — leaves come from the
 * tree's own attach step — so the split is total rather than guarded.
 */
function split(placed: Placed[]): { clusters: Cluster[]; cards: Cards } {
	const clusters: Cluster[] = []
	const cards: Cards = {}

	placed.forEach((entry, i) => {
		const leaf = entry.tree.children.length === 0 ? entry.tree.node : undefined

		if (leaf) {
			cards[leaf.id] = {
				node: leaf,
				vis: [],
				more: leaf.rows.length,
				w: entry.rect.w,
				h: entry.rect.h,
				x: entry.rect.x,
				y: entry.rect.y,
				groupIndex: i
			}
		} else if (entry.tree.children.length > 0) {
			clusters.push(clusterOf(entry, i))
		}
	})

	return { clusters, cards }
}

/**
 * Containment as area.
 *
 * `focusPath` scopes the canvas to a subtree — the drill-down operation — and `levels` caps
 * how far below it is built. A box with children becomes a cluster; a box without becomes a
 * card, so the outermost materialised level is what a reader clicks.
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
		out: placed
	})

	// Edges are deliberately absent: containment IS the relationship here, and at world scale
	// the adjacency graph cannot be drawn. Cross-container aggregation is its own design.
	return { ...split(placed), edges: [], size: CANVAS }
}
