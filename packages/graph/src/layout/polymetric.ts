/* The polymetric view (#168): Lanza & Marinescu's System Complexity.
 *
 * A containment tree, drawn top-down, where every LEAF is a box whose width, height and shade
 * carry three independent measures — the three-at-once is the point: narrow-tall-dark reads
 * differently from wide-short-pale, and neither is expressible as area (that is `world`).
 *
 * Degenerate data is the normal case for code metrics, so it is designed for:
 *   - each channel scales to the 95th percentile of its values, so one file with 10x the
 *     functions of the rest does not shrink every other box to the minimum; a value past the
 *     cap is clamped to the maximum and the box says so (`clamped`);
 *   - a zero is a value and draws at the minimum; a MISSING measure also draws at the minimum
 *     but is marked (`missing`), never passed off as a zero.
 * Every box at one depth is topped on one line, so heights compare at a glance.
 */
import { buildTree } from '../model/tree.js'
import type { TreeNode } from '../model/tree.js'
import { degreeOf } from './sizing.js'
import { warnUnknownOptions } from './options.js'
import { capOf } from './percentile.js'
import type {
	ChannelScale,
	Cluster,
	LayoutFn,
	LayoutOptions,
	LayoutResult,
	PolymetricChannel,
	RoutedEdge
} from './types.js'
import type { GraphNode } from '../types.js'

const MIN = 10
const MAX: Record<PolymetricChannel, number> = { width: 140, height: 140, color: 1 }
/** A container is a label, not a measured thing. */
const CONTAINER = { w: 132, h: 26 }
const GAP_X = 18
/** Between depth rows — room for the leaf labels under the boxes and the links. */
const GAP_Y = 46
const PAD = 16

/** One encoding: the measure it reads, and the value its full extent stands for. */
class Channel {
	readonly name: PolymetricChannel
	readonly measure: string
	readonly cap: number
	#degree: Map<string, number>

	constructor(name: PolymetricChannel, measure: string, leaves: TreeNode[], degree: Map<string, number>) {
		this.name = name
		this.measure = measure
		this.#degree = degree
		this.cap = capOf(leaves.map((l) => this.valueOf(l.node as GraphNode)))
	}

	/** The node's value, or undefined when it has none — distinct from zero. */
	valueOf(node: GraphNode): number | undefined {
		if (this.measure === 'degree') return this.#degree.get(node.id) ?? 0
		if (this.measure === 'weight') return node.weight
		return node.measures?.[this.measure]
	}

	/** 0..1 of the cap (undefined when missing), and whether the value passed the cap. */
	read(node: GraphNode): { t?: number; clamped: boolean } {
		const value = this.valueOf(node)
		if (value === undefined) return { clamped: false }
		return { t: Math.min(1, Math.max(0, value / this.cap)), clamped: value > this.cap }
	}

	get scale(): ChannelScale {
		return { measure: this.measure, cap: this.cap }
	}
}

type Encoding = Pick<Cluster, 'w' | 'h' | 'shade' | 'missing' | 'clamped'>

/** One channel's reading onto the box: a size between MIN and the max, or a shade. */
function apply(out: Encoding, name: PolymetricChannel, t: number | undefined): void {
	if (name === 'color') {
		if (t !== undefined) out.shade = t
		return
	}
	out[name === 'width' ? 'w' : 'h'] = MIN + (t ?? 0) * (MAX[name] - MIN)
}

/** A leaf's width, height and shade, with what was missing or clamped. */
function encode(node: GraphNode, channels: Channel[]): Encoding {
	const out: Encoding = {}
	const missing: PolymetricChannel[] = []
	const clamped: PolymetricChannel[] = []
	for (const channel of channels) {
		const { t, clamped: over } = channel.read(node)
		if (t === undefined) missing.push(channel.name)
		if (over) clamped.push(channel.name)
		apply(out, channel.name, t)
	}
	if (missing.length) out.missing = missing
	if (clamped.length) out.clamped = clamped
	return out
}

type Box = Cluster & { tree: TreeNode; span: number; kids: Box[] }

const rowSpan = (boxes: Box[]) =>
	boxes.reduce((s, b) => s + b.span, 0) + GAP_X * Math.max(0, boxes.length - 1)

function boxFor(tree: TreeNode, encoding: Encoding, kids: Box[]): Box {
	// From the TREE, not from `kids`: a container's kids are attached after it is created.
	const leaf = tree.children.length === 0
	return {
		name: tree.label,
		list: [],
		count: tree.children.length,
		groupIndex: 0,
		x: 0,
		y: 0,
		depth: tree.depth - 1,
		path: tree.address,
		declared: tree.node?.id,
		...(leaf ? { nodeId: tree.node?.id, kind: tree.node?.kind } : {}),
		...encoding,
		tree,
		kids,
		span: 0
	}
}

