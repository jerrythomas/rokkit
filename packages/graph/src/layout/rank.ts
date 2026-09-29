/* Which column a node belongs in, and which edges had to be broken to answer that.
 *
 * Pure graph work, no geometry — see docs/design/25-flow-layout.md. The rule the whole `flow`
 * layout rests on: an edge leaves its source's RIGHT and enters its target's LEFT, so a target
 * must sit in a later column than its source. Rank is that constraint solved.
 */

import type { GraphEdge, GraphModel } from '../types.js'

export type Ranking = {
	/** Node id → column index, 0-based. Every node in the model is present. */
	ranks: Map<string, number>
	/** Ids of the edges reversed to make the graph acyclic. */
	back: Set<string>
}

/**
 * Whether an edge can constrain a column.
 *
 * A self-loop spans no columns. An unplaced end is not a node — 59.6% of Sensei's 4.08M edges
 * have a null target — and treating the raw string as one would invent a column for something
 * that has no box.
 */
function spans(edge: GraphEdge, byId: Map<string, unknown>): boolean {
	if (edge.source === edge.target) return false

	return byId.has(edge.source) && byId.has(edge.target)
}

/**
 * Edge ids that must be reversed to make the graph acyclic, by DFS.
 *
 * An edge back to a node still on the recursion stack closes a cycle, so it is the one to
 * break. Real schemas have mutual foreign keys; refusing to rank a cyclic graph would take the
 * whole diagram down for a pair of tables that reference each other.
 *
 * Iteration follows `model.nodes` order, which normalisation fixes, so WHICH edge of a cycle
 * gets broken is stable across runs — determinism `LayoutFn` promises.
 */
function findBackEdges(nodes: string[], out: Map<string, GraphEdge[]>): Set<string> {
	const back = new Set<string>()
	const state = new Map<string, 'open' | 'done'>()

	const visit = (id: string): void => {
		state.set(id, 'open')
		for (const edge of out.get(id) ?? []) {
			const next = edge.target
			const seen = state.get(next)
			if (seen === 'open') back.add(edge.id)
			else if (seen === undefined) visit(next)
		}
		state.set(id, 'done')
	}

	for (const id of nodes) {
		if (!state.has(id)) visit(id)
	}

	return back
}

/**
 * Longest-path ranking over the acyclic remainder.
 *
 * Longest, not shortest: with `a→b→c` and `a→c`, ranking `c` at 1 satisfies `a→c` and leaves
 * `b→c` pointing leftward. Taking the longest path to each node satisfies every kept edge at
 * once.
 *
 * Memoised depth-first rather than a topological sweep — the graph is already known acyclic
 * here, so recursion terminates, and the memo makes it linear in edges.
 */
function longestPaths(nodes: string[], into: Map<string, GraphEdge[]>): Map<string, number> {
	const ranks = new Map<string, number>()

	const depth = (id: string): number => {
		const cached = ranks.get(id)
		if (cached !== undefined) return cached

		// Set before recursing: the graph is acyclic by construction, and this also stops a
		// pathological input from recursing forever rather than producing a wrong number.
		ranks.set(id, 0)
		let best = 0
		for (const edge of into.get(id) ?? []) {
			best = Math.max(best, depth(edge.source) + 1)
		}
		ranks.set(id, best)

		return best
	}

	for (const id of nodes) depth(id)

	return ranks
}

/** Group edges by one endpoint, keeping input order. */
function index(edges: GraphEdge[], key: (e: GraphEdge) => string): Map<string, GraphEdge[]> {
	const out = new Map<string, GraphEdge[]>()
	for (const edge of edges) {
		const list = out.get(key(edge))
		if (list) list.push(edge)
		else out.set(key(edge), [edge])
	}

	return out
}

/**
 * Columns for every node, and the edges broken to get them.
 *
 * A node constrained by nothing — disconnected, or reached only by a broken edge — ranks 0 and
 * still gets a box. Dropping it would hide a table from the diagram because of how it happens
 * to be referenced.
 */
export function rank(model: GraphModel): Ranking {
	const ids = model.nodes.map((n) => n.id)
	const usable = model.edges.filter((e) => spans(e, model.byId))

	const back = findBackEdges(ids, index(usable, (e) => e.source))
	const forward = usable.filter((e) => !back.has(e.id))

	return { ranks: longestPaths(ids, index(forward, (e) => e.target)), back }
}
