/* The containment tree, derived from `GraphNode.path`.
 *
 * Three jobs, none of them geometry:
 *
 *   1. SYNTHESISE the containers the data implies but never states. A codebase indexes files
 *      and symbols; the folders between them are implied by the path, and requiring a node per
 *      folder would make the model refuse data that is perfectly well-formed.
 *   2. FOLD a container that adds no level. `src › lib › index.ts` with nothing else at either
 *      level is three boxes for one file — that is punctuation, not a hierarchy.
 *   3. SUM each subtree's measure, so a container's area can be what it CONTAINS rather than
 *      what it is.
 *
 * Pure and deterministic like every layout here, and deliberately separate from
 * `normalizeGraph`: most graphs are flat, and building a tree they never read would be waste
 * on every re-render.
 */

import type { GraphModel, GraphNode } from '../types.js'

export type TreeNode = {
	/** Path joined by `/`. The root is `''`. */
	id: string
	label: string
	/** Full path to this node, outermost first. Empty at the root. */
	path: string[]
	/** 0 at the root. A layout materialising N levels reads this. */
	depth: number
	/** The real node behind this box: a leaf always, a container only if one claims it. */
	node?: GraphNode
	children: TreeNode[]
	/** This subtree's summed measure, including its own leaves. */
	value: number
}

const ROOT = ''

/** A container's id is its path joined — which is also what a claiming node's id must equal. */
const idOf = (path: string[]) => path.join('/')

function container(path: string[]): TreeNode {
	return {
		id: idOf(path),
		label: path[path.length - 1] ?? ROOT,
		path,
		depth: path.length,
		children: [],
		value: 0
	}
}

/** Walk to `path`, creating any container along the way that does not exist yet. */
function ensure(root: TreeNode, path: string[]): TreeNode {
	let current = root

	for (let i = 0; i < path.length; i++) {
		const segment = path[i]
		let next = current.children.find((c) => c.label === segment && c.node === undefined)
		if (!next) {
			next = container(path.slice(0, i + 1))
			current.children.push(next)
		}
		current = next
	}

	return current
}

/**
 * The number a node contributes to its subtree.
 *
 * `weight` is the named default, so a caller that shipped against #161 is unaffected; any
 * other name reads the measures bag. Absent is 0 rather than a break — "unknown" is a normal
 * state in a partially-indexed graph.
 */
function measureOf(node: GraphNode, measure: string): number {
	if (measure === 'weight') return node.weight ?? 0

	return node.measures?.[measure] ?? 0
}

function leafOf(node: GraphNode, measure: string): TreeNode {
	return {
		id: node.id,
		label: node.label,
		path: node.path ?? [],
		depth: (node.path?.length ?? 0) + 1,
		node,
		children: [],
		value: measureOf(node, measure)
	}
}

/**
 * Sum every subtree bottom-up, and re-derive depth after folding has shortened paths.
 *
 * A leaf's value is its own measure; a container's is what it holds. That is what lets a box's
 * area mean "how much is in here" rather than "how big is this one thing".
 */
function summarise(node: TreeNode, depth: number): number {
	node.depth = depth
	if (node.children.length === 0) return node.value

	node.value = node.children.reduce((total, child) => total + summarise(child, depth + 1), 0)

	return node.value
}

/**
 * Collapse a container that holds exactly one child and nothing of its own.
 *
 * NOT applied to a claimed container: a node that exists carries its own label, note and
 * status, and folding it would silently drop them. The rule is "a wrapper is not a level",
 * and a thing the data names is not a wrapper.
 */
function fold(node: TreeNode): TreeNode {
	node.children = node.children.map(fold)

	if (node.children.length === 1 && node.node === undefined && node.depth > 0) {
		const only = node.children[0]
		// The child takes this box's PLACE, so the segment this box contributed is spliced out
		// of its path — not merely trimmed from the end, which would leave a leaf sitting at
		// the very path that was just removed.
		const cut = node.path.length - 1

		return { ...only, path: [...only.path.slice(0, cut), ...only.path.slice(cut + 1)] }
	}

	return node
}

/** Depth-first, alphabetical: a re-render must never reshuffle the picture. */
function sort(node: TreeNode): void {
	node.children.sort((a, b) => a.label.localeCompare(b.label) || a.id.localeCompare(b.id))
	for (const child of node.children) sort(child)
}

/**
 * The containment tree for a model.
 *
 * A node whose id equals a container's joined path CLAIMS it, lending its label and note —
 * checked before leaves are placed, so a claiming node becomes the box rather than a child
 * inside it.
 */
/**
 * Nodes that name a container rather than living in one.
 *
 * A node with no path whose id looks like a path (`dbd/core/lexer`) is claiming that box. It
 * has to be identified BEFORE leaves are placed, or a leaf inside it would create an
 * unclaimed container that the claimer then cannot become.
 */
function claimsIn(model: GraphModel): Map<string, GraphNode> {
	const claims = new Map<string, GraphNode>()
	for (const node of model.nodes) {
		if (node.path === undefined && node.id.includes('/')) claims.set(node.id, node)
	}

	return claims
}

export function buildTree(model: GraphModel, options: { measure?: string } = {}): TreeNode {
	const measure = options.measure ?? 'weight'
	const root = container([])
	root.depth = 0

	const claims = claimsIn(model)

	for (const node of model.nodes) {
		if (claims.has(node.id)) continue
		ensure(root, node.path ?? []).children.push(leafOf(node, measure))
	}

	for (const [id, node] of claims) {
		const box = ensure(root, id.split('/'))
		box.node = node
		box.label = node.label
	}

	const folded = fold(root)
	sort(folded)
	summarise(folded, 0)

	return folded
}

/** The node at `path`, or undefined. */
export function findNode(root: TreeNode, path: string[]): TreeNode | undefined {
	let current: TreeNode | undefined = root

	for (const segment of path) {
		current = current?.children.find((c) => c.path[c.path.length - 1] === segment)
		if (!current) return undefined
	}

	return current
}