/** Every box in the subtree, sized; `span` is the subtree's width for the tidy layout. */
function size(tree: TreeNode, channels: Channel[], out: Box[]): Box {
	if (tree.children.length === 0) {
		// A leaf is always a declared node: a synthesised box exists only because something
		// lies below it.
		const leaf = boxFor(tree, encode(tree.node as GraphNode, channels), [])
		leaf.span = leaf.w!
		out.push(leaf)
		return leaf
	}
	const box = boxFor(tree, { ...CONTAINER }, [])
	out.push(box)
	box.kids = tree.children.map((child) => size(child, channels, out))
	box.span = Math.max(CONTAINER.w, rowSpan(box.kids))
	return box
}

/** Lay the subtree out from `left`: children side by side, the parent centred over them. */
function place(box: Box, left: number, rowTop: number[]): void {
	box.y = rowTop[box.depth ?? 0]
	box.x = left + (box.span - box.w!) / 2
	let x = left + (box.span - rowSpan(box.kids)) / 2
	for (const kid of box.kids) {
		place(kid, x, rowTop)
		x += kid.span + GAP_X
	}
}

/** The top of each depth row: every box at a depth is topped on one line. */
function rowTops(boxes: Box[]): number[] {
	const tallest: number[] = []
	for (const b of boxes) tallest[b.depth ?? 0] = Math.max(tallest[b.depth ?? 0] ?? 0, b.h!)
	const tops: number[] = []
	let y = PAD
	for (const h of tallest) {
		tops.push(y)
		y += h + GAP_Y
	}
	return tops
}

const keyOf = (b: Box) => b.declared ?? b.tree.id

/** An elbow from the bottom of a container to the top of what it holds. */
function link(parent: Box, child: Box, i: number): RoutedEdge {
	const x1 = parent.x + parent.w! / 2
	const y1 = parent.y + parent.h!
	const x2 = child.x + child.w! / 2
	const y2 = child.y
	return {
		i,
		id: `contains:${keyOf(parent)}>${keyOf(child)}`,
		fromKey: keyOf(parent),
		toKey: keyOf(child),
		kind: 'containment',
		self: false,
		x1,
		y1,
		x2,
		y2,
		s1: 1,
		s2: 1,
		path: `M ${x1} ${y1} V ${(y1 + y2) / 2} H ${x2} V ${y2}`
	}
}

function linksOf(roots: Box[]): RoutedEdge[] {
	const edges: RoutedEdge[] = []
	const walk = (b: Box) => {
		for (const kid of b.kids) {
			edges.push(link(b, kid, edges.length))
			walk(kid)
		}
	}
	roots.forEach(walk)
	return edges
}

/** The channels the options bind; colour only when a measure is named for it. */
function channelsFor(options: LayoutOptions, leaves: TreeNode[], degree: Map<string, number>): Channel[] {
	const channels = [
		new Channel('width', options.widthBy ?? 'weight', leaves, degree),
		new Channel('height', options.heightBy ?? 'weight', leaves, degree)
	]
	if (options.colorBy) channels.push(new Channel('color', options.colorBy, leaves, degree))
	return channels
}

/** Size and place the forest under the tree root; returns the boxes and the canvas width. */
function lay(roots: TreeNode[], channels: Channel[]): { boxes: Box[]; tops: Box[]; width: number } {
	const boxes: Box[] = []
	const tops = roots.map((root) => size(root, channels, boxes))
	const rowTop = rowTops(boxes)
	let left = PAD
	for (const top of tops) {
		place(top, left, rowTop)
		left += top.span + GAP_X * 2
	}
	return { boxes, tops, width: left - GAP_X * 2 + PAD }
}

/** The containment tree with each leaf's width, height and shade bound to three measures. */
export const polymetric: LayoutFn = (model, options): LayoutResult => {
	warnUnknownOptions(options, 'polymetric')
	const tree = buildTree(model)
	if (tree.children.length === 0) return { clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } }

	const leaves = (function all(n: TreeNode): TreeNode[] {
		return n.children.length === 0 ? [n] : n.children.flatMap(all)
	})(tree)
	const channels = channelsFor(options, leaves, degreeOf(model))
	const { boxes, tops, width } = lay(tree.children, channels)
	const [w, h, color] = channels
	return {
		clusters: boxes.map(({ tree: _t, span: _s, kids: _k, ...cluster }) => cluster),
		cards: {},
		edges: linksOf(tops),
		size: { w: width, h: Math.max(...boxes.map((b) => b.y + b.h!)) + PAD + GAP_Y / 2 },
		channels: { width: w.scale, height: h.scale, ...(color ? { color: color.scale } : {}) }
	}
}
