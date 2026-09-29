/* Breadth-first rings around a focus node — the shape a depth-N neighbourhood needs.
 *
 * Separate from `neighborhood.ts` because it is pure graph traversal with no geometry, and
 * because the rule that makes it correct is worth stating once: a node is claimed at its
 * NEAREST depth and never re-placed. Without that, a node reachable both directly and via a
 * detour gets two cards for one identity, or gets drawn further away than it actually is.
 */

import type { GraphEdge, GraphModel } from '../types.js'

/** Which side of the focus a ring sits on. */
export type Side = 'in' | 'out'

export type Ring = {
	depth: number
	side: Side
	ids: string[]
}

/**
 * The far end of an edge from `id` in one direction, or nothing.
 *
 * An unplaced end is not a node and has no card; a self-loop leads back where it started.
 * Neither can seed a ring.
 */
function across(edge: GraphEdge, id: string, side: Side): string | undefined {
	if (edge.unplaced || edge.source === edge.target) return undefined
	if (side === 'out') return edge.source === id ? edge.target : undefined

	return edge.target === id ? edge.source : undefined
}

/** Every node one step from `id` in one direction. */
function step(edges: GraphEdge[], id: string, side: Side): string[] {
	const out: string[] = []
	for (const edge of edges) {
		const far = across(edge, id, side)
		if (far !== undefined) out.push(far)
	}

	return out
}

const toRings = (bucket: Map<Side, string[]>, depth: number): Ring[] =>
	(['in', 'out'] as Side[]).map((side) => ({ depth, side, ids: bucket.get(side)! }))

/**
 * Rings outward from `focus`, to `depth` hops, on both sides.
 *
 * `claimed` is seeded with the focus and grows as rings are built, which is what enforces
 * nearest-depth-wins across BOTH sides — a node reached leftward at depth 1 is not re-reached
 * rightward at depth 2.
 *
 * `seedSide` lets the caller decide ring 1 by its own rule (the dominant-direction split in
 * `neighborhood`), and every ring beyond it inherits its ancestor's side: a caller's caller is
 * further left, a callee's callee further right. That is what makes the columns read outward.
 */
export function rings(
	model: GraphModel,
	focusId: string,
	depth: number,
	seedSide: (id: string) => Side
): Ring[] {
	const claimed = new Set<string>([focusId])
	const out: Ring[] = []

	let previous = seedRing(model, focusId, claimed, seedSide)
	out.push(...toRings(previous, 1))

	for (let d = 2; d <= depth; d++) {
		previous = nextRing(model, previous, claimed)
		out.push(...toRings(previous, d))
	}

	return out
}

/** An empty bucket per side. */
function sides(): Map<Side, string[]> {
	return new Map<Side, string[]>([
		['in', []],
		['out', []]
	])
}

/**
 * Ring 1, sided by the CALLER's rule rather than by a direction walk — that is what lets a
 * mutual neighbour land on the side its dominant direction earns it (#160).
 */
function seedRing(
	model: GraphModel,
	focusId: string,
	claimed: Set<string>,
	seedSide: (id: string) => Side
): Map<Side, string[]> {
	const first = sides()
	const reachable = new Set([
		...step(model.edges, focusId, 'in'),
		...step(model.edges, focusId, 'out')
	])

	// No `claimed` check: `reachable` is a Set, and `step` drops self-loops, so the
	// pre-claimed focus cannot appear in it. Ring 1 is claimed here for the rings that follow.
	for (const id of reachable) {
		claimed.add(id)
		first.get(seedSide(id))!.push(id)
	}

	return first
}

/** One ring further out, each side continuing in its own direction. */
function nextRing(
	model: GraphModel,
	previous: Map<Side, string[]>,
	claimed: Set<string>
): Map<Side, string[]> {
	const next = sides()

	for (const side of ['in', 'out'] as Side[]) {
		const reached = previous.get(side)!.flatMap((from) => step(model.edges, from, side))
		for (const id of reached) {
			if (claimed.has(id)) continue
			claimed.add(id)
			next.get(side)!.push(id)
		}
	}

	return next
}
