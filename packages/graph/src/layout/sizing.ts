/* How big a node is drawn when the layout has no room for a card.
 *
 * Shared by `points` and `radial`: both replace the card with a small rect whose AREA — not
 * width — tracks a measure, so ten edges reads as ten rather than as a hundred. Extracted from
 * `points` rather than copied, because two copies of a size curve drift and the drift shows up
 * as "the same node is bigger in one view than the other".
 */

import type { GraphModel, GraphNode } from '../types.js'

/**
 * Area bounds, carried over from `points`' disc version (pi*5^2 to pi*26^2) so the ink weight
 * of a diagram is unchanged by the switch to rects.
 */
const MIN_AREA = Math.PI * 5 * 5
const MAX_AREA = Math.PI * 26 * 26
/** Width:height. 2:1 reads as a "chip"; a square wastes shelf height. */
const ASPECT = 2

export type Sized = { w: number; h: number }
export type Scale = 'linear' | 'log'

/** Edges touching each node. A self-loop counts once — it is one edge, not two. */
export function degreeOf(model: GraphModel): Map<string, number> {
	const degree = new Map<string, number>()
	for (const node of model.nodes) degree.set(node.id, 0)

	for (const edge of model.edges) {
		degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1)
		if (edge.source !== edge.target) {
			degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1)
		}
	}

	return degree
}

/**
 * Position of `value` in `[min, max]`, 0..1.
 *
 * `log` is for a measure spanning orders of magnitude — declaration counts across a real repo
 * span three or four, and a linear map puts everything below the top few on the floor. `+1`
 * shifts the domain off zero, which has no logarithm.
 *
 * A flat measure — every node equal, so `max === min` — is 0, not a division by zero.
 */
export function normalise(value: number, min: number, max: number, scale: Scale): number {
	if (max <= min) return 0
	if (scale === 'log') {
		return Math.log(value - min + 1) / Math.log(max - min + 1)
	}

	return (value - min) / (max - min)
}

/** Area is LINEAR in the measure, so width grows as its square root — ten reads as ten. */
export function sizeFor(t: number): Sized {
	const area = MIN_AREA + (MAX_AREA - MIN_AREA) * t

	return { w: Math.sqrt(area * ASPECT), h: Math.sqrt(area / ASPECT) }
}

/**
 * The number each node is sized by.
 *
 * A node with no weight under `sizeBy: 'weight'` floors rather than vanishing or exploding —
 * "unknown" is a normal state in a partially-indexed graph, and the alternative is a NaN
 * width that renders as nothing at all.
 */
export function measureOf(
	node: GraphNode,
	degree: Map<string, number>,
	sizeBy: string
): number {
	if (sizeBy === 'degree') return degree.get(node.id) ?? 0
	if (sizeBy === 'weight') return node.weight ?? 0

	return node.measures?.[sizeBy] ?? 0
}

/**
 * One size per node, from whichever measure the caller named.
 *
 * The domain is anchored at 0 rather than at the smallest value present, matching `points`:
 * that is what makes a node the same size in both views, which is the point of sharing this
 * at all. Against the present minimum, the smallest node in every graph would be identical
 * whether it had one edge or four hundred.
 */
export function nodeSizes(model: GraphModel, sizeBy: string, scale: Scale): Map<string, Sized> {
	const degree = degreeOf(model)
	const measures = model.nodes.map((n) => measureOf(n, degree, sizeBy))
	const min = Math.min(0, ...measures)
	const max = Math.max(0, ...measures)

	return new Map(
		model.nodes.map((node, i) => [node.id, sizeFor(normalise(measures[i], min, max, scale))])
	)
}
