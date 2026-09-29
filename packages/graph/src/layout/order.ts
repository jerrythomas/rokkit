/* Ordering within a column — the crossing-reduction half of a layered layout.
 *
 * Minimising edge crossings is NP-hard, so this is the standard heuristic: sweep the layers
 * assigning each node the average position of its neighbours in the adjacent layer, sort by
 * that, repeat. See docs/design/25-flow-layout.md.
 *
 * Two properties are load-bearing and neither is incidental:
 *
 *   - It is DETERMINISTIC. A fixed pass count and a stable tie-break, so the same model lays
 *     out identically every run — which `LayoutFn` promises and every layout spec relies on.
 *   - It never returns worse than it started. Each candidate is scored and the best kept, so
 *     a graph the heuristic cannot improve comes back unchanged rather than churned.
 */

import type { GraphEdge, GraphModel } from '../types.js'

/** Sweeps of down-then-up. Four is where the standard heuristic stops paying. */
const PASSES = 4

/** An edge that is actually drawn between two adjacent columns. */
function drawn(edges: GraphEdge[], back: Set<string>, byId: Map<string, unknown>): GraphEdge[] {
	return edges.filter(
		(e) =>
			!back.has(e.id) && e.source !== e.target && byId.has(e.source) && byId.has(e.target)
	)
}

/**
 * Crossings between every adjacent pair of layers.
 *
 * Two edges cross when their endpoints are in opposite relative order on the two sides. The
 * naive pair-count is fine here: a layer holds tens of nodes, not thousands, and being
 * obviously correct matters more than being O(n log n) — this is the score the sweep is
 * optimising, so an error in it would silently make the heuristic choose the worse layout.
 */
export function countCrossings(
	layers: string[][],
	model: GraphModel,
	back: Set<string>
): number {
	const pos = new Map<string, number>()
	layers.forEach((layer) => layer.forEach((id, i) => pos.set(id, i)))

	const layerOf = new Map<string, number>()
	layers.forEach((layer, i) => layer.forEach((id) => layerOf.set(id, i)))

	let total = 0
	const edges = drawn(model.edges, back, model.byId)

	for (let i = 0; i < edges.length; i++) {
		for (let j = i + 1; j < edges.length; j++) {
			const a = edges[i]
			const b = edges[j]
			// Only edges spanning the SAME pair of adjacent layers can cross in this model.
			if (layerOf.get(a.source) !== layerOf.get(b.source)) continue
			if (layerOf.get(a.target) !== layerOf.get(b.target)) continue

			const as = pos.get(a.source)!
			const bs = pos.get(b.source)!
			const at = pos.get(a.target)!
			const bt = pos.get(b.target)!
			if ((as - bs) * (at - bt) < 0) total++
		}
	}

	return total
}

/** Mean position of `ids` in the previous ordering, or nothing when there are none. */
function barycenter(ids: string[], pos: Map<string, number>): number | undefined {
	const known = ids.map((id) => pos.get(id)).filter((p): p is number => p !== undefined)
	if (known.length === 0) return undefined

	return known.reduce((sum, p) => sum + p, 0) / known.length
}

/**
 * Re-sort one layer by the average position of each node's neighbours on `side`.
 *
 * A node with no neighbour on that side keeps its current index as its key, so it holds
 * station instead of collapsing to one end — an unconstrained node drifting to position 0 is
 * how a sweep makes a layout worse than the order it was given.
 */
function sweepLayer(
	layer: string[],
	neighbors: Map<string, string[]>,
	pos: Map<string, number>
): string[] {
	const keyed = layer.map((id, i) => ({
		id,
		key: barycenter(neighbors.get(id) ?? [], pos) ?? i,
		i
	}))

	// Index breaks ties, so equal barycenters keep their relative order — a stable sort by
	// hand, because the tie-break IS the determinism guarantee.
	keyed.sort((a, b) => a.key - b.key || a.i - b.i)

	return keyed.map((k) => k.id)
}

/** Positions within each layer, for the scoring pass and the next sweep. */
function positions(layers: string[][]): Map<string, number> {
	const pos = new Map<string, number>()
	layers.forEach((layer) => layer.forEach((id, i) => pos.set(id, i)))

	return pos
}

function adjacency(edges: GraphEdge[], forward: boolean): Map<string, string[]> {
	const out = new Map<string, string[]>()
	for (const edge of edges) {
		const [from, to] = forward ? [edge.target, edge.source] : [edge.source, edge.target]
		const list = out.get(from)
		if (list) list.push(to)
		else out.set(from, [to])
	}

	return out
}

/**
 * Nodes grouped into their columns and ordered to reduce crossings.
 *
 * Layers start in model order — which normalisation fixed — so the starting point is stable
 * and the result is reproducible.
 */
/** Nodes bucketed into their columns, in model order — the stable starting arrangement. */
function layersOf(model: GraphModel, ranks: Map<string, number>): string[][] {
	const layers: string[][] = []
	for (const node of model.nodes) {
		const r = ranks.get(node.id) ?? 0
		;(layers[r] ??= []).push(node.id)
	}

	// A rank with no nodes cannot come out of `rank()`, but an array hole would crash the
	// sweep rather than lay out oddly, and the cost of not assuming is one filter.
	return layers.filter((layer) => layer !== undefined)
}

/**
 * One sweep across every layer.
 *
 * Down means each layer follows the one to its left, up means the one to its right.
 * Alternating is what lets an improvement propagate in both directions rather than piling up
 * against whichever end the sweep started from.
 */
function sweep(
	layers: string[][],
	down: boolean,
	predecessors: Map<string, string[]>,
	successors: Map<string, string[]>
): string[][] {
	const next = layers.map((layer) => [...layer])
	const indices = down
		? next.map((_, i) => i).slice(1)
		: next
				.map((_, i) => i)
				.slice(0, -1)
				.reverse()

	for (const i of indices) {
		next[i] = sweepLayer(next[i], down ? predecessors : successors, positions(next))
	}

	return next
}

export function order(
	model: GraphModel,
	ranks: Map<string, number>,
	back: Set<string>
): string[][] {
	const filled = layersOf(model, ranks)
	if (filled.length === 0) return []

	const edges = drawn(model.edges, back, model.byId)
	const predecessors = adjacency(edges, true)
	const successors = adjacency(edges, false)

	let best = filled
	let bestScore = countCrossings(filled, model, back)
	let current = filled

	for (let pass = 0; pass < PASSES; pass++) {
		current = sweep(current, pass % 2 === 0, predecessors, successors)
		const score = countCrossings(current, model, back)
		if (score < bestScore) {
			bestScore = score
			best = current
		}
	}

	return best
}
