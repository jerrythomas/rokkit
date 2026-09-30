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
	/** Full path to this node, outermost first. Empty at the root. Folding splices it. */
	path: string[]
	/**
	 * The node's path in the DATA — never folded. What a host knows a node by, so what a drill
	 * reports and what `focusPath` names; `path` is only where the box sits in the picture.
	 */
	address: string[]
	/** 0 at the root. A layout materialising N levels reads this. */
	depth: number
	/** The real node behind this box. Absent only on a container nothing declared. */
	node?: GraphNode
	children: TreeNode[]
	/** This subtree's summed measure, including its own leaves. */
	value: number
}

const ROOT = ''

/** A synthesised box's id is its path joined. A declared node replaces it with its own. */
const idOf = (path: string[]) => path.join('/')

function container(path: string[]): TreeNode {
	return {
		id: idOf(path),
		label: path[path.length - 1] ?? ROOT,
		path,
		address: path,
		depth: path.length,
		children: [],
		value: 0
	}
}

/**
 * Walk to `path`, synthesising any box along the way that nothing has declared yet.
 *
 * Matched on the path SEGMENT, not on the label: a declared node may label its box anything
 * ('Lexer' for the segment 'lexer'), and matching on label would then fail to find the box it
 * had already created.
 */
function ensure(root: TreeNode, path: string[]): TreeNode {
	let current = root

	for (let i = 0; i < path.length; i++) {
		const segment = path[i]
		let next = current.children.find((c) => c.path[c.path.length - 1] === segment)
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
function measureOf(node: GraphNode, measure: string, degree: Map<string, number>): number {
	if (measure === 'degree') return degree.get(node.id) ?? 0
	if (measure === 'weight') return node.weight ?? 0

	return node.measures?.[measure] ?? 0
}

/**
 * Edges touching each node.
 *
 * `degree` is the package-wide default for `sizeBy`, so the tree has to understand it or a
 * caller that never set a measure gets a silent zero for every node — and a tree of zeroes
 * falls through to an even split, which renders a 27:1 ratio as 1:1 with no error anywhere.
 */
function degreesIn(model: GraphModel): Map<string, number> {
	const degree = new Map<string, number>()
	for (const edge of model.edges) {
		if (edge.unplaced) continue
		degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1)
		if (edge.target !== edge.source) {
			degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1)
		}
	}

	return degree
}

/**
 * Attach a real node to the box at its own path.
 *
 * The box may already exist — synthesised by a descendant that arrived first — in which case
 * this fills in its identity rather than creating a sibling. That is the whole of "a container
 * is an ordinary node": no claiming, no id convention, just the same walk.
 */
function attach(
	root: TreeNode,
	node: GraphNode,
	measure: string,
	degree: Map<string, number>
): void {
	const box = ensure(root, node.path ?? [])
	if (box === root) {
		// No path: a root-level leaf, not a redefinition of the root itself.
		root.children.push({
			id: node.id,
			label: node.label,
			path: [],
			// No address either: a pathless node has no place in the containment tree to drill to.
			address: [],
			depth: 1,
			node,
			children: [],
			value: measureOf(node, measure, degree)
		})

		return
	}

	box.id = node.id
	box.label = node.label
	box.node = node
	// A container can hold declarations of its OWN — a file has top-level code as well as the
	// functions in it — so this is added to the subtree rather than replaced by it.
	box.value += measureOf(node, measure, degree)
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

	// `node.value` starts as the container's OWN measure, if it declared one — a module can
	// hold top-level declarations as well as the functions inside it.
	node.value += node.children.reduce((total, child) => total + summarise(child, depth + 1), 0)

	return node.value
}

/**
 * Collapse a container that holds exactly one child and nothing of its own.
 *
 * NOT applied to a DECLARED container: a node that exists carries its own label, note and
 * edges, and folding it would silently drop them. The rule is "a wrapper is not a level", and
 * a thing the data names is not a wrapper.
 */
function fold(node: TreeNode, keep: string[]): TreeNode {
	node.children = node.children.map((child) => fold(child, keep))

	// A container ON the focus chain is the scope the reader asked for, not punctuation: folding
	// it would make the focusPath naming it stop resolving. A host loading one level at a time
	// sends exactly such a chain — a crate's modules, with nothing declaring the crate.
	const onFocusChain = node.address.every((segment, i) => keep[i] === segment)
	if (node.children.length === 1 && node.node === undefined && node.depth > 0 && !onFocusChain) {
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
 * Containment is PREFIX: a node whose path extends past another's is inside it. That is what
 * makes a container an ordinary node — it keeps its own id, label, note and edges, and there
 * is no convention to satisfy. A prefix nothing declares is synthesised.
 */
export function buildTree(
	model: GraphModel,
	options: { measure?: string; keep?: string[] } = {}
): TreeNode {
	const measure = options.measure ?? 'weight'
	const degree = measure === 'degree' ? degreesIn(model) : new Map<string, number>()
	const root = container([])
	root.depth = 0

	// One pass, one rule: every node is the box at its own path. Order does not matter —
	// a descendant arriving first synthesises the box, and its owner fills in the identity.
	for (const node of model.nodes) attach(root, node, measure, degree)

	const folded = fold(root, options.keep ?? [])
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
