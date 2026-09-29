/* A spanning tree over a call graph, which is what a radial layout can actually draw.
 *
 * A call graph is not a tree and never was: a shared helper has several callers, and recursion
 * makes cycles. Radial layouts need one parent per node, so this picks one — breadth-first, so
 * a node sits at its SHORTEST distance from a root — and reports the edges it could not use.
 *
 * Those edges are reported rather than discarded. "b also calls this" is exactly the fact a
 * reader is looking for in a call graph, and a tree that silently drops half its edges looks
 * like a complete picture while being a quarter of one. The view draws them; they just do not
 * define position.
 */

import type { GraphEdge, GraphModel } from '../types.js'

export type Hierarchy = {
	/** Nodes nothing calls, plus any disconnected node. In model order. */
	roots: string[]
	/** Hops from the nearest root. */
	depthOf: Map<string, number>
	/** Tree children, in the order they were reached. */
	childrenOf: Map<string, string[]>
	/** Childless nodes, in walk order — left to right around the rim. */
	leaves: string[]
	/** Ids of edges the tree could not use. Real relationships, drawn but not structural. */
	extra: Set<string>
}

/**
 * A node's tree children — always an array.
 *
 * A childless node has no entry at all, and every caller wants an empty list rather than an
 * `undefined` to guard. One place to say so beats the same `?? []` at each use site.
 */
export function childrenIn(h: Pick<Hierarchy, 'childrenOf'>, id: string): string[] {
	return h.childrenOf.get(id) ?? []
}

/** An edge that can be a parent link: both ends are nodes, and it is not a self-loop. */
function usable(edge: GraphEdge, byId: Map<string, unknown>): boolean {
	return edge.source !== edge.target && byId.has(edge.source) && byId.has(edge.target)
}

function outgoing(edges: GraphEdge[]): Map<string, GraphEdge[]> {
	const out = new Map<string, GraphEdge[]>()
	for (const edge of edges) {
		const list = out.get(edge.source)
		if (list) list.push(edge)
		else out.set(edge.source, [edge])
	}

	return out
}

/**
 * Where the walk starts: nodes nothing calls.
 *
 * A graph that is one big cycle has none, and rendering an empty canvas for a graph that
 * plainly has nodes is the worse answer — so the first node in model order is drafted. Model
 * order is fixed by normalisation, so the choice is stable.
 */
function rootsOf(model: GraphModel, links: GraphEdge[]): string[] {
	const called = new Set(links.map((e) => e.target))
	const roots = model.nodes.map((n) => n.id).filter((id) => !called.has(id))
	if (roots.length > 0) return roots

	return model.nodes.length > 0 ? [model.nodes[0].id] : []
}

/** The mutable state one breadth-first walk carries. */
type Walk = {
	out: Map<string, GraphEdge[]>
	claimed: Map<string, number>
	childrenOf: Map<string, string[]>
}

/** Every not-yet-claimed callee of `id`, claimed at `depth` and recorded as its children. */
function claimChildren(id: string, depth: number, w: Walk): string[] {
	const taken: string[] = []

	for (const edge of w.out.get(id) ?? []) {
		if (w.claimed.has(edge.target)) continue
		w.claimed.set(edge.target, depth)
		taken.push(edge.target)
	}

	if (taken.length > 0) w.childrenOf.set(id, [...(w.childrenOf.get(id) ?? []), ...taken])

	return taken
}

/** Breadth-first, claiming each node once at its nearest depth. */
function walk(roots: string[], w: Walk): void {
	let frontier = roots.filter((id) => !w.claimed.has(id))
	for (const id of frontier) w.claimed.set(id, 0)

	let depth = 0
	while (frontier.length > 0) {
		depth++
		frontier = frontier.flatMap((id) => claimChildren(id, depth, w))
	}
}

/** Childless nodes in walk order, so a parent's children stay adjacent on the rim. */
function leavesOf(roots: string[], childrenOf: Map<string, string[]>): string[] {
	const leaves: string[] = []

	const visit = (id: string): void => {
		const kids = childrenIn({ childrenOf }, id)
		if (kids.length === 0) {
			leaves.push(id)

			return
		}
		for (const kid of kids) visit(kid)
	}

	for (const root of roots) visit(root)

	return leaves
}

/**
 * One parent per node, and the edges that did not fit.
 *
 * Every node is placed: a disconnected one becomes its own root rather than disappearing, and
 * a cycle terminates because a claimed node is never re-claimed.
 */
export function hierarchy(model: GraphModel): Hierarchy {
	const links = model.edges.filter((e) => usable(e, model.byId))
	const out = outgoing(links)

	const claimed = new Map<string, number>()
	const childrenOf = new Map<string, string[]>()
	const roots = rootsOf(model, links)

	const w: Walk = { out, claimed, childrenOf }
	walk(roots, w)

	// A node inside a cycle that no root reaches is still a node. Each unclaimed one seeds its
	// own walk, so the whole model is covered however tangled it is.
	const stragglers: string[] = []
	for (const node of model.nodes) {
		if (claimed.has(node.id)) continue
		stragglers.push(node.id)
		walk([node.id], w)
	}

	const allRoots = [...roots, ...stragglers]
	const tree = new Set<string>()
	for (const [parent, kids] of childrenOf) {
		for (const kid of kids) tree.add(`${parent}->${kid}`)
	}

	return {
		roots: allRoots,
		depthOf: claimed,
		childrenOf,
		leaves: leavesOf(allRoots, childrenOf),
		// An edge whose endpoints are not a parent/child pair in the tree. It is real and the
		// view draws it; it simply did not get to decide where anything sits.
		extra: new Set(
			links.filter((e) => !tree.has(`${e.source}->${e.target}`)).map((e) => e.id)
		)
	}
}
