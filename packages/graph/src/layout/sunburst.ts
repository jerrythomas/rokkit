/* The sunburst: the treemap's question asked radially.
 *
 * Same tree, same measure, same captions as `world` — deliberately, so the two are one dataset
 * drawn twice rather than two features that drift. What changes is which channel carries what:
 *
 *   treemap   area = measure, depth = nesting you have to look for
 *   sunburst  ANGLE = measure, RADIUS = depth, which you read at a glance
 *
 * A treemap spends its pixels better; a sunburst tells you how deep the tree goes before you
 * have read a single label. Neither is the right one, which is why both exist.
 *
 * Geometry only — a wedge is `{ r0, r1, a0, a1 }` and the renderer turns that into an arc.
 * That keeps this a pure `LayoutFn` like every other: DOM-free, synchronous, unit-testable to
 * exact radians.
 */

import { buildTree, findNode } from '../model/tree.js'
import { shadeFields, shares } from '../model/share.js'
import type { TreeNode } from '../model/tree.js'
import { warnUnknownOptions } from './options.js'
import type { Cluster, LayoutFn, LayoutResult } from './types.js'

/** Outer radius of the deepest materialised ring. The canvas is derived from it. */
const RADIUS = 380
/** Margin outside the rim. */
const PAD = 16
/**
 * Angular floor, as a share of one child's EQUAL slice of its parent.
 *
 * The same reasoning as the treemap's area floor, and the same trap avoided: a per-child floor
 * measured against the TOTAL sums with the child count, so it is negligible at two children and
 * swamps the circle at 470. Against the equal slice the total floor caps at this constant
 * whatever the child count.
 */
const MIN_EQUAL_SHARE = 0.12

type Placed = { tree: TreeNode; depth: number; parent?: string; a0: number; a1: number; ramp?: string }

/** Compact enough to sit in a label strip: 1200 reads as 1.2k. */
function compact(value: number): string {
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
	if (value >= 1000) return `${(value / 1000).toFixed(1)}k`

	return String(Math.round(value))
}

/**
 * Divide a parent's angular span among its children, proportional to measure.
 *
 * Recurses `levels` deep and no further — the same refusal the treemap makes, and for the same
 * reason: the cost of a large tree is in building it, not in drawing it.
 */
function split(
	node: TreeNode,
	span: { a0: number; a1: number },
	ctx: { levels: number; out: Placed[]; parent?: string; origin: number; ramp?: string }
): void {
	const { levels, out, parent, origin, ramp } = ctx
	if (levels <= 0 || node.children.length === 0) return

	const total = node.children.reduce((sum, c) => sum + Math.max(c.value, 0), 0)
	const floor = (total / node.children.length) * MIN_EQUAL_SHARE
	// Equal slices when nothing is measured. Returning early instead drew NOTHING for a tree
	// whose measure happens to be zero everywhere — a codebase under `sizeBy: 'degree'` where
	// no module imports another, which is a blank canvas rather than a visible "unmeasured".
	// `squarify` makes the same fallback for the treemap, so the two views agree.
	const values =
		total > 0 ? node.children.map((c) => Math.max(c.value, floor)) : node.children.map(() => 1)
	const sum = values.reduce((a, b) => a + b, 0)

	let a = span.a0
	const width = span.a1 - span.a0

	node.children.forEach((child, i) => {
		const slice = (values[i] / sum) * width
		const range = { a0: a, a1: a + slice }
		// Depth is RELATIVE to the focus, so the innermost rendered ring is always 0 whatever
		// the reader has drilled into — the same convention `world` uses.
		// The outermost wedge names the ramp entry and its whole subtree inherits it, so a
		// package reads as one coloured sector rather than a bright inner ring above a grey
		// outer one.
		const key = ramp ?? child.label
		out.push({ tree: child, depth: node.path.length - origin, parent, ramp: key, ...range })
		split(child, range, { levels: levels - 1, out, parent: child.id, origin, ramp: key })
		a += slice
	})
}

function wedgeOf(entry: Placed, groupIndex: number, ring: number, shaded?: Map<string, number>): Cluster {
	const leaf = entry.tree.children.length === 0 ? entry.tree.node : undefined

	return {
		name: entry.tree.label,
		caption: compact(entry.tree.value),
		parent: entry.parent,
		depth: entry.depth,
		ramp: entry.ramp,
		nodeId: leaf?.id,
		kind: leaf?.kind,
		path: entry.tree.address,
		leaf: entry.tree.children.length === 0,
		declared: entry.tree.node?.id,
		list: entry.tree.children.map((c) => c.node).filter((n) => n !== undefined),
		count: entry.tree.children.length,
		groupIndex,
		wedge: {
			r0: entry.depth * ring,
			r1: (entry.depth + 1) * ring,
			a0: entry.a0,
			a1: entry.a1
		},
		// A wedge is drawn from its own polar geometry, but the box still reports where it sits
		// so selection, hit-testing and anything measuring the canvas keep working unchanged.
		x: RADIUS + PAD + Math.cos((entry.a0 + entry.a1) / 2) * ((entry.depth + 0.5) * ring),
		y: RADIUS + PAD + Math.sin((entry.a0 + entry.a1) / 2) * ((entry.depth + 0.5) * ring),
		w: 0,
		h: 0,
		...shadeFields(shaded, entry.tree.id)
	}
}

/**
 * Containment as angle, depth as radius.
 *
 * `focusPath` and `levels` mean exactly what they mean in `world`, so a reader switching
 * between the two views keeps their place.
 */
export const sunburst: LayoutFn = (model, options): LayoutResult => {
	warnUnknownOptions(options, 'sunburst')

	const tree = buildTree(model, { measure: options.sizeBy ?? 'weight', keep: options.focusPath })
	const root = findNode(tree, options.focusPath ?? [])
	if (!root || root.children.length === 0) {
		return { clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } }
	}

	const levels = options.levels ?? 2
	// #164: as in `world` — a share per wedge when a measure is named for it.
	const shaded = options.shadeBy ? shares(root, options.shadeBy) : undefined
	const placed: Placed[] = []
	split(root, { a0: 0, a1: Math.PI * 2 }, { levels, out: placed, origin: root.path.length })

	const ring = RADIUS / Math.max(1, levels)
	const extent = (RADIUS + PAD) * 2

	return {
		clusters: placed.map((entry, i) => wedgeOf(entry, i, ring, shaded)),
		cards: {},
		// Edges are absent for the same reason as the treemap: containment IS the relationship,
		// and an adjacency graph cannot be drawn at this scale.
		edges: [],
		size: { w: extent, h: extent }
	}
}
